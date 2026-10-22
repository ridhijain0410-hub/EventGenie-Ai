import React, { useState } from 'react';
import { X, DollarSign, Wallet } from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { BudgetCategory, PaymentStatus } from '../../types/event';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: BudgetCategory[] = [
  'Venue & Rentals',
  'Catering & Bar',
  'Decor & Florals',
  'Photography & Video',
  'Entertainment & Music',
  'Attire & Beauty',
  'Stationery & Favors',
  'Staff & Security',
  'Contingency & Misc',
  'Other',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { activeEvent, addBudgetItem, activeVendors } = useEventContext();

  const [category, setCategory] = useState<BudgetCategory>('Venue & Rentals');
  const [name, setName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [status, setStatus] = useState<PaymentStatus>('planned');
  const [vendorName, setVendorName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !activeEvent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an expense item name.');
      return;
    }

    const estNum = estimatedCost === '' ? 0 : parseFloat(estimatedCost);
    const actNum = actualCost === '' ? estNum : parseFloat(actualCost);
    const paidNum = paidAmount === '' ? 0 : parseFloat(paidAmount);

    if (isNaN(estNum) || estNum < 0) {
      setError('Estimated cost must be 0 or a positive number.');
      return;
    }
    if (isNaN(actNum) || actNum < 0) {
      setError('Actual cost must be 0 or a positive number.');
      return;
    }
    if (isNaN(paidNum) || paidNum < 0) {
      setError('Paid amount must be 0 or a positive number.');
      return;
    }

    addBudgetItem({
      eventId: activeEvent.id,
      category,
      name: name.trim(),
      estimatedCost: estNum,
      actualCost: actNum,
      paidAmount: paidNum,
      status,
      vendorName: vendorName.trim() || undefined,
      dueDate: dueDate || undefined,
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
              <Wallet className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Add Budget Expense</h2>
              <p className="text-xs text-purple-200">Log allocated or incurred event costs.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-purple-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BudgetCategory)}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Item Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Reception Champagne & Bar Service"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated ({activeEvent.currency || 'USD'})
              </label>
              <input
                type="number"
                min="0"
                step="10"
                placeholder="0"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Actual ({activeEvent.currency || 'USD'})
              </label>
              <input
                type="number"
                min="0"
                step="10"
                placeholder="0"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Paid ({activeEvent.currency || 'USD'})
              </label>
              <input
                type="number"
                min="0"
                step="10"
                placeholder="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="planned">Planned</option>
                <option value="deposit_paid">Deposit Paid</option>
                <option value="paid_in_full">Paid in Full</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Associated Vendor</label>
              <input
                type="text"
                list="vendors-list"
                placeholder="Select or enter vendor"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
              <datalist id="vendors-list">
                {activeVendors.map((v) => (
                  <option key={v.id} value={v.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Terms</label>
            <input
              type="text"
              placeholder="e.g. Final balance due 7 days prior to event"
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
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
