export type EventType =
  | 'wedding'
  | 'indian_wedding'
  | 'sangeet_mehendi'
  | 'haldi'
  | 'birthday'
  | 'community'
  | 'corporate'
  | 'anniversary'
  | 'baby_shower'
  | 'gala'
  | 'other';

export type EventStatus = 'planning' | 'in_progress' | 'ready' | 'completed';

export interface RunOfShowItem {
  time: string;
  activity: string;
  notes: string;
}

export interface BudgetSuggestion {
  category: string;
  percentage: number;
  suggestedAmount: number;
  description: string;
}

export interface DecorationIdea {
  area: string;
  concept: string;
  details: string;
}

export interface MenuRecommendation {
  welcomeDrinks: string[];
  appetizers: string[];
  mainCourse: string[];
  desserts: string[];
  dietaryNotes: string;
}

export interface BackupPlan {
  weatherBackup: string;
  vendorBackup: string;
  timingBuffer: string;
  powerAudioBackup: string;
}

export interface DatedTimelineItem {
  targetDate: string;
  milestoneTitle: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export interface AIGeneratedPlan {
  themeConcept: string;
  tagline: string;
  colorPalette: string[];
  highlightMoments: string[];
  runOfShow: RunOfShowItem[];
  suggestedBudgetBreakdown?: BudgetSuggestion[];
  recommendedTasks?: {
    title: string;
    category: string;
    milestone: string;
    priority: 'high' | 'medium' | 'low';
    dueDate?: string;
  }[];
  vendorChecklist?: {
    category: string;
    name: string;
    keyQuestions: string;
  }[];
  decorationIdeas?: DecorationIdea[];
  menuRecommendations?: MenuRecommendation;
  backupPlan?: BackupPlan;
  budgetSavingTips: string[];
  contingencyTips: string[];
}

export type SupportedCurrency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD';

export interface EventModel {
  id: string;
  name: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "17:00"
  location: string;
  venue: string;
  currency: SupportedCurrency;
  budget: number;
  contingencyPercentage: number; // e.g., 10 for 10%
  guestCount: number;
  theme: string;
  description?: string;
  status: EventStatus;
  isDemo?: boolean;
  createdAt: string;
  aiPlan?: AIGeneratedPlan;
}

export type BudgetCategory =
  | 'Venue & Rentals'
  | 'Catering & Bar'
  | 'Decor & Florals'
  | 'Photography & Video'
  | 'Entertainment & Music'
  | 'Attire & Beauty'
  | 'Stationery & Favors'
  | 'Staff & Security'
  | 'Contingency & Misc'
  | 'Other';

export type PaymentStatus = 'planned' | 'deposit_paid' | 'paid_in_full' | 'pending';

export interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  status: PaymentStatus;
  vendorName?: string;
  notes?: string;
  dueDate?: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface TaskItem {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  category: string;
  milestone: '6+ Months Before' | '3-6 Months Before' | '1-2 Months Before' | 'Event Week' | 'Day-Of' | 'Post-Event';
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
}

export type VendorCategory = 'venue' | 'catering' | 'decoration' | 'photography' | 'entertainment' | 'other';
export type VendorStatus = 'researching' | 'contacted' | 'quoted' | 'booked' | 'declined';

export interface VendorItem {
  id: string;
  eventId: string;
  name: string;
  category: VendorCategory;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  quotedPrice: number;
  depositPaid: number;
  status: VendorStatus;
  rating?: number;
  contractSigned: boolean;
  notes?: string;
}

export type RSVPStatus = 'attending' | 'declined' | 'tentative' | 'invited';

export interface GuestItem {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  partySize: number; // including plus ones
  rsvpStatus: RSVPStatus;
  dietaryRestrictions: string; // e.g. "None", "Vegetarian", "Gluten-Free", "Nut Allergy", "Jain (No Root Veg)", "Halal"
  tableGroup?: string;
  hasPlusOne: boolean;
  notes?: string;
}
