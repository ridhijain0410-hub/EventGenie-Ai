import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle,
  FileCheck,
  Star,
  Sparkles,
  Filter,
  DollarSign,
  AlertCircle,
  Search,
  Edit2,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { VendorItem, VendorCategory, VendorStatus } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { EditVendorModal } from '../modals/EditVendorModal';

interface VendorsViewProps {
  onOpenAddVendor: () => void;
}

const CATEGORIES: { id: VendorCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Vendors' },
  { id: 'venue', label: 'Venue & Space' },
  { id: 'catering', label: 'Catering & Bar' },
  { id: 'decoration', label: 'Decor & Florals' },
  { id: 'photography', label: 'Photography & Video' },
  { id: 'entertainment', label: 'Entertainment & Music' },
  { id: 'other', label: 'Other Services' },
];

export const VendorsView: React.FC<VendorsViewProps> = ({ onOpenAddVendor }) => {
  const {
    activeEvent,
    activeVendors,
    deleteVendor,
    updateVendor,
  } = useEventContext();

  const [activeCategory, setActiveCategory] = useState<VendorCategory | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiGuideOpen, setIsAiGuideOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);

  if (!activeEvent) {
    return <div className="p-8 text-center text-slate-500">Please select an event.</div>;
  }

  const currency = activeEvent.currency || 'USD';

  // Filter vendors
  const filteredVendors = activeVendors.filter((vendor) => {
    const matchesCat = activeCategory === 'all' || vendor.category === activeCategory;
    const matchesStat = activeStatus === 'all' || vendor.status === activeStatus;
    const matchesSearch =
      searchQuery === '' ||
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.contactPerson && vendor.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesStat && matchesSearch;
  });

  const bookedCount = activeVendors.filter((v) => v.status === 'booked').length;
  const totalCost = activeVendors.reduce((sum, v) => sum + (v.quotedPrice || 0), 0);
  const totalDeposit = activeVendors.reduce((sum, v) => sum + (v.depositPaid || 0), 0);

  const handleToggleContract = (id: string, current: boolean) => {
    updateVendor(id, { contractSigned: !current });
  };

  const handleStatusChange = (id: string, newStatus: VendorStatus) => {
    updateVendor(id, { status: newStatus });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                Vendor Checklist & Directory
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                {bookedCount} of {activeVendors.length} Booked
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage quotes, contracts, contact coordination, and deposits for all suppliers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAiGuideOpen(!isAiGuideOpen)}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition border border-purple-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Vendor Questions</span>
            </button>
            <button
              onClick={onOpenAddVendor}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-purple-600/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vendor</span>
            </button>
          </div>
        </div>

        {/* Financial mini-row for vendors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-purple-50">
          <div className="p-3 rounded-2xl bg-purple-50/50">
            <span className="text-[10px] text-purple-800 font-bold uppercase">Total Contract Value</span>
            <div className="text-base font-extrabold text-purple-950 mt-0.5">
              {formatCurrency(totalCost, currency)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50/50">
            <span className="text-[10px] text-emerald-800 font-bold uppercase">Deposits Disbursed</span>
            <div className="text-base font-extrabold text-emerald-950 mt-0.5">
              {formatCurrency(totalDeposit, currency)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50/50">
            <span className="text-[10px] text-indigo-800 font-bold uppercase">Outstanding Balance</span>
            <div className="text-base font-extrabold text-indigo-950 mt-0.5">
              {formatCurrency(Math.max(0, totalCost - totalDeposit), currency)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Contracts Executed</span>
            <div className="text-base font-extrabold text-slate-800 mt-0.5">
              {activeVendors.filter((v) => v.contractSigned).length} / {activeVendors.length}
            </div>
          </div>
        </div>
      </div>

      {/* AI Vendor Interview Advice Modal / Banner */}
      {isAiGuideOpen && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-3xl text-white p-6 shadow-xl border border-purple-700 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-base">
                Essential Questions to Ask Before Signing Contracts
              </h3>
            </div>
            <button
              onClick={() => setIsAiGuideOpen(false)}
              className="text-xs text-purple-200 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <span className="font-bold text-amber-300 block">Venue & Space</span>
              <p className="text-purple-100 leading-relaxed">
                "What is the exact curfew? Are tables/chairs included or third-party rented? What is the rain backup?"
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <span className="font-bold text-amber-300 block">Catering & Bar</span>
              <p className="text-purple-100 leading-relaxed">
                "Are service staff, bussers, and cake-cutting fees included? How are allergies and vendor meals handled?"
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <span className="font-bold text-amber-300 block">Photography & Video</span>
              <p className="text-purple-100 leading-relaxed">
                "Do you provide raw unedited footage? What is the delivery turnaround for social media teaser highlights?"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills & Filters */}
      <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Pipeline Stages</option>
            <option value="booked">Booked</option>
            <option value="quoted">Quoted</option>
            <option value="contacted">Contacted</option>
            <option value="researching">Researching</option>
          </select>

          <input
            type="text"
            placeholder="Search vendor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-purple-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[160px]"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.map((vendor) => {
          const balance = (vendor.quotedPrice || 0) - (vendor.depositPaid || 0);

          return (
            <div
              key={vendor.id}
              className="bg-white rounded-3xl border border-purple-100 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between group space-y-4"
            >
              <div>
                {/* Header: Category icon & Status */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 uppercase tracking-wider">
                    {vendor.category}
                  </span>
                  <select
                    value={vendor.status}
                    onChange={(e) => handleStatusChange(vendor.id, e.target.value as VendorStatus)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border focus:outline-none ${
                      vendor.status === 'booked'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : vendor.status === 'quoted'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : vendor.status === 'contacted'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <option value="researching">Researching</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="booked">Booked</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                {/* Vendor Name & Rating */}
                <div className="mt-3">
                  <h3 className="font-extrabold text-base text-slate-800 leading-snug">
                    {vendor.name}
                  </h3>
                  {vendor.rating && (
                    <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-700">{vendor.rating}</span>
                    </div>
                  )}
                </div>

                {/* Contact information */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  {vendor.contactPerson && (
                    <div className="font-medium text-slate-700">
                      Contact: {vendor.contactPerson}
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {vendor.notes && (
                  <div className="mt-3 p-2.5 rounded-xl bg-purple-50/40 text-[11px] text-slate-600 border border-purple-50 leading-relaxed">
                    {vendor.notes}
                  </div>
                )}
              </div>

              {/* Pricing, Contract toggle & Actions */}
              <div className="pt-3 border-t border-purple-50 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-400">Quoted Price</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatCurrency(vendor.quotedPrice, currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400">Deposit Paid</span>
                    <span className="font-semibold text-emerald-700">
                      {formatCurrency(vendor.depositPaid, currency)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleToggleContract(vendor.id, vendor.contractSigned)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                      vendor.contractSigned
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>{vendor.contractSigned ? 'Contract Signed' : 'Sign Contract'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingVendor(vendor)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition"
                      title="Edit vendor details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteVendor(vendor.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredVendors.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-purple-100">
            No vendors found for this category or filter.
          </div>
        )}
      </div>

      {/* Edit Vendor Modal */}
      <EditVendorModal
        isOpen={Boolean(editingVendor)}
        onClose={() => setEditingVendor(null)}
        vendor={editingVendor}
      />
    </div>
  );
};
