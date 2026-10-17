import React, { useState, useMemo } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  Zap,
  Tag,
  ShieldAlert,
  Edit3,
  Trash2,
  Calendar,
  IndianRupee,
  Share2,
  Sun,
  Compass,
  Layers,
  Users,
  Lock,
  Shield
} from 'lucide-react';
import {
  CrmTask,
  CrmTaskStatus,
  CrmUser,
  calculateResponseLag,
  formatTimeAgo,
  getPmSuryaGharStageInfo,
} from '../../data/crmData';
import { ActiveLeadWorkflow } from '../../data/workflowTemplateData';
import { playActionClickSound } from '../../utils/audioAlert';

interface CrmTaskCardProps {
  task: CrmTask;
  itemIndex?: number;
  currentUser: CrmUser;
  staffUsers?: CrmUser[];
  leadWorkflows?: ActiveLeadWorkflow[];
  onUpdateStatus: (
    taskId: string,
    newStatus: CrmTaskStatus,
    optionalMessage: string
  ) => void;
  onViewTemplate?: (templateId?: string) => void;
  onViewFlowchart?: (workflowId?: string) => void;
  onEditTask?: (task: CrmTask) => void;
  onDeleteTask?: (task: CrmTask) => void;
  onOpenWhatsAppModal?: (task: CrmTask) => void;
  onOpenPmSuryaGharModal?: (task: CrmTask) => void;
  onOpenFeasibilityModal?: (task: CrmTask) => void;
  onOpenEquipmentBomModal?: (task: CrmTask) => void;
}

