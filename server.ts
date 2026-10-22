import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google Gen AI client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health & Status endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: Generate Full Event Plan (Structured JSON)
app.post('/api/gemini/generate-plan', async (req: Request, res: Response) => {
  try {
    const {
      eventType,
      name,
      date,
      location,
      venue,
      budget,
      currency = 'USD',
      guestCount,
      theme,
      specialNotes,
      naturalDescription,
    } = req.body;

    const isIndian =
      currency === 'INR' ||
      eventType === 'indian_wedding' ||
      eventType === 'sangeet_mehendi' ||
      eventType === 'haldi' ||
      (location && /india|delhi|mumbai|jaipur|rajasthan|bengaluru|hyderabad|chennai/i.test(location)) ||
      (theme && /marigold|mandap|sangeet|haldi|mehendi|baraat|desi/i.test(theme)) ||
      (naturalDescription && /mandap|sangeet|haldi|mehendi|baraat|pheras|shaadi|chaat/i.test(naturalDescription));

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        success: true,
        isFallback: true,
        message: 'No GEMINI_API_KEY configured. Utilizing curated intelligent plan.',
        plan: generateFallbackPlan(eventType, name, budget, currency, guestCount, theme, location, isIndian),
      });
    }

    const prompt = `You are an elite, culturally knowledgeable event planner specializing in luxury weddings (including traditional Indian weddings, Sangeets, and Western ceremonies), milestone birthdays, and community galas.
Generate a comprehensive, bespoke event plan based on this user description and parameters:

Event Details:
- Name: ${name || 'Celebration'}
- Type: ${eventType || 'Celebration'}
- Target Date: ${date || 'Upcoming'}
- Location: ${location || 'Venue TBD'} ${venue ? `(Venue: ${venue})` : ''}
- Currency: ${currency} (${currency === 'INR' ? 'Indian Rupee ₹' : currency})
- Total Budget: ${budget || (currency === 'INR' ? 2500000 : 20000)} ${currency}
- Guest Count: ${guestCount || 100}
- Theme & Aesthetic: ${theme || 'Timeless Elegance'}
- Host's Vision & Natural Description: ${naturalDescription || specialNotes || 'Create an unforgettable, seamless celebration.'}
${isIndian ? '- Special Cultural Requirements: Traditional Indian rituals, authentic decor (marigold, brass, fabrics), dietary considerations (Pure Veg/Jain/Halal options), Baraat, Sangeet choreography, and Mandap Pheras.' : ''}

You MUST return ONLY a valid, parseable JSON object (no markdown tags, no backticks, just raw JSON) conforming to this exact schema:
{
  "themeConcept": "A captivating 2-3 sentence description of the atmosphere, materials, lighting, and guest sensory journey",
  "tagline": "A memorable event tagline",
  "colorPalette": ["#Hex (Color Name)", "#Hex (Color Name)", "#Hex (Color Name)", "#Hex (Color Name)"],
  "highlightMoments": [
    "Standout experiential surprise or centerpiece ritual 1",
    "Standout experiential surprise or centerpiece ritual 2",
    "Standout experiential surprise or centerpiece ritual 3",
    "Standout experiential surprise or centerpiece ritual 4"
  ],
  "runOfShow": [
    { "time": "e.g. 4:00 PM", "activity": "Activity name", "notes": "Specific stage directions and coordination notes" }
  ],
  "suggestedBudgetBreakdown": [
    { "category": "Venue & Rentals", "percentage": 30, "suggestedAmount": 0, "description": "Indoor/outdoor space and essential furniture" },
    { "category": "Catering & Bar", "percentage": 35, "suggestedAmount": 0, "description": "Food stations, appetizers, signature drinks, dinner courses" },
    { "category": "Decor & Florals", "percentage": 14, "suggestedAmount": 0, "description": "Stage, floral arches/mandap, lighting, table setups" },
    { "category": "Photography & Video", "percentage": 10, "suggestedAmount": 0, "description": "Full day coverage, drone, preview reels" },
    { "category": "Entertainment & Music", "percentage": 6, "suggestedAmount": 0, "description": "Sound engineering, DJ, live musicians/dhol" },
    { "category": "Contingency & Misc", "percentage": 5, "suggestedAmount": 0, "description": "Unplanned costs and emergency buffer" }
  ],
  "recommendedTasks": [
    { "title": "Task name", "category": "Category", "milestone": "3-6 Months Before", "priority": "high" }
  ],
  "vendorChecklist": [
    { "category": "venue", "name": "Recommended Vendor Title", "keyQuestions": "Crucial questions to ask before signing contract" }
  ],
  "decorationIdeas": [
    { "area": "Entrance / Welcome Area", "concept": "Concept name", "details": "Specific visual details, props, and lighting" },
    { "area": "Main Stage / Mandap / Focal Point", "concept": "Concept name", "details": "Specific visual details, props, and lighting" },
    { "area": "Dining & Tablescapes", "concept": "Concept name", "details": "Specific visual details, props, and lighting" }
  ],
  "menuRecommendations": {
    "welcomeDrinks": ["Drink 1", "Drink 2"],
    "appetizers": ["Starter 1", "Starter 2", "Starter 3"],
    "mainCourse": ["Main Dish 1", "Main Dish 2", "Main Dish 3"],
    "desserts": ["Dessert 1", "Dessert 2"],
    "dietaryNotes": "Notes on vegetarian, vegan, Jain, gluten-free, or allergy accommodations"
  },
  "backupPlan": {
    "weatherBackup": "Specific plan for rain, wind, or excessive heat",
    "vendorBackup": "Protocol if key supplier or performer faces emergency",
    "timingBuffer": "Where time buffers are placed to prevent rush",
    "powerAudioBackup": "Contingency power, backup generator, and audio safeguards"
  },
  "budgetSavingTips": [
    "Practical tip 1 for saving money without diminishing quality",
    "Practical tip 2",
    "Practical tip 3"
  ],
  "contingencyTips": [
    "Contingency protocol 1",
    "Contingency protocol 2"
  ]
}

Note: Calculate "suggestedAmount" so that the sum across all categories equals ${budget || 10000}.`;

    let responseText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      responseText = response.text || '';
    } catch (primaryErr) {
      console.warn('Primary model busy, attempting fallback to gemini-flash-latest:', primaryErr);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      responseText = fallbackResponse.text || '';
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    // Validate parsedData structure
    if (!parsedData || !parsedData.themeConcept || !Array.isArray(parsedData.runOfShow)) {
      throw new Error('Incomplete structure received from AI model');
    }

    return res.json({
      success: true,
      isFallback: false,
      plan: parsedData,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/generate-plan:', err);
    const fallback = generateFallbackPlan(
      req.body.eventType,
      req.body.name,
      req.body.budget,
      req.body.currency || 'USD',
      req.body.guestCount,
      req.body.theme,
      req.body.location,
      req.body.currency === 'INR' || /india/i.test(req.body.location || '')
    );
    return res.status(200).json({
      success: true,
      isFallback: true,
      errorNotice: err?.message || 'Gemini service busy. Provided high-precision curated event plan.',
      plan: fallback,
    });
  }
});

