import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Flag,
  User,
  Sparkles,
  Filter,
  Check,
  Calendar,
  Layers,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { TaskItem, TaskPriority, TaskStatus } from '../../types/event';
import { formatDate, getDaysRemaining } from '../../utils/formatters';

interface TimelineViewProps {
  onOpenAddTask: () => void;
}

const MILESTONES = [
  '6+ Months Before',
  '3-6 Months Before',
  '1-2 Months Before',
  'Event Week',
  'Day-Of',
  'Post-Event',
] as const;

export const TimelineView: React.FC<TimelineViewProps> = ({ onOpenAddTask }) => {
  const {
    activeEvent,
    activeTasks,
    toggleTaskStatus,
    deleteTask,
    updateTask,
    addTask,
    triggerCelebration,
  } = useEventContext();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [milestoneFilter, setMilestoneFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  if (!activeEvent) {
    return <div className="p-8 text-center text-slate-500">Please select an event.</div>;
  }

  const completedCount = activeTasks.filter((t) => t.status === 'completed').length;
  const totalCount = activeTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter tasks
  const filteredTasks = activeTasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && task.status === 'completed') ||
      (statusFilter === 'pending' && task.status !== 'completed');
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesMilestone = milestoneFilter === 'all' || task.milestone === milestoneFilter;
    const matchesSearch =
      searchQuery === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.category && task.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesPriority && matchesMilestone && matchesSearch;
  });

  // Populate smart AI tasks if needed
  const handleAutoFillAiTasks = () => {
    const standardTasks = [
      { title: 'Confirm photographer arrival time & photo shot list', category: 'Photography', milestone: 'Event Week', priority: 'high' as TaskPriority },
      { title: 'Reconfirm final guest headcount and special diets with caterer', category: 'Catering', milestone: 'Event Week', priority: 'high' as TaskPriority },
      { title: 'Prepare day-of cash gratuity tips in sealed envelopes', category: 'Finance', milestone: 'Event Week', priority: 'medium' as TaskPriority },
      { title: 'Pack day-of emergency essentials kit (tapes, mints, chargers)', category: 'General', milestone: 'Day-Of', priority: 'medium' as TaskPriority },
      { title: 'Send thank-you messages and review vendors online', category: 'Post-Event', milestone: 'Post-Event', priority: 'low' as TaskPriority },
    ];

    standardTasks.forEach((st) => {
      addTask({
        eventId: activeEvent.id,
        title: st.title,
        category: st.category,
        milestone: st.milestone as any,
        dueDate: activeEvent.date,
        priority: st.priority,
        status: 'todo',
        assignedTo: 'Planner',
      });
    });
    triggerCelebration();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                Planning Timeline & Checklists
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                {completedCount} of {totalCount} Done
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured milestone deadlines leading up to {formatDate(activeEvent.date)}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoFillAiTasks}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition border border-purple-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Smart Task Checklist</span>
            </button>
            <button
              onClick={onOpenAddTask}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-purple-600/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Overall Task Completion Rate</span>
            <span className="font-bold text-purple-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Milestone Tabs */}
      <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Milestone Filter */}
          <select
            value={milestoneFilter}
            onChange={(e) => setMilestoneFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-purple-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Milestones</option>
            {MILESTONES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-purple-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="completed">Completed Only</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-purple-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search task title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-purple-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[200px]"
        />
      </div>

      {/* Task Milestones Grouping */}
      <div className="space-y-6">
        {MILESTONES.map((milestone) => {
          const tasksInMilestone = filteredTasks.filter((t) => t.milestone === milestone);
          if (tasksInMilestone.length === 0 && milestoneFilter !== 'all' && milestoneFilter !== milestone) {
            return null;
          }

          const milestoneCompleted = tasksInMilestone.filter((t) => t.status === 'completed').length;

          return (
            <div
              key={milestone}
              className="bg-white rounded-3xl border border-purple-100 p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-purple-50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{milestone}</h3>
                    <p className="text-[11px] text-slate-400">
                      {tasksInMilestone.length} {tasksInMilestone.length === 1 ? 'task' : 'tasks'} (
                      {milestoneCompleted} completed)
                    </p>
                  </div>
                </div>

                {tasksInMilestone.length > 0 && (
                  <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                    {Math.round((milestoneCompleted / tasksInMilestone.length) * 100)}%
                  </span>
                )}
              </div>

              {/* Tasks List in this milestone */}
              <div className="space-y-2.5">
                {tasksInMilestone.map((task) => {
                  const isDone = task.status === 'completed';
                  const daysToTask = getDaysRemaining(task.dueDate);
                  const isOverdue = !isDone && daysToTask < 0;

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 group ${
                        isDone
                          ? 'bg-slate-50/60 border-slate-100 text-slate-400'
                          : 'bg-white border-purple-100/80 hover:border-purple-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                            isDone
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-300 hover:border-purple-600 bg-white'
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <Circle className="w-2.5 h-2.5 text-transparent" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-bold leading-snug ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </p>

                          {task.description && (
                            <p className="text-[11px] text-slate-400 mt-1">{task.description}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px]">
                            <span className="px-2 py-0.5 rounded-md font-semibold bg-purple-50 text-purple-700">
                              {task.category}
                            </span>

                            <span
                              className={`flex items-center gap-1 font-medium ${
                                isOverdue
                                  ? 'text-rose-600 font-bold'
                                  : isDone
                                  ? 'text-slate-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(task.dueDate)}</span>
                              {isOverdue && <span>(Overdue)</span>}
                            </span>

                            {task.assignedTo && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <User className="w-3 h-3" />
                                <span>{task.assignedTo}</span>
                              </span>
                            )}

                            <span
                              className={`px-1.5 py-0.2 rounded font-semibold capitalize ${
                                task.priority === 'high'
                                  ? 'bg-rose-50 text-rose-600'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {task.priority} Priority
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1.5 text-slate-300 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition"
                          title="Edit task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {tasksInMilestone.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-400 italic">
                    No tasks assigned to this milestone phase yet.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Edit Task</h2>
                  <p className="text-xs text-purple-200">Update deadline, priority, or milestone phase.</p>
                </div>
              </div>
              <button onClick={() => setEditingTask(null)} className="p-1.5 rounded-lg text-purple-200 hover:text-white">
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateTask(editingTask.id, {
                  title: editingTask.title,
                  category: editingTask.category,
                  milestone: editingTask.milestone,
                  dueDate: editingTask.dueDate,
                  priority: editingTask.priority,
                  status: editingTask.status,
                  assignedTo: editingTask.assignedTo,
                  description: editingTask.description,
                });
                setEditingTask(null);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Milestone Phase</label>
                  <select
                    value={editingTask.milestone}
                    onChange={(e) => setEditingTask({ ...editingTask, milestone: e.target.value as any })}
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
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="todo">To-Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingTask.category}
                    onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignee</label>
                <input
                  type="text"
                  value={editingTask.assignedTo || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
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
      )}
    </div>
  );
};
