import React, { useState, useEffect } from 'react';
import { X, Edit3, Trash2, Calendar, MapPin, DollarSign, Users, Globe } from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { EventModel, EventType, SupportedCurrency } from '../../types/event';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventModel | null;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ isOpen, onClose, event }) => {
  const { updateEvent, deleteEvent, events } = useEventContext();

  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>('wedding');
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('17:00');
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [budget, setBudget] = useState('15000');
  const [contingencyPercentage, setContingencyPercentage] = useState('10');
  const [guestCount, setGuestCount] = useState('100');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (event) {
      setName(event.name);
      setType(event.type);
      setCurrency(event.currency || 'USD');
      setDate(event.date);
      setTime(event.time || '17:00');
      setLocation(event.location);
      setVenue(event.venue);
      setBudget(String(event.budget));
      setContingencyPercentage(String(event.contingencyPercentage ?? 10));
      setGuestCount(String(event.guestCount));
      setTheme(event.theme);
      setDescription(event.description || '');
      setError('');
      setShowConfirmDelete(false);
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e: React.FormEvent) => {
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

    const numContingency = Math.max(0, Math.min(30, parseInt(contingencyPercentage, 10) || 10));

    updateEvent(event.id, {
      name: name.trim(),
      type,
      currency,
      date,
      time,
      location: location.trim() || 'Selected Destination',
      venue: venue.trim() || 'Main Venue',
      budget: numBudget,
      contingencyPercentage: numContingency,
      guestCount: numGuests,
      theme: theme.trim() || 'Warm Modern Elegance',
      description: description.trim(),
    });

    onClose();
  };

  const handleDelete = () => {
    deleteEvent(event.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Edit Event Parameters</h2>
              <p className="text-xs text-purple-200">
                Update date, location, budget ceiling, currency, or theme.
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
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
                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Venue Name</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Theme & Aesthetic</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Delete Danger Zone */}
          {events.length > 1 && (
            <div className="pt-2">
              {showConfirmDelete ? (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                  <div className="text-xs text-rose-800 font-semibold">
                    Are you sure? This deletes all associated budget items, tasks, and guests.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-2.5 py-1 text-xs rounded-lg text-slate-600 hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1 text-xs rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete This Event</span>
                </button>
              )}
            </div>
          )}

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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