export const CrmTaskCard: React.FC<CrmTaskCardProps> = ({
  task,
  itemIndex,
  currentUser,
  staffUsers = [],
  leadWorkflows = [],
  onUpdateStatus,
  onViewTemplate,
  onViewFlowchart,
  onEditTask,
  onDeleteTask,
  onOpenWhatsAppModal,
  onOpenPmSuryaGharModal,
  onOpenFeasibilityModal,
  onOpenEquipmentBomModal,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<CrmTaskStatus>(task.status);
  const [updateMessage, setUpdateMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const responseLag = calculateResponseLag(task.assignedAt, task.firstRespondedAt);

  const cleanPhone = task.customerPhone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  // Find matching workflow (by id, taskId, clean phone, or customer name)
  const matchingWorkflow = leadWorkflows.find((wf) => {
    if (task.workflowId && wf.id === task.workflowId) return true;
    if (wf.taskId && wf.taskId === task.id) return true;
    const cleanTPhone = (task.customerPhone || '').replace(/\D/g, '');
    const cleanWfPhone = (wf.customerPhone || '').replace(/\D/g, '');
    if (cleanTPhone && cleanWfPhone && cleanTPhone.length >= 8 && cleanWfPhone.length >= 8) {
      if (cleanTPhone.includes(cleanWfPhone) || cleanWfPhone.includes(cleanTPhone)) return true;
    }
    if (
      task.customerName &&
      wf.customerName &&
      task.customerName.trim().toLowerCase() === wf.customerName.trim().toLowerCase()
    ) {
      return true;
    }
    return false;
  });

  // Active notified step numbers for this workflow (N1-N6 cascade)
  const activeFlowStepNumbers = useMemo(() => {
    if (!matchingWorkflow) return [];
    if (
      Array.isArray(matchingWorkflow.currentActiveFlowStepNumbers) &&
      matchingWorkflow.currentActiveFlowStepNumbers.length > 0
    ) {
      return matchingWorkflow.currentActiveFlowStepNumbers;
    }
    if (
      Array.isArray(matchingWorkflow.notifiedSteps) &&
      matchingWorkflow.notifiedSteps.length > 0
    ) {
      return matchingWorkflow.notifiedSteps;
    }
    return [1, 2];
  }, [matchingWorkflow]);

  // Strictly filter Notified Team members to ONLY the currently active flowchart steps (e.g. Step 1 & 2)
  // This eliminates Disturbance 1 where all steps 1-7 assignees were prematurely displayed
  const activeNotifiedTeamMembers = useMemo(() => {
    if (!matchingWorkflow?.steps || activeFlowStepNumbers.length === 0) return [];

    const memberMap = new Map<string, { name: string; stepNumbers: number[] }>();

    // Only inspect the steps that are currently active and receiving notifications
    const activeSteps = matchingWorkflow.steps.filter((st) =>
      activeFlowStepNumbers.includes(st.stepNumber)
    );

    activeSteps.forEach((st) => {
      // 1. Check direct assigned user names on the active step
      if (Array.isArray(st.assignedUserNames)) {
        st.assignedUserNames.forEach((name) => {
          if (name && !name.startsWith('usr-') && name !== 'Unassigned') {
            const existing = memberMap.get(name);
            if (existing) {
              if (!existing.stepNumbers.includes(st.stepNumber)) {
                existing.stepNumbers.push(st.stepNumber);
              }
            } else {
              memberMap.set(name, { name, stepNumbers: [st.stepNumber] });
            }
          }
        });
      }

      // 2. Check assignedUserIds mapped against staffUsers
      if (Array.isArray(st.assignedUserIds) && staffUsers.length > 0) {
        st.assignedUserIds.forEach((uid) => {
          const u = staffUsers.find((user) => user.id === uid);
          if (u?.name) {
            const existing = memberMap.get(u.name);
            if (existing) {
              if (!existing.stepNumbers.includes(st.stepNumber)) {
                existing.stepNumbers.push(st.stepNumber);
              }
            } else {
              memberMap.set(u.name, { name: u.name, stepNumbers: [st.stepNumber] });
            }
          }
        });
      }
    });

    return Array.from(memberMap.values()).map((m) => ({
      ...m,
      stepNumbers: m.stepNumbers.sort((a, b) => a - b),
    }));
  }, [matchingWorkflow, activeFlowStepNumbers, staffUsers]);

  // Flowchart initial 2-step active phase check (Rule 1 / N1 Enforced)
  const isRule1InitialPhase = matchingWorkflow
    ? (activeFlowStepNumbers.includes(1) ||
       activeFlowStepNumbers.includes(2) ||
       (matchingWorkflow.notifiedSteps?.includes(1) ?? false))
    : false;

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    playActionClickSound();
    onUpdateStatus(task.id, selectedStatus, updateMessage.trim());
    setUpdateMessage('');
    setJustSaved(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setJustSaved(false);
    }, 1000);
  };

  const handleQuickComplete = () => {
    if (isSubmitting || task.status === 'compleated') return;
    setIsSubmitting(true);
    playActionClickSound();
    onUpdateStatus(
      task.id,
      'compleated',
      updateMessage.trim() || `${currentUser.name} verified and marked project as Compleated`
    );
    setSelectedStatus('compleated');
    setUpdateMessage('');
    setJustSaved(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setJustSaved(false);
    }, 1000);
  };

  const getStatusBadge = (status: CrmTaskStatus) => {
    switch (status) {
      case 'not started':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
      case 'pending':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'on hold':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
      case 'compleated':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'Urgent') {
      return 'bg-rose-600 text-white font-extrabold animate-pulse';
    }
    if (priority === 'High') {
      return 'bg-amber-500 text-slate-950 font-bold';
    }
    return 'bg-slate-200 text-slate-700 font-medium';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            {typeof itemIndex === 'number' && (
              <span
                className="font-mono text-xs font-black text-slate-900 bg-amber-400 border border-amber-500 px-2 py-0.5 rounded shadow-xs"
                title={`Pipeline Order #${itemIndex} (Newest First)`}
              >
                #{itemIndex}
              </span>
            )}
            <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded">
              {task.taskCode}
            </span>
            <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${getPriorityBadge(task.priority)}`}>
              {task.priority} Priority
            </span>
            {task.dealValueRs && (
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-0.5">
                <IndianRupee className="w-3 h-3" />
                <span>{task.dealValueRs.toLocaleString('en-IN')}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {task.dueDate && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${
                  new Date(task.dueDate) < new Date() && task.status !== 'compleated'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              </span>
            )}
            <span className={`text-xs px-2.5 py-0.5 rounded-full border capitalize ${getStatusBadge(task.status)}`}>
              {task.status}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {task.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {onEditTask && (
              <button
                type="button"
                onClick={() => {
                  playActionClickSound();
                  onEditTask(task);
                }}
                className="p-1 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                title="Edit Task Details"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDeleteTask && currentUser.role === 'owner' && (
              <button
                type="button"
                onClick={() => {
                  playActionClickSound();
                  onDeleteTask(task);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Response Lag & Idle Time Alert Banner */}
        <div className={`mt-2.5 p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${responseLag.delayClass}`}>
          <div className="flex items-center gap-1.5">
            {responseLag.isResponded ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
            )}
            <span className="font-semibold">{responseLag.text}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Added: <strong>{formatTimeAgo(task.assignedAt)}</strong> ({new Date(task.assignedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})</span>
          </span>
        </div>
      </div>

      {/* Customer & Technical Details */}
      <div className="p-4 space-y-3 text-xs text-slate-700 flex-1">
        {/* Customer Info */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">{task.customerName}</span>
            <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {task.capacityKw} kW • {task.systemType}
            </span>
          </div>

          <div className="flex items-start gap-1 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{task.customerAddress}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-slate-600">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <strong className="text-slate-800">{task.customerPhone}</strong>
            </span>
            {task.uppclAccountNo && (
              <span className="font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-700 text-[11px]">
                UPPCL: {task.uppclAccountNo}
              </span>
            )}
            {task.monthlyBillRs && (
              <span className="text-slate-600 text-[11px]">
                Bill: ₹{Number(task.monthlyBillRs).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Quick Contact Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <a
              href={`tel:${cleanPhone}`}
              onClick={() => playActionClickSound()}
              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Client</span>
            </a>
            <a
              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                `Hello ${task.customerName}, greeting from Dilip Enterprises regarding your ${task.capacityKw}kW Solar Project (${task.taskCode}).`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playActionClickSound()}
              className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {onOpenWhatsAppModal && (
              <button
                type="button"
                onClick={() => {
                  playActionClickSound();
                  onOpenWhatsAppModal(task);
                }}
                className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                title="Open Official WhatsApp Templates"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Templates</span>
              </button>
            )}

            {onViewTemplate && (
              <button
                type="button"
                onClick={() => {
                  playActionClickSound();
                  onViewTemplate(task.templateId);
                }}
                className="inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-2.5 py-1.5 rounded-lg text-xs ml-auto cursor-pointer"
                title="View SOP Checklist"
              >
                <FileText className="w-3.5 h-3.5 text-blue-800" />
                <span>View Task SOP</span>
              </button>
            )}

            {onViewFlowchart && matchingWorkflow && (
              <button
                type="button"
                onClick={() => {
                  playActionClickSound();
                  onViewFlowchart(matchingWorkflow.id);
                }}
                className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-300 hover:bg-indigo-100 text-indigo-900 font-bold px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                title="Open Live Customer Flowchart & SOP Execution"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Live Flowchart</span>
              </button>
            )}
          </div>
        </div>

        {/* PM Surya Ghar & UPPCL Stage Tracker Banner */}
        <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 border border-amber-200/90 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <Sun className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-amber-900 tracking-wider flex items-center gap-1.5">
                <span>PM Surya Ghar Milestone:</span>
                {task.consumerAppNo && (
                  <span className="font-mono text-[9px] bg-white px-1 rounded text-slate-600 border border-amber-200">
                    {task.consumerAppNo}
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                {getPmSuryaGharStageInfo(task.pmSuryaGharStage).hindiLabel}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            {onOpenPmSuryaGharModal && (
              <button
                type="button"
                onClick={() => {
                  playActionClickSound();
                  onOpenPmSuryaGharModal(task);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-[#1a3882] hover:bg-blue-900 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                title="Track or update PM Surya Ghar stage"
              >
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Update Stage</span>
              </button>
            )}

            {onOpenFeasibilityModal && (
              <button
                type="button"
                onClick={() => {
                  playActionClickSound();
                  onOpenFeasibilityModal(task);
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                title="View/Edit Site Feasibility Audit"
              >
                <Compass className="w-3 h-3 text-blue-600" />
                <span>Feasibility</span>
              </button>
            )}

            {onOpenEquipmentBomModal && (
              <button
                type="button"
                onClick={() => {
                  playActionClickSound();
                  onOpenEquipmentBomModal(task);
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                title="View/Edit Equipment BOM & Serials"
              >
                <Layers className="w-3 h-3 text-purple-600" />
                <span>BOM</span>
              </button>
            )}
          </div>
        </div>

        {/* Assigned Staff Info & Owner Instructions */}
        <div className="text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-200/80">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span className="text-slate-500 font-medium">Primary In-charge:</span>
              <strong className="text-slate-900 font-bold">{task.assignedToUserName || activeNotifiedTeamMembers[0]?.name || 'Unassigned'}</strong>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">By: {task.assignedBy}</span>
          </div>

          {task.ownerInstructions && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 text-slate-800">
              <span className="font-bold text-amber-900 block text-[11px] mb-0.5 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-700" />
                <span>Owner's Instruction / Message:</span>
              </span>
              <p className="italic leading-relaxed">{task.ownerInstructions}</p>
            </div>
          )}
        </div>

        {/* Live Customer Flowchart & Cascade Notification Details */}
        {matchingWorkflow && (
          <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-purple-50/90 border border-indigo-200/90 rounded-xl p-2.5 space-y-2 text-xs shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-indigo-900 tracking-wider flex items-center gap-1.5">
                    <span>Live Customer Flowchart:</span>
                    {isRule1InitialPhase && (
                      <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded text-[9px] uppercase tracking-tight shadow-xs">
                        Rule 1 / N1 Enforced
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-indigo-950 truncate">
                    {matchingWorkflow.templateTitle || 'Sequential SOP Workflow'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="bg-indigo-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                  Step {activeFlowStepNumbers.join(' & ')} Active
                </span>
                {onViewFlowchart && (
                  <button
                    type="button"
                    onClick={() => {
                      playActionClickSound();
                      onViewFlowchart(matchingWorkflow.id);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-300 rounded-lg transition-colors cursor-pointer shadow-xs"
                    title="Open Live Customer Flowchart"
                  >
                    <Zap className="w-3 h-3 text-indigo-600" />
                    <span>Flowchart</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Notified Team Members - Strictly showing only users of active flowchart steps */}
            {activeNotifiedTeamMembers.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-indigo-100 text-[11px]">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-600" />
                  <span>Notified Team:</span>
                </span>
                {activeNotifiedTeamMembers.map((member, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-white/95 text-indigo-900 font-bold px-2 py-0.5 rounded-md border border-indigo-200/90 text-[10.5px] shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{member.name}</span>
                    <span className="text-[9.5px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-1 py-0.2 rounded">
                      Step {member.stepNumbers.join(', ')}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action / Status Form or Owner Override Lock Notice */}
        {task.isOwnerOverride && currentUser.role !== 'owner' ? (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2.5 text-xs font-bold text-amber-900 shadow-xs">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p>Updated by Dilip Enterprises (Owner) - Locked against modification.</p>
                <p className="text-[10px] font-normal text-amber-700 mt-0.5">
                  Current Status: <strong className="capitalize">{task.status}</strong>
                  {task.ownerOverrideAt && ` • ${formatTimeAgo(task.ownerOverrideAt)}`}
                </p>
              </div>
            </div>
            {/* History Toggle */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  playActionClickSound();
                  setShowHistory(!showHistory);
                }}
                className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>History ({task.remarksHistory?.length || 0})</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveUpdate} className="pt-2 border-t border-slate-100 space-y-2">
            {currentUser.role === 'owner' && (
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Owner Supremacy: Master Override Active</span>
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Project Status (Select from 5 options):
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CrmTaskStatus)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 capitalize cursor-pointer"
              >
                <option value="not started">1. not started (Default)</option>
                <option value="in progress">2. in progress</option>
                <option value="pending">3. pending</option>
                <option value="on hold">4. on hold</option>
                <option value="compleated">5. compleated</option>
              </select>
            </div>

            {/* Under status: Message / Remark (Not compulsory) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span>Work Update Message / Remark:</span>
                <span className="text-[10px] text-slate-400 italic font-normal">Optional</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Structure foundation completed / Meter fee paid..."
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  playActionClickSound();
                  setShowHistory(!showHistory);
                }}
                className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>History ({task.remarksHistory?.length || 0})</span>
              </button>

              <div className="flex items-center gap-2">
                {task.status !== 'compleated' && (
                  <button
                    type="button"
                    onClick={handleQuickComplete}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-lg shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    title="Quickly mark project as Compleated"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tick Compleated</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 bg-[#1a3882] hover:bg-blue-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow cursor-pointer transition-all disabled:opacity-75"
                >
                  {justSaved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* History of status changes & remarks */}
        {showHistory && (
          <div className="pt-2 border-t border-slate-100 space-y-1.5 max-h-40 overflow-y-auto bg-slate-50 p-2 rounded-lg text-[11px]">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Task Updates Timeline:
            </h4>
            {task.remarksHistory && task.remarksHistory.length > 0 ? (
              task.remarksHistory.map((rem) => (
                <div key={rem.id} className="border-b border-slate-200/80 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="font-bold text-slate-800">
                      {rem.authorName} ({rem.authorRole})
                    </span>
                    <span>{new Date(rem.timestamp).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {rem.statusChangedTo && (
                    <span className="inline-block bg-blue-100/70 text-blue-900 px-1.5 py-0.2 rounded font-semibold text-[10px] my-0.5">
                      Status: {rem.statusChangedTo}
                    </span>
                  )}
                  {rem.message && <p className="text-slate-700 italic">{rem.message}</p>}
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic">No previous updates recorded yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
