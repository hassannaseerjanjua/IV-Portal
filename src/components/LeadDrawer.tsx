import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CompanyLead, CompanySummary, LeadTask, LeadTaskType, LeadTaskStatus } from '../types';
import { usePresence } from '../hooks/usePresence';
import {
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Clock,
  Edit3,
  ExternalLink,
  ChevronDown,
  Layers,
  Calendar,
  User,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Tag,
  AlertCircle,
  FileText,
  Users,
  Package,
  CheckSquare,
  Square,
} from 'lucide-react';

export interface LeadDrawerProps {
  lead: (CompanyLead & { summary?: CompanySummary }) | null;
  onClose: () => void;
  onEditLead?: (lead: CompanyLead) => void;
  onStatusChange?: (companyName: string, newStatus: CompanyLead['status']) => void;
  onViewCompanyProducts?: (company: CompanySummary) => void;
}

const TASK_TYPES: LeadTaskType[] = [
  'Follow Up',
  'Call',
  'Email',
  'Meeting',
  'Sample Dispatch',
  'Contract',
];

const TASK_STATUSES: LeadTaskStatus[] = ['Todo', 'In Progress', 'Closed'];

import { getCompanyTasks, saveCompanyTasks, subscribeToTasksUpdates } from '../utils/crmStorage';

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  lead: leadProp,
  onClose,
  onEditLead,
  onStatusChange,
  onViewCompanyProducts,
}) => {
  const { value: lead, state: presence } = usePresence(leadProp);
  const [currentStatus, setCurrentStatus] = useState<CompanyLead['status']>('Not Contacted');

  // Tasks state
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form fields
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<LeadTaskType>('Follow Up');
  const [newTaskStatus, setNewTaskStatus] = useState<LeadTaskStatus>('Todo');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  useEffect(() => {
    if (leadProp) {
      setCurrentStatus(leadProp.status);
      setTasks(getCompanyTasks(leadProp.companyName));
      setIsAddingTask(false);
      resetTaskForm();
    }
  }, [leadProp]);

  // Subscribe to external task changes
  useEffect(() => {
    if (!leadProp) return;
    const unsub = subscribeToTasksUpdates(() => {
      setTasks(getCompanyTasks(leadProp.companyName));
    });
    return unsub;
  }, [leadProp]);

  // Close on Escape key
  useEffect(() => {
    if (!leadProp) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [leadProp, onClose]);

  if (!lead) return null;

  const resetTaskForm = () => {
    setNewTaskTitle('');
    setNewTaskType('Follow Up');
    setNewTaskStatus('Todo');
    setNewTaskDueDate('');
    setNewTaskNotes('');
  };

  const handleStatusSelect = (newStatus: CompanyLead['status']) => {
    setCurrentStatus(newStatus);
    onStatusChange?.(lead.companyName, newStatus);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: LeadTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      type: newTaskType,
      status: newTaskStatus,
      dueDate: newTaskDueDate || undefined,
      notes: newTaskNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [task, ...tasks];
    setTasks(updated);
    saveCompanyTasks(lead.companyName, updated);
    resetTaskForm();
    setIsAddingTask(false);
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextStatus: LeadTaskStatus = t.status === 'Closed' ? 'Todo' : 'Closed';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTasks(updated);
    saveCompanyTasks(lead.companyName, updated);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: LeadTaskStatus) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
    setTasks(updated);
    saveCompanyTasks(lead.companyName, updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveCompanyTasks(lead.companyName, updated);
  };

  // Helper for lead stage badge colors
  const getStatusStyle = (status: CompanyLead['status']) => {
    switch (status) {
      case 'Existing Client':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'Sample Sent':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'In Discussion':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-600',
        };
      case 'Not Interested':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  // Helper for task type pill styles and icons
  const getTaskTypeStyle = (type: LeadTaskType) => {
    switch (type) {
      case 'Call':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Phone };
      case 'Email':
        return { bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: Mail };
      case 'Meeting':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Users };
      case 'Sample Dispatch':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Package };
      case 'Contract':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FileText };
      case 'Follow Up':
      default:
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock };
    }
  };

  // Helper for task status badge styles
  const getTaskStatusStyle = (status: LeadTaskStatus) => {
    switch (status) {
      case 'Closed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Closed',
        };
      case 'In Progress':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'In Progress',
        };
      case 'Todo':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Todo',
        };
    }
  };

  const statusStyle = getStatusStyle(currentStatus);

  // Formatted date string from updatedAt
  const formattedDate = lead.updatedAt
    ? new Date(lead.updatedAt).toLocaleDateString('en-CA')
    : new Date().toLocaleDateString('en-CA');

  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9+]/g, '') : '';
  const todayStr = new Date().toISOString().split('T')[0];

  const drawerContent = (
    <div
      data-state={presence}
      className="motion-scrim fixed inset-0 z-[100] bg-black/40 backdrop-blur-xs flex justify-end overflow-hidden"
      style={{ height: '100vh', width: '100vw' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="motion-drawer relative w-full max-w-md sm:max-w-lg bg-white h-screen shadow-2xl flex flex-col overflow-hidden border-l border-slate-200"
        style={{ height: '100vh', maxHeight: '100vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Brand Stripe */}
        <div className="h-1.5 bg-[#f59e0b] w-full shrink-0" />

        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-white">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
              {lead.companyName}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 flex items-center gap-2 truncate">
              <span>{lead.city || 'Pakistan'}</span>
              {lead.contactPerson && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="truncate text-slate-700 font-semibold">{lead.contactPerson}</span>
                </>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
            title="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader / Section Title */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold text-slate-900">Lead details</span>
          <div className="flex items-center gap-3">
            {onEditLead && (
              <button
                onClick={() => {
                  onClose();
                  onEditLead(lead);
                }}
                className="text-xs font-semibold text-[#0047ba] hover:text-[#003894] flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Lead</span>
              </button>
            )}
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Assignment history</span>
            </span>
          </div>
        </div>

        {/* Scrollable Content Body (Showing Table Fields Only) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* 1. Company / Target */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">Company / Target</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-right">{lead.companyName}</span>
              {lead.summary && onViewCompanyProducts && (
                <button
                  onClick={() => {
                    onClose();
                    onViewCompanyProducts(lead.summary!);
                  }}
                  title="View company formulations & profile"
                  className="text-slate-400 hover:text-[#0047ba] transition-colors p-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Outreach Stage & Dropdown */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">Outreach Stage</span>
            <div className="relative min-w-[170px]">
              <select
                value={currentStatus}
                onChange={(e) => handleStatusSelect(e.target.value as CompanyLead['status'])}
                className={`w-full appearance-none pl-6 pr-8 py-1.5 text-xs font-semibold rounded-xl border cursor-pointer focus:outline-none transition-colors shadow-2xs ${statusStyle.bg}`}
              >
                <option value="Not Contacted">Not Contacted</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Sample Sent">Sample Sent</option>
                <option value="Existing Client">Existing Client</option>
                <option value="Not Interested">Not Interested</option>
              </select>
              <span
                className={`w-2 h-2 rounded-full absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${statusStyle.dot}`}
              />
              <ChevronDown className="w-3.5 h-3.5 text-current opacity-70 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Date uploaded / updated */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">Date uploaded</span>
            <span className="font-semibold text-slate-900 font-mono">{formattedDate}</span>
          </div>

          {/* 4. City / Plant Location */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">City</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{lead.city || 'Pakistan'}</span>
            </div>
          </div>

          {/* 5. Packaging Profile (Glass & BFS Breakdown) */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">Packaging Profile</span>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {(lead.glassCount ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold badge-glass">
                  {lead.glassCount} Glass
                </span>
              )}
              {(lead.plasticCount ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold badge-plastic">
                  {lead.plasticCount} BFS
                </span>
              )}
              <span className="text-[11px] text-slate-400">
                ({lead.totalProducts || 0} total)
              </span>
            </div>
          </div>

          {/* 6. Key Brands */}
          <div className="flex items-start justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium pt-0.5">Key Brands</span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[260px]">
              {lead.brands && lead.brands.length > 0 ? (
                lead.brands.map((brand) => (
                  <span
                    key={brand}
                    className="px-2 py-0.5 bg-slate-100 border border-slate-200/60 rounded-md text-[10px] font-semibold text-blue-700"
                  >
                    {brand}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">IV Infusions</span>
              )}
            </div>
          </div>

          {/* 7. Key Contact Person & Details */}
          <div className="flex items-start justify-between gap-4 py-1 border-t border-slate-100 pt-3">
            <span className="text-slate-500 font-medium">Key Contact</span>
            <div className="text-right space-y-1">
              <div className="font-semibold text-slate-900">
                {lead.contactPerson || <span className="text-slate-400 italic font-normal">—</span>}
              </div>
              {lead.title && (
                <div className="text-[11px] font-semibold text-[#0047ba]">{lead.title}</div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 justify-end">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="font-mono text-xs font-semibold text-[#0047ba] hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{lead.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              )}
              {lead.email && (
                <div>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-[11px] text-[#0047ba] hover:underline flex items-center justify-end gap-1"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>{lead.email}</span>
                  </a>
                </div>
              )}
              {lead.linkedin && (
                <div>
                  <a
                    href={lead.linkedin.startsWith('http') ? lead.linkedin : `https://${lead.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#0a66c2] hover:underline flex items-center justify-end gap-1"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn Profile</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 8. Pitch Notes */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-slate-700 font-semibold block mb-1.5">Notes</span>
            {lead.notes ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-xs whitespace-pre-wrap">
                {lead.notes}
              </div>
            ) : (
              <span className="text-slate-400 italic">—</span>
            )}
          </div>

          {/* 9. Tasks Section with Enum Task Type, Enum Status, Optional Note & Due Date */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-slate-800 font-bold text-xs sm:text-sm">
                Tasks ({tasks.length})
              </span>
              <button
                type="button"
                onClick={() => setIsAddingTask(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0047ba] hover:bg-[#003894] rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Inline Task Creation Form with Enum Type, Status, Due Date & Optional Note */}
            {isAddingTask && (
              <form
                onSubmit={handleAddTask}
                className="mb-3.5 p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3"
              >
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Task Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Follow up on 100ml hanger labels sample testing..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 focus:border-[#0047ba]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Task Type Enum Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Task Type
                    </label>
                    <select
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value as LeadTaskType)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                    >
                      {TASK_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Task Status Enum Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Task Status
                    </label>
                    <select
                      value={newTaskStatus}
                      onChange={(e) => setNewTaskStatus(e.target.value as LeadTaskStatus)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                    >
                      {TASK_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Due Date</span>
                    </label>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                    />
                  </div>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>Optional Note</span>
                  </label>
                  <textarea
                    rows={2}
                    value={newTaskNotes}
                    onChange={(e) => setNewTaskNotes(e.target.value)}
                    placeholder="Add details, meeting agenda, sample tracking number, or discussion points..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 focus:border-[#0047ba]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-blue-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTask(false);
                      resetTaskForm();
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0047ba] hover:bg-[#003894] rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            )}

            {/* Tasks List or Empty State */}
            {tasks.length === 0 && !isAddingTask ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-7 text-center bg-slate-50/50">
                <span className="text-xs font-medium text-slate-400">No tasks yet</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => {
                  const typeStyle = getTaskTypeStyle(task.type);
                  const statusStyle = getTaskStatusStyle(task.status);
                  const TypeIcon = typeStyle.icon;
                  const isClosed = task.status === 'Closed';
                  const isOverdue =
                    !isClosed && task.dueDate && task.dueDate < todayStr;

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isClosed
                          ? 'bg-slate-50/80 border-slate-200/80'
                          : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      {/* Top Row: Type Pill, Status Selector Dropdown & Actions */}
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Task Type Badge (Enum) */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeStyle.bg}`}
                          >
                            <TypeIcon className="w-3 h-3" />
                            <span>{task.type}</span>
                          </span>

                          {/* Task Status Dropdown (Enum) */}
                          <div className="relative inline-block">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleUpdateTaskStatus(
                                  task.id,
                                  e.target.value as LeadTaskStatus
                                )
                              }
                              className={`appearance-none pl-5 pr-5 py-0.5 text-[10px] font-bold rounded-full border cursor-pointer focus:outline-none transition-colors ${statusStyle.bg}`}
                            >
                              <option value="Todo">Todo</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Closed">Closed</option>
                            </select>
                            <span
                              className={`w-1.5 h-1.5 rounded-full absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${statusStyle.dot}`}
                            />
                            <ChevronDown className="w-2.5 h-2.5 text-current opacity-70 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Due Date & Delete */}
                        <div className="flex items-center gap-2">
                          {task.dueDate && (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                isOverdue
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                              title={isOverdue ? 'Task is overdue' : 'Due date'}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{task.dueDate}</span>
                              {isOverdue && <span className="font-bold text-[9px] uppercase">Overdue</span>}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Task Title with Toggle Checkbox */}
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className="mt-0.5 text-slate-400 hover:text-[#0047ba] transition-colors shrink-0"
                          title={isClosed ? 'Mark as Todo' : 'Mark as Closed'}
                        >
                          {isClosed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-semibold leading-snug ${
                              isClosed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </p>

                          {/* Optional Note Card */}
                          {task.notes && (
                            <p className="mt-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 leading-relaxed whitespace-pre-wrap">
                              {task.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Quick Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {lead.phone && (
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Call</span>
              </a>
            )}

            {onEditLead && (
              <button
                onClick={() => {
                  onClose();
                  onEditLead(lead);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0047ba] hover:bg-[#003894] rounded-xl shadow-xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Lead</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
};
export default LeadDrawer;
