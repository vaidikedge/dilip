import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Users,
  AlertCircle,
  Sparkles,
  Info,
  Trash2,
  Check,
  CheckCircle2,
  FileText,
  Calendar,
  Eye,
  Edit3,
  Search,
  X,
  Clock,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  ListOrdered,
  Flag,
  User,
  CheckSquare,
  Square,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { CrmUser } from '../../data/crmData';
import {
  TaskWorkflowTemplate,
  WorkflowTemplateStep,
  resolveStaffUser,
  normalizeStaffUserIds,
} from '../../data/workflowTemplateData';
import { playSuccessSound, playActionClickSound, playWarningSound } from '../../utils/audioAlert';

interface TaskTemplatesViewProps {
  currentUser: CrmUser;
  staffUsers: CrmUser[];
  templates: TaskWorkflowTemplate[];
  onOpenAddTemplate: () => void;
  onUpdateTemplate?: (updatedTemplate: TaskWorkflowTemplate) => void;
  onDeleteTemplate?: (templateId: string) => void;
  // Optional props retained for backward compatibility
  leadWorkflows?: any[];
  ownerDirectives?: any[];
  userDirectives?: any[];
  onUpdateLeadWorkflow?: (updated: any) => void;
  onDeleteLeadWorkflow?: (workflowId: string) => void;
  onRecordAudit?: (action: string, details: string) => void;
  onSendNotification?: (notif: any) => void;
}

