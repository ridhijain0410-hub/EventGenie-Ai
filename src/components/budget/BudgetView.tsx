import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Download,
  Filter,
  Search,
  CheckCircle2,
  PieChart,
  Lightbulb,
  Sparkles,
  ArrowUpDown,
  Building,
  Info,
  X,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { BudgetItem, BudgetCategory, PaymentStatus } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';

interface BudgetViewProps {
  onOpenAddExpense: () => void;
  onEditExpense?: (item: BudgetItem) => void;
}

const CATEGORIES: BudgetCategory[] = [
  'Venue & Rentals',
  'Catering & Bar',
  'Decor & Florals',
  'Photography & Video',
  'Entertainment & Music',
  'Attire & Beauty',
  'Stationery & Favors',
  'Staff & Security',
  'Contingency & Misc',
  'Other',
];

export const BudgetView: React.FC<BudgetViewProps> = ({ onOpenAddExpense }) => {
  const {
    activeEvent,
    activeBudgetItems,
    budgetMetrics,
    deleteBudgetItem,
    updateBudgetItem,
  } = useEventContext();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [editError, setEditError] = useState('');
  const [isAiOptimizerOpen, setIsAiOptimizerOpen] = useState(false);

  if (!activeEvent) {
    return <div className="p-8 text-center text-slate-500">Please select an event.</div>;
  }

  const currency = activeEvent.currency || 'USD';

  // Live category spending breakdown derived directly from activeBudgetItems
  const categoryBreakdown = useMemo(() => {
    const map: Record<
      string,
      { estimated: number; actual: number; paid: number; count: number }
    > = {};

    activeBudgetItems.forEach((item) => {
      if (!map[item.category]) {
        map[item.category] = { estimated: 0, actual: 0, paid: 0, count: 0 };
      }
      map[item.category].estimated += item.estimatedCost || 0;
      map[item.category].actual += item.actualCost || 0;
      map[item.category].paid += item.paidAmount || 0;
      map[item.category].count += 1;
    });

    return Object.entries(map).map(([category, data]) => {
      const isContingency = category === 'Contingency & Misc';
      const referenceBase = isContingency
        ? budgetMetrics.contingencyReserve
        : budgetMetrics.operatingBudget;
      const percentSpent =
        referenceBase > 0 ? Math.round((data.actual / referenceBase) * 100) : 0;
      const variance = data.actual - data.estimated;

      return {
        category,
        ...data,
        isContingency,
        percentSpent,
        variance,
      };
    });
  }, [activeBudgetItems, budgetMetrics.operatingBudget, budgetMetrics.contingencyReserve]);

  // Filter items
  const filteredItems = activeBudgetItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.vendorName && item.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Quick inline status change
  const handleQuickStatusChange = (id: string, newStatus: PaymentStatus) => {
    const item = activeBudgetItems.find((b) => b.id === id);
    if (!item) return;

    if (newStatus === 'paid_in_full') {
      updateBudgetItem(id, {
        status: 'paid_in_full',
        paidAmount: item.actualCost || item.estimatedCost,
      });
    } else {
      updateBudgetItem(id, { status: newStatus });
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Category',
      'Item Name',
      'Vendor',
      `Estimated Cost (${currency})`,
      `Actual Cost (${currency})`,
      `Paid Amount (${currency})`,
      'Status',
      'Notes',
    ];
    const rows = activeBudgetItems.map((item) => [
      `"${item.category}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${(item.vendorName || '').replace(/"/g, '""')}"`,
      item.estimatedCost,
      item.actualCost,
      item.paidAmount,
      item.status,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeEvent.name.replace(/\s+/g, '_')}_Budget_Report_${currency}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner: Financial Summary */}
      <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-50 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                Budget Planner & Expense Ledger
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                Currency: {currency}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Reconciled oversight of total budget, operating allocations, actual spend, and emergency reserves.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAiOptimizerOpen(!isAiOptimizerOpen)}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition border border-purple-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Benchmark Guidelines</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenAddExpense}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-purple-600/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* 6 Mathematically Reconciled KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Total Budget = Operating Budget + Contingency Reserve */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block mb-1">
                Total Budget
              </span>
              <div className="text-lg font-extrabold text-purple-950">
                {formatCurrency(budgetMetrics.totalBudget, currency)}
              </div>
            </div>
            <span className="text-[10px] text-purple-700 mt-2 block border-t border-purple-100/60 pt-1">
              Operating + {budgetMetrics.contingencyPercentage}% Reserve
            </span>
          </div>

          {/* 2. Operating Budget = Total Budget - Contingency Reserve */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Operating Budget
              </span>
              <div className="text-lg font-extrabold text-slate-900">
                {formatCurrency(budgetMetrics.operatingBudget, currency)}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block border-t border-slate-200/60 pt-1">
              Total − Contingency
            </span>
          </div>

          {/* 3. Contingency Reserve (Tracked separately, never counted twice) */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Contingency Reserve
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900">
                  {budgetMetrics.contingencyPercentage}%
                </span>
              </div>
              <div className="text-lg font-extrabold text-amber-950">
                {formatCurrency(budgetMetrics.contingencyReserve, currency)}
              </div>
            </div>
            <span className="text-[10px] text-amber-700 mt-2 block border-t border-amber-200/50 pt-1">
              Available: {formatCurrency(budgetMetrics.contingencyReserveRemaining, currency)}
            </span>
          </div>

          {/* 4. Actual Spending = Operating Spend + Contingency Spend */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
                Actual Spending
              </span>
              <div className="text-lg font-extrabold text-blue-950">
                {formatCurrency(budgetMetrics.totalActual, currency)}
              </div>
            </div>
            <span className="text-[10px] text-blue-700 mt-2 block border-t border-blue-100 pt-1">
              Paid: {formatCurrency(budgetMetrics.totalPaid, currency)}
            </span>
          </div>

          {/* 5. Operating Budget Remaining = Operating Budget - Actual Operating Expenses */}
          <div
            className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
              budgetMetrics.isOperatingExceeded
                ? 'bg-rose-50/80 border-rose-200'
                : 'bg-emerald-50/70 border-emerald-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    budgetMetrics.isOperatingExceeded ? 'text-rose-800' : 'text-emerald-800'
                  }`}
                >
                  Operating Remaining
                </span>
                {budgetMetrics.isOperatingExceeded && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 uppercase">
                    Over
                  </span>
                )}
              </div>
              <div
                className={`text-lg font-extrabold ${
                  budgetMetrics.isOperatingExceeded ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                {formatCurrency(budgetMetrics.operatingBudgetRemaining, currency)}
              </div>
            </div>
            <span
              className={`text-[10px] mt-2 block border-t pt-1 ${
                budgetMetrics.isOperatingExceeded
                  ? 'border-rose-200/60 text-rose-600 font-semibold'
                  : 'border-emerald-200/50 text-emerald-700'
              }`}
            >
              {budgetMetrics.isOperatingExceeded
                ? `Exceeded by ${formatCurrency(budgetMetrics.overspentOperatingAmount, currency)}`
                : 'Operating − Operating Spend'}
            </span>
          </div>

          {/* 6. Remaining Total Balance = Total Budget - Actual Spending */}
          <div
            className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
              budgetMetrics.isOverBudget
                ? 'bg-rose-100/80 border-rose-300'
                : budgetMetrics.isOperatingExceeded
                ? 'bg-amber-50/80 border-amber-200'
                : 'bg-emerald-50/70 border-emerald-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    budgetMetrics.isOverBudget
                      ? 'text-rose-900'
                      : budgetMetrics.isOperatingExceeded
                      ? 'text-amber-800'
                      : 'text-emerald-800'
                  }`}
                >
                  Total Balance
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    budgetMetrics.isOverBudget
                      ? 'bg-rose-200 text-rose-900'
                      : budgetMetrics.isOperatingExceeded
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {budgetMetrics.isOverBudget
                    ? 'Deficit'
                    : budgetMetrics.isOperatingExceeded
                    ? 'Buffer Safe'
                    : 'Solvent'}
                </span>
              </div>
              <div
                className={`text-lg font-extrabold ${
                  budgetMetrics.isOverBudget
                    ? 'text-rose-700'
                    : budgetMetrics.isOperatingExceeded
                    ? 'text-amber-900'
                    : 'text-emerald-700'
                }`}
              >
                {formatCurrency(budgetMetrics.remainingTotalBalance, currency)}
              </div>
            </div>
            <span
              className={`text-[10px] mt-2 block border-t pt-1 ${
                budgetMetrics.isOverBudget
                  ? 'border-rose-300 text-rose-700 font-bold'
                  : budgetMetrics.isOperatingExceeded
                  ? 'border-amber-200 text-amber-800'
                  : 'border-emerald-200 text-emerald-700'
              }`}
            >
              {budgetMetrics.isOverBudget
                ? `Total Deficit: -${formatCurrency(budgetMetrics.overspentTotalAmount, currency)}`
                : budgetMetrics.isOperatingExceeded
                ? 'Covered by Reserve'
                : 'Total − Total Actual'}
            </span>
          </div>
        </div>

        {/* Dynamic Overspending Alert Banner */}
        {budgetMetrics.isOverBudget ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-rose-800">
                Total Budget Deficit Alert
              </h4>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                Total actual spending of <strong>{formatCurrency(budgetMetrics.totalActual, currency)}</strong> has
                exceeded the entire event budget of{' '}
                <strong>{formatCurrency(budgetMetrics.totalBudget, currency)}</strong> by{' '}
                <strong className="text-rose-900">
                  {formatCurrency(budgetMetrics.overspentTotalAmount, currency)}
                </strong>
                . Immediate expense reduction is advised.
              </p>
            </div>
          </div>
        ) : budgetMetrics.isOperatingExceeded ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                Operating Budget Exceeded — Contingency Reserve Absorbing Overrun
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Actual operating expenses (
                <strong>{formatCurrency(budgetMetrics.actualOperatingExpenses, currency)}</strong>) have exceeded your
                operating budget (
                <strong>{formatCurrency(budgetMetrics.operatingBudget, currency)}</strong>) by{' '}
                <strong className="text-amber-950">
                  {formatCurrency(budgetMetrics.overspentOperatingAmount, currency)}
                </strong>
                . Your protected contingency reserve of{' '}
                <strong>{formatCurrency(budgetMetrics.contingencyReserve, currency)}</strong> is absorbing this
                difference, keeping the overall celebration solvent with{' '}
                <strong className="text-emerald-800">
                  {formatCurrency(budgetMetrics.remainingTotalBalance, currency)}
                </strong>{' '}
                net remaining balance.
              </p>
            </div>
          </div>
        ) : null}

        {/* Visual Overall Spending Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              Spending Incurred: <strong>{formatCurrency(budgetMetrics.totalActual, currency)}</strong> of{' '}
              <strong>{formatCurrency(budgetMetrics.totalBudget, currency)}</strong>
            </span>
            <span
              className={`font-bold ${
                budgetMetrics.isOverBudget
                  ? 'text-rose-600'
                  : budgetMetrics.isOperatingExceeded
                  ? 'text-amber-600'
                  : 'text-purple-700'
              }`}
            >
              {budgetMetrics.actualSpentPercentage}% of total budget
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-purple-600 h-3 transition-all duration-500"
              style={{
                width: `${Math.min(
                  budgetMetrics.totalBudget > 0
                    ? (budgetMetrics.totalPaid / budgetMetrics.totalBudget) * 100
                    : 0,
                  100
                )}%`,
              }}
              title={`Disbursed: ${formatCurrency(budgetMetrics.totalPaid, currency)}`}
            />
            <div
              className="bg-purple-300 h-3 transition-all duration-500"
              style={{
                width: `${Math.min(
                  budgetMetrics.totalBudget > 0
                    ? (budgetMetrics.pendingPayment / budgetMetrics.totalBudget) * 100
                    : 0,
                  100
                )}%`,
              }}
              title={`Pending Due: ${formatCurrency(budgetMetrics.pendingPayment, currency)}`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
              <span>Paid in full / Deposit ({formatCurrency(budgetMetrics.totalPaid, currency)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-300 inline-block" />
              <span>Committed / Balance Due ({formatCurrency(budgetMetrics.pendingPayment, currency)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>
                Contingency Reserve ({formatCurrency(budgetMetrics.contingencyReserve, currency)})
              </span>
            </div>
          </div>
        </div>

        {/* Live Category Spending Breakdown Chart */}
        {categoryBreakdown.length > 0 && (
          <div className="pt-3 border-t border-purple-50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Live Category Spending & Variance
              </h3>
              <span className="text-[11px] text-slate-400">
                {categoryBreakdown.length} active spending categories
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryBreakdown.map((cat) => (
                <div
                  key={cat.category}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-purple-200 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 truncate">{cat.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        cat.variance > 0
                          ? 'bg-rose-100 text-rose-700'
                          : cat.variance < 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat.variance > 0
                        ? `+${formatCurrency(cat.variance, currency)} over`
                        : cat.variance < 0
                        ? `${formatCurrency(Math.abs(cat.variance), currency)} under`
                        : 'On Quote'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Actual: <strong>{formatCurrency(cat.actual, currency)}</strong>
                    </span>
                    <span>Quote: {formatCurrency(cat.estimated, currency)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        cat.variance > 0 ? 'bg-rose-500' : 'bg-purple-600'
                      }`}
                      style={{
                        width: `${Math.min(
                          cat.estimated > 0 ? (cat.actual / cat.estimated) * 100 : cat.actual > 0 ? 100 : 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Budget Benchmark Drawer (Collapsible) */}
      {isAiOptimizerOpen && (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl text-white p-6 shadow-lg border border-purple-700 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-base">
                Industry Benchmark Allocations ({currency})
              </h3>
            </div>
            <button
              onClick={() => setIsAiOptimizerOpen(false)}
              className="text-xs text-purple-200 hover:text-white"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-purple-200 mb-4 max-w-2xl">
            For a <strong className="text-white capitalize">{activeEvent.type.replace('_', ' ')}</strong> with a{' '}
            <strong className="text-white">{formatCurrency(budgetMetrics.totalBudget, currency)}</strong> budget, standard
            planner allocations recommend:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-[11px] text-purple-200 block">Venue & Rentals</span>
              <span className="font-bold text-white text-sm">30 - 35%</span>
              <span className="text-[10px] text-purple-300 block">
                {formatCurrency(budgetMetrics.totalBudget * 0.32, currency)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-[11px] text-purple-200 block">Catering & Bar</span>
              <span className="font-bold text-white text-sm">32 - 38%</span>
              <span className="text-[10px] text-purple-300 block">
                {formatCurrency(budgetMetrics.totalBudget * 0.35, currency)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-[11px] text-purple-200 block">Photography & Video</span>
              <span className="font-bold text-white text-sm">10 - 12%</span>
              <span className="text-[10px] text-purple-300 block">
                {formatCurrency(budgetMetrics.totalBudget * 0.1, currency)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-[11px] text-purple-200 block">Decor & Florals</span>
              <span className="font-bold text-white text-sm">12 - 16%</span>
              <span className="text-[10px] text-purple-300 block">
                {formatCurrency(budgetMetrics.totalBudget * 0.14, currency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-purple-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories ({activeBudgetItems.length})</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-purple-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid_in_full">Paid in Full</option>
            <option value="deposit_paid">Deposit Paid</option>
            <option value="planned">Planned</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search items or vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-purple-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>
      </div>

      {/* Expense Items Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-50 bg-purple-50/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Item & Vendor</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Estimated</th>
                <th className="py-3.5 px-4 text-right">Actual Incurred</th>
                <th className="py-3.5 px-4 text-right">Paid</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-xs">
              {filteredItems.map((item) => {
                const balanceDue = (item.actualCost || item.estimatedCost) - (item.paidAmount || 0);
                const isOverBudget = item.actualCost > item.estimatedCost && item.estimatedCost > 0;

                return (
                  <tr key={item.id} className="hover:bg-purple-50/30 transition-colors group">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-slate-800">{item.name}</div>
                      {item.vendorName ? (
                        <div className="text-[11px] text-purple-600 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          <span>{item.vendorName}</span>
                        </div>
                      ) : (
                        item.notes && <div className="text-[11px] text-slate-400 mt-0.5">{item.notes}</div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right text-slate-500 font-medium">
                      {formatCurrency(item.estimatedCost, currency)}
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-slate-800">
                      <span>{formatCurrency(item.actualCost, currency)}</span>
                      {isOverBudget && (
                        <span className="block text-[10px] text-rose-500 font-medium">
                          +{formatCurrency(item.actualCost - item.estimatedCost, currency)} over
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right font-medium text-emerald-700">
                      {formatCurrency(item.paidAmount, currency)}
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-slate-700">
                      {balanceDue > 0 ? (
                        <span className="text-amber-700">{formatCurrency(balanceDue, currency)}</span>
                      ) : (
                        <span className="text-emerald-600">Settled</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleQuickStatusChange(item.id, e.target.value as PaymentStatus)
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg border focus:outline-none ${
                          item.status === 'paid_in_full'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'deposit_paid'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : item.status === 'pending'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="planned">Planned</option>
                        <option value="deposit_paid">Deposit Paid</option>
                        <option value="paid_in_full">Paid in Full</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition"
                          title="Edit expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteBudgetItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600 mb-1">No expense items found</p>
                    <p className="text-xs text-slate-400 mb-3">
                      Start tracking quotes and expenses by clicking below.
                    </p>
                    <button
                      onClick={onOpenAddExpense}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
                    >
                      + Add First Expense
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Expense Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Edit Budget Expense</h2>
                  <p className="text-xs text-purple-200">
                    Update costs in {currency}, payment status, or vendor details.
                  </p>
                </div>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-1.5 rounded-lg text-purple-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const est = parseFloat(editingItem.estimatedCost as any);
                const act = parseFloat(editingItem.actualCost as any);
                const paid = parseFloat(editingItem.paidAmount as any);

                if (isNaN(est) || est < 0) {
                  setEditError('Estimated cost must be 0 or a positive number.');
                  return;
                }
                if (isNaN(act) || act < 0) {
                  setEditError('Actual cost must be 0 or a positive number.');
                  return;
                }
                if (isNaN(paid) || paid < 0) {
                  setEditError('Paid amount must be 0 or a positive number.');
                  return;
                }

                updateBudgetItem(editingItem.id, {
                  name: editingItem.name.trim(),
                  category: editingItem.category,
                  estimatedCost: est,
                  actualCost: act,
                  paidAmount: paid,
                  status: editingItem.status,
                  vendorName: editingItem.vendorName?.trim() || undefined,
                  notes: editingItem.notes?.trim() || undefined,
                });
                setEditingItem(null);
                setEditError('');
              }}
              className="p-6 space-y-4"
            >
              {editError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as BudgetCategory })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={editingItem.estimatedCost}
                    onChange={(e) => setEditingItem({ ...editingItem, estimatedCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Actual ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={editingItem.actualCost}
                    onChange={(e) => setEditingItem({ ...editingItem, actualCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Paid ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={editingItem.paidAmount}
                    onChange={(e) => setEditingItem({ ...editingItem, paidAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as PaymentStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="planned">Planned</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="paid_in_full">Paid in Full</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={editingItem.vendorName || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, vendorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Terms</label>
                <input
                  type="text"
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
