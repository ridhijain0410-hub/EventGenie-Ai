import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Utensils,
  Search,
  Filter,
  Download,
  Trash2,
  Mail,
  Phone,
  Sparkles,
  Eye,
  CheckCircle2,
  Edit2,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { GuestItem, RSVPStatus } from '../../types/event';
import { EditGuestModal } from '../modals/EditGuestModal';

interface GuestsViewProps {
  onOpenAddGuest: () => void;
  onOpenRsvpSimulation: (guest?: GuestItem) => void;
}

export const GuestsView: React.FC<GuestsViewProps> = ({
  onOpenAddGuest,
  onOpenRsvpSimulation,
}) => {
  const {
    activeEvent,
    activeGuests,
    deleteGuest,
    updateGuest,
    triggerCelebration,
  } = useEventContext();

  const [rsvpFilter, setRsvpFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);

  if (!activeEvent) {
    return <div className="p-8 text-center text-slate-500">Please select an event.</div>;
  }

  // Headcount and metrics
  const attendingGuests = activeGuests.filter((g) => g.rsvpStatus === 'attending');
  const attendingHeadcount = attendingGuests.reduce((acc, g) => acc + g.partySize, 0);

  const declinedGuests = activeGuests.filter((g) => g.rsvpStatus === 'declined');
  const tentativeGuests = activeGuests.filter(
    (g) => g.rsvpStatus === 'tentative' || g.rsvpStatus === 'invited'
  );

  const totalInvitedHeadcount = activeGuests.reduce((acc, g) => acc + g.partySize, 0);

  // Dietary restrictions tally
  const dietaryItems = activeGuests.filter(
    (g) => g.dietaryRestrictions && g.dietaryRestrictions.toLowerCase() !== 'none'
  );

  // Filter guests
  const filteredGuests = activeGuests.filter((guest) => {
    const matchesRsvp = rsvpFilter === 'all' || guest.rsvpStatus === rsvpFilter;
    const matchesDiet =
      dietaryFilter === 'all' ||
      (dietaryFilter === 'has_restriction' &&
        guest.dietaryRestrictions &&
        guest.dietaryRestrictions.toLowerCase() !== 'none');
    const matchesSearch =
      searchQuery === '' ||
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.tableGroup && guest.tableGroup.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRsvp && matchesDiet && matchesSearch;
  });

  const handleStatusChange = (id: string, status: RSVPStatus) => {
    updateGuest(id, { rsvpStatus: status });
    if (status === 'attending') {
      triggerCelebration();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Guest Name', 'Email', 'Phone', 'Party Size', 'RSVP Status', 'Dietary Restrictions', 'Table Group', 'Notes'];
    const rows = activeGuests.map((g) => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.email}"`,
      `"${g.phone || ''}"`,
      g.partySize,
      g.rsvpStatus,
      `"${(g.dietaryRestrictions || 'None').replace(/"/g, '""')}"`,
      `"${(g.tableGroup || '').replace(/"/g, '""')}"`,
      `"${(g.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeEvent.name.replace(/\s+/g, '_')}_Guest_List.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                Guest List & RSVP Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                {attendingHeadcount} Confirmed Seats
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live RSVP response tracking, party size tallies, and catering dietary notes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenRsvpSimulation()}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition border border-purple-200"
            >
              <Eye className="w-3.5 h-3.5 text-purple-600" />
              <span>Preview Public RSVP Portal</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenAddGuest}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-purple-600/20 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Guest</span>
            </button>
          </div>
        </div>

        {/* Guest KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-1 border-t border-purple-50">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center justify-between text-emerald-800 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Confirmed Attending</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-950">
              {attendingHeadcount} <span className="text-xs font-semibold text-emerald-700">guests</span>
            </div>
            <span className="text-[11px] text-emerald-700 mt-1 block">
              {attendingGuests.length} invitation parties
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center justify-between text-blue-800 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Pending Response</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-950">
              {tentativeGuests.length} <span className="text-xs font-semibold text-blue-700">awaiting</span>
            </div>
            <span className="text-[11px] text-blue-700 mt-1 block">
              Invited / Tentative
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Declined</span>
              <UserX className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-800">
              {declinedGuests.length} <span className="text-xs font-semibold text-slate-500">invitations</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Respectfully declined
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="flex items-center justify-between text-amber-800 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Dietary Notes</span>
              <Utensils className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-950">
              {dietaryItems.length} <span className="text-xs font-semibold text-amber-700">guests</span>
            </div>
            <span className="text-[11px] text-amber-700 mt-1 block">
              Special menus required
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={rsvpFilter}
            onChange={(e) => setRsvpFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-purple-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All RSVP Statuses ({activeGuests.length})</option>
            <option value="attending">Attending ({attendingGuests.length})</option>
            <option value="declined">Declined ({declinedGuests.length})</option>
            <option value="tentative">Tentative</option>
            <option value="invited">Invited / Pending</option>
          </select>

          {/* Dietary Filter */}
          <select
            value={dietaryFilter}
            onChange={(e) => setDietaryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-purple-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Diets</option>
            <option value="has_restriction">Special Diets Only ({dietaryItems.length})</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search guest or table group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-purple-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-50 bg-purple-50/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Guest / Party Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-center">Party Size</th>
                <th className="py-3.5 px-4">RSVP Status</th>
                <th className="py-3.5 px-4">Dietary Notes</th>
                <th className="py-3.5 px-4">Table / Seating</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-xs">
              {filteredGuests.map((guest) => {
                const hasSpecialDiet =
                  guest.dietaryRestrictions && guest.dietaryRestrictions.toLowerCase() !== 'none';

                return (
                  <tr key={guest.id} className="hover:bg-purple-50/30 transition-colors group">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-slate-800">{guest.name}</div>
                      {guest.notes && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{guest.notes}</div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[150px]">{guest.email}</span>
                      </div>
                      {guest.phone && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="font-extrabold text-slate-800 text-sm px-2.5 py-1 bg-purple-50 rounded-lg">
                        {guest.partySize}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <select
                        value={guest.rsvpStatus}
                        onChange={(e) =>
                          handleStatusChange(guest.id, e.target.value as RSVPStatus)
                        }
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border focus:outline-none ${
                          guest.rsvpStatus === 'attending'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : guest.rsvpStatus === 'declined'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="attending">Attending</option>
                        <option value="declined">Declined</option>
                        <option value="tentative">Tentative</option>
                        <option value="invited">Invited / Pending</option>
                      </select>
                    </td>

                    <td className="py-4 px-4">
                      {hasSpecialDiet ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-block">
                          {guest.dietaryRestrictions}
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {guest.tableGroup ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700">
                          {guest.tableGroup}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingGuest(guest)}
                          title="Edit guest details"
                          className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenRsvpSimulation(guest)}
                          title="Simulate Guest RSVP"
                          className="p-1.5 text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-50 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGuest(guest.id)}
                          title="Delete guest"
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No guests match your selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Guest Modal */}
      <EditGuestModal
        guest={editingGuest}
        onClose={() => setEditingGuest(null)}
      />
    </div>
  );
};