export const TaskTemplatesView: React.FC<TaskTemplatesViewProps> = ({
  currentUser,
  staffUsers,
  templates,
  onOpenAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}) => {
  const isOwner = currentUser.role === 'owner';

  // Search filter for template table
  const [searchTerm, setSearchTerm] = useState('');

  // Full page view state (when user clicks template name or view button)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Modals state
  const [editingTemplate, setEditingTemplate] = useState<TaskWorkflowTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<TaskWorkflowTemplate | null>(null);

  // Edit template form state
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Residential Solar');
  const [editDescription, setEditDescription] = useState('');
  const [editSteps, setEditSteps] = useState<WorkflowTemplateStep[]>([]);
  const [editValidationError, setEditValidationError] = useState<string | null>(null);

  // Dedicated Assign Users Modal state
  const [assignModal, setAssignModal] = useState<{
    template: TaskWorkflowTemplate;
    stepIndex: number | null; // null = all steps, number = specific step
    activeStepIndex: number;
    assignments: Record<number, string[]>;
    staffFilter: string;
  } | null>(null);
  const [quickAssignFeedback, setQuickAssignFeedback] = useState<string | null>(null);

  const eligibleStaff = useMemo(() => {
    return staffUsers.filter((u) => u.status === 'active');
  }, [staffUsers]);

  // Format date helper: DD-MM-YYYY (e.g. 28-05-2026 or 24-09-2026)
  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return '24-09-2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '24-09-2026';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return '24-09-2026';
    }
  };

  // Helper to extract or generate clean display ID matching Screenshot 2 (e.g. 8, 7, 5, 4)
  const getDisplayId = (tmpl: TaskWorkflowTemplate, index: number, total: number): number => {
    const match = tmpl.id.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (!isNaN(num) && num > 0 && num < 100) return num;
    }
    return total - index;
  };

  // Currently viewed template for Full Page View (Screenshot 2)
  const activeTemplate = useMemo(() => {
    if (!selectedTemplateId) return null;
    return templates.find((t) => t.id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  // Filtered templates based on search query
  const filteredTemplates = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((t) => {
      const titleMatch = t.title.toLowerCase().includes(q);
      const catMatch = (t.category || '').toLowerCase().includes(q);
      const descMatch = (t.description || '').toLowerCase().includes(q);
      const stepsMatch = t.steps.some(
        (st) =>
          st.title.toLowerCase().includes(q) ||
          (st.description || '').toLowerCase().includes(q) ||
          (st.assignedUserNames || []).some((name) => (name || '').toLowerCase().includes(q))
      );
      return titleMatch || catMatch || descMatch || stepsMatch;
    });
  }, [templates, searchTerm]);

  // Open Edit Modal for a template
  const handleOpenEditModal = (tmpl: TaskWorkflowTemplate) => {
    playActionClickSound();
    setEditingTemplate(tmpl);
    setEditTitle(tmpl.title);
    setEditCategory(tmpl.category || 'Residential Solar');
    setEditDescription(tmpl.description || '');
    setEditSteps(
      tmpl.steps.map((st) => ({
        ...st,
        assignedUserIds: normalizeStaffUserIds(st.assignedUserIds, staffUsers),
      }))
    );
    setEditValidationError(null);
  };

  // Add a new step in Edit Modal (supports Task 4, 5, 6, 7... 25+)
  const handleAddEditStep = () => {
    playActionClickSound();
    const nextStepNum = editSteps.length + 1;
    const newStep: WorkflowTemplateStep = {
      id: `step-edit-${Date.now()}-${nextStepNum}`,
      stepNumber: nextStepNum,
      title: `Task #${nextStepNum}`,
      description: 'Define specific SOP actions required for this stage.',
      assignedUserIds: [],
      estimatedDays: 2,
    };
    setEditSteps([...editSteps, newStep]);
  };

  // Remove a step in Edit Modal
  const handleRemoveEditStep = (indexToRemove: number) => {
    if (editSteps.length <= 1) {
      setEditValidationError('A workflow template must have at least 1 task step.');
      return;
    }
    playActionClickSound();
    const filtered = editSteps
      .filter((_, idx) => idx !== indexToRemove)
      .map((st, idx) => ({
        ...st,
        stepNumber: idx + 1,
      }));
    setEditSteps(filtered);
    setEditValidationError(null);
  };

  // Step field updates in Edit Modal
  const handleEditStepTitleChange = (index: number, newTitle: string) => {
    const updated = [...editSteps];
    updated[index].title = newTitle;
    setEditSteps(updated);
  };

  const handleEditStepDescChange = (index: number, newDesc: string) => {
    const updated = [...editSteps];
    updated[index].description = newDesc;
    setEditSteps(updated);
  };

  const handleEditStepDaysChange = (index: number, days: number) => {
    const updated = [...editSteps];
    updated[index].estimatedDays = Math.max(1, days);
    setEditSteps(updated);
  };

  const handleToggleUserInEditStep = (stepIndex: number, userId: string) => {
    const updated = [...editSteps];
    const currentList = updated[stepIndex].assignedUserIds || [];
    if (currentList.includes(userId)) {
      updated[stepIndex].assignedUserIds = currentList.filter((id) => id !== userId);
    } else {
      updated[stepIndex].assignedUserIds = [...currentList, userId];
    }
    setEditSteps(updated);
  };

  const handleClearAllUsersInEditStep = (stepIndex: number) => {
    const updated = [...editSteps];
    updated[stepIndex].assignedUserIds = [];
    setEditSteps(updated);
  };

  const handleAssignAllUsersInEditStep = (stepIndex: number) => {
    const updated = [...editSteps];
    updated[stepIndex].assignedUserIds = eligibleStaff.map((u) => u.id);
    setEditSteps(updated);
  };

  // Save edited template
  const handleSaveEditedTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    if (!editTitle.trim()) {
      setEditValidationError('Please enter a valid template name.');
      return;
    }

    if (editSteps.length === 0) {
      setEditValidationError('Template must contain at least 1 task step.');
      return;
    }

    const hasEmptyTitle = editSteps.some((s) => !s.title.trim());
    if (hasEmptyTitle) {
      setEditValidationError('All task steps must have a task title.');
      return;
    }

    const updatedSteps = editSteps.map((st, idx) => {
      const normalizedIds = normalizeStaffUserIds(st.assignedUserIds, staffUsers);
      const names = normalizedIds.map((uid) => resolveStaffUser(uid, staffUsers)?.name || uid);
      return {
        ...st,
        stepNumber: idx + 1,
        assignedUserIds: normalizedIds,
        assignedUserNames: names,
      };
    });

    const updatedTmpl: TaskWorkflowTemplate = {
      ...editingTemplate,
      title: editTitle.trim(),
      category: editCategory.trim(),
      description: editDescription.trim(),
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    if (onUpdateTemplate) {
      onUpdateTemplate(updatedTmpl);
    }

    playSuccessSound();
    setEditingTemplate(null);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!deletingTemplate || !onDeleteTemplate) return;
    playWarningSound();
    onDeleteTemplate(deletingTemplate.id);
    if (selectedTemplateId === deletingTemplate.id) {
      setSelectedTemplateId(null);
    }
    setDeletingTemplate(null);
  };

  // ==============================================================
  // DEDICATED USER ASSIGNMENT HANDLERS (Full Page & Modal Support)
  // ==============================================================
  const handleOpenAssignModalForStep = (template: TaskWorkflowTemplate, stepIdx: number) => {
    playActionClickSound();
    const assignments: Record<number, string[]> = {};
    template.steps.forEach((st, idx) => {
      assignments[idx] = normalizeStaffUserIds(st.assignedUserIds, staffUsers);
    });
    setAssignModal({
      template,
      stepIndex: stepIdx,
      activeStepIndex: stepIdx,
      assignments,
      staffFilter: '',
    });
  };

  const handleOpenManageAllAssignments = (template: TaskWorkflowTemplate) => {
    playActionClickSound();
    const assignments: Record<number, string[]> = {};
    template.steps.forEach((st, idx) => {
      assignments[idx] = normalizeStaffUserIds(st.assignedUserIds, staffUsers);
    });
    setAssignModal({
      template,
      stepIndex: null,
      activeStepIndex: 0,
      assignments,
      staffFilter: '',
    });
  };

  const handleToggleUserInAssignModal = (stepIdx: number, userId: string) => {
    if (!assignModal) return;
    const current = assignModal.assignments[stepIdx] || [];
    const next = current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId];
    setAssignModal({
      ...assignModal,
      assignments: {
        ...assignModal.assignments,
        [stepIdx]: next,
      },
    });
  };

  const handleSelectAllInAssignModal = (stepIdx: number) => {
    if (!assignModal) return;
    setAssignModal({
      ...assignModal,
      assignments: {
        ...assignModal.assignments,
        [stepIdx]: eligibleStaff.map((u) => u.id),
      },
    });
  };

  const handleClearAllInAssignModal = (stepIdx: number) => {
    if (!assignModal) return;
    setAssignModal({
      ...assignModal,
      assignments: {
        ...assignModal.assignments,
        [stepIdx]: [],
      },
    });
  };

  const handleApplyToAllStepsInAssignModal = (sourceStepIdx: number) => {
    if (!assignModal) return;
    const sourceUsers = assignModal.assignments[sourceStepIdx] || [];
    const newAssignments: Record<number, string[]> = {};
    assignModal.template.steps.forEach((_, idx) => {
      newAssignments[idx] = [...sourceUsers];
    });
    setAssignModal({
      ...assignModal,
      assignments: newAssignments,
    });
    playSuccessSound();
  };

  const handleSaveAssignments = () => {
    if (!assignModal || !onUpdateTemplate) return;
    const updatedSteps = assignModal.template.steps.map((st, idx) => {
      const userIds = normalizeStaffUserIds(assignModal.assignments[idx] || [], staffUsers);
      const userNames = userIds.map((uid) => resolveStaffUser(uid, staffUsers)?.name || uid);
      return {
        ...st,
        assignedUserIds: userIds,
        assignedUserNames: userNames,
      };
    });

    const updatedTemplate: TaskWorkflowTemplate = {
      ...assignModal.template,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    onUpdateTemplate(updatedTemplate);
    playSuccessSound();
    setAssignModal(null);
    setQuickAssignFeedback('Staff assignments updated and saved successfully!');
    setTimeout(() => setQuickAssignFeedback(null), 3500);
  };

  // Quick 1-click add/remove from full page task cards
  const handleQuickAddUserToStep = (template: TaskWorkflowTemplate, stepIdx: number, userId: string) => {
    if (!onUpdateTemplate) return;
    const targetStep = template.steps[stepIdx];
    if (!targetStep) return;
    const current = targetStep.assignedUserIds || [];
    if (current.includes(userId)) return;
    const nextIds = [...current, userId];
    const normalized = normalizeStaffUserIds(nextIds, staffUsers);
    const names = normalized.map((uid) => resolveStaffUser(uid, staffUsers)?.name || uid);

    const updatedSteps = template.steps.map((s, idx) =>
      idx === stepIdx
        ? {
            ...s,
            assignedUserIds: normalized,
            assignedUserNames: names,
          }
        : s
    );

    const updatedTemplate: TaskWorkflowTemplate = {
      ...template,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    onUpdateTemplate(updatedTemplate);
    playSuccessSound();
    const addedUser = resolveStaffUser(userId, staffUsers);
    setQuickAssignFeedback(`Added ${addedUser?.name || 'staff'} to Task #${stepIdx + 1}`);
    setTimeout(() => setQuickAssignFeedback(null), 3000);
  };

  const handleQuickRemoveUserFromStep = (template: TaskWorkflowTemplate, stepIdx: number, userId: string) => {
    if (!onUpdateTemplate) return;
    const targetStep = template.steps[stepIdx];
    if (!targetStep) return;
    const current = targetStep.assignedUserIds || [];
    const nextIds = current.filter((id) => id !== userId);
    const normalized = normalizeStaffUserIds(nextIds, staffUsers);
    const names = normalized.map((uid) => resolveStaffUser(uid, staffUsers)?.name || uid);

    const updatedSteps = template.steps.map((s, idx) =>
      idx === stepIdx
        ? {
            ...s,
            assignedUserIds: normalized,
            assignedUserNames: names,
          }
        : s
    );

    const updatedTemplate: TaskWorkflowTemplate = {
      ...template,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    onUpdateTemplate(updatedTemplate);
    playActionClickSound();
    const removedUser = resolveStaffUser(userId, staffUsers);
    setQuickAssignFeedback(`Removed ${removedUser?.name || 'staff'} from Task #${stepIdx + 1}`);
    setTimeout(() => setQuickAssignFeedback(null), 3000);
  };

  const handleQuickClearUsersFromStep = (template: TaskWorkflowTemplate, stepIdx: number) => {
    if (!onUpdateTemplate) return;
    const updatedSteps = template.steps.map((s, idx) =>
      idx === stepIdx
        ? {
            ...s,
            assignedUserIds: [],
            assignedUserNames: [],
          }
        : s
    );

    const updatedTemplate: TaskWorkflowTemplate = {
      ...template,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    onUpdateTemplate(updatedTemplate);
    playActionClickSound();
    setQuickAssignFeedback(`Cleared all staff from Task #${stepIdx + 1}`);
    setTimeout(() => setQuickAssignFeedback(null), 3000);
  };

  // Priority badge styling matching Screenshot 2 (e.g. 🚩 1 Highest)
  const getPriorityBadge = (stepNumber: number) => {
    if (stepNumber === 1) {
      return { label: '1 Highest', bg: 'bg-[#ea5455] text-white' };
    }
    if (stepNumber === 2) {
      return { label: '2 High', bg: 'bg-[#ff9f43] text-white' };
    }
    if (stepNumber === 3) {
      return { label: '3 Medium', bg: 'bg-[#7367f0] text-white' };
    }
    return { label: 'Normal', bg: 'bg-slate-600 text-white' };
  };

  // ==============================================================
  // RENDER 1: FULL PAGE TEMPLATE DETAILS VIEW (EXACT SCREENSHOT 2)
  // ==============================================================
  if (activeTemplate) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        {/* TOP BAR: Task Template Details with Back & Edit buttons */}
        <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Task Template Details
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                playActionClickSound();
                setSelectedTemplateId(null);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenManageAllAssignments(activeTemplate)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5a489b] hover:bg-[#4a3983] text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
                  title="Assign staff users to all tasks in this template"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Assign Staff Users</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(activeTemplate)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#ff9f43] hover:bg-[#e68e3b] text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Assign Success Feedback Toast */}
        {quickAssignFeedback && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{quickAssignFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setQuickAssignFeedback(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* METADATA CARD: Template Name & Created Date */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Template Name
              </div>
              <div className="text-base font-black text-[#5a489b] dark:text-indigo-400 mt-0.5">
                {activeTemplate.title}
              </div>
              {activeTemplate.description && (
                <p className="text-xs text-slate-500 mt-1">
                  {activeTemplate.description}
                </p>
              )}
            </div>

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Created Date
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono">{formatDisplayDate(activeTemplate.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TASKS LIST SECTION HEADER WITH BADGE */}
        <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tasks List
            </h3>
            <span className="px-2 py-0.5 rounded border border-[#5a489b] text-[#5a489b] dark:border-indigo-400 dark:text-indigo-300 text-xs font-bold font-mono">
              {activeTemplate.steps.length}
            </span>
          </div>

          <div className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium">
            💡 Click <strong>"+ Assign / Change Users"</strong> on any task to appoint team members
          </div>
        </div>

        {/* SEQUENTIAL TASK CARDS (EXACT SCREENSHOT 2 DESIGN) */}
        <div className="space-y-3">
          {activeTemplate.steps.map((st, idx) => {
            const assignedUsers = st.assignedUserIds
              .map((uid) => resolveStaffUser(uid, staffUsers))
              .filter(Boolean) as CrmUser[];

            const badge = getPriorityBadge(st.stepNumber);

            return (
              <div
                key={st.id || idx}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 border-l-4 border-l-[#5a489b] p-4 shadow-2xs space-y-3 transition-all"
              >
                {/* Line 1: #ID ○ Task Name ... Priority Badge */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#5a489b] dark:text-indigo-400">
                      #{idx + 1}
                    </span>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 dark:border-slate-500 shrink-0" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {st.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs ${badge.bg}`}
                    >
                      <Flag className="w-3 h-3 fill-current" />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                </div>

                {st.description && (
                  <p className="text-xs text-slate-500 pl-6 -mt-1">
                    {st.description}
                  </p>
                )}

                {/* Line 2: Assigned Users with dark pills + count on right + Quick Add / Remove + Open Modal */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                        <Users className="w-3.5 h-3.5 text-[#5a489b] dark:text-indigo-400" />
                        <span>Assigned Users:</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {st.assignedUserIds.length === 0 ? (
                          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 italic">
                            No users assigned yet
                          </span>
                        ) : (
                          assignedUsers.map((u, uIdx) => (
                            <span
                              key={uIdx}
                              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-[11.5px] font-semibold bg-[#4b3f88] hover:bg-[#3c3270] text-white shadow-2xs group transition-all"
                            >
                              <User className="w-3 h-3 text-white/90" />
                              <span>{u?.name || st.assignedUserNames?.[uIdx] || 'Staff'}</span>
                              {isOwner && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickRemoveUserFromStep(activeTemplate, idx, u?.id || st.assignedUserIds[uIdx]);
                                  }}
                                  className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-0.5 cursor-pointer ml-0.5 transition-colors"
                                  title={`Remove ${u?.name || 'user'}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {st.assignedUserIds.length > 0 && (
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          {st.assignedUserIds.length} user(s)
                        </span>
                      )}

                      {/* Direct "+ Assign Users" button right here on the card */}
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModalForStep(activeTemplate, idx)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#5a489b] hover:bg-[#4a3983] text-white text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                          title="Assign or change staff for this task"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Assign / Change Users</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Quick Assign Dropdown for effortless instant assignment */}
                  {isOwner && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] flex-wrap bg-slate-50/80 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Quick Add Staff:</span>
                      </span>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleQuickAddUserToStep(activeTemplate, idx, e.target.value);
                          }
                        }}
                        className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer hover:border-indigo-500"
                      >
                        <option value="">+ Select staff member to add to this task...</option>
                        {eligibleStaff
                          .filter((stf) => !st.assignedUserIds.includes(stf.id))
                          .map((stf) => (
                            <option key={stf.id} value={stf.id}>
                              + {stf.name} ({stf.role === 'owner' ? 'Owner' : 'Staff'})
                            </option>
                          ))}
                      </select>

                      <span className="text-[10.5px] text-slate-400 italic hidden sm:inline">
                        (Select any user to instantly assign them to Task #{idx + 1})
                      </span>

                      {st.assignedUserIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleQuickClearUsersFromStep(activeTemplate, idx)}
                          className="text-rose-600 dark:text-rose-400 hover:underline text-[11px] font-semibold cursor-pointer ml-auto"
                        >
                          Clear all users
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM BACK BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              playActionClickSound();
              setSelectedTemplateId(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to All Templates</span>
          </button>
        </div>

        {/* EDIT MODAL RENDERED IN FULL PAGE CONTEXT TOO */}
        {renderEditModal()}

        {/* DEDICATED ASSIGN STAFF USERS MODAL */}
        {renderAssignStaffModal()}
      </div>
    );
  }

  // Helper to render Edit Modal
  function renderEditModal() {
    if (!editingTemplate) return null;
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#ff9f43] text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <Edit3 className="w-5 h-5" />
              <div>
                <h3 className="text-base font-bold">
                  Edit Task Template: {editingTemplate.title}
                </h3>
                <p className="text-xs text-white/90">
                  Update template name, add/delete tasks, and reassign appointed staff.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditingTemplate(null)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Form */}
          <form onSubmit={handleSaveEditedTemplate} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {editValidationError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editValidationError}</span>
              </div>
            )}

            {/* Template Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. varanasi, Manda, Prayagraj"
                  className="w-full text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#ff9f43]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-900 focus:outline-none"
                >
                  <option value="Residential Solar">Residential Solar</option>
                  <option value="Commercial Solar">Commercial Solar</option>
                  <option value="Industrial EPC">Industrial EPC</option>
                  <option value="Solar Water Pump">Solar Water Pump</option>
                  <option value="General EPC">General EPC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Description / SOP Objective
              </label>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Standard operating procedure summary for this workflow..."
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-900 focus:outline-none"
              />
            </div>

            {/* Sequential Steps List */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Sequential Tasks ({editSteps.length} Steps):</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Tasks will trigger sequentially
                </span>
              </div>

              <div className="space-y-3">
                {editSteps.map((st, idx) => (
                  <div
                    key={st.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 space-y-3 shadow-2xs"
                  >
                    {/* Step Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          Task #{idx + 1}
                        </span>
                        {idx < 2 && (
                          <span className="text-[9.5px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                            Auto Alert on Lead Add
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Days:</span>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={st.estimatedDays || 2}
                            onChange={(e) => handleEditStepDaysChange(idx, parseInt(e.target.value) || 1)}
                            className="w-12 text-center text-xs font-bold border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 bg-white dark:bg-slate-900"
                          />
                        </div>

                        {editSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEditStep(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer transition-colors"
                            title="Delete task step"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Task Name & SOP Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Task Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={st.title}
                          onChange={(e) => handleEditStepTitleChange(idx, e.target.value)}
                          placeholder="e.g. Site Survey, Roof Grouting, Inverter Commissioning"
                          className="w-full text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          SOP Instructions / Note
                        </label>
                        <input
                          type="text"
                          value={st.description || ''}
                          onChange={(e) => handleEditStepDescChange(idx, e.target.value)}
                          placeholder="Specific checklist notes for this milestone..."
                          className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Appointed Staff Members */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          <span>Assign Staff Users (Click staff button or choose from dropdown):</span>
                          {st.assignedUserIds.length === 0 ? (
                            <span className="text-[9.5px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-extrabold border border-amber-300">
                              Unassigned (0 Users)
                            </span>
                          ) : (
                            <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">
                              ✓ {st.assignedUserIds.length} Selected
                            </span>
                          )}
                        </label>

                        <div className="flex items-center gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleClearAllUsersInEditStep(idx)}
                            className="text-rose-600 hover:underline font-bold cursor-pointer"
                          >
                            Clear All (0 Users)
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleAssignAllUsersInEditStep(idx)}
                            className="text-blue-600 hover:underline font-bold cursor-pointer"
                          >
                            Assign All Staff
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Quick Select */}
                      <div className="flex items-center gap-2">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleToggleUserInEditStep(idx, e.target.value);
                            }
                          }}
                          className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="">+ Choose staff member to assign / unassign...</option>
                          {eligibleStaff.map((staff) => {
                            const isAssigned = (st.assignedUserIds || []).includes(staff.id);
                            return (
                              <option key={staff.id} value={staff.id}>
                                {isAssigned ? '✓ (Assigned) ' : '+ (Add) '} {staff.name} ({staff.role === 'owner' ? 'Owner' : 'Staff'})
                              </option>
                            );
                          })}
                        </select>
                        <span className="text-[10px] text-slate-400">
                          (Click any staff button below to toggle)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {eligibleStaff.map((staff) => {
                          const isAssigned = (st.assignedUserIds || []).includes(staff.id);
                          return (
                            <button
                              key={staff.id}
                              type="button"
                              onClick={() => handleToggleUserInEditStep(idx, staff.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                isAssigned
                                  ? 'bg-blue-600 border-blue-500 text-white shadow-xs font-bold ring-1 ring-blue-400'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                              }`}
                            >
                              {isAssigned ? (
                                <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                              ) : (
                                <Plus className="w-3 h-3 text-slate-400" />
                              )}
                              <span>{staff.name}</span>
                              <span className="text-[9.5px] opacity-75">
                                ({staff.role === 'owner' ? 'Owner' : 'Staff'})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Task Button (Task 4, 5, 6...) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAddEditStep}
                    className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-amber-400 hover:border-amber-500 bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Add Task #{editSteps.length + 1} (Click to add more sequential tasks)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer inside form */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500">
                Total Steps: <strong>{editSteps.length}</strong> | Ready for Standard SOP Automation
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#ff9f43] hover:bg-[#e68e3b] rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==============================================================
  // HELPER TO RENDER DEDICATED ASSIGN STAFF USERS MODAL
  // ==============================================================
  function renderAssignStaffModal() {
    if (!assignModal) return null;
    const { template, stepIndex, activeStepIndex, assignments, staffFilter } = assignModal;
    const isSingleStep = stepIndex !== null && stepIndex !== undefined;
    const currentStepIdx = isSingleStep ? stepIndex : activeStepIndex;
    const currentStep = template.steps[currentStepIdx];
    const currentAssignedIds = assignments[currentStepIdx] || [];

    const filteredStaff = eligibleStaff.filter((stf) => {
      const q = (staffFilter || '').toLowerCase().trim();
      if (!q) return true;
      return (
        stf.name.toLowerCase().includes(q) ||
        (stf.role || '').toLowerCase().includes(q) ||
        (stf.email || '').toLowerCase().includes(q)
      );
    });

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#5a489b] text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {isSingleStep
                    ? `Assign Users: Task #${currentStepIdx + 1} - ${currentStep?.title || 'Milestone'}`
                    : `Manage Staff Assignments: ${template.title}`}
                </h3>
                <p className="text-xs text-white/90">
                  Select team members to execute this task SOP milestone.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAssignModal(null)}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            {/* If managing all steps: Tab switcher */}
            {!isSingleStep && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  Select Task Milestone to Configure Staff:
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {template.steps.map((st, sIdx) => {
                    const count = (assignments[sIdx] || []).length;
                    const isActive = sIdx === activeStepIndex;
                    return (
                      <button
                        key={st.id || sIdx}
                        type="button"
                        onClick={() => {
                          playActionClickSound();
                          setAssignModal({ ...assignModal, activeStepIndex: sIdx });
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#5a489b] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <span className="font-mono">#{sIdx + 1}</span>
                        <span className="truncate max-w-[140px]">{st.title}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Step Banner & SOP notes */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#5a489b] text-white font-mono font-black text-xs">
                    Task #{currentStepIdx + 1}
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {currentStep?.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Est: {currentStep?.estimatedDays || 2} days</span>
                </div>
              </div>
              {currentStep?.description && (
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                  {currentStep.description}
                </p>
              )}
            </div>

            {/* Informational Hint: User Assign Karne Ka Tarika */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11.5px]">
                <p className="font-bold">
                  User Assign Karne Ka Tarika / How to Assign Users:
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Niche diye gaye staff cards par click karein. Jiske aage <strong>✓ Checkmark</strong> hoga, wo is task ke liye appointed rahega. Nayi lead create hone par ye users auto-assign honge.
                </p>
              </div>
            </div>

            {/* Quick Actions & Search Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search staff by name or role..."
                  value={staffFilter}
                  onChange={(e) => setAssignModal({ ...assignModal, staffFilter: e.target.value })}
                  className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {staffFilter && (
                  <button
                    type="button"
                    onClick={() => setAssignModal({ ...assignModal, staffFilter: '' })}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAllInAssignModal(currentStepIdx)}
                  className="px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-[11px] cursor-pointer transition-colors"
                >
                  ✓ Select All Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleClearAllInAssignModal(currentStepIdx)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 font-bold text-[11px] cursor-pointer transition-colors"
                >
                  Clear (0 Users)
                </button>
                {!isSingleStep && template.steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleApplyToAllStepsInAssignModal(currentStepIdx)}
                    className="px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-bold text-[11px] cursor-pointer transition-colors"
                    title="Copy selected users to all other tasks in this template"
                  >
                    📋 Apply to All Tasks
                  </button>
                )}
              </div>
            </div>

            {/* Staff Members Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {filteredStaff.map((staff) => {
                const isAssigned = currentAssignedIds.includes(staff.id);
                return (
                  <div
                    key={staff.id}
                    onClick={() => handleToggleUserInAssignModal(currentStepIdx, staff.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isAssigned
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isAssigned
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {staff.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {staff.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize truncate">
                          {staff.role === 'owner' ? 'Owner / Director' : staff.role || 'Staff Specialist'}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isAssigned ? (
                        <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center" />
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredStaff.length === 0 && (
                <div className="col-span-2 py-6 text-center text-slate-400 text-xs">
                  No staff member found matching "{staffFilter}".
                </div>
              )}
            </div>

            {/* Selected Users Summary Pill Box */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold">Assigned to Task #{currentStepIdx + 1}:</span>
                {currentAssignedIds.length === 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 italic">
                    None (Unassigned)
                  </span>
                ) : (
                  currentAssignedIds.map((uid) => {
                    const userObj = resolveStaffUser(uid, staffUsers);
                    return (
                      <span
                        key={uid}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200"
                      >
                        <span>{userObj?.name || uid}</span>
                      </span>
                    );
                  })
                )}
              </div>
              <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                {currentAssignedIds.length} user(s) selected
              </span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 shrink-0">
            <button
              type="button"
              onClick={() => setAssignModal(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAssignments}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save & Apply Assignments</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // RENDER 2: MASTER TASK TEMPLATES TABLE (MATCHING SCREENSHOT 2)
  // ==============================================================
  return (
    <div className="space-y-6">
      {/* TOP HEADER SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5a489b] to-[#6d55ae] text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  View Task Templates
                </h1>
                <span className="text-xs font-mono font-bold bg-[#17a2b8]/15 text-[#117a8b] dark:text-[#22b8cf] px-2.5 py-0.5 rounded-full border border-[#17a2b8]/30">
                  {templates.length} Templates Defined
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Standardized Sequential Task SOP Templates. Appointed task users will automatically inherit into every new lead and project.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search template name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Add Task Template Button (Owner Only) */}
            {isOwner && (
              <button
                type="button"
                onClick={onOpenAddTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer transform active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add Task Template</span>
              </button>
            )}
          </div>
        </div>

        {/* Informative Rule Strip */}
        <div className="mt-4 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 flex items-start gap-2.5 text-xs text-blue-950 dark:text-blue-200">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11.5px]">
            <strong>Standardized Task Staff Architecture:</strong>
            <span className="ml-1 text-slate-700 dark:text-slate-300">
              Her project ke liye same task users use honge — alag alag nahi. Template me appointed staff har nayi lead me auto-inherit honge. Lead create karte samay Task Template ka name select karna compulsory hai. Click on any template name or the "View" button to open its full details page.
            </span>
          </div>
        </div>
      </div>

      {/* MASTER TASK TEMPLATES TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* PURPLE THEMED HEADER (MATCHING SCREENSHOT 2) */}
            <thead className="bg-[#6351a2] text-white text-xs font-bold uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3.5 px-4 text-center w-16">
                  #ID
                </th>
                <th scope="col" className="py-3.5 px-6 text-left">
                  Template Name
                </th>
                <th scope="col" className="py-3.5 px-6 text-center">
                  Total Tasks
                </th>
                <th scope="col" className="py-3.5 px-6 text-center">
                  Created Date
                </th>
                <th scope="col" className="py-3.5 px-6 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredTemplates.map((tmpl, index) => {
                const displayId = getDisplayId(tmpl, index, templates.length);
                const displayDate = formatDisplayDate(tmpl.createdAt);

                return (
                  <tr
                    key={tmpl.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Column 1: #ID */}
                    <td className="py-4 px-4 text-center font-black text-slate-900 dark:text-white text-sm">
                      {displayId}
                    </td>

                    {/* Column 2: Template Name with Document Icon - CLICKABLE TO OPEN FULL DETAILS PAGE */}
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => {
                          playActionClickSound();
                          setSelectedTemplateId(tmpl.id);
                        }}
                        className="flex items-center gap-2.5 font-bold text-slate-900 hover:text-[#5a489b] dark:text-white dark:hover:text-indigo-400 text-sm cursor-pointer transition-colors text-left group"
                        title="Click to view full template details page"
                      >
                        <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-[#5a489b] shrink-0" />
                        <span className="truncate group-hover:underline underline-offset-2">
                          {tmpl.title}
                        </span>
                      </button>
                      {tmpl.category && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block ml-6">
                          {tmpl.category}
                        </span>
                      )}
                      {/* Appointed staff preview */}
                      <div className="flex items-center gap-1.5 mt-1 ml-6 flex-wrap">
                        {(() => {
                          const allStaffIds = Array.from(new Set(tmpl.steps.flatMap((s) => s.assignedUserIds || [])));
                          const count = allStaffIds.length;
                          return (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                              count === 0
                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            }`}>
                              <Users className="w-2.5 h-2.5" />
                              <span>{count === 0 ? 'No staff appointed' : `${count} staff appointed`}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </td>

                    {/* Column 3: Total Tasks Cyan Pill */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#17a2b8] text-white shadow-2xs">
                        <span className="font-mono text-sm leading-none font-black">≈</span>
                        <span>{tmpl.steps.length} Tasks</span>
                      </span>
                    </td>

                    {/* Column 4: Created Date with Calendar Icon */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-mono font-medium">{displayDate}</span>
                      </span>
                    </td>

                    {/* Column 5: Action Buttons (View, Assign Users, Edit, Delete) */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {/* 1. View Button (Cyan / Teal Pill) -> Opens Full Page Details (Screenshot 2) */}
                        <button
                          type="button"
                          onClick={() => {
                            playActionClickSound();
                            setSelectedTemplateId(tmpl.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#17a2b8] hover:bg-[#138496] text-white text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                          title="View template details and steps"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {/* 2. Assign Users Button (Purple Pill) */}
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => {
                              playActionClickSound();
                              handleOpenManageAllAssignments(tmpl);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5a489b] hover:bg-[#4a3983] text-white text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                            title="Assign staff users to tasks in this template"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Assign Users</span>
                          </button>
                        )}

                        {/* 3. Edit Button (Orange / Amber Pill) */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(tmpl)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff9f43] hover:bg-[#e68e3b] text-white text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                          title="Edit template name, add/remove tasks & reassign staff"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* 4. Delete Button (Red / Rose Pill) */}
                        {isOwner && onDeleteTemplate && (
                          <button
                            type="button"
                            onClick={() => {
                              playWarningSound();
                              setDeletingTemplate(tmpl);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ea5455] hover:bg-rose-700 text-white text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                            title="Delete template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTemplates.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="space-y-2">
                      <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                        No Task Templates Found
                      </p>
                      <p className="text-xs">
                        {searchTerm
                          ? `No template matching "${searchTerm}". Try resetting search.`
                          : 'No workflow templates defined yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-3.5 bg-slate-50/70 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong>{filteredTemplates.length}</strong> of <strong>{templates.length}</strong> templates
          </span>
          <span className="font-mono text-[11px]">
            Master SOP Standard v2.0
          </span>
        </div>
      </div>

      {/* EDIT MODAL */}
      {renderEditModal()}

      {/* DEDICATED ASSIGN STAFF USERS MODAL */}
      {renderAssignStaffModal()}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-rose-200 dark:border-rose-900 p-6 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold">Delete Task Template</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete template{' '}
              <strong className="text-rose-600 underline">"{deletingTemplate.title}"</strong>{' '}
              with {deletingTemplate.steps.length} sequential task steps?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingTemplate(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-[#ea5455] hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Yes, Delete Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
