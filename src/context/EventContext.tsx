import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  EventModel,
  BudgetItem,
  TaskItem,
  VendorItem,
  GuestItem,
  AIGeneratedPlan,
  SupportedCurrency,
  TaskPriority,
} from '../types/event';
import {
  INITIAL_EVENTS,
  INITIAL_BUDGET_ITEMS,
  INITIAL_TASKS,
  INITIAL_VENDORS,
  INITIAL_GUESTS,
} from '../data/sampleEvents';
import { calculateMilestoneDate } from '../utils/formatters';
import {
  computeBudgetMetrics,
  ComputedBudgetMetrics as BudgetMetrics,
} from '../utils/budgetCalculations';
import confetti from 'canvas-confetti';

export type { BudgetMetrics };

interface EventContextType {
  events: EventModel[];
  activeEvent: EventModel | null;
  activeEventId: string;
  setActiveEventId: (id: string) => void;
  createEvent: (eventData: Omit<EventModel, 'id' | 'createdAt'>) => string;
  updateEvent: (id: string, updates: Partial<EventModel>) => void;
  deleteEvent: (id: string) => void;
  resetToSampleData: () => void;

  // Persistence export & import
  exportDataAsJSON: () => void;
  importDataFromJSON: (jsonString: string) => { success: boolean; message: string };

  // Budget
  budgetItems: BudgetItem[];
  activeBudgetItems: BudgetItem[];
  budgetMetrics: BudgetMetrics;
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  // Tasks
  tasks: TaskItem[];
  activeTasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  // Vendors
  vendors: VendorItem[];
  activeVendors: VendorItem[];
  addVendor: (vendor: Omit<VendorItem, 'id'>) => void;
  updateVendor: (id: string, updates: Partial<VendorItem>) => void;
  deleteVendor: (id: string) => void;

  // Guests & RSVP
  guests: GuestItem[];
  activeGuests: GuestItem[];
  addGuest: (guest: Omit<GuestItem, 'id'>) => void;
  updateGuest: (id: string, updates: Partial<GuestItem>) => void;
  deleteGuest: (id: string) => void;

