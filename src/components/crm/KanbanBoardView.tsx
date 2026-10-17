import React from 'react';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MessageCircle,
  Edit3,
  User,
  Zap,
  MapPin,
  FileText,
  Users
} from 'lucide-react';
import { CrmTask, CrmTaskStatus, CrmUser, calculateResponseLag, formatTimeAgo } from '../../data/crmData';
import { ActiveLeadWorkflow } from '../../data/workflowTemplateData';
import { playActionClickSound } from '../../utils/audioAlert';

interface KanbanBoardViewProps {
  tasks?: CrmTask[];
  currentUser?: CrmUser | null;
  users?: CrmUser[];
  staffUsers?: CrmUser[];
  leadWorkflows?: ActiveLeadWorkflow[];
  onUpdateStatus?: (taskId: string, newStatus: CrmTaskStatus, optionalMessage: string) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: CrmTaskStatus, optionalMessage?: string) => void;
  onEditTask?: (task: CrmTask) => void;
  onDeleteTask?: (task: CrmTask) => void;
  onOpenWhatsApp?: (task: CrmTask) => void;
  onOpenWhatsAppModal?: (task: CrmTask) => void;
  onViewTemplate?: (templateId?: string) => void;
}

const KANBAN_COLUMNS: {
  status: CrmTaskStatus;
  title: string;
  subtitle: string;
  bgColor: string;
  headerColor: string;
  badgeColor: string;
}[] = [
  {
    status: 'not started',
    title: '1. Not Started',
    subtitle: 'Site Survey & Intake',
    bgColor: 'bg-slate-50/80',
    headerColor: 'border-slate-300 text-slate-800 bg-slate-100',
    badgeColor: 'bg-slate-200 text-slate-800',
  },
  {
    status: 'in progress',
    title: '2. In Progress',
    subtitle: 'Mounting & Solar Modules',
    bgColor: 'bg-blue-50/40',
    headerColor: 'border-blue-300 text-blue-900 bg-blue-100/70',
    badgeColor: 'bg-blue-200 text-blue-900',
  },
  {
    status: 'pending',
    title: '3. Pending',
    subtitle: 'UPPCL Discom Inspection',
    bgColor: 'bg-amber-50/40',
    headerColor: 'border-amber-300 text-amber-900 bg-amber-100/70',
    badgeColor: 'bg-amber-200 text-amber-900',
  },
  {
    status: 'on hold',
    title: '4. On Hold',
    subtitle: 'Customer / Roof Delay',
    bgColor: 'bg-rose-50/40',
    headerColor: 'border-rose-300 text-rose-900 bg-rose-100/70',
    badgeColor: 'bg-rose-200 text-rose-900',
  },
  {
    status: 'compleated',
    title: '5. Compleated',
    subtitle: 'Commissioned & Subsidy',
    bgColor: 'bg-emerald-50/40',
    headerColor: 'border-emerald-300 text-emerald-900 bg-emerald-100/70',
    badgeColor: 'bg-emerald-200 text-emerald-900',
  },
];

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  tasks = [],
  currentUser,
  users,
  staffUsers,
  leadWorkflows = [],
  onUpdateStatus,
  onUpdateTaskStatus,
  onEditTask,
  onDeleteTask,
  onOpenWhatsApp,
  onOpenWhatsAppModal,
  onViewTemplate,
}) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const handleUpdate = onUpdateStatus || onUpdateTaskStatus;
  const handleWhatsApp = onOpenWhatsApp || onOpenWhatsAppModal;

  const getNextStatus = (current: CrmTaskStatus): CrmTaskStatus | null => {
    switch (current) {
      case 'not started':
        return 'in progress';
      case 'in progress':
        return 'pending';
      case 'pending':
        return 'compleated';
      case 'on hold':
        return 'in progress';
      case 'compleated':
        return null;
      default:
        return null;
    }
  };

  const getPrevStatus = (current: CrmTaskStatus): CrmTaskStatus | null => {
    switch (current) {
      case 'not started':
        return null;
      case 'in progress':
        return 'not started';
      case 'pending':
        return 'in progress';
      case 'on hold':
        return 'pending';
      case 'compleated':
        return 'in progress';
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto pb-4 pt-1">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 min-w-[1100px]">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = safeTasks.filter((t) => t.status === col.status);
          const colTotalValue = colTasks.reduce((sum, t) => sum + (t.dealValueRs || 0), 0);
          const colTotalKw = colTasks.reduce((sum, t) => sum + (t.capacityKw || 0), 0);

          return (
            <div
              key={col.status}
              className={`rounded-xl border border-slate-200/90 ${col.bgColor} flex flex-col max-h-[750px] shadow-2xs`}
            >
              {/* Column Header */}
              <div className={`p-3 rounded-t-xl border-b font-bold text-xs ${col.headerColor} flex flex-col gap-1`}>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold">{col.title}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${col.badgeColor}`}>
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] opacity-80">
                  <span>{col.subtitle}</span>
                  {colTotalValue > 0 && (
                    <span className="font-mono font-bold">₹{(colTotalValue / 100000).toFixed(1)}L ({colTotalKw}kW)</span>
                  )}
                </div>
              </div>

              {/* Tasks List */}
              <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                {colTasks.map((task) => {
                  const lag = calculateResponseLag(task.assignedAt, task.firstRespondedAt);
                  const nextSt = getNextStatus(task.status);
                  const prevSt = getPrevStatus(task.status);
                  const cleanPhone = task.customerPhone.replace(/[^0-9]/g, '');

                  return (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs hover:shadow-md transition-all space-y-2 text-xs"
                    >
                      {/* Top Code & Priority */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-black text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded border border-amber-500 shadow-2xs" title="Pipeline Rank (Newest First)">
                            #{safeTasks.findIndex((t) => t.id === task.id) + 1}
                          </span>
                          <span className="font-mono font-bold text-[10px] bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded border border-blue-200">
                            {task.taskCode}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                            task.priority === 'Urgent'
                              ? 'bg-rose-600 text-white animate-pulse'
                              : task.priority === 'High'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Lead Creation & Relative Age */}
                      <div className="text-[10px] text-slate-500 flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          <span>Added: <strong>{formatTimeAgo(task.assignedAt)}</strong></span>
                        </span>
                        <span className="font-mono text-[9px]">
                          {new Date(task.assignedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Customer & System */}
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-1">
                          {task.customerName}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 mt-0.5">
                          <span className="font-bold text-amber-900">
                            {task.capacityKw} kW • {task.systemType.replace(' Rooftop', '')}
                          </span>
                          {task.dealValueRs && (
                            <span className="font-bold text-emerald-800 font-mono">
                              ₹{(task.dealValueRs / 1000).toFixed(0)}k
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Address & Assigned */}
                      <div className="text-[10px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1 line-clamp-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{task.customerAddress}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-700 font-medium truncate">
                            <User className="w-3 h-3 text-blue-600 shrink-0" />
                            <strong className="text-slate-900 truncate">{task.assignedToUserName}</strong>
                          </span>
                          {task.dueDate && (
                            <span className={`text-[9px] px-1 py-0.2 rounded font-semibold shrink-0 ${
                              new Date(task.dueDate) < new Date() && task.status !== 'compleated'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                        </div>

                        {/* Team Members if multiple or from workflow */}
                        {(() => {
                          const matchingWf = leadWorkflows.find(
                            (wf) =>
                              (task.workflowId && wf.id === task.workflowId) ||
                              (wf.taskId && wf.taskId === task.id) ||
                              (task.customerPhone &&
                                wf.customerPhone &&
                                task.customerPhone.replace(/\D/g, '') === wf.customerPhone.replace(/\D/g, '')) ||
                              (task.customerName &&
                                wf.customerName &&
                                task.customerName.trim().toLowerCase() === wf.customerName.trim().toLowerCase())
                          );

                          const teamSet = new Set<string>();
                          if (task.assignedToUserName && task.assignedToUserName !== 'Unassigned') {
                            teamSet.add(task.assignedToUserName);
                          }
                          if (Array.isArray(task.assignedUserNames)) {
                            task.assignedUserNames.forEach(n => { if (n && !n.startsWith('usr-')) teamSet.add(n); });
                          }
                          if (matchingWf?.steps) {
                            matchingWf.steps.forEach(st => {
                              (st.assignedUserNames || []).forEach(n => { if (n && !n.startsWith('usr-')) teamSet.add(n); });
                            });
                          }
                          const teamList = Array.from(teamSet);

                          return (
                            <>
                              {teamList.length > 1 && (
                                <div className="flex items-center gap-1 text-[9px] text-slate-600 truncate">
                                  <Users className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                  <span className="truncate font-medium">Team: {teamList.join(', ')}</span>
                                </div>
                              )}

                              {matchingWf && (
                                <div className="bg-blue-50/80 border border-blue-200/80 rounded p-1 text-[9px] text-blue-950 flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 truncate font-bold text-blue-900">
                                    <Zap className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                    <span className="truncate">Active #{matchingWf.currentActiveFlowStepNumbers?.join(', #') || '1, #2'}</span>
                                  </div>
                                  {currentUser?.id && matchingWf.steps.some(s => s.assignedUserIds?.includes(currentUser.id)) && (
                                    <span className="bg-blue-600 text-white font-extrabold px-1 rounded text-[8px] uppercase">
                                      Your Step
                                    </span>
                                  )}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      {/* Lag Indicator */}
                      <div className={`p-1 rounded text-[10px] flex items-center gap-1 ${lag.delayClass}`}>
                        {lag.isResponded ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                        )}
                        <span className="truncate">{lag.text}</span>
                      </div>

                      {/* Quick Card Actions */}
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                        <div className="flex items-center gap-1">
                          <a
                            href={`tel:${cleanPhone}`}
                            onClick={() => playActionClickSound()}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 transition-colors"
                            title="Call customer"
                          >
                            <Phone className="w-3 h-3" />
                          </a>

                          {handleWhatsApp && (
                            <button
                              type="button"
                              onClick={() => {
                                playActionClickSound();
                                handleWhatsApp(task);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-[#25D366] transition-colors"
                              title="Send WhatsApp template"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </button>
                          )}

                          {onEditTask && (
                            <button
                              type="button"
                              onClick={() => {
                                playActionClickSound();
                                onEditTask(task);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 transition-colors"
                              title="Edit task details"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Pipeline Move Buttons */}
                        <div className="flex items-center gap-1">
                          {prevSt && handleUpdate && (
                            <button
                              type="button"
                              onClick={() => {
                                playActionClickSound();
                                handleUpdate(task.id, prevSt, `Moved back to ${prevSt}`);
                              }}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                              title={`Move back to ${prevSt}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}

                          {nextSt && handleUpdate && (
                            <button
                              type="button"
                              onClick={() => {
                                playActionClickSound();
                                handleUpdate(task.id, nextSt, `Advanced to ${nextSt}`);
                              }}
                              className="p-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
                              title={`Advance to ${nextSt}`}
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="p-4 text-center text-slate-400 text-[11px] italic bg-white/40 rounded-lg border border-dashed border-slate-200">
                    No tasks in {col.status}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