// Endpoint: AI Creative Assistant (Speech writing, Invitation wording, Menu design, Playlists)
app.post('/api/gemini/creative-assist', async (req: Request, res: Response) => {
  try {
    const { mode, eventDetails, userPrompt } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        isFallback: true,
        result: getFallbackCreativeContent(mode, eventDetails),
      });
    }

    const currencySymbol = eventDetails.currency === 'INR' ? '₹' : '$';
    let systemContext = `You are EventGenie, an expert multicultural event planner and speechwriter. Tone: Eloquent, joyous, and practical.`;
    let prompt = '';

    if (mode === 'invitation') {
      prompt = `Draft 3 distinct invitation messages (1. Formal & Royal, 2. Warm & Joyful, 3. Modern & Playful) for this celebration:
Event Name: ${eventDetails.name}
Type: ${eventDetails.type}
Date: ${eventDetails.date}
Venue: ${eventDetails.venue || eventDetails.location}
Theme: ${eventDetails.theme}
Currency: ${eventDetails.currency || 'USD'}
Custom Instructions: ${userPrompt || 'Include RSVP request and dress code recommendation.'}`;
    } else if (mode === 'speech') {
      prompt = `Draft a heartwarming, memorable speech/toast:
Event Name: ${eventDetails.name}
Event Type: ${eventDetails.type}
Audience Size: ${eventDetails.guestCount || 100} guests
Speaker Persona/Instructions: ${userPrompt || 'Welcome toast by the host thanking guests, celebrating love and community, and inviting everyone to celebrate.'}
Include stage directions, delivery pauses, and emotional closing toast.`;
    } else if (mode === 'menu') {
      prompt = `Curate a mouthwatering catering menu & beverage concept tailored to:
Event: ${eventDetails.name} (${eventDetails.type})
Theme: ${eventDetails.theme}
Location: ${eventDetails.location}
Guest Count: ${eventDetails.guestCount}
User Preferences: ${userPrompt || 'Include welcome refreshments, live counters/appetizers, main courses with vegetarian/gluten-free options, and artisanal desserts.'}`;
    } else if (mode === 'playlist') {
      prompt = `Curate a dynamic event soundtrack & entertainment sequence:
Event: ${eventDetails.name} (${eventDetails.type})
Theme: ${eventDetails.theme}
Atmosphere Request: ${userPrompt || 'Arrival welcome acoustics, grand entrance fanfare, dinner lounge vibes, and peak high-energy dance floor anthems.'}`;
    } else {
      prompt = `Answer this event planning question with high-value professional advice:
Event: ${eventDetails.name} (${eventDetails.type}), Budget: ${currencySymbol}${eventDetails.budget}, Guests: ${eventDetails.guestCount}
Location: ${eventDetails.location}
Question: ${userPrompt}`;
    }

    let resultText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: systemContext,
        },
      });
      resultText = response.text || '';
    } catch (primaryErr) {
      console.warn('Primary model busy for creative-assist, trying gemini-flash-latest:', primaryErr);
      const fallbackResp = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          systemInstruction: systemContext,
        },
      });
      resultText = fallbackResp.text || '';
    }

    res.json({
      success: true,
      result: resultText,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/creative-assist:', err);
    res.json({
      success: true,
      isFallback: true,
      result: getFallbackCreativeContent(req.body.mode, req.body.eventDetails),
    });
  }
});

