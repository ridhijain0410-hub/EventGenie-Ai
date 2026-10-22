import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Plus,
  PlusCircle,
  Calendar,
  Wallet,
  CheckSquare,
  Building2,
  UserPlus,
  Wand2,
  ChevronDown,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { ActiveTab } from './Sidebar';
import { getDaysRemaining } from '../../utils/formatters';

interface HeaderProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenCreateEvent: () => void;
  onOpenAddExpense: () => void;
  onOpenAddTask: () => void;
  onOpenAddVendor: () => void;
  onOpenAddGuest: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateEvent,
  onOpenAddExpense,
  onOpenAddTask,
  onOpenAddVendor,
  onOpenAddGuest,
  onToggleMobileSidebar,
}) => {
  const { activeEvent } = useEventContext();
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const daysLeft = activeEvent ? getDaysRemaining(activeEvent.date) : 0;

  const getSectionTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Event Overview',
          subtitle: 'Real-time planning intelligence, budget health, and task countdowns.',
        };
      case 'ai-hub':
        return {
          title: 'AI Genie Hub',
          subtitle: 'Gemini-powered run of show, creative concepts, speeches, invitations, and cost saving tips.',
        };
      case 'budget':
        return {
          title: 'Budget Planner',
          subtitle: 'Category expense trackers, payment status, contingency reserve, and cost variance.',
        };
      case 'timeline':
        return {
          title: 'Planning Timeline',
          subtitle: 'Milestone checklists, deadlines, priority tags, and day-of run of show.',
        };
      case 'vendors':
        return {
          title: 'Vendor Checklist',
          subtitle: 'Pipeline management for venues, caterers, florals, photographers, and entertainment.',
        };
      case 'guests':
        return {
          title: 'Guest List & RSVP Management',
          subtitle: 'Track RSVP statuses, party sizes, dietary restrictions, and table seating.',
        };
    }
  };

  const { title, subtitle } = getSectionTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-purple-100 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
                {title}
              </h2>
              {activeEvent && (
                <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>
                    {daysLeft > 0
                      ? `${daysLeft} days to go`
                      : daysLeft === 0
                      ? 'Event is Today!'
                      : 'Event Completed'}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block truncate max-w-lg">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Sparkle action button */}
          <button
            onClick={() => onSelectTab('ai-hub')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              currentTab === 'ai-hub'
                ? 'bg-purple-700 text-white ring-2 ring-purple-300'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            <span>AI Genie Studio</span>
          </button>

          {/* New Event Button */}
          <button
            onClick={onOpenCreateEvent}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Event</span>
          </button>

          {/* Quick Add Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {isQuickMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsQuickMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 z-50 bg-white rounded-xl shadow-xl border border-purple-100 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenAddTask();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-purple-50 flex items-center gap-2.5 text-slate-700 hover:text-purple-700 font-medium"
                  >
                    <CheckSquare className="w-4 h-4 text-purple-600" />
                    <span>New Task</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenAddExpense();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-purple-50 flex items-center gap-2.5 text-slate-700 hover:text-purple-700 font-medium"
                  >
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>New Expense</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenAddGuest();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-purple-50 flex items-center gap-2.5 text-slate-700 hover:text-purple-700 font-medium"
                  >
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <span>New Guest</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenAddVendor();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-purple-50 flex items-center gap-2.5 text-slate-700 hover:text-purple-700 font-medium"
                  >
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>New Vendor</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
