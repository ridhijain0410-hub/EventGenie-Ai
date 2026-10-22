import React, { useState, useRef } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Wallet,
  CalendarCheck,
  Building2,
  Users,
  PlusCircle,
  ChevronDown,
  Wand2,
  Calendar,
  MapPin,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Download,
  Upload,
  HardDrive,
  Info,
  X,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { formatCurrency, getDaysRemaining, getEventTypeBadge } from '../../utils/formatters';

export type ActiveTab = 'dashboard' | 'ai-hub' | 'budget' | 'timeline' | 'vendors' | 'guests';

interface SidebarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenCreateEvent: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateEvent,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const {
    events,
    activeEvent,
    activeEventId,
    setActiveEventId,
    resetToSampleData,
    exportDataAsJSON,
    importDataFromJSON,
    budgetMetrics,
    activeTasks,
    activeGuests,
    activeVendors,
  } = useEventContext();

  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedTasks = activeTasks.filter((t) => t.status === 'completed').length;
  const totalTasks = activeTasks.length;
  const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const daysLeft = activeEvent ? getDaysRemaining(activeEvent.date) : 0;
  const typeBadge = activeEvent ? getEventTypeBadge(activeEvent.type) : null;
  const currency = activeEvent?.currency || 'USD';

  const attendingGuests = activeGuests
    .filter((g) => g.rsvpStatus === 'attending')
    .reduce((sum, g) => sum + g.partySize, 0);

  const bookedVendorsCount = activeVendors.filter((v) => v.status === 'booked').length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importDataFromJSON(content);
        setImportStatus(result.message);
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'ai-hub' as ActiveTab,
      label: 'AI Genie Hub',
      icon: Wand2,
      badge: 'Gemini 3.8',
      badgeColor: 'bg-purple-100 text-purple-700 font-semibold',
    },
    {
      id: 'budget' as ActiveTab,
      label: 'Budget Planner',
      icon: Wallet,
      badge: `${budgetMetrics.actualSpentPercentage}% spent`,
      badgeColor: budgetMetrics.isOverBudget
        ? 'bg-rose-100 text-rose-700'
        : budgetMetrics.actualSpentPercentage > 85
        ? 'bg-amber-100 text-amber-700'
        : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'timeline' as ActiveTab,
      label: 'Planning Timeline',
      icon: CalendarCheck,
      badge: `${completedTasks}/${totalTasks}`,
      badgeColor: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'vendors' as ActiveTab,
      label: 'Vendor Checklist',
      icon: Building2,
      badge: `${bookedVendorsCount} booked`,
      badgeColor: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'guests' as ActiveTab,
      label: 'Guest List & RSVP',
      icon: Users,
      badge: `${attendingGuests} confirmed`,
      badgeColor: 'bg-slate-100 text-slate-600',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-purple-100 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-700 bg-clip-text text-transparent">
                  EventGenie<span className="text-purple-600 ml-0.5">AI</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">Smart Event Orchestrator</p>
              </div>
            </div>
          </div>

          {/* Active Event Card & Switcher */}
          <div className="mt-4 relative">
            <button
              onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
              className="w-full text-left p-3 rounded-xl bg-purple-50/70 border border-purple-100 hover:border-purple-300 transition-all flex items-center justify-between group"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  {typeBadge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${typeBadge.bg} ${typeBadge.color}`}>
                      {typeBadge.label}
                    </span>
                  )}
                  {activeEvent?.isDemo ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                      Demo
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      Custom
                    </span>
                  )}
                  {daysLeft >= 0 ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-200/60 text-purple-800 font-medium">
                      {daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                    </span>
                  ) : null}
                </div>
                <div className="font-semibold text-xs text-slate-800 truncate group-hover:text-purple-700">
                  {activeEvent?.name || 'Select Event'}
                </div>
                <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                  <span>{activeEvent?.location || 'Location TBD'}</span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-purple-500 transition-transform ${
                  isEventDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Event Dropdown */}
            {isEventDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-purple-100 py-2 divide-y divide-purple-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Switch Event ({events.length})</span>
                  <span className="text-[10px] text-purple-600 font-bold">{currency}</span>
                </div>
                <div className="py-1">
                  {events.map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => {
                        setActiveEventId(evt.id);
                        setIsEventDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-50 transition-colors ${
                        evt.id === activeEventId ? 'bg-purple-50/80 font-bold text-purple-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{evt.name}</span>
                          {evt.isDemo && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-700 font-bold shrink-0">
                              Demo
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-slate-600">
                            {formatCurrency(evt.budget, evt.currency || 'USD')}
                          </span>
                          <span>•</span>
                          <span>{evt.guestCount} guests</span>
                        </div>
                      </div>
                      {evt.id === activeEventId && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsEventDropdownOpen(false);
                      onOpenCreateEvent();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create New Event</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                      isActive ? 'bg-purple-700/60 text-purple-100' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Progress Snapshot widget */}
        {activeEvent && (
          <div className="mx-3 my-2 p-3 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-100/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700">Planning Progress</span>
              <span className="font-bold text-purple-700">{taskPct}%</span>
            </div>
            <div className="w-full bg-purple-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${taskPct}%` }}
              />
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
              <div>
                <span className="block text-slate-400 text-[10px]">Actual Spend</span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(budgetMetrics.totalActual, currency)}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">Headcount</span>
                <span className="font-semibold text-slate-700">
                  {attendingGuests} / {activeEvent.guestCount}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer controls: Storage, Backup & Reset */}
        <div className="p-3 border-t border-purple-50 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStorageModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-purple-700 hover:bg-purple-50 border border-slate-200 transition"
              title="Backup and restore data"
            >
              <HardDrive className="w-3.5 h-3.5 text-purple-600" />
              <span>Data & Backup</span>
            </button>
            <button
              onClick={resetToSampleData}
              title="Reset to sample wedding, birthday & gala dataset"
              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50 border border-slate-200 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gemini 3.8 Active</span>
            </span>
            <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded">
              {currency}
            </span>
          </div>
        </div>
      </aside>

      {/* Storage & Backup Modal */}
      {isStorageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-purple-50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Data Storage & Backup</h3>
                  <p className="text-[11px] text-slate-400">Manage your local event database</p>
                </div>
              </div>
              <button
                onClick={() => setIsStorageModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-purple-600" />
                <span>Local Browser Persistence</span>
              </div>
              <p className="text-[11px] text-purple-800/90 leading-relaxed">
                All event plans, budgets, tasks, vendors, and guests are saved automatically in your browser's LocalStorage. To preserve your work across devices or prevent data loss when clearing cookies, export a JSON backup file.
              </p>
            </div>

            {importStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                {importStatus}
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                onClick={exportDataAsJSON}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export Backup (Download JSON)</span>
              </button>

              <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition">
                <Upload className="w-4 h-4" />
                <span>Import Backup (Restore JSON)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  resetToSampleData();
                  setIsStorageModalOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All to Default Sample Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
