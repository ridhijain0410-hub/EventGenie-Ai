import React from 'react';
import {
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Building2,
  Wand2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Plus,
  Compass,
  Utensils,
  Palette,
  ShieldAlert,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { formatCurrency, formatDate, getDaysRemaining, getEventTypeBadge } from '../../utils/formatters';
import { ActiveTab } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenCreateEvent: () => void;
  onOpenAddExpense: () => void;
  onOpenAddTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenCreateEvent,
  onOpenAddExpense,
  onOpenAddTask,
}) => {
  const {
    activeEvent,
    activeBudgetItems,
    activeTasks,
    activeVendors,
    activeGuests,
    budgetMetrics,
    toggleTaskStatus,
    generateAIPlanForCurrentEvent,
    isAiGenerating,
  } = useEventContext();

  if (!activeEvent) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wand2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No event selected</h3>
        <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
          Create your first dream event or select one of our pre-built sample events to explore.
        </p>
        <button
          onClick={onOpenCreateEvent}
          className="mt-5 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition shadow-md shadow-purple-600/20"
        >
          Create Event Now
        </button>
      </div>
    );
  }

  const currency = activeEvent.currency || 'USD';

  // Task calculations
  const completedTasks = activeTasks.filter((t) => t.status === 'completed');
  const pendingTasks = activeTasks.filter((t) => t.status !== 'completed');
  const taskProgressPct = activeTasks.length > 0 ? Math.round((completedTasks.length / activeTasks.length) * 100) : 0;

  // Guest calculations
  const attendingGuests = activeGuests.filter((g) => g.rsvpStatus === 'attending');
  const attendingHeadcount = attendingGuests.reduce((sum, g) => sum + g.partySize, 0);
  const declinedGuests = activeGuests.filter((g) => g.rsvpStatus === 'declined').length;
  const tentativeGuests = activeGuests.filter((g) => g.rsvpStatus === 'tentative' || g.rsvpStatus === 'invited').length;
  const dietaryCount = activeGuests.filter((g) => g.dietaryRestrictions && g.dietaryRestrictions.toLowerCase() !== 'none').length;

  // Vendor calculations
  const bookedVendors = activeVendors.filter((v) => v.status === 'booked');

  // Days left & Event type
  const daysLeft = getDaysRemaining(activeEvent.date);
  const typeBadge = getEventTypeBadge(activeEvent.type);

  // Group budget by categories for visual chart
  const categoryTotals: Record<string, { estimated: number; actual: number }> = {};
  activeBudgetItems.forEach((item) => {
    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = { estimated: 0, actual: 0 };
    }
    categoryTotals[item.category].estimated += item.estimatedCost || 0;
    categoryTotals[item.category].actual += item.actualCost || 0;
  });

  const categoryEntries = Object.entries(categoryTotals).slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Hero Event Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white p-6 sm:p-8 shadow-xl shadow-purple-950/15 border border-purple-700/50">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${typeBadge.bg} ${typeBadge.color}`}>
                {typeBadge.label}
              </span>
              {activeEvent.isDemo ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-400 text-purple-950">
                  Demo Sample
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-400 text-emerald-950">
                  Custom Event
                </span>
              )}
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-white/10 text-purple-200 border border-white/10 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(activeEvent.date, currency === 'INR' ? 'indian' : 'standard')}
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-white/10 text-purple-200 border border-white/10 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {activeEvent.time || '18:00'}
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {daysLeft > 0 ? `${daysLeft} Days to Go` : daysLeft === 0 ? 'Today!' : 'Completed'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {activeEvent.name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-purple-200">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="font-medium text-white">{activeEvent.venue}</span>
                <span>({activeEvent.location})</span>
              </span>
              <span className="hidden sm:inline text-purple-400">•</span>
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-300 shrink-0" />
                <span className="italic">Theme: {activeEvent.theme}</span>
              </span>
            </div>

            {activeEvent.aiPlan?.tagline && (
              <p className="text-xs sm:text-sm text-purple-200/90 italic pt-1 border-t border-white/10">
                "{activeEvent.aiPlan.tagline}"
              </p>
            )}
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
            <button
              onClick={() => onNavigate('ai-hub')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Wand2 className="w-4 h-4 text-purple-900" />
              <span>Explore AI Genie Studio</span>
            </button>

            {!activeEvent.aiPlan && (
              <button
                disabled={isAiGenerating}
                onClick={() => generateAIPlanForCurrentEvent()}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition border border-white/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>{isAiGenerating ? 'Generating with Gemini...' : 'Generate AI Plan'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Metric Financial & Progress KPI Cards (100% Reconciled) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget & Operating Budget */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Budget</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
              {currency === 'INR' ? '₹' : '$'}
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatCurrency(budgetMetrics.totalBudget, currency)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Operating: {formatCurrency(budgetMetrics.operatingBudget, currency)}</span>
            <span className="text-purple-600 font-semibold">{budgetMetrics.contingencyPercentage}% reserve</span>
          </div>
        </div>

        {/* Actual Spent / Incurred */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Actual Spent</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatCurrency(budgetMetrics.totalActual, currency)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Disbursed: {formatCurrency(budgetMetrics.totalPaid, currency)}</span>
            <span className={`font-semibold ${budgetMetrics.isOverBudget ? 'text-rose-600' : 'text-indigo-600'}`}>
              {budgetMetrics.actualSpentPercentage}%
            </span>
          </div>
        </div>

        {/* Remaining Operating Balance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Remaining Balance</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                budgetMetrics.remainingTotalBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-extrabold ${
              budgetMetrics.remainingTotalBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {formatCurrency(budgetMetrics.remainingTotalBalance, currency)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              Operating: {formatCurrency(budgetMetrics.operatingBudgetRemaining, currency)}
            </span>
            <span
              className={`font-semibold ${
                budgetMetrics.isOverBudget
                  ? 'text-rose-600'
                  : budgetMetrics.isOperatingExceeded
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {budgetMetrics.isOverBudget
                ? 'Deficit'
                : budgetMetrics.isOperatingExceeded
                ? 'Buffer Active'
                : 'On Track'}
            </span>
          </div>
        </div>

        {/* Guest RSVP Confirmation */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Guest Headcount</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {attendingHeadcount} <span className="text-sm font-normal text-slate-400">/ {activeEvent.guestCount} target</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{tentativeGuests} pending reply</span>
            <span className="font-semibold text-blue-600">
              {Math.round((attendingHeadcount / (activeEvent.guestCount || 1)) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Mathematical Budget Reconciliation Explainer Card */}
      <div className="bg-white rounded-3xl border border-purple-100 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-50 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              Σ
            </div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
              Mathematical Budget Reconciliation
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Reconciles Total Budget = Operating Budget + Contingency Reserve
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Budget</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5">
              {formatCurrency(budgetMetrics.totalBudget, currency)}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              100% Top-line ceiling
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col justify-between">
            <span className="text-[10px] text-amber-700 uppercase font-semibold block">
              Contingency Reserve
            </span>
            <span className="font-bold text-amber-900 text-sm mt-0.5">
              {formatCurrency(budgetMetrics.contingencyReserve, currency)}
            </span>
            <span className="text-[10px] text-amber-700 mt-1 block">
              {budgetMetrics.contingencyPercentage}% buffer
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between">
            <span className="text-[10px] text-purple-700 uppercase font-semibold block">Operating Budget</span>
            <span className="font-bold text-purple-900 text-sm mt-0.5">
              {formatCurrency(budgetMetrics.operatingBudget, currency)}
            </span>
            <span className="text-[10px] text-purple-700 mt-1 block">
              Total − Contingency
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col justify-between">
            <span className="text-[10px] text-blue-700 uppercase font-semibold block">Actual Spending</span>
            <span className="font-bold text-blue-900 text-sm mt-0.5">
              {formatCurrency(budgetMetrics.totalActual, currency)}
            </span>
            <span className="text-[10px] text-blue-700 mt-1 block">
              Paid: {formatCurrency(budgetMetrics.totalPaid, currency)}
            </span>
          </div>
          <div
            className={`p-3 rounded-2xl border flex flex-col justify-between ${
              budgetMetrics.isOperatingExceeded
                ? 'bg-rose-50/80 border-rose-200'
                : 'bg-emerald-50/60 border-emerald-100'
            }`}
          >
            <span
              className={`text-[10px] uppercase font-semibold block ${
                budgetMetrics.isOperatingExceeded ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              Operating Remaining
            </span>
            <span
              className={`font-bold text-sm mt-0.5 ${
                budgetMetrics.isOperatingExceeded ? 'text-rose-800' : 'text-emerald-800'
              }`}
            >
              {formatCurrency(budgetMetrics.operatingBudgetRemaining, currency)}
            </span>
            <span
              className={`text-[10px] mt-1 block ${
                budgetMetrics.isOperatingExceeded ? 'text-rose-600 font-semibold' : 'text-emerald-600'
              }`}
            >
              {budgetMetrics.isOperatingExceeded ? 'Operating Exceeded' : 'Operating − Spend'}
            </span>
          </div>
          <div
            className={`p-3 rounded-2xl border flex flex-col justify-between ${
              budgetMetrics.isOverBudget
                ? 'bg-rose-100/80 border-rose-300'
                : budgetMetrics.isOperatingExceeded
                ? 'bg-amber-50/80 border-amber-200'
                : 'bg-emerald-50/60 border-emerald-100'
            }`}
          >
            <span
              className={`text-[10px] uppercase font-semibold block ${
                budgetMetrics.isOverBudget
                  ? 'text-rose-800'
                  : budgetMetrics.isOperatingExceeded
                  ? 'text-amber-800'
                  : 'text-emerald-700'
              }`}
            >
              Total Remaining
            </span>
            <span
              className={`font-bold text-sm mt-0.5 ${
                budgetMetrics.isOverBudget
                  ? 'text-rose-900'
                  : budgetMetrics.isOperatingExceeded
                  ? 'text-amber-900'
                  : 'text-emerald-800'
              }`}
            >
              {formatCurrency(budgetMetrics.remainingTotalBalance, currency)}
            </span>
            <span
              className={`text-[10px] mt-1 block ${
                budgetMetrics.isOverBudget
                  ? 'text-rose-700 font-bold'
                  : budgetMetrics.isOperatingExceeded
                  ? 'text-amber-700'
                  : 'text-emerald-600'
              }`}
            >
              {budgetMetrics.isOverBudget
                ? 'Budget Deficit'
                : budgetMetrics.isOperatingExceeded
                ? 'Buffer Absorbing'
                : 'Total − Actual'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Mid Section: Budget Category Allocation & Task Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Health & Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-purple-100 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Budget Category Breakdown</h3>
                <p className="text-xs text-slate-400">Comparing estimated costs vs actual incurred expenses</p>
              </div>
              <button
                onClick={() => onNavigate('budget')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Overall Spent Bar */}
            <div className="mb-6 p-4 rounded-2xl bg-purple-50/50 border border-purple-100/60">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-700">Budget Incurred</span>
                <span className="font-bold text-purple-700">{budgetMetrics.actualSpentPercentage}% used</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    budgetMetrics.isOverBudget
                      ? 'bg-rose-500'
                      : budgetMetrics.actualSpentPercentage > 85
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                  }`}
                  style={{ width: `${budgetMetrics.actualSpentPercentage}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Incurred: {formatCurrency(budgetMetrics.totalActual, currency)}</span>
                <span>Total Limit: {formatCurrency(budgetMetrics.totalBudget, currency)}</span>
              </div>
            </div>

            {/* Category Bars */}
            <div className="space-y-3.5">
              {categoryEntries.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No budget items added yet. Click "+ Add Expense" to begin tracking.
                </div>
              ) : (
                categoryEntries.map(([catName, values]) => {
                  const pct = budgetMetrics.totalBudget > 0 ? Math.round((values.actual / budgetMetrics.totalBudget) * 100) : 0;
                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{catName}</span>
                        <div className="text-slate-500 text-[11px]">
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(values.actual, currency)}
                          </span>
                          <span className="text-slate-400 ml-1">
                            / {formatCurrency(values.estimated, currency)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.min(pct * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Contingency cushion: <strong className="text-slate-700">{formatCurrency(budgetMetrics.contingencyReserve, currency)}</strong>
            </span>
            <button
              onClick={onOpenAddExpense}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Upcoming Tasks Checklist */}
        <div className="bg-white rounded-3xl border border-purple-100 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Imminent Tasks</h3>
                <p className="text-xs text-slate-400">
                  {completedTasks.length} of {activeTasks.length} tasks completed ({taskProgressPct}%)
                </p>
              </div>
              <button
                onClick={() => onNavigate('timeline')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <span>Timeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-purple-50/30 transition flex items-start gap-3 group"
                >
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="mt-0.5 w-4 h-4 rounded-md border border-slate-300 hover:border-purple-600 flex items-center justify-center transition shrink-0"
                  >
                    {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 leading-snug group-hover:text-purple-900 transition-colors">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="font-medium text-purple-600">{task.milestone}</span>
                      <span>•</span>
                      <span>Due {formatDate(task.dueDate, currency === 'INR' ? 'indian' : 'standard')}</span>
                      {task.priority === 'high' && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 font-semibold">
                          High
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {pendingTasks.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All upcoming tasks completed! You're ahead of schedule.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {pendingTasks.length} tasks pending
            </span>
            <button
              onClick={onOpenAddTask}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: Vendor Status & AI Run of Show Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Pipeline Card */}
        <div className="bg-white rounded-3xl border border-purple-100 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Key Event Vendors</h3>
              <p className="text-xs text-slate-400">
                {bookedVendors.length} of {activeVendors.length} vendors contracted and booked
              </p>
            </div>
            <button
              onClick={() => onNavigate('vendors')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <span>Manage Vendors</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {activeVendors.slice(0, 4).map((vendor) => (
              <div
                key={vendor.id}
                className="p-3 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-purple-200 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{vendor.name}</div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {vendor.category} • {vendor.contactPerson || 'No contact specified'}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-800">
                    {formatCurrency(vendor.quotedPrice, currency)}
                  </div>
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                      vendor.status === 'booked'
                        ? 'bg-emerald-50 text-emerald-700'
                        : vendor.status === 'quoted'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {vendor.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Event Concept & Schedule Spotlight */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50/40 rounded-3xl border border-purple-100 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">AI Event Design & Highlights</h3>
                  <p className="text-xs text-slate-400">Curated by Gemini 3.8 Flash</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('ai-hub')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <span>AI Studio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeEvent.aiPlan ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed bg-white/70 p-3 rounded-2xl border border-purple-100">
                  {activeEvent.aiPlan.themeConcept}
                </p>

                <div>
                  <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block mb-2">
                    Signature Moments
                  </span>
                  <div className="space-y-1.5">
                    {activeEvent.aiPlan.highlightMoments.slice(0, 3).map((moment, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                        <span>{moment}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color swatches */}
                {activeEvent.aiPlan.colorPalette && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Palette:</span>
                    <div className="flex items-center gap-1.5">
                      {activeEvent.aiPlan.colorPalette.map((color, i) => {
                        const hex = color.split(' ')[0] || '#7C3AED';
                        return (
                          <div
                            key={i}
                            title={color}
                            className="w-5 h-5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: hex }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <Wand2 className="w-8 h-8 text-purple-400 mx-auto animate-pulse" />
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Unlock bespoke theme narratives, minute-by-minute run-of-show, and vendor checklists for this event.
                </p>
                <button
                  onClick={() => generateAIPlanForCurrentEvent()}
                  disabled={isAiGenerating}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition"
                >
                  {isAiGenerating ? 'Crafting with Gemini...' : 'Generate AI Plan Now'}
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-purple-100/60 flex items-center justify-between text-xs text-slate-400">
            <span>Special dietary alerts: <strong className="text-slate-700">{dietaryCount} guests</strong></span>
            <button
              onClick={() => onNavigate('guests')}
              className="text-purple-600 font-semibold hover:underline"
            >
              View RSVP list
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