// Fallback plan generator with Indian and Western cultural specialization
function generateFallbackPlan(
  eventType = 'wedding',
  name = 'Special Celebration',
  budget = 10000,
  currency = 'USD',
  guestCount = 80,
  theme = 'Enchanted Lavender & Gold',
  location = 'Grand Ballroom',
  isIndian = false
) {
  const numBudget = Number(budget) || (isIndian ? 2500000 : 15000);

  if (isIndian) {
    return {
      themeConcept: `A regal Rajputana celebration featuring fragrant marigold (genda) cascades, gleaming brass urlis, mirror-worked royal fabrics, and warm amber ambient lanterns welcoming ${guestCount} cherished guests.`,
      tagline: `Bandhan: Celebrations Rooted in Tradition & Joy`,
      colorPalette: [
        '#E11D48 (Rani Pink)',
        '#F59E0B (Royal Marigold)',
        '#7C3AED (Royal Violet)',
        '#FBBF24 (Kundan Gold)',
      ],
      highlightMoments: [
        'Grand Royal Baraat with authentic Punjabi Dhol and brass fanfare',
        'Sunset Varmala exchange under a cascading rose petal shower',
        'Sangeet dance performances and friendly family face-off',
        'Late-night live artisan Jalebi, Rabdi, and Kulfi Falooda counter',
      ],
      runOfShow: [
        { time: '4:00 PM', activity: 'Haldi & Phoolon Ki Holi', notes: 'Yellow attire, floral petal shower, and dhol beats' },
        { time: '5:30 PM', activity: 'Welcome High Tea & Live Chaat', notes: 'Pani puri shots, samosas, and masala kulhad chai' },
        { time: '6:45 PM', activity: 'Baraat Assembly & Safa Tying', notes: 'Dhol drummers lead groom procession to main gates' },
        { time: '7:45 PM', activity: 'Milni & Rose Water Welcome', notes: 'Garland exchange between family elders' },
        { time: '8:30 PM', activity: 'Sunset Varmala & Stage Photos', notes: 'Cold pyrotechnic sparkulars during garland exchange' },
        { time: '9:15 PM', activity: 'Sacred Mandap Pheras', notes: 'Vedic chants and sitar background melodies' },
        { time: '10:15 PM', activity: 'Royal Feast & Sangeet Celebrations', notes: 'Multi-course banquet and DJ dance floor' },
      ],
      suggestedBudgetBreakdown: [
        { category: 'Venue & Rentals', percentage: 30, suggestedAmount: Math.round(numBudget * 0.30), description: 'Heritage courtyard, Mandap lawn, and power generators' },
        { category: 'Catering & Bar', percentage: 34, suggestedAmount: Math.round(numBudget * 0.34), description: 'Live chaat counters, Royal Thali dinner, and dessert studio' },
        { category: 'Decor & Florals', percentage: 14, suggestedAmount: Math.round(numBudget * 0.14), description: 'Mandap floral carving, entrance arches, and lighting' },
        { category: 'Photography & Video', percentage: 10, suggestedAmount: Math.round(numBudget * 0.10), description: 'Candid photography, cinematography, drone, and reels' },
        { category: 'Entertainment & Music', percentage: 7, suggestedAmount: Math.round(numBudget * 0.07), description: 'DJ, concert sound, Punjabi dhol, and Sangeet lighting' },
        { category: 'Contingency & Misc', percentage: 5, suggestedAmount: Math.round(numBudget * 0.05), description: 'Overtime buffer and emergency cash reserve' },
      ],
      recommendedTasks: [
        { title: 'Finalize Sangeet music tracks & hire choreographer', category: 'Entertainment', milestone: '3-6 Months Before', priority: 'high' },
        { title: 'Confirm Mandap fresh flower suppliers and brass lanterns', category: 'Decor & Florals', milestone: '1-2 Months Before', priority: 'high' },
        { title: 'Tasting session for live Chaat & Mithai counters', category: 'Catering', milestone: '1-2 Months Before', priority: 'high' },
        { title: 'Book lead Mehendi artists for bridal party and guests', category: 'Attire & Beauty', milestone: '1-2 Months Before', priority: 'medium' },
        { title: 'Arrange Baraat dhol troupe and welcome safa turban tyers', category: 'Logistics', milestone: 'Event Week', priority: 'high' },
        { title: 'Prepare cash Shagun envelopes and vendor tip packets', category: 'General', milestone: 'Event Week', priority: 'medium' },
      ],
      vendorChecklist: [
        { category: 'venue', name: 'Palace / Banquet Manager', keyQuestions: 'What is the noise curfew for outdoor Dhol, and is power generator backup included?' },
        { category: 'catering', name: 'Executive Caterer', keyQuestions: 'Can you guarantee separate preparation areas and dedicated serving staff for Jain/Pure Veg guests?' },
        { category: 'decoration', name: 'Mandap & Floral Designer', keyQuestions: 'Do you handle midnight tear-down and can florals be repurposed between Haldi and Reception?' },
        { category: 'photography', name: 'Lead Cinematographer', keyQuestions: 'What is the delivery turnaround for the 60-second Instagram wedding reel?' },
      ],
      decorationIdeas: [
        { area: 'Entrance & Pathway', concept: 'Toran of Mogra & Brass Diyas', details: 'Avenue lined with 200 glowing brass lamps, marigold canopies, and antique welcome urli bowls with floating rose petals.' },
        { area: 'Sacred Mandap', concept: 'Domed Floral Sanctum with Crystal Chandeliers', details: 'Carved wooden pillars wrapped in blush tuberose (rajnigandha) and vermillion roses overlooking courtyard gardens.' },
        { area: 'Sangeet Stage', concept: 'Mirror-Work Backdrop with Beam Lights', details: 'High-definition LED backdrop with custom Rajasthani jharokha patterns and cold pyro sparkulars.' },
      ],
      menuRecommendations: {
        welcomeDrinks: ['Kesar Pista Thandai', 'Fresh Jamun Kala Khatta', 'Rose Cardamom Sharbat'],
        appetizers: ['Paneer Tikka Angara', 'Dahi Sev Puri Shots', 'Amritsari Fish / Soya Chaap Tikka', 'Galouti Kebabs'],
        mainCourse: ['Dal Baati Churma with Pure Ghee', 'Dal Makhani Bukhara Style', 'Paneer Lababdar', 'Dum Pukht Awadhi Biryani with Burani Raita'],
        desserts: ['Hot Jalebi with Saffron Rabdi', 'Baked Gulab Jamun Tart', 'Matka Kulfi with Falooda'],
        dietaryNotes: 'Dedicated Pure Vegetarian and Jain counters demarcated with distinct service spoons and staff.',
      },
      backupPlan: {
        weatherBackup: 'Adjoining air-conditioned indoor banquet halls on standby within 30 minutes in case of wind or rain.',
        vendorBackup: 'Secondary sound generator and backup Mehendi artists on retainer.',
        timingBuffer: '45-minute buffer built into Baraat and Varmala to accommodate traditional rituals without delaying dinner.',
        powerAudioBackup: 'Dual silent 125kVA diesel generators on automatic switch for uninterrupted lighting and sound.',
      },
      budgetSavingTips: [
        'Source marigold and jasmine flowers directly from wholesale mandi rather than luxury florists to save up to 40%.',
        'Use the same staging structure for Sangeet and Reception by swapping visual backdrop banners.',
        'Send animated WhatsApp video invitations with interactive RSVP tracking to save printing costs.',
      ],
      contingencyTips: [
        'Maintain a strict 10% cash contingency reserve for late-night permissions and guest additions.',
        'Assign a reliable family member with a walkie-talkie to manage guest arrivals and transportation.',
      ],
    };
  }

  return {
    themeConcept: `A timeless and warm aesthetic centering on ${theme || 'modern elegance'}, highlighting cozy ambient lighting, lush botanical textures, and curated hospitality for ${guestCount} cherished guests.`,
    tagline: `Celebrate Life's Greatest Moments in Style`,
    colorPalette: [
      '#7C3AED (Royal Violet)',
      '#A78BFA (Soft Lavender)',
      '#F59E0B (Warm Amber Gold)',
      '#F8FAFC (Luminous Pearl)',
    ],
    highlightMoments: [
      'Champagne & Artisan Mocktail Welcome Greeting with live acoustic melodies',
      'Personalized Interactive Memory Wall where guests leave handwritten well-wishes',
      'Golden Hour Sunset Photography session and coordinated toast',
      'Sparkler or Glow-wand Grand Send-off at the conclusion of the evening',
    ],
    runOfShow: [
      { time: '4:30 PM', activity: 'Guest Arrival & Welcome Refreshments', notes: 'Soft background acoustics, coat check, welcome signage' },
      { time: '5:15 PM', activity: 'Main Ceremony or Welcome Opening', notes: 'Microphones checked, seating assistance for VIPs' },
      { time: '6:00 PM', activity: 'Cocktail & Hors d’oeuvres Reception', notes: 'Signature drinks circulating, photographer capturing guest portraits' },
      { time: '7:15 PM', activity: 'Grand Dinner & Keynote Toasts', notes: 'Coordinated courses, audio levels balanced for heartfelt speeches' },
      { time: '8:45 PM', activity: 'Cake Cutting / Dessert Presentation', notes: 'Spotlight on dessert table, coffee and tea station opened' },
      { time: '9:15 PM', activity: 'Music, Dance Floor & Festivities', notes: 'Upbeat DJ set, ambient party lighting activated' },
      { time: '11:00 PM', activity: 'Grand Farewell Send-off', notes: 'Guest favors handed out, secure gift transport arranged' },
    ],
    suggestedBudgetBreakdown: [
      { category: 'Venue & Rentals', percentage: 32, suggestedAmount: Math.round(numBudget * 0.32), description: 'Venue fee, tables, chairs, staging and ambient lighting' },
      { category: 'Catering & Bar', percentage: 35, suggestedAmount: Math.round(numBudget * 0.35), description: 'Food service, beverage packages, bar staff and tableware' },
      { category: 'Decor & Florals', percentage: 12, suggestedAmount: Math.round(numBudget * 0.12), description: 'Centerpieces, floral arch, signage, linens, candles' },
      { category: 'Photography & Video', percentage: 10, suggestedAmount: Math.round(numBudget * 0.10), description: '6-8 hours coverage, edited digital gallery' },
      { category: 'Entertainment & Music', percentage: 6, suggestedAmount: Math.round(numBudget * 0.06), description: 'Professional DJ, sound engineering, microphones' },
      { category: 'Contingency & Misc', percentage: 5, suggestedAmount: Math.round(numBudget * 0.05), description: 'Unplanned expenses and gratuity reserve' },
    ],
    recommendedTasks: [
      { title: 'Confirm venue contract and security deposit', category: 'Venue', milestone: '6+ Months Before', priority: 'high' },
      { title: 'Finalize guest list and send formal invitations', category: 'Guests', milestone: '3-6 Months Before', priority: 'high' },
      { title: 'Schedule menu tasting with caterer', category: 'Catering', milestone: '3-6 Months Before', priority: 'medium' },
      { title: 'Book lead photographer & videographer', category: 'Photography', milestone: '3-6 Months Before', priority: 'high' },
      { title: 'Select event playlist & key moment tracks', category: 'Entertainment', milestone: '1-2 Months Before', priority: 'medium' },
      { title: 'Collect all dietary restrictions and finalize table seating', category: 'Guests', milestone: '1-2 Months Before', priority: 'high' },
      { title: 'Confirm final headcount with caterer and venue', category: 'Catering', milestone: 'Event Week', priority: 'high' },
      { title: 'Prepare vendor tip envelopes and day-of emergency kit', category: 'General', milestone: 'Event Week', priority: 'medium' },
    ],
    vendorChecklist: [
      { category: 'venue', name: 'Venue Manager', keyQuestions: 'What is the noise curfew, load-in window, and backup rain plan?' },
      { category: 'catering', name: 'Catering Director', keyQuestions: 'Are linens, flatware, and bar staffing included in per-person quotes?' },
      { category: 'decoration', name: 'Florist & Decorator', keyQuestions: 'Do you handle midnight tear-down and can florals be repurposed?' },
      { category: 'photography', name: 'Lead Photographer', keyQuestions: 'What is the turnaround time for the preview gallery and raw footage?' },
      { category: 'entertainment', name: 'DJ / MC', keyQuestions: 'Do you provide wireless lapel mics for ceremonies and speeches?' },
    ],
    decorationIdeas: [
      { area: 'Ceremony Entrance', concept: 'Organic Botanical Welcome Wall', details: 'Lush eucalyptus, white delphiniums, and custom acrylic signage with warm up-lighting.' },
      { area: 'Main Ceremony Arch', concept: 'Asymmetrical Floral Birch Arch', details: 'Draped with natural sheer ivory linen, garden roses, and curly willow.' },
      { area: 'Dinner Pavilion', concept: 'Suspended Fairy Light Canopy', details: 'Warm micro-LED canopy with suspended botanical hoops over wooden banquet tables.' },
    ],
    menuRecommendations: {
      welcomeDrinks: ['Empress 1908 Violet Spritz', 'Sparkling Lavender Lemonade (Zero-Proof)'],
      appetizers: ['Whipped Goat Cheese & Fig Crostini', 'Mini Wild Mushroom Tartlets', 'Smoked Salmon Blinis with Dill'],
      mainCourse: ['Herb-Crusted Filet Mignon with Truffle Mash', 'Pan-Seared Sea Bass', 'Roasted Butternut Squash Risotto'],
      desserts: ['Lemon Blackberry Naked Cake', 'Warm Cinnamon Churro Bites with Salted Caramel'],
      dietaryNotes: 'Gluten-free, vegan, and nut-free accommodations prepared with separate equipment.',
    },
    backupPlan: {
      weatherBackup: 'Motorized drop-down clear pavilion weather blinds and 8 outdoor patio heaters ready for rapid deployment.',
      vendorBackup: 'Second shooter photographer equipped with backup camera bodies and dual SD cards.',
      timingBuffer: '30-minute cocktail hour buffer to accommodate sunset portraits without delaying dinner.',
      powerAudioBackup: 'Dual battery-powered Bose wireless speaker units for lawn ceremony audio.',
    },
    budgetSavingTips: [
      'Repurpose ceremony flowers as reception head-table and photo-backdrop arrangements.',
      'Opt for a signature cocktail duo plus beer/wine rather than an unlimited open top-shelf bar.',
      'Send interactive digital invitations with smart RSVP tracking to save $500+ on printing & postage.',
    ],
    contingencyTips: [
      'Allocate a strict 8-10% contingency reserve for surprise vendor overtime or weather adaptations.',
      'Designate a day-of point person with vendor phone contacts so the host never handles logistics.',
    ],
  };
}

