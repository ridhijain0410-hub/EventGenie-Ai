import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { RSVPStatus } from '../../types/event';

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddGuestModal: React.FC<AddGuestModalProps> = ({ isOpen, onClose }) => {
  const { activeEvent, addGuest } = useEventContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState('1');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('invited');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('None');
  const [tableGroup, setTableGroup] = useState('');
  const [hasPlusOne, setHasPlusOne] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !activeEvent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a guest or party name.');
      return;
    }

    addGuest({
      eventId: activeEvent.id,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: phone.trim() || undefined,
      partySize: Math.max(1, parseInt(partySize, 10) || 1),
      rsvpStatus,
      dietaryRestrictions: dietaryRestrictions.trim() || 'None',
      tableGroup: tableGroup.trim() || undefined,
      hasPlusOne,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Add Guest / Party</h2>
              <p className="text-xs text-purple-200">Record RSVP, party headcount, and dietary needs.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-purple-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Guest or Couple Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Lin & Julian Ross"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="guest@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Party Size (Seats)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial RSVP Status</label>
              <select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as RSVPStatus)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="invited">Invited / Pending</option>
                <option value="attending">Attending (Confirmed)</option>
                <option value="declined">Declined</option>
                <option value="tentative">Tentative</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Restrictions</label>
              <input
                type="text"
                placeholder="None, Jain, Pure Vegetarian, Halal..."
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['None', 'Pure Veg', 'Jain', 'Halal', 'Vegan', 'Gluten-Free'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDietaryRestrictions(preset)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Table Seating / Group</label>
              <input
                type="text"
                placeholder="e.g. Table 4 - Family, Groom's Side"
                value={tableGroup}
                onChange={(e) => setTableGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Relationship</label>
            <input
              type="text"
              placeholder="e.g. Flying in from Chicago, Bride's cousin"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition"
            >
              Add Guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
