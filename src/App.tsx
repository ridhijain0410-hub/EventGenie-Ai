import React, { useState } from 'react';
import { EventProvider, useEventContext } from './context/EventContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { AiHubView } from './components/ai/AiHubView';
import { BudgetView } from './components/budget/BudgetView';
import { TimelineView } from './components/timeline/TimelineView';
import { VendorsView } from './components/vendors/VendorsView';
import { GuestsView } from './components/guests/GuestsView';

// Modals
import { CreateEventModal } from './components/modals/CreateEventModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AddTaskModal } from './components/modals/AddTaskModal';
import { AddVendorModal } from './components/modals/AddVendorModal';
import { AddGuestModal } from './components/modals/AddGuestModal';
import { GuestRsvpSimulationModal } from './components/modals/GuestRsvpSimulationModal';
import { GuestItem } from './types/event';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [rsvpSimulationGuest, setRsvpSimulationGuest] = useState<GuestItem | undefined>(undefined);
  const [isRsvpSimulationOpen, setIsRsvpSimulationOpen] = useState(false);

  const handleOpenRsvpSimulation = (guest?: GuestItem) => {
    setRsvpSimulationGuest(guest);
    setIsRsvpSimulationOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCreateEvent={() => setIsCreateEventOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenCreateEvent={() => setIsCreateEventOpen(true)}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          onOpenAddVendor={() => setIsAddVendorOpen(true)}
          onOpenAddGuest={() => setIsAddGuestOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 pb-16">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentTab}
              onOpenCreateEvent={() => setIsCreateEventOpen(true)}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenAddTask={() => setIsAddTaskOpen(true)}
            />
          )}

          {currentTab === 'ai-hub' && <AiHubView />}

          {currentTab === 'budget' && (
            <BudgetView onOpenAddExpense={() => setIsAddExpenseOpen(true)} />
          )}

          {currentTab === 'timeline' && (
            <TimelineView onOpenAddTask={() => setIsAddTaskOpen(true)} />
          )}

          {currentTab === 'vendors' && (
            <VendorsView onOpenAddVendor={() => setIsAddVendorOpen(true)} />
          )}

          {currentTab === 'guests' && (
            <GuestsView
              onOpenAddGuest={() => setIsAddGuestOpen(true)}
              onOpenRsvpSimulation={handleOpenRsvpSimulation}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />

      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />

      <AddVendorModal
        isOpen={isAddVendorOpen}
        onClose={() => setIsAddVendorOpen(false)}
      />

      <AddGuestModal
        isOpen={isAddGuestOpen}
        onClose={() => setIsAddGuestOpen(false)}
      />

      <GuestRsvpSimulationModal
        isOpen={isRsvpSimulationOpen}
        onClose={() => {
          setIsRsvpSimulationOpen(false);
          setRsvpSimulationGuest(undefined);
        }}
        guest={rsvpSimulationGuest}
      />
    </div>
  );
}

export default function App() {
  return (
    <EventProvider>
      <MainApp />
    </EventProvider>
  );
}
