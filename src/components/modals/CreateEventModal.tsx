import React, { useState } from 'react';
import { X, Sparkles, Wand2, Calendar, MapPin, DollarSign, Users, Globe } from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { EventType, SupportedCurrency } from '../../types/event';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const { createEvent, generateAIPlanForCurrentEvent } = useEventContext();

  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>('wedding');
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [date, setDate] = useState('2026-12-20');
  const [time, setTime] = useState('17:00');
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [budget, setBudget] = useState('15000');
  const [contingencyPercentage, setContingencyPercentage] = useState('10');
  const [guestCount, setGuestCount] = useState('100');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [autoGenerateAI, setAutoGenerateAI] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCurrencyChange = (newCurr: SupportedCurrency) => {
    setCurrency(newCurr);
    if (newCurr === 'INR' && budget === '15000') {
      setBudget('2000000');
    } else if (newCurr === 'USD' && budget === '2000000') {
      setBudget('25000');
    }
  };

  const handleTypeChange = (newType: EventType) => {
    setType(newType);
    if (newType === 'indian_wedding' || newType === 'sangeet_mehendi' || newType === 'haldi') {
      setCurrency('INR');
      if (budget === '15000') setBudget('2500000');
      if (!location) setLocation('Jaipur, Rajasthan, India');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an event name.');
      return;
    }
    const numBudget = parseFloat(budget);
    if (isNaN(numBudget) || numBudget <= 0) {
      setError('Please enter a valid total budget amount.');
      return;
    }
    const numGuests = parseInt(guestCount, 10);
    if (isNaN(numGuests) || numGuests <= 0) {
      setError('Please enter a valid guest count.');
      return;
    }

    setError('');
    createEvent({
      name: name.trim(),
      type,
      currency,
      date,
      time,
      location: location.trim() || 'Selected Destination',
      venue: venue.trim() || 'Main Venue',
      budget: numBudget,
      contingencyPercentage: parseInt(contingencyPercentage, 10) || 10,
      guestCount: numGuests,
      theme: theme.trim() || 'Warm Modern Elegance',
      description: description.trim(),
      status: 'planning',
    });

    onClose();

    if (autoGenerateAI) {
      setTimeout(() => {
        generateAIPlanForCurrentEvent(description.trim() || undefined);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Create New Event</h2>
              <p className="text-xs text-purple-200">
                Configure your celebration parameters and generate custom AI intelligence.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 font-medium">
              {error}
            </div>
          )}

          {/* Event Type, Currency & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event Type
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as EventType)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="wedding">Wedding (Classic/Western)</option>
                <option value="indian_wedding">Indian Wedding (Shaadi & Pheras)</option>
                <option value="sangeet_mehendi">Sangeet & Mehendi Night</option>
                <option value="haldi">Haldi Ceremony</option>
                <option value="birthday">Birthday Party</option>
                <option value="community">Community Festival / Utsav</option>
                <option value="corporate">Corporate Gala</option>
                <option value="anniversary">Anniversary</option>
                <option value="baby_shower">Baby Shower / Godh Bharai</option>
                <option value="other">Other Celebration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-purple-600" />
                <span>Currency</span>
              </label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value as SupportedCurrency)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white font-semibold text-purple-900"
              >
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ US Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="GBP">GBP (£ British Pound)</option>
                <option value="AED">AED (AED UAE Dirham)</option>
                <option value="CAD">CAD ($ Canadian Dollar)</option>
                <option value="AUD">AUD ($ Australian Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav & Diya's Royal Wedding"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Date, Time, Location & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Udaipur, Rajasthan, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Venue Name
              </label>
              <input
                type="text"
                placeholder="e.g. Lake Palace Courtyard & Mandap Lawn"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Financials & Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Budget ({currency}) *
              </label>
              <input
                type="number"
                min="100"
                step="100"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contingency Reserve (%)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={contingencyPercentage}
                onChange={(e) => setContingencyPercentage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Guest Count *
              </label>
              <input
                type="number"
                min="1"
                required
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Theme & Aesthetic */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Theme & Aesthetic Vision
            </label>
            <input
              type="text"
              placeholder="e.g. Royal Marigold & Kundan Gold with Starlit Sangeet"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Natural Language Vision Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Natural Language Vision & Special Notes (Gemini prompt)
            </label>
            <textarea
              rows={2}
              placeholder="Describe traditions, live food stations, musical preferences, or must-have moments..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* AI Checkbox */}
          <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center gap-3">
            <input
              type="checkbox"
              id="ai-auto-plan"
              checked={autoGenerateAI}
              onChange={(e) => setAutoGenerateAI(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded-md border-purple-300 focus:ring-purple-500"
            />
            <label htmlFor="ai-auto-plan" className="text-xs font-semibold text-purple-900 cursor-pointer">
              Auto-generate bespoke run of show, itemized budget in {currency}, decor, menu & risk plan with Gemini 3.8
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Create Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
