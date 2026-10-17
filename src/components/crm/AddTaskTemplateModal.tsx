import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Users,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
  UserCheck,
  Info,
  Zap,
} from 'lucide-react';
import { CrmUser } from '../../data/crmData';
import {
  TaskWorkflowTemplate,
  WorkflowTemplateStep,
} from '../../data/workflowTemplateData';

interface AddTaskTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffUsers: CrmUser[];
  onSaveTemplate: (template: TaskWorkflowTemplate) => void;
}

export const AddTaskTemplateModal: React.FC<AddTaskTemplateModalProps> = ({
  isOpen,
  onClose,
  staffUsers,
  onSaveTemplate,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Residential Solar');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowTemplateStep[]>([
    {
      id: 'step-new-1',
      stepNumber: 1,
      title: 'Lead Verification & Customer Contact',
      description: 'Call customer, verify site address, check monthly electricity consumption and bill.',
      assignedUserIds: [],
      estimatedDays: 1,
    },
    {
      id: 'step-new-2',
      stepNumber: 2,
      title: 'Site Survey, Shadow Analysis & Roof Measurements',
      description: 'Physical roof audit, shadow analysis, azimuth direction, electrical panel inspection.',
      assignedUserIds: [],
      estimatedDays: 2,
    },
    {
      id: 'step-new-3',
      stepNumber: 3,
      title: 'Quotation, BOM & PM Surya Ghar Portal Filing',
      description: 'Submit formal solar quotation, collect advance token, upload application on portal.',
      assignedUserIds: [],
      estimatedDays: 2,
    },
  ]);

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const eligibleStaff = staffUsers.filter((u) => u.status === 'active');

  const handleAddStep = () => {
    const nextStepNum = steps.length + 1;
    const newStep: WorkflowTemplateStep = {
      id: `step-new-${Date.now()}-${nextStepNum}`,
      stepNumber: nextStepNum,
      title: `Step ${nextStepNum}: Work Milestone`,
      description: 'Define specific SOP actions required for this stage.',
      assignedUserIds: [],
      estimatedDays: 2,
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (indexToRemove: number) => {
    if (steps.length <= 1) {
      setValidationError('A workflow template must have at least 1 task step.');
      return;
    }
    const filtered = steps
      .filter((_, idx) => idx !== indexToRemove)
      .map((st, idx) => ({
        ...st,
        stepNumber: idx + 1,
      }));
    setSteps(filtered);
    setValidationError(null);
  };

  const handleStepTitleChange = (index: number, newTitle: string) => {
    const updated = [...steps];
    updated[index].title = newTitle;
    setSteps(updated);
  };

  const handleStepDescChange = (index: number, newDesc: string) => {
    const updated = [...steps];
    updated[index].description = newDesc;
    setSteps(updated);
  };

  const handleStepDaysChange = (index: number, days: number) => {
    const updated = [...steps];
    updated[index].estimatedDays = Math.max(1, days);
    setSteps(updated);
  };

  const handleToggleUserInStep = (stepIndex: number, userId: string) => {
    const updated = [...steps];
    const currentList = updated[stepIndex].assignedUserIds || [];
    if (currentList.includes(userId)) {
      updated[stepIndex].assignedUserIds = currentList.filter((id) => id !== userId);
    } else {
      updated[stepIndex].assignedUserIds = [...currentList, userId];
    }
    setValidationError(null);
    setSteps(updated);
  };

  const handleClearAllUsersInStep = (stepIndex: number) => {
    const updated = [...steps];
    updated[stepIndex].assignedUserIds = [];
    setSteps(updated);
    setValidationError(null);
  };

  const handleAssignAllUsersInStep = (stepIndex: number) => {
    const updated = [...steps];
    updated[stepIndex].assignedUserIds = eligibleStaff.map((u) => u.id);
    setSteps(updated);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Template title is required.');
      return;
    }
    if (steps.length < 2) {
      setValidationError('Please configure at least 2 steps.');
      return;
    }
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i].title.trim()) {
        setValidationError(`Step ${i + 1} must have a title.`);
        return;
      }
    }

    const newTemplate: TaskWorkflowTemplate = {
      id: `tmpl-custom-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim() || 'Custom enterprise workflow template with 2-step notification flow.',
      steps: steps.map((s, idx) => ({
        ...s,
        stepNumber: idx + 1,
        assignedUserNames: (s.assignedUserIds || []).map(
          (uid) => staffUsers.find((u) => u.id === uid)?.name || uid
        ),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveTemplate(newTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Add Task Workflow Template & 2-Step Flowchart</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-tight">
                  Rule 1 & Rule 2
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure sequential tasks with multi-user assignments & 2-step cascade notification logic
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {validationError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Template Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 5kW Hybrid Solar Battery Installation Workflow"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category / Industry
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 focus:outline-none"
              >
                <option value="Residential Solar">Residential Solar Rooftop</option>
                <option value="Commercial Solar">Commercial & Industrial Solar</option>
                <option value="Agricultural Solar">Agricultural Solar Pumps (PM-KUSUM)</option>
                <option value="EV Infrastructure">EV Charging Stations</option>
                <option value="Electrical Works">Electrical & Panel Contracting</option>
                <option value="AMC & Service">AMC & Preventive Maintenance</option>
                <option value="Custom Workflow">Custom Workflow</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Template Overview & Description
            </label>
            <textarea
              rows={2}
              placeholder="Explain the purpose of this template and standard operating procedures..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* 2-Step Flowchart & Cascade Notification Engine Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Zap className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-blue-950 dark:text-blue-100 flex items-center gap-1.5">
                <span>2-Step Notification Cascade & Flowchart Engine</span>
                <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded font-mono">
                  Rule 1 & Rule 2 Enforced
                </span>
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                When this template is attached to a project: <strong>Rule 1</strong> triggers immediate dual-notification to Step 1 & Step 2 staff simultaneously. As soon as Step 1 finishes, <strong>Rule 2</strong> cascades forward to notify the next steps in real-time.
              </p>
            </div>
          </div>

          {/* Workflow Steps Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                  Sequential Tasks ({steps.length} Steps)
                </h3>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-600 dark:text-slate-300">
                  Multiple Users Per Step
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Step</span>
              </button>
            </div>

            {/* List of Steps */}
            <div className="space-y-3">
              {steps.map((st, idx) => (
                <div
                  key={st.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3 relative group transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Task #{idx + 1}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2 py-0.2 rounded-full font-bold">
                          Initial 1-2 Notification
                        </span>
                      )}
                      {idx === 1 && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2 py-0.2 rounded-full font-bold">
                          Initial 1-2 Notification
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Days:</span>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={st.estimatedDays || 1}
                          onChange={(e) => handleStepDaysChange(idx, parseInt(e.target.value) || 1)}
                          className="w-12 text-center text-xs font-bold border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 bg-white dark:bg-slate-900"
                        />
                      </div>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer transition-colors"
                          title="Delete step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                        Task Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shadow Analysis & Roof Measurements"
                        value={st.title}
                        onChange={(e) => handleStepTitleChange(idx, e.target.value)}
                        className="w-full text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                        SOP Instructions / Note
                      </label>
                      <input
                        type="text"
                        placeholder="Check south orientation and RCC anchor points..."
                        value={st.description || ''}
                        onChange={(e) => handleStepDescChange(idx, e.target.value)}
                        className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Multiple Users Assignment */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <span>Assign Staff Users (Click staff button or choose from dropdown):</span>
                        {st.assignedUserIds.length === 0 ? (
                          <span className="text-[9.5px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-extrabold border border-amber-300 dark:border-amber-700">
                            Unassigned (0 Users)
                          </span>
                        ) : (
                          <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">
                            ✓ {st.assignedUserIds.length} Selected
                          </span>
                        )}
                      </label>

                      <div className="flex items-center gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleClearAllUsersInStep(idx)}
                          className="text-rose-600 dark:text-rose-400 hover:underline font-bold cursor-pointer"
                        >
                          Clear All (0 Users)
                        </button>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <button
                          type="button"
                          onClick={() => handleAssignAllUsersInStep(idx)}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                        >
                          Assign All Staff
                        </button>
                      </div>
                    </div>

                    {/* Quick Dropdown Select */}
                    <div className="flex items-center gap-2">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleToggleUserInStep(idx, e.target.value);
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

                    <div className="flex flex-wrap gap-2">
                      {eligibleStaff.map((staff) => {
                        const isAssigned = (st.assignedUserIds || []).includes(staff.id);
                        return (
                          <button
                            key={staff.id}
                            type="button"
                            onClick={() => handleToggleUserInStep(idx, staff.id)}
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
                            <span className="text-[10px] opacity-75">
                              ({staff.role === 'owner' ? 'Owner' : 'Staff'})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Task Button (Task #4, #5, #6...) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-blue-400 hover:border-blue-600 bg-blue-50/70 hover:bg-blue-100/80 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Add Task #{steps.length + 1} (Click to add more sequential tasks)</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total Steps: <strong>{steps.length}</strong> | Ready for Flowchart Automation
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Save Task Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