  // AI Generation
  isAiGenerating: boolean;
  generateAIPlanForCurrentEvent: (customDescription?: string) => Promise<AIGeneratedPlan | null>;
  applyAiRecommendations: (
    plan: AIGeneratedPlan,
    options?: { applyBudget?: boolean; applyTasks?: boolean; applyVendors?: boolean }
  ) => void;
  triggerCelebration: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EVENTS: 'eventgenie_events_v2',
  ACTIVE_ID: 'eventgenie_active_id_v2',
  BUDGET: 'eventgenie_budget_v2',
  TASKS: 'eventgenie_tasks_v2',
  VENDORS: 'eventgenie_vendors_v2',
  GUESTS: 'eventgenie_guests_v2',
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventModel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
      return saved || (INITIAL_EVENTS[0]?.id ?? '');
    } catch {
      return INITIAL_EVENTS[0]?.id ?? '';
    }
  });

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      return saved ? JSON.parse(saved) : INITIAL_BUDGET_ITEMS;
    } catch {
      return INITIAL_BUDGET_ITEMS;
    }
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [vendors, setVendors] = useState<VendorItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VENDORS);
      return saved ? JSON.parse(saved) : INITIAL_VENDORS;
    } catch {
      return INITIAL_VENDORS;
    }
  });

  const [guests, setGuests] = useState<GuestItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUESTS);
      return saved ? JSON.parse(saved) : INITIAL_GUESTS;
    } catch {
      return INITIAL_GUESTS;
    }
  });

  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeEventId);
  }, [activeEventId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budgetItems));
  }, [budgetItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
  }, [guests]);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0] || null;

  const activeBudgetItems = useMemo(
    () => budgetItems.filter((b) => b.eventId === activeEvent?.id),
    [budgetItems, activeEvent?.id]
  );

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.eventId === activeEvent?.id),
    [tasks, activeEvent?.id]
  );

  const activeVendors = useMemo(
    () => vendors.filter((v) => v.eventId === activeEvent?.id),
    [vendors, activeEvent?.id]
  );

  const activeGuests = useMemo(
    () => guests.filter((g) => g.eventId === activeEvent?.id),
    [guests, activeEvent?.id]
  );

  // Unified single source of truth for budget calculations
  const budgetMetrics: BudgetMetrics = useMemo(() => {
    return computeBudgetMetrics(activeEvent, activeBudgetItems);
  }, [activeEvent, activeBudgetItems]);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#7C3AED', '#A78BFA', '#F59E0B', '#10B981', '#E11D48'],
      });
    } catch (e) {
      console.warn('Confetti unavailable', e);
    }
  };

  const createEvent = (eventData: Omit<EventModel, 'id' | 'createdAt'>): string => {
    const newId = `evt-${Date.now()}`;
    const newEvent: EventModel = {
      ...eventData,
      id: newId,
      isDemo: false,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);
    setActiveEventId(newId);
    triggerCelebration();
    return newId;
  };

  const updateEvent = (id: string, updates: Partial<EventModel>) => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, ...updates } : evt))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setBudgetItems((prev) => prev.filter((b) => b.eventId !== id));
    setTasks((prev) => prev.filter((t) => t.eventId !== id));
    setVendors((prev) => prev.filter((v) => v.eventId !== id));
    setGuests((prev) => prev.filter((g) => g.eventId !== id));
    if (activeEventId === id) {
      const remaining = events.filter((e) => e.id !== id);
      if (remaining.length > 0) {
        setActiveEventId(remaining[0].id);
      }
    }
  };

  const resetToSampleData = () => {
    setEvents(INITIAL_EVENTS);
    setActiveEventId(INITIAL_EVENTS[0].id);
    setBudgetItems(INITIAL_BUDGET_ITEMS);
    setTasks(INITIAL_TASKS);
    setVendors(INITIAL_VENDORS);
    setGuests(INITIAL_GUESTS);
    triggerCelebration();
  };

  // Export entire dataset as JSON backup
  const exportDataAsJSON = () => {
    const backupData = {
      app: 'EventGenie AI',
      exportDate: new Date().toISOString(),
      events,
      budgetItems,
      tasks,
      vendors,
      guests,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `EventGenie_Backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const importDataFromJSON = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.events || !Array.isArray(parsed.events)) {
        return { success: false, message: 'Invalid backup file: missing events list.' };
      }
      setEvents(parsed.events);
      if (parsed.budgetItems) setBudgetItems(parsed.budgetItems);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.vendors) setVendors(parsed.vendors);
      if (parsed.guests) setGuests(parsed.guests);
      if (parsed.events.length > 0) {
        setActiveEventId(parsed.events[0].id);
      }
      triggerCelebration();
      return { success: true, message: `Successfully restored ${parsed.events.length} events!` };
    } catch (err: any) {
      return { success: false, message: `Error parsing JSON: ${err.message}` };
    }
  };

  // Budget operations with non-negative validation
  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const safeEstimated = Math.max(0, Number(item.estimatedCost) || 0);
    const safeActual = Math.max(0, Number(item.actualCost) || 0);
    const safePaid = Math.max(0, Number(item.paidAmount) || 0);

    const newItem: BudgetItem = {
      ...item,
      estimatedCost: safeEstimated,
      actualCost: safeActual,
      paidAmount: safePaid,
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setBudgetItems((prev) => [newItem, ...prev]);
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    const safeUpdates = { ...updates };
    if (safeUpdates.estimatedCost !== undefined) {
      safeUpdates.estimatedCost = Math.max(0, Number(safeUpdates.estimatedCost) || 0);
    }
    if (safeUpdates.actualCost !== undefined) {
      safeUpdates.actualCost = Math.max(0, Number(safeUpdates.actualCost) || 0);
    }
    if (safeUpdates.paidAmount !== undefined) {
      safeUpdates.paidAmount = Math.max(0, Number(safeUpdates.paidAmount) || 0);
    }

    setBudgetItems((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...safeUpdates } : b))
    );
  };

  const deleteBudgetItem = (id: string) => {
    setBudgetItems((prev) => prev.filter((b) => b.id !== id));
  };

  // Task operations
  const addTask = (task: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...task,
      id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<TaskItem>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
          if (nextStatus === 'completed') triggerCelebration();
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Vendor operations
  const addVendor = (vendor: Omit<VendorItem, 'id'>) => {
    const newVendor: VendorItem = {
      ...vendor,
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setVendors((prev) => [newVendor, ...prev]);
  };

  const updateVendor = (id: string, updates: Partial<VendorItem>) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const deleteVendor = (id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
  };

  // Guest operations
  const addGuest = (guest: Omit<GuestItem, 'id'>) => {
    const newGuest: GuestItem = {
      ...guest,
      id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setGuests((prev) => [newGuest, ...prev]);
  };

  const updateGuest = (id: string, updates: Partial<GuestItem>) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const deleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  // AI Plan Generation
  const generateAIPlanForCurrentEvent = async (customDescription?: string): Promise<AIGeneratedPlan | null> => {
    if (!activeEvent) return null;
    setIsAiGenerating(true);
    try {
      const response = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: activeEvent.type,
          name: activeEvent.name,
          date: activeEvent.date,
          location: activeEvent.location,
          venue: activeEvent.venue,
          currency: activeEvent.currency || 'USD',
          budget: activeEvent.budget,
          guestCount: activeEvent.guestCount,
          theme: activeEvent.theme,
          specialNotes: activeEvent.description,
          naturalDescription: customDescription || activeEvent.description,
        }),
      });

      const data = await response.json();
      if (data.plan) {
        updateEvent(activeEvent.id, { aiPlan: data.plan });
        triggerCelebration();
        return data.plan;
      }
      return null;
    } catch (err) {
      console.error('Failed to generate AI plan:', err);
      return null;
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Apply AI recommendations with dated timelines and vendors
  const applyAiRecommendations = (
    plan: AIGeneratedPlan,
    options?: { applyBudget?: boolean; applyTasks?: boolean; applyVendors?: boolean }
  ) => {
    if (!activeEvent) return;
    const { applyBudget = true, applyTasks = true, applyVendors = true } = options || {};

    // Apply tasks with calculated milestone dates
    if (applyTasks && plan.recommendedTasks && plan.recommendedTasks.length > 0) {
      const newTasks: TaskItem[] = plan.recommendedTasks.map((rt, idx) => {
        let daysOffset = 30;
        if (rt.milestone === '6+ Months Before') daysOffset = 180;
        else if (rt.milestone === '3-6 Months Before') daysOffset = 90;
        else if (rt.milestone === '1-2 Months Before') daysOffset = 30;
        else if (rt.milestone === 'Event Week') daysOffset = 5;
        else if (rt.milestone === 'Day-Of') daysOffset = 0;

        return {
          id: `t-ai-${Date.now()}-${idx}`,
          eventId: activeEvent.id,
          title: rt.title,
          category: rt.category || 'AI Plan',
          milestone: (rt.milestone as any) || '1-2 Months Before',
          dueDate: calculateMilestoneDate(activeEvent.date, daysOffset),
          priority: rt.priority || 'medium',
          status: 'todo',
          assignedTo: 'Lead Organizer',
        };
      });
      setTasks((prev) => [...newTasks, ...prev]);
    }

    // Apply suggested budget breakdown
    if (applyBudget && plan.suggestedBudgetBreakdown && plan.suggestedBudgetBreakdown.length > 0) {
      const newBudgetItems: BudgetItem[] = plan.suggestedBudgetBreakdown.map((sb, idx) => ({
        id: `b-ai-${Date.now()}-${idx}`,
        eventId: activeEvent.id,
        category: (sb.category as any) || 'Other',
        name: `${sb.category} - ${sb.description ? sb.description.slice(0, 40) : 'Allocated Expense'}`,
        estimatedCost: sb.suggestedAmount || Math.round((activeEvent.budget * sb.percentage) / 100),
        actualCost: 0,
        paidAmount: 0,
        status: 'planned',
        notes: sb.description,
      }));
      setBudgetItems((prev) => [...newBudgetItems, ...prev]);
    }

    // Apply vendors from vendor checklist if available
    if (applyVendors && plan.vendorChecklist && plan.vendorChecklist.length > 0) {
      const newVendors: VendorItem[] = plan.vendorChecklist.map((vc, idx) => ({
        id: `v-ai-${Date.now()}-${idx}`,
        eventId: activeEvent.id,
        name: `${vc.name} (Recommended)`,
        category: (vc.category as any) || 'other',
        quotedPrice: 0,
        depositPaid: 0,
        status: 'researching',
        contractSigned: false,
        notes: `AI Recommendation. Key questions to ask: ${vc.keyQuestions}`,
      }));
      setVendors((prev) => [...newVendors, ...prev]);
    }

    triggerCelebration();
  };

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        activeEventId,
        setActiveEventId,
        createEvent,
        updateEvent,
        deleteEvent,
        resetToSampleData,
        exportDataAsJSON,
        importDataFromJSON,
        budgetItems,
        activeBudgetItems,
        budgetMetrics,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        tasks,
        activeTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        vendors,
        activeVendors,
        addVendor,
        updateVendor,
        deleteVendor,
        guests,
        activeGuests,
        addGuest,
        updateGuest,
        deleteGuest,
        isAiGenerating,
        generateAIPlanForCurrentEvent,
        applyAiRecommendations,
        triggerCelebration,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