function getFallbackCreativeContent(mode: string, eventDetails: any) {
  if (mode === 'invitation') {
    return `### Option 1: Classic & Elegant
Together with their families, you are cordially invited to celebrate the momentous occasion of **${eventDetails.name}**.
Join us on **${eventDetails.date || 'our special day'}** at **${eventDetails.venue || eventDetails.location || 'the venue'}**.
Dinner, music, and merriment to follow.
*Kindly reply with your RSVP by three weeks prior.*

---

### Option 2: Warm & Joyful
Love, laughter, and a celebration to remember!
We can't imagine celebrating **${eventDetails.name}** without you.
📅 **Date:** ${eventDetails.date || 'Coming soon'}
📍 **Location:** ${eventDetails.venue || eventDetails.location || 'City Center'}
✨ **Vibe:** ${eventDetails.theme || 'Joyful Celebration'}
*Please RSVP below so we can save your seat at the feast!*

---

### Option 3: Modern & Catchy
Get ready for an unforgettable night!
You're invited to **${eventDetails.name}**. Good food, great drinks, and dancing shoes required.
RSVP online now to let us know your dietary preferences and song requests!`;
  }

  if (mode === 'speech') {
    return `### Heartfelt Welcome Toast (approx. 2.5 minutes)

*(Stand, gently tap glass to gather attention, smile warmly around the room)*

"Good evening, everyone! Look around this room. Each of you here has played a special part in our lives, and having you all gathered under one roof for **${eventDetails.name}** means more to us than words could ever convey.

Some of you traveled across town, and some flew across countries to share this milestone with us. Thank you for your time, your love, and the boundless joy you bring into our lives.

Tonight isn't just about a calendar date; it's about making memories that we'll laugh about ten, twenty, and fifty years from now. We have wonderful food ahead, great music, and plenty of reasons to smile.

So, please raise your glasses with me:
To old memories cherished, new memories created tonight, and the wonderful people who make every celebration feel like home.

*Cheers! Enjoy the evening!*"`;
  }

  if (mode === 'menu') {
    return `### Curated Tasting Menu Concept

**Welcome Refreshments (Passed):**
- Whipped Goat Cheese & Fig Crostini with hot honey drizzle (Vegetarian)
- Smoked Salmon Blinis with lemon crème fraîche and fresh dill
- Mini Wild Mushroom Tartlets with thyme and aged parmesan

**First Course:**
- Roasted Beet & Burrata Salad with baby arugula, candied pecans, and white balsamic vinaigrette

**Main Entrées (Choice of):**
- Pan-Seared Herb-Crusted Filet Mignon with truffle potato purée and asparagus
- Miso-Glazed Chilean Sea Bass with ginger jasmine rice and baby bok choy
- Roasted Butternut Squash & Wild Rice Risotto with crisp sage (Vegan & Gluten-Free)

**Signature Libations:**
- *The Violet Spritz:* Empress 1908 gin, elderflower liqueur, prosecco, fresh lemon twist
- *Golden Orchard (Zero-Proof):* Spiced apple cider, ginger beer, cinnamon stick, rosemary smoke`;
  }

  return `### Event Entertainment & Vibe Blueprint
- **Arrival Ambiance:** Soft modern jazz or acoustic fingerstyle guitar to welcome guests smoothly.
- **Cocktail Hour:** Neo-soul and upbeat indie-pop to spark lively conversation.
- **Dinner:** French bistro jazz and acoustic lounge classics at a conversational volume.
- **Dance Floor Kickoff:** Timeless crossover hits to bring all generations onto the floor.
- **Peak Hour:** Curated high-energy dance anthems.`;
}

// In production, serve dist; in dev, Vite middleware is used by dev runner
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`EventGenie AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
