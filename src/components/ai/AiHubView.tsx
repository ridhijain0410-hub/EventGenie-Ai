import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Palette,
  Clock,
  DollarSign,
  ShieldAlert,
  Lightbulb,
  Copy,
  Check,
  FileText,
  Music,
  Utensils,
  Mic,
  Send,
  Loader2,
  RefreshCw,
  ArrowRight,
  ListPlus,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { formatCurrency } from '../../utils/formatters';

type StudioTab = 'invitation' | 'speech' | 'menu' | 'playlist' | 'consultant';

export const AiHubView: React.FC = () => {
  const {
    activeEvent,
    generateAIPlanForCurrentEvent,
    isAiGenerating,
    applyAiRecommendations,
  } = useEventContext();

  const [naturalVisionPrompt, setNaturalVisionPrompt] = useState('');
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('invitation');
  const [studioPrompt, setStudioPrompt] = useState('');
  const [studioResult, setStudioResult] = useState('');
  const [isStudioLoading, setIsStudioLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [applyOptions, setApplyOptions] = useState({
    applyBudget: true,
    applyTasks: true,
    applyVendors: true,
  });
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [hasAppliedRecommendations, setHasAppliedRecommendations] = useState(false);

  if (!activeEvent) {
    return <div className="p-8 text-center text-slate-500">Please select an event.</div>;
  }

  const aiPlan = activeEvent.aiPlan;
  const currency = activeEvent.currency || 'USD';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGeneratePlan = async () => {
    await generateAIPlanForCurrentEvent(naturalVisionPrompt.trim() || undefined);
  };

  const handleRunCreativeStudio = async () => {
    setIsStudioLoading(true);
    setStudioResult('');
    try {
      const response = await fetch('/api/gemini/creative-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeStudioTab,
          eventDetails: activeEvent,
          userPrompt: studioPrompt,
        }),
      });
      const data = await response.json();
      setStudioResult(data.result || 'No response generated.');
    } catch (err) {
      console.error('Error generating studio content:', err);
      setStudioResult('Encountered an issue calling the AI service. Please try again.');
    } finally {
      setIsStudioLoading(false);
    }
  };

  const handleConfirmApply = () => {
    if (aiPlan) {
      applyAiRecommendations(aiPlan, applyOptions);
      setIsApplyModalOpen(false);
      setHasAppliedRecommendations(true);
      setTimeout(() => setHasAppliedRecommendations(false), 4000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner: Master AI Generator with Natural Language Input */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-purple-950">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 3.8 Flash Multimodal Engine</span>
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-purple-200 border border-white/10">
              Target Currency: {currency}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Event Genie Hub
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
            Describe your vision in plain English—from intimate vineyard weddings to royal Indian Sangeets with live chaat, or milestone arcade birthdays. Gemini creates an itemized budget, dated timeline, decoration plan, menu, and backup protocol.
          </p>

          {/* Natural Language Prompt Input */}
          <div className="space-y-2 pt-1">
            <textarea
              rows={3}
              value={naturalVisionPrompt}
              onChange={(e) => setNaturalVisionPrompt(e.target.value)}
              placeholder="e.g. Traditional destination Sangeet & wedding in Jaipur with marigold floral decor, live Rajasthani chaat station, Baraat with dhol, and acoustic sunset vows..."
              className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-purple-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 backdrop-blur-xs"
            />
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-3">
            <button
              onClick={handleGeneratePlan}
              disabled={isAiGenerating}
              className="px-6 py-3 rounded-2xl bg-white text-purple-900 font-bold text-xs sm:text-sm hover:bg-purple-50 transition shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span>Synthesizing with Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-purple-600" />
                  <span>{aiPlan ? 'Regenerate Event Plan' : 'Generate Full AI Plan'}</span>
                </>
              )}
            </button>

            {aiPlan && (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-purple-700/60 hover:bg-purple-700 text-white font-semibold text-xs border border-purple-400/40 flex items-center gap-1.5 transition"
              >
                {hasAppliedRecommendations ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Applied to Timeline & Budget!</span>
                  </>
                ) : (
                  <>
                    <ListPlus className="w-4 h-4" />
                    <span>Apply AI Plan to Live Event</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generated AI Plan Display */}
      {aiPlan ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Section 1: Concept, Tagline & Palette */}
          <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-50 pb-4">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                  Creative Direction
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  Theme Concept & Aesthetic
                </h3>
              </div>
              {aiPlan.tagline && (
                <div className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-semibold text-xs italic border border-purple-200">
                  "{aiPlan.tagline}"
                </div>
              )}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {aiPlan.themeConcept}
            </p>

            {/* Color Palette Swatches */}
            {aiPlan.colorPalette && aiPlan.colorPalette.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                  Curated Color Palette
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {aiPlan.colorPalette.map((colorStr, i) => {
                    const parts = colorStr.split('(');
                    const hex = parts[0]?.trim() || '#7C3AED';
                    const name = parts[1] ? parts[1].replace(')', '').trim() : hex;
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center gap-3"
                      >
                        <div
                          className="w-10 h-10 rounded-xl shadow-xs border border-white shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">{name}</div>
                          <div className="text-[10px] text-slate-400 font-mono uppercase">{hex}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Itemized Budget Allocation */}
          {aiPlan.suggestedBudgetBreakdown && aiPlan.suggestedBudgetBreakdown.length > 0 && (
            <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-purple-50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">
                      AI Suggested Budget Allocation ({currency})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Calculated for {formatCurrency(activeEvent.budget, currency)} total event budget
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {aiPlan.suggestedBudgetBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800">{item.category}</span>
                        <span className="text-purple-700 font-extrabold bg-purple-100 px-2 py-0.5 rounded-md text-[11px]">
                          {item.percentage}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug mt-1">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-purple-100/60 font-extrabold text-sm text-purple-950">
                      {formatCurrency(
                        item.suggestedAmount || Math.round((activeEvent.budget * item.percentage) / 100),
                        currency
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Decoration Concepts & Culinary Menu */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Decoration Ideas */}
            <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Decoration Concepts & Styling</h3>
                  <p className="text-xs text-slate-400">Atmospheric focal points and materials</p>
                </div>
              </div>

              <div className="space-y-3">
                {aiPlan.decorationIdeas?.map((decor, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-pink-900">{decor.area}</span>
                      <span className="text-[11px] font-semibold text-pink-700 bg-pink-100 px-2 py-0.5 rounded">
                        {decor.concept}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{decor.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Recommendations */}
            <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Curated Menu Recommendations</h3>
                  <p className="text-xs text-slate-400">Appetizers, mains, beverages & dietary notes</p>
                </div>
              </div>

              {aiPlan.menuRecommendations ? (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100">
                    <span className="font-bold text-amber-900 block mb-1">Welcome Refreshments:</span>
                    <p className="text-slate-700">{aiPlan.menuRecommendations.welcomeDrinks.join(' • ')}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100">
                    <span className="font-bold text-amber-900 block mb-1">Starters & Passed Canapés:</span>
                    <p className="text-slate-700">{aiPlan.menuRecommendations.appetizers.join(' • ')}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100">
                    <span className="font-bold text-amber-900 block mb-1">Grand Entrées & Mains:</span>
                    <p className="text-slate-700">{aiPlan.menuRecommendations.mainCourse.join(' • ')}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100">
                    <span className="font-bold text-amber-900 block mb-1">Artisan Desserts:</span>
                    <p className="text-slate-700">{aiPlan.menuRecommendations.desserts.join(' • ')}</p>
                  </div>
                  {aiPlan.menuRecommendations.dietaryNotes && (
                    <div className="p-2.5 rounded-xl bg-purple-50 text-[11px] text-purple-800 border border-purple-100 font-medium">
                      {aiPlan.menuRecommendations.dietaryNotes}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No menu generated.</p>
              )}
            </div>
          </div>

          {/* Section 4: Highlights & Run of Show */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signature Highlight Moments */}
            <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Unforgettable Highlight Moments</h3>
                    <p className="text-xs text-slate-400">Curated signature experiential touches</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {aiPlan.highlightMoments.map((moment, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/70 to-indigo-50/40 border border-purple-100 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {moment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Minute-by-Minute Run of Show */}
            <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Day-of Run of Show</h3>
                      <p className="text-xs text-slate-400">Chronological itinerary and coordination cues</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        aiPlan.runOfShow
                          .map((r) => `${r.time} - ${r.activity} (${r.notes})`)
                          .join('\n'),
                        'run-of-show'
                      )
                    }
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    {copiedKey === 'run-of-show' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Schedule</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {aiPlan.runOfShow.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-start gap-3 hover:border-purple-200 transition"
                    >
                      <span className="text-xs font-extrabold text-purple-700 bg-purple-100/70 px-2 py-1 rounded-lg shrink-0">
                        {item.time}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800">{item.activity}</div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Backup Plan & Cost Saving Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backup Plan Protocol */}
            <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Contingency & Risk Protocol</h3>
                  <p className="text-xs text-slate-400">Safeguards for weather, delay & technical failures</p>
                </div>
              </div>

              {aiPlan.backupPlan ? (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <span className="font-bold text-amber-900 block mb-0.5">Weather Safeguard:</span>
                    <p className="text-slate-700">{aiPlan.backupPlan.weatherBackup}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <span className="font-bold text-amber-900 block mb-0.5">Vendor Backup:</span>
                    <p className="text-slate-700">{aiPlan.backupPlan.vendorBackup}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <span className="font-bold text-amber-900 block mb-0.5">Timing Buffer:</span>
                    <p className="text-slate-700">{aiPlan.backupPlan.timingBuffer}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <span className="font-bold text-amber-900 block mb-0.5">Power & Sound Backup:</span>
                    <p className="text-slate-700">{aiPlan.backupPlan.powerAudioBackup}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {aiPlan.contingencyTips.map((tip, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 text-xs">
                      {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cost Saving Tips */}
            <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Cost-Saving Intelligence</h3>
                  <p className="text-xs text-slate-400">Clever ways to optimize spending</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {aiPlan.budgetSavingTips?.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-2.5"
                  >
                    <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-purple-100 p-8 text-center space-y-4">
          <Wand2 className="w-12 h-12 text-purple-500 mx-auto animate-bounce" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-800">
              No AI Plan Generated Yet
            </h3>
            <p className="text-xs text-slate-500">
              Type your dream vision in the box above or click generate to synthesize your complete personalized event blueprint.
            </p>
          </div>
          <button
            onClick={handleGeneratePlan}
            disabled={isAiGenerating}
            className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition shadow-md shadow-purple-600/20"
          >
            {isAiGenerating ? 'Synthesizing with Gemini...' : 'Generate Plan with Gemini 3.8'}
          </button>
        </div>
      )}

      {/* Interactive Creative Studio */}
      <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Interactive AI Copy & Concept Generator</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">
            Creative Studio & Speechwriter
          </h2>
          <p className="text-xs text-slate-400">
            Generate invitations, personalized toasts, curated menus, and entertainment playlists in real-time.
          </p>
        </div>

        {/* Studio Sub-tabs */}
        <div className="flex flex-wrap gap-2 border-b border-purple-50 pb-3">
          {[
            { id: 'invitation' as StudioTab, label: 'Invitations & RSVP Copy', icon: FileText },
            { id: 'speech' as StudioTab, label: 'Speech & Toast Drafts', icon: Mic },
            { id: 'menu' as StudioTab, label: 'Catering & Cocktail Menu', icon: Utensils },
            { id: 'playlist' as StudioTab, label: 'Soundtrack & Vibes', icon: Music },
            { id: 'consultant' as StudioTab, label: 'Ask AI Event Consultant', icon: Wand2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStudioTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveStudioTab(tab.id);
                  setStudioResult('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input box */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            {activeStudioTab === 'invitation' && 'Specify tone, dress code, or special instructions (e.g. Royal Indian Sangeet, Cocktail attire):'}
            {activeStudioTab === 'speech' && 'Who is speaking and what tone? (e.g. Bride’s sister, heartfelt and humorous, 2 minutes):'}
            {activeStudioTab === 'menu' && 'Any dietary preferences or signature dishes? (e.g. Authentic Chaat, Paneer Tikka, Thandai cocktail):'}
            {activeStudioTab === 'playlist' && 'Desired music eras or specific moments? (e.g. Punjabi dhol baraat, 90s Bollywood dance floor):'}
            {activeStudioTab === 'consultant' && 'What event planning dilemma or question would you like Gemini to solve?'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={studioPrompt}
              onChange={(e) => setStudioPrompt(e.target.value)}
              placeholder="e.g. Make it emotional, mention our families coming together, and end with an energetic toast..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-purple-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              onKeyDown={(e) => e.key === 'Enter' && handleRunCreativeStudio()}
            />
            <button
              onClick={handleRunCreativeStudio}
              disabled={isStudioLoading}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {isStudioLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Studio Generated Result */}
        {studioResult && (
          <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Generated Copy
              </span>
              <button
                onClick={() => handleCopy(studioResult, 'studio-result')}
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1.5"
              >
                {copiedKey === 'studio-result' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans bg-white p-4 rounded-xl border border-purple-100 shadow-xs max-h-96 overflow-y-auto">
              {studioResult}
            </div>
          </div>
        )}
      </div>

      {/* Apply AI Plan to Event Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-base text-slate-800">
              Apply AI Plan to Live Event
            </h3>
            <p className="text-xs text-slate-500">
              Select which AI-generated items to populate into your active event database:
            </p>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-3 p-3 rounded-2xl border border-purple-100 bg-purple-50/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyOptions.applyTasks}
                  onChange={(e) => setApplyOptions({ ...applyOptions, applyTasks: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Recommended Action Tasks</span>
                  <span className="text-slate-500 text-[11px]">Calculates real dates for milestones</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl border border-purple-100 bg-purple-50/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyOptions.applyBudget}
                  onChange={(e) => setApplyOptions({ ...applyOptions, applyBudget: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Itemized Budget Breakdown</span>
                  <span className="text-slate-500 text-[11px]">Populates categories in {currency}</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl border border-purple-100 bg-purple-50/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyOptions.applyVendors}
                  onChange={(e) => setApplyOptions({ ...applyOptions, applyVendors: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Vendor Checklist</span>
                  <span className="text-slate-500 text-[11px]">Pre-loads supplier interview questions</span>
                </div>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition"
              >
                Confirm & Populate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
