import React, { useState } from 'react';
import { X, Sparkles, Heart, Check, Calendar, MapPin, Send } from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { GuestItem, RSVPStatus } from '../../types/event';
import { formatDate } from '../../utils/formatters';

interface GuestRsvpSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest?: GuestItem;
}

export const GuestRsvpSimulationModal: React.FC<GuestRsvpSimulationModalProps> = ({
  isOpen,
  onClose,
  guest,
}) => {
  const { activeEvent, updateGuest, addGuest, triggerCelebration } = useEventContext();

  const [name, setName] = useState(guest?.name || '');
  const [email, setEmail] = useState(guest?.email || '');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>(
    guest?.rsvpStatus === 'invited' || guest?.rsvpStatus === 'tentative'
      ? 'attending'
      : guest?.rsvpStatus || 'attending'
  );
  const [partySize, setPartySize] = useState(guest?.partySize?.toString() || '2');
  const [dietary, setDietary] = useState(guest?.dietaryRestrictions || 'None');
  const [songRequest, setSongRequest] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !activeEvent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSize = Math.max(1, parseInt(partySize, 10) || 1);

    if (guest) {
      updateGuest(guest.id, {
        name,
        email,
        rsvpStatus,
        partySize: rsvpStatus === 'declined' ? 0 : finalSize,
        dietaryRestrictions: dietary,
        notes: message ? `Guest note: "${message}"` : guest.notes,
      });
    } else {
      addGuest({
        eventId: activeEvent.id,
        name: name.trim() || 'Valued Guest',
        email: email.trim() || 'guest@example.com',
        partySize: rsvpStatus === 'declined' ? 0 : finalSize,
        rsvpStatus,
        dietaryRestrictions: dietary,
        hasPlusOne: finalSize > 1,
        notes: message ? `Guest note: "${message}"` : undefined,
      });
    }

    if (rsvpStatus === 'attending') {
      triggerCelebration();
    }
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Top Header simulation banner */}
        <div className="bg-slate-900 text-white px-4 py-2 text-[11px] flex items-center justify-between border-b border-slate-800">
          <span className="flex items-center gap-1.5 text-purple-300 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Guest Invitation & RSVP Preview</span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Card */}
        <div className="p-6 text-center bg-gradient-to-b from-purple-50 via-white to-white border-b border-purple-50">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-purple-500/20">
            <Heart className="w-6 h-6 fill-amber-200 text-amber-200" />
          </div>
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest block mb-1">
            Official RSVP Portal
          </span>
          <h2 className="text-xl font-extrabold text-slate-800">{activeEvent.name}</h2>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>{formatDate(activeEvent.date)}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-purple-600" />
              <span>{activeEvent.venue}</span>
            </span>
          </div>
          {activeEvent.theme && (
            <div className="mt-2 text-xs italic text-purple-600 font-medium">
              Aesthetic: {activeEvent.theme}
            </div>
          )}
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {rsvpStatus === 'attending'
                ? "RSVP Confirmed! We can't wait to celebrate!"
                : 'Thank You for Letting Us Know!'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your response has been saved directly to the live event roster. You can see your updated headcount in the dashboard!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
            >
              Back to Planner
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Taylor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Email</label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Attendance Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Will you be attending? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRsvpStatus('attending')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    rsvpStatus === 'attending'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Joyfully Accept</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRsvpStatus('declined')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    rsvpStatus === 'declined'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>Regretfully Decline</span>
                </button>
              </div>
            </div>

            {rsvpStatus === 'attending' && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Number in Party (including you)
                    </label>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Dietary Needs / Allergies
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vegetarian, Gluten-Free, None"
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Song Request for the Dance Floor 🎵
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. September by Earth, Wind & Fire"
                    value={songRequest}
                    onChange={(e) => setSongRequest(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Warm Note to the Hosts
              </label>
              <textarea
                rows={2}
                placeholder="Congratulations, we're so thrilled for you!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit RSVP</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
