import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import {
  CompanySummary,
  CompanyLead,
  LeadTask,
  LeadTaskType,
  LeadTaskStatus,
} from '../types';
import {
  getStoredCompanyLeads,
  saveCompanyLead,
  getCompanyTasks,
  saveCompanyTasks,
  getAllCompanyTasks,
  subscribeToTasksUpdates,
  StoredCalendarTask,
} from '../utils/crmStorage';
import { LeadDrawer } from './LeadDrawer';

import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Check,
  CheckCircle2,
  Building2,
  Tag,
  AlertCircle,
  Trash2,
  Edit3,
  Search,
  FileText,
  CalendarDays,
} from 'lucide-react';

/* ── Big Calendar Localizer ── */
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export interface TaskCalendarViewProps {
  companies: CompanySummary[];
  onSelectCompany?: (company: CompanySummary) => void;
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

const OUTREACH_STAGES: CompanyLead['status'][] = [
  'In Discussion',
  'Sample Sent',
  'Existing Client',
  'Not Contacted',
  'Not Interested',
];

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: StoredCalendarTask;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  companies,
  onSelectCompany,
}) => {
  // Navigation & View state
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 10, 26)); // Default to Nov 2026 to match screenshot
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  // Filters
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('All');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');

  // Task Store
  const [allTasks, setAllTasks] = useState<StoredCalendarTask[]>([]);

  // Day Detail Drawer State
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 10, 26));
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);

  // Lead Drawer State (opened via Eye button)
  const [selectedLeadForDrawer, setSelectedLeadForDrawer] = useState<
    (CompanyLead & { summary?: CompanySummary }) | null
  >(null);

  // New Task form state inside Day Drawer
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCompany, setNewTaskCompany] = useState('');
  const [newTaskType, setNewTaskType] = useState<LeadTaskType>('Follow Up');
  const [newTaskStatus, setNewTaskStatus] = useState<LeadTaskStatus>('Todo');
  const [newTaskTime, setNewTaskTime] = useState('10:00');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Initial seeding if empty (to match reference screenshots)
  useEffect(() => {
    const existing = getAllCompanyTasks();
    if (existing.length === 0) {
      // Seed initial tasks matching the screenshot
      const seededBosch: LeadTask[] = [
        {
          id: 'seed-task-1',
          title: 'Follow Up',
          type: 'Follow Up',
          status: 'Todo',
          dueDate: '2026-11-26T19:00',
          notes: 'Follow up on 100ml glass infusion hanger label commercial order.',
          createdAt: '2026-11-12T10:00:00Z',
        },
        {
          id: 'seed-task-2',
          title: 'Looking for Operations Head',
          type: 'Call',
          status: 'Todo',
          dueDate: '2026-12-03T09:00',
          notes: 'Connect with plant engineering team.',
          createdAt: '2026-11-12T11:00:00Z',
        },
      ];
      saveCompanyTasks('Bosch Pharmaceuticals (Pvt) Ltd', seededBosch);

      const seededSami: LeadTask[] = [
        {
          id: 'seed-task-3',
          title: 'Contacted',
          type: 'Email',
          status: 'In Progress',
          dueDate: '2026-12-02T09:00',
          notes: 'Sent introduction and technical catalog for glass bottle hanger labels.',
          createdAt: '2026-11-12T10:30:00Z',
        },
        {
          id: 'seed-task-4',
          title: 'Follow Up',
          type: 'Follow Up',
          status: 'Todo',
          dueDate: '2026-12-02T14:00',
          notes: 'Check receipt of technical proposal.',
          createdAt: '2026-11-12T11:30:00Z',
        },
      ];
      saveCompanyTasks('Sami Pharmaceuticals (Pvt) Ltd', seededSami);

      const seededOtsuka: LeadTask[] = [
        {
          id: 'seed-task-5',
          title: 'Contacted',
          type: 'Call',
          status: 'Closed',
          dueDate: '2026-12-04T09:00',
          notes: 'Discussed line compatibility.',
          createdAt: '2026-11-12T12:00:00Z',
        },
      ];
      saveCompanyTasks('Otsuka Pakistan Ltd', seededOtsuka);
    }

    setAllTasks(getAllCompanyTasks());
  }, []);

  // Listen to updates
  useEffect(() => {
    const refresh = () => setAllTasks(getAllCompanyTasks());
    const unsub = subscribeToTasksUpdates(refresh);
    return unsub;
  }, []);

  // Set default company in new task form
  useEffect(() => {
    if (!newTaskCompany) {
      if (companies.length > 0) {
        setNewTaskCompany(companies[0].name);
      } else {
        const storedLeads = Object.keys(getStoredCompanyLeads());
        if (storedLeads.length > 0) setNewTaskCompany(storedLeads[0]);
      }
    }
  }, [companies, newTaskCompany]);

  // Combine company options (from dataset + stored leads)
  const allCompanyNames = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => set.add(c.name));
    Object.keys(getStoredCompanyLeads()).forEach((c) => set.add(c));
    return Array.from(set).sort();
  }, [companies]);

  // Map of company leads for outreach stage filtering
  const companyLeadsMap = useMemo(() => {
    return getStoredCompanyLeads();
  }, [allTasks]);

  // Filter tasks based on dropdowns
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      // Company filter
      if (selectedCompanyFilter !== 'All' && task.companyName !== selectedCompanyFilter) {
        return false;
      }

      // Outreach stage filter
      if (selectedStageFilter !== 'All') {
        const lead = companyLeadsMap[task.companyName];
        const stage = lead ? lead.status : 'Not Contacted';
        if (stage !== selectedStageFilter) return false;
      }

      // Task Type filter
      if (selectedTypeFilter !== 'All' && task.type !== selectedTypeFilter) {
        return false;
      }

      return true;
    });
  }, [allTasks, selectedCompanyFilter, selectedStageFilter, selectedTypeFilter, companyLeadsMap]);

  // Convert tasks into react-big-calendar events
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return filteredTasks.map((task) => {
      let startDate = new Date();
      if (task.dueDate) {
        const parsed = new Date(task.dueDate);
        if (!isNaN(parsed.getTime())) startDate = parsed;
      } else if (task.createdAt) {
        const parsed = new Date(task.createdAt);
        if (!isNaN(parsed.getTime())) startDate = parsed;
      }

      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour slot
      return {
        id: task.id,
        title: task.title,
        start: startDate,
        end: endDate,
        resource: task,
      };
    });
  }, [filteredTasks]);

  // Tasks for the selected day in Day Drawer
  const dayDrawerTasks = useMemo(() => {
    if (!selectedDate) return [];
    return allTasks.filter((t) => {
      if (!t.dueDate && !t.createdAt) return false;
      const taskDate = new Date(t.dueDate || t.createdAt);
      return isSameDay(taskDate, selectedDate);
    });
  }, [allTasks, selectedDate]);

  // Navigation handlers
  const handleNavigateToday = () => {
    setCurrentDate(new Date(2026, 10, 26)); // Or new Date()
  };

  const handleNavigatePrev = () => {
    if (currentView === Views.MONTH) {
      setCurrentDate((prev) => subMonths(prev, 1));
    } else {
      setCurrentDate((prev) => subWeeks(prev, 1));
    }
  };

  const handleNavigateNext = () => {
    if (currentView === Views.MONTH) {
      setCurrentDate((prev) => addMonths(prev, 1));
    } else {
      setCurrentDate((prev) => addWeeks(prev, 1));
    }
  };

  // Slot click -> open day drawer
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedDate(slotInfo.start);
    setIsDayDrawerOpen(true);
    setIsAddingTask(false);
  };

  // Event click -> open day drawer
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedDate(event.start);
    setIsDayDrawerOpen(true);
    setIsAddingTask(false);
  };

  // Open Lead Drawer for specific company
  const handleOpenLeadDrawer = (companyName: string) => {
    const leads = getStoredCompanyLeads();
    const storedLead = leads[companyName];
    const summary = companies.find((c) => c.name.toLowerCase() === companyName.toLowerCase());

    const targetLead: CompanyLead & { summary?: CompanySummary } = storedLead
      ? { ...storedLead, summary }
      : {
        companyName,
        status: 'Not Contacted',
        city: summary?.city || '',
        summary,
      };

    setSelectedLeadForDrawer(targetLead);
  };

  // Save new task in Day Drawer
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskCompany.trim() || !selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const fullDue = newTaskTime ? `${dateStr}T${newTaskTime}` : dateStr;

    const newTask: LeadTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      type: newTaskType,
      status: newTaskStatus,
      dueDate: fullDue,
      notes: newTaskNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const existingCompanyTasks = getCompanyTasks(newTaskCompany);
    saveCompanyTasks(newTaskCompany, [newTask, ...existingCompanyTasks]);

    // Reset form
    setNewTaskTitle('');
    setNewTaskNotes('');
    setIsAddingTask(false);
    setAllTasks(getAllCompanyTasks());
  };

  // Status toggle in Day Drawer
  const handleToggleTaskStatus = (task: StoredCalendarTask) => {
    const nextStatus: LeadTaskStatus =
      task.status === 'Closed' ? 'Todo' : task.status === 'Todo' ? 'In Progress' : 'Closed';
    const companyTasks = getCompanyTasks(task.companyName);
    const updated = companyTasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t));
    saveCompanyTasks(task.companyName, updated);
    setAllTasks(getAllCompanyTasks());
  };

  // Delete task in Day Drawer
  const handleDeleteTask = (task: StoredCalendarTask) => {
    const companyTasks = getCompanyTasks(task.companyName);
    const updated = companyTasks.filter((t) => t.id !== task.id);
    saveCompanyTasks(task.companyName, updated);
    setAllTasks(getAllCompanyTasks());
  };

  // Custom Event component in Calendar Grid
  const CustomEvent = ({ event }: { event: CalendarEvent }) => {
    const task = event.resource;
    let timeLabel = '';
    try {
      timeLabel = format(event.start, 'h:mm a');
    } catch {
      timeLabel = '';
    }

    return (
      <div
        className="bg-[#3d4b60] hover:bg-[#2e3949] text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-sm flex items-center gap-1.5 cursor-pointer truncate transition-all duration-150 active:scale-[0.98]"
        title={`${timeLabel} · ${task.title} (${task.companyName})`}
      >
        <CalendarIcon className="w-3 h-3 text-slate-300 flex-shrink-0" />
        {timeLabel && <span className="font-semibold whitespace-nowrap">{timeLabel}</span>}
        {timeLabel && <span className="text-slate-400">·</span>}
        <span className="truncate">{task.title || task.type}</span>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* ── Main Calendar Container (Screenshot 1) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 overflow-hidden">
        {/* Top Control Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          {/* Left: Today, Navigation, Month Label */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleNavigateToday}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
              <button
                onClick={handleNavigatePrev}
                className="p-1.5 hover:bg-slate-50 text-slate-600 border-r border-slate-200 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNavigateNext}
                className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-lg font-bold text-slate-900 ml-1">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>

          {/* Center / Right: Filter Dropdowns & View Switchers */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter 1: All Companies */}
            <div className="relative">
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All Companies</option>
                {allCompanyNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter 2: All Leads (Stage) */}
            <div className="relative">
              <select
                value={selectedStageFilter}
                onChange={(e) => setSelectedStageFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All Leads</option>
                {OUTREACH_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter 3: All Task Types */}
            <div className="relative">
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All Task Types</option>
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Switchers: Month / Week */}
            <div className="flex items-center rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs">
              <button
                onClick={() => setCurrentView(Views.MONTH)}
                className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${currentView === Views.MONTH
                  ? 'bg-[#002d75] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                Month
              </button>
              <button
                onClick={() => setCurrentView(Views.WEEK)}
                className={`px-3.5 py-1.5 text-xs font-semibold transition-colors border-l border-slate-200 ${currentView === Views.WEEK
                  ? 'bg-[#002d75] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="mt-4 custom-big-calendar-container">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={(d) => setCurrentDate(d)}
            view={currentView}
            onView={(v) => setCurrentView(v)}
            views={[Views.MONTH, Views.WEEK]}
            toolbar={false}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            components={{ event: CustomEvent as any }}
            popup
            style={{ height: 700 }}   // 👈 add this
          />
        </div>
      </div>

      {/* ── Day Detail Drawer (Screenshot 2) ── */}
      {isDayDrawerOpen && selectedDate && (
        <DayDetailDrawer
          selectedDate={selectedDate}
          tasks={dayDrawerTasks}
          onClose={() => {
            setIsDayDrawerOpen(false);
            setIsAddingTask(false);
          }}
          onOpenLeadDrawer={handleOpenLeadDrawer}
          onToggleTaskStatus={handleToggleTaskStatus}
          onDeleteTask={handleDeleteTask}
          isAddingTask={isAddingTask}
          setIsAddingTask={setIsAddingTask}
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          newTaskCompany={newTaskCompany}
          setNewTaskCompany={setNewTaskCompany}
          newTaskType={newTaskType}
          setNewTaskType={setNewTaskType}
          newTaskStatus={newTaskStatus}
          setNewTaskStatus={setNewTaskStatus}
          newTaskTime={newTaskTime}
          setNewTaskTime={setNewTaskTime}
          newTaskNotes={newTaskNotes}
          setNewTaskNotes={setNewTaskNotes}
          handleCreateTask={handleCreateTask}
          allCompanyNames={allCompanyNames}
        />
      )}

      {/* ── Lead Drawer (Triggered by Eye Button) ── */}
      {selectedLeadForDrawer && (
        <LeadDrawer
          lead={selectedLeadForDrawer}
          onClose={() => setSelectedLeadForDrawer(null)}
          onStatusChange={(compName, newStatus) => {
            saveCompanyLead(compName, {
              status: newStatus,
            });
            // Also refresh local tasks if stage changed
            setAllTasks(getAllCompanyTasks());
          }}
          onViewCompanyProducts={(comp) => {
            onSelectCompany?.(comp);
          }}
        />
      )}

      {/* Scoped CSS for Calendar Grid to match Screenshot 1 */}
      <style>{`
        .custom-big-calendar-container .rbc-month-view {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        .custom-big-calendar-container .rbc-header {
          padding: 12px 6px;
          font-weight: 700;
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
          background-color: #ffffff;
        }
        .custom-big-calendar-container .rbc-month-row {
          border-bottom: 1px solid #e2e8f0;
          min-height: 100px;
        }
        .custom-big-calendar-container .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #e2e8f0;
        }
        .custom-big-calendar-container .rbc-date-cell {
          padding: 6px 10px;
          font-weight: 600;
          font-size: 12px;
          color: #1e293b;
        }
        .custom-big-calendar-container .rbc-off-range {
          color: #94a3b8;
        }
        .custom-big-calendar-container .rbc-off-range-bg {
          background-color: #fcfcfd;
        }
        .custom-big-calendar-container .rbc-today {
          background-color: #f8fafc;
        }
        .custom-big-calendar-container .rbc-today .rbc-button-link {
          background-color: #002d75;
          color: #ffffff;
          border-radius: 9999px;
          width: 24px;
          height: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .custom-big-calendar-container .rbc-event {
          background: transparent !important;
          padding: 1px 4px !important;
          margin: 1px 0 !important;
        }
        .custom-big-calendar-container .rbc-event:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

/* ── Day Detail Drawer Component (Screenshot 2) ── */
interface DayDetailDrawerProps {
  selectedDate: Date;
  tasks: StoredCalendarTask[];
  onClose: () => void;
  onOpenLeadDrawer: (companyName: string) => void;
  onToggleTaskStatus: (task: StoredCalendarTask) => void;
  onDeleteTask: (task: StoredCalendarTask) => void;
  isAddingTask: boolean;
  setIsAddingTask: (v: boolean) => void;
  newTaskTitle: string;
  setNewTaskTitle: (v: string) => void;
  newTaskCompany: string;
  setNewTaskCompany: (v: string) => void;
  newTaskType: LeadTaskType;
  setNewTaskType: (v: LeadTaskType) => void;
  newTaskStatus: LeadTaskStatus;
  setNewTaskStatus: (v: LeadTaskStatus) => void;
  newTaskTime: string;
  setNewTaskTime: (v: string) => void;
  newTaskNotes: string;
  setNewTaskNotes: (v: string) => void;
  handleCreateTask: (e: React.FormEvent) => void;
  allCompanyNames: string[];
}

const DayDetailDrawer: React.FC<DayDetailDrawerProps> = ({
  selectedDate,
  tasks,
  onClose,
  onOpenLeadDrawer,
  onToggleTaskStatus,
  onDeleteTask,
  isAddingTask,
  setIsAddingTask,
  newTaskTitle,
  setNewTaskTitle,
  newTaskCompany,
  setNewTaskCompany,
  newTaskType,
  setNewTaskType,
  newTaskStatus,
  setNewTaskStatus,
  newTaskTime,
  setNewTaskTime,
  newTaskNotes,
  setNewTaskNotes,
  handleCreateTask,
  allCompanyNames,
}) => {
  // Format formatted date title: e.g. "Thursday, 26 November 2026"
  const formattedDate = format(selectedDate, 'EEEE, d MMMM yyyy');
  const taskCountText = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md sm:max-w-md bg-white shadow-2xl flex flex-col h-screen z-10 animate-in slide-in-from-right duration-200">
        {/* Navy Header (Screenshot 2) */}
        <div className="px-6 py-5 flex border-b items-center justify-between flex-shrink-0 shadow-md">
          <div>
            <h2 className="text-lg font-bold tracking-tight">{formattedDate}</h2>
            <p className="text-xs text-blue-500 font-medium mt-0.5">{taskCountText}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-400 text-white flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* + New task Button */}
          {!isAddingTask ? (
            <button
              onClick={() => setIsAddingTask(true)}
              className="w-full py-2.5 px-4 bg-[#002d75] hover:bg-[#003da5] text-white font-medium text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>New task</span>
            </button>
          ) : (
            /* Inline New Task Form */
            <form
              onSubmit={handleCreateTask}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Add New Task for {format(selectedDate, 'MMM d')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow Up, Call regarding sample dispatch..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Company <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newTaskCompany}
                  onChange={(e) => setNewTaskCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {allCompanyNames.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Task Type
                  </label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as LeadTaskType)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    {TASK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as LeadTaskStatus)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Time</label>
                <input
                  type="time"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context or agenda..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#002d75] hover:bg-[#003da5] text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          {/* Task List */}
          <div className="space-y-3 pt-1">
            {tasks.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl">
                <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No tasks for this day</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click "+ New task" above to schedule a task or follow up.
                </p>
              </div>
            ) : (
              tasks.map((task) => {
                let timeDisplay = 'All Day';
                if (task.dueDate && task.dueDate.includes('T')) {
                  try {
                    timeDisplay = format(new Date(task.dueDate), 'h:mm a');
                  } catch { }
                }

                return (
                  <div
                    key={task.id}
                    className="border border-slate-200 bg-white rounded-xl p-4 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex items-center justify-between gap-3 group"
                  >
                    {/* Left: Time */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm whitespace-nowrap pt-0.5">
                        {timeDisplay}
                      </div>

                      {/* Middle: Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-sm">
                            {task.title}
                          </span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${task.status === 'Closed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : task.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                          >
                            {task.status === 'Todo' ? 'ToDo' : task.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 font-medium truncate mt-1">
                          {task.companyName}
                        </div>

                        {task.notes && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                            "{task.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions including Eye Button */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* EYE BUTTON: Opens LeadDrawer with this specific lead */}
                      <button
                        onClick={() => onOpenLeadDrawer(task.companyName)}
                        title="View Lead Details"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors shadow-2xs"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Quick delete */}
                      <button
                        onClick={() => onDeleteTask(task)}
                        title="Delete Task"
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
