import React, { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { GuestItem, RSVPStatus } from '../../types/event';

interface EditGuestModalProps {
  guest: GuestItem | null;
  onClose: () => void;
}

export const EditGuestModal: React.FC<EditGuestModalProps> = ({ guest, onClose }) => {
  const { updateGuest, triggerCelebration } = useEventContext();

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

  useEffect(() => {
    if (guest) {
      setName(guest.name);
      setEmail(guest.email);
      setPhone(guest.phone || '');
      setPartySize(String(guest.partySize));
      setRsvpStatus(guest.rsvpStatus);
      setDietaryRestrictions(guest.dietaryRestrictions || 'None');
      setTableGroup(guest.tableGroup || '');
      setHasPlusOne(Boolean(guest.hasPlusOne));
      setNotes(guest.notes || '');
      setError('');
    }
  }, [guest]);

  if (!guest) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a guest name.');
      return;
    }

    const newPartySize = Math.max(1, parseInt(partySize, 10) || 1);
    const wasAttending = guest.rsvpStatus === 'attending';

    updateGuest(guest.id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      partySize: newPartySize,
      rsvpStatus,
      dietaryRestrictions: dietaryRestrictions.trim() || 'None',
      tableGroup: tableGroup.trim() || undefined,
      hasPlusOne,
      notes: notes.trim() || undefined,
    });

    if (rsvpStatus === 'attending' && !wasAttending) {
      triggerCelebration();
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Edit Guest / Party</h2>
              <p className="text-xs text-purple-200">Update response status, seating table, or dietary notes.</p>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Party Headcount (Seats)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">RSVP Status</label>
              <select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as RSVPStatus)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="attending">Attending (Confirmed)</option>
                <option value="declined">Declined</option>
                <option value="tentative">Tentative</option>
                <option value="invited">Invited / Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Restrictions</label>
              <input
                type="text"
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
                placeholder="e.g. Table 3 - Family, VIP"
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
