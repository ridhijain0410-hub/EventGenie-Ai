import React, { useState } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { TaskPriority } from '../../types/event';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MILESTONES = [
  '6+ Months Before',
  '3-6 Months Before',
  '1-2 Months Before',
  'Event Week',
  'Day-Of',
  'Post-Event',
] as const;

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { activeEvent, addTask } = useEventContext();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [milestone, setMilestone] = useState<typeof MILESTONES[number]>('1-2 Months Before');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !activeEvent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    addTask({
      eventId: activeEvent.id,
      title: title.trim(),
      category: category.trim() || 'General',
      milestone,
      dueDate: dueDate || activeEvent.date,
      priority,
      status: 'todo',
      assignedTo: assignedTo.trim() || undefined,
      description: description.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Add Planning Task</h2>
              <p className="text-xs text-purple-200">Assign milestone actions and due dates.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-purple-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Confirm acoustic sound check with venue AV engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Milestone Phase</label>
              <select
                value={milestone}
                onChange={(e) => setMilestone(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {MILESTONES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Venue, Catering, Music"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assignee</label>
              <input
                type="text"
                placeholder="e.g. Maya, Ethan, Maid of Honor"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Sub-notes</label>
            <textarea
              rows={2}
              placeholder="Instructions or contacts..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
