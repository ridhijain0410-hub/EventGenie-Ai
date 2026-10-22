import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { VendorItem, VendorCategory, VendorStatus } from '../../types/event';

interface EditVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorItem | null;
}

export const EditVendorModal: React.FC<EditVendorModalProps> = ({ isOpen, onClose, vendor }) => {
  const { activeEvent, updateVendor } = useEventContext();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('venue');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('0');
  const [depositPaid, setDepositPaid] = useState('0');
  const [status, setStatus] = useState<VendorStatus>('quoted');
  const [contractSigned, setContractSigned] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (vendor) {
      setName(vendor.name);
      setCategory(vendor.category);
      setContactPerson(vendor.contactPerson || '');
      setPhone(vendor.phone || '');
      setEmail(vendor.email || '');
      setWebsite(vendor.website || '');
      setQuotedPrice(String(vendor.quotedPrice || 0));
      setDepositPaid(String(vendor.depositPaid || 0));
      setStatus(vendor.status);
      setContractSigned(Boolean(vendor.contractSigned));
      setNotes(vendor.notes || '');
      setError('');
    }
  }, [vendor]);

  if (!isOpen || !vendor || !activeEvent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a vendor name.');
      return;
    }

    const numQuoted = Math.max(0, parseFloat(quotedPrice) || 0);
    const numDeposit = Math.max(0, parseFloat(depositPaid) || 0);

    updateVendor(vendor.id, {
      name: name.trim(),
      category,
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      quotedPrice: numQuoted,
      depositPaid: numDeposit,
      status,
      contractSigned,
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
              <Building2 className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Edit Vendor Details</h2>
              <p className="text-xs text-purple-200">Update quotes, deposit amounts, and contract status.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-purple-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs">{error}</div>}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Vendor Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VendorCategory)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="venue">Venue</option>
                <option value="catering">Catering & Bar</option>
                <option value="decoration">Decoration & Florals</option>
                <option value="photography">Photography & Video</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other Service</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quoted ({activeEvent.currency || 'USD'})
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Deposit ({activeEvent.currency || 'USD'})
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={depositPaid}
                onChange={(e) => setDepositPaid(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pipeline Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VendorStatus)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="researching">Researching</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="booked">Booked</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
            <input
              type="checkbox"
              id="edit-contract-signed"
              checked={contractSigned}
              onChange={(e) => setContractSigned(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded border-purple-300"
            />
            <label htmlFor="edit-contract-signed" className="text-xs font-semibold text-purple-900 cursor-pointer">
              Contract has been formally signed and executed
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deliverables & Notes</label>
            <textarea
              rows={2}
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
