import React, { useState, useEffect, useMemo } from 'react';
import { X, UserPlus, Zap, MapPin, Phone, FileText, Send, Building2, ShieldCheck, Lock } from 'lucide-react';
import { CrmTask, CrmUser } from '../../data/crmData';
import { BusinessWorkspace } from '../../data/businessTemplatesData';
import { TaskWorkflowTemplate, INITIAL_TASK_WORKFLOW_TEMPLATES, resolveStaffUser } from '../../data/workflowTemplateData';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffUsers: CrmUser[];
  currentUser: CrmUser;
  businesses?: BusinessWorkspace[];
  activeBusinessId?: string;
  taskWorkflowTemplates?: TaskWorkflowTemplate[];
  onCreateTask: (task: Omit<CrmTask, 'id' | 'taskCode' | 'assignedAt' | 'lastUpdatedAt' | 'lastUpdatedBy' | 'remarksHistory'>) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  staffUsers,
  currentUser,
  businesses = [],
  activeBusinessId,
  taskWorkflowTemplates,
  onCreateTask,
}) => {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(activeBusinessId || 'biz-solar-dilip');
  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId) || businesses[0];

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [capacityKw, setCapacityKw] = useState(3);
  const [systemType, setSystemType] = useState<string>('On-Grid Rooftop');
  const [monthlyBillRs, setMonthlyBillRs] = useState('3500');
  const [uppclAccountNo, setUppclAccountNo] = useState('');
  const [roofType, setRoofType] = useState<CrmTask['roofType']>('RCC Flat Roof');
  const [priority, setPriority] = useState<CrmTask['priority']>('High');
  const [dealValueRs, setDealValueRs] = useState<number>(250000);
  const [assignedToUserId, setAssignedToUserId] = useState<string>('');
  const [ownerInstructions, setOwnerInstructions] = useState('');

  // Template selection is COMPULSORY: Every project inherits the same appointed task users from the chosen template
  const availableTemplates: TaskWorkflowTemplate[] = useMemo(() => {
    if (taskWorkflowTemplates && taskWorkflowTemplates.length > 0) {
      return taskWorkflowTemplates;
    }
    return INITIAL_TASK_WORKFLOW_TEMPLATES;
  }, [taskWorkflowTemplates]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const defaultTmpl = availableTemplates.find((t) => t.category?.toLowerCase().includes('solar')) || availableTemplates[0];
    return defaultTmpl ? defaultTmpl.id : '';
  });

  const activeTemplate: TaskWorkflowTemplate | undefined = useMemo(() => {
    return availableTemplates.find((t) => t.id === selectedTemplateId) || availableTemplates[0];
  }, [availableTemplates, selectedTemplateId]);

  // Inherited staff members from the selected master template
  const templateStaffIds = useMemo(() => {
    if (!activeTemplate || !activeTemplate.steps) return [];
    return Array.from(
      new Set(activeTemplate.steps.flatMap((s) => s.assignedUserIds || []))
    ).filter(Boolean);
  }, [activeTemplate]);

  const templateStaffNames = useMemo(() => {
    return templateStaffIds.map((uid) => resolveStaffUser(uid, staffUsers)?.name || uid);
  }, [templateStaffIds, staffUsers]);

  const step1StaffIds = useMemo(() => {
    return activeTemplate?.steps?.find((s) => s.stepNumber === 1)?.assignedUserIds || [];
  }, [activeTemplate]);

  const step2StaffIds = useMemo(() => {
    return activeTemplate?.steps?.find((s) => s.stepNumber === 2)?.assignedUserIds || [];
  }, [activeTemplate]);

  const step1StaffNames = useMemo(() => {
    return step1StaffIds.map((uid) => resolveStaffUser(uid, staffUsers)?.name || uid);
  }, [step1StaffIds, staffUsers]);

  const step2StaffNames = useMemo(() => {
    return step2StaffIds.map((uid) => resolveStaffUser(uid, staffUsers)?.name || uid);
  }, [step2StaffIds, staffUsers]);

  const employees = staffUsers.filter((u) => u.role === 'employee' && u.status === 'active');

  // Update defaults when activeBusinessId changes or modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (activeBusinessId) {
      setSelectedBusinessId(activeBusinessId);
    }
    if (!selectedTemplateId && availableTemplates.length > 0) {
      const defaultTmpl = availableTemplates.find((t) => t.category?.toLowerCase().includes('solar')) || availableTemplates[0];
      if (defaultTmpl) setSelectedTemplateId(defaultTmpl.id);
    }
  }, [activeBusinessId, isOpen, availableTemplates, selectedTemplateId]);

  useEffect(() => {
    if (!isOpen) return;
    if (selectedBusiness && selectedBusiness.systemTypes && selectedBusiness.systemTypes.length > 0) {
      setSystemType(selectedBusiness.systemTypes[0]);
    }
  }, [selectedBusinessId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId || !activeTemplate) {
      alert('Task Workflow Template selection is compulsory! Please select a Task Template.');
      return;
    }

    onCreateTask({
      title: `${capacityKw} ${selectedBusiness?.industry?.includes('Solar') ? 'kW' : 'Units'} ${systemType} - ${customerName.trim()}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      capacityKw: Number(capacityKw) || 3,
      systemType,
      monthlyBillRs: monthlyBillRs.trim(),
      uppclAccountNo: uppclAccountNo.trim(),
      roofType,
      priority,
      assignedToUserId: step1StaffIds[0] || templateStaffIds[0] || '',
      assignedToUserName: step1StaffNames[0] || templateStaffNames[0] || 'Unassigned',
      assignedUserIds: templateStaffIds, // STRICT: ALL task users configured in this template
      assignedUserNames: templateStaffNames,
      assignedBy: currentUser.name,
      ownerInstructions: ownerInstructions.trim() || `[Template: ${activeTemplate.title}] Tasks appointed according to SOP template.`,
      status: 'not started', // Default status requested by user!
      dealValueRs: Number(dealValueRs) || 0,
      businessId: selectedBusiness?.id || selectedBusinessId,
      businessName: selectedBusiness?.name || 'Dilip Enterprises',
      templateId: activeTemplate.id,
      customStepAssignments: {
        1: step1StaffIds,
        2: step2StaffIds,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1a3882] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Solar Lead / Project Task</h3>
              <p className="text-xs text-slate-500">Super Admin Lead Creation • Flowchart SOP Rule 1 (N1) Enforced</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RULE 1 (N1) AUTOMATION BANNER */}
        <div className="mb-4 bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border-2 border-amber-400 rounded-xl p-3 text-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-amber-950 text-xs">
              <Zap className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>SOP RULE 1 (N1) ENFORCED: Initial Lead Dispatch</span>
            </div>
            <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Rule 1 (N1) Active
            </span>
          </div>
          <p className="text-[11px] text-amber-950 leading-relaxed font-semibold">
            Super admin panel se lead add hone par yeh lead details or notification <strong>sirf Task 1 or Task 2 k sabhi users k paas</strong> jayegi.
            Task 3 se 7 ke users ke paas lead access locked rahega jab tak Task 1 & 2 ka status update nahi hota.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-slate-900 bg-white/90 p-2 rounded-lg border border-amber-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-blue-950">Appointed Task 1 & 2 Staff:</span>
            <span className="text-amber-900 font-extrabold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              {step1StaffNames.concat(step2StaffNames).length > 0 ? Array.from(new Set([...step1StaffNames, ...step2StaffNames])).join(', ') : 'Template Staff Appointed'}
            </span>
            <span className="text-[10px] text-slate-500 font-normal ml-auto flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              Task 3–7 Locked
            </span>
          </div>
        </div>

        {/* COMPULSORY WORKFLOW SOP TEMPLATE SELECTOR */}
        <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-extrabold text-xs text-[#1a3882] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Select Task Workflow Template * (Compulsory)</span>
            </label>
            <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
              Compulsory Field
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            Har project ke liye alag alag staff select nahi karna padega — select kiye gaye Task Template ke steps me jo staff users appointed hain, wahi users har project me automatically appoint ho jaenge.
          </p>

          <div>
            <select
              required
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full border-2 border-blue-600 bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            >
              <option value="" disabled>-- Select Task Workflow Template (Compulsory) --</option>
              {availableTemplates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.title} ({tmpl.steps.length} Steps • {tmpl.category})
                </option>
              ))}
            </select>
          </div>

          {/* Active Template Appointed Staff Preview */}
          {activeTemplate && (
            <div className="bg-white rounded-xl p-3 border border-blue-200 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-800 text-[11px]">
                  Template: <strong>{activeTemplate.title}</strong>
                </span>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  {activeTemplate.steps.length} Sequential Tasks
                </span>
              </div>

              <div className="space-y-1.5">
                {activeTemplate.steps.map((st) => {
                  const uNames = (st.assignedUserIds || []).map((uid) => resolveStaffUser(uid, staffUsers)?.name || uid);
                  const isInitial = st.stepNumber === 1 || st.stepNumber === 2;
                  return (
                    <div
                      key={st.id}
                      className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] ${
                        isInitial ? 'bg-amber-50/70 border border-amber-200' : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-4 h-4 rounded text-[10px] font-black flex items-center justify-center text-white ${
                          isInitial ? 'bg-amber-600' : 'bg-slate-500'
                        }`}>
                          {st.stepNumber}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {st.title}
                        </span>
                        {isInitial && (
                          <span className="text-[9px] font-extrabold text-amber-800 bg-amber-200/80 px-1 rounded">
                            Rule 1 Dispatched
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-700">
                        {uNames.length > 0 ? (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {uNames.join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 italic pt-1">
                Note: Task users can be configured anytime inside the Master Task Templates tab.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Business Workspace Selector */}
          {businesses.length > 0 && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Assign to Business Workspace (Template) *</span>
              </label>
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="w-full border-2 border-amber-400 bg-white rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none"
              >
                {businesses.map((biz) => (
                  <option key={biz.id} value={biz.id}>
                    {biz.name} ({biz.industry})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Workspace: <strong>{selectedBusiness?.name}</strong> • Currency: <strong>{selectedBusiness?.currency || '₹'}</strong>
              </p>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Customer / Client Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra Verma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#1a3882] focus:outline-none font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Customer Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 9415..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#1a3882] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {selectedBusiness?.industry?.includes('Solar') ? 'System Capacity (kW) *' : 'Project Scope / Units *'}
              </label>
              <input
                type="number"
                min="1"
                max="50000"
                step="0.5"
                required
                value={capacityKw}
                onChange={(e) => setCapacityKw(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#1a3882] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Project / Site Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. Plot 15, Near Medical College, Lowther Road, Prayagraj"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#1a3882] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">System / Service Type</label>
              <select
                value={systemType}
                onChange={(e) => setSystemType(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none font-medium"
              >
                {selectedBusiness?.systemTypes && selectedBusiness.systemTypes.length > 0 ? (
                  selectedBusiness.systemTypes.map((st, idx) => (
                    <option key={idx} value={st}>
                      {st}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="On-Grid Rooftop">On-Grid Rooftop</option>
                    <option value="Hybrid Solar">Hybrid Solar</option>
                    <option value="Off-Grid">Off-Grid</option>
                    <option value="Solar Water Pump">Solar Water Pump</option>
                    <option value="Commercial HT">Commercial HT</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none font-semibold"
              >
                <option value="Normal">Normal Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent Priority (Immediate Action)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Estimated Deal / Order Value ({selectedBusiness?.currency || '₹'})
              </label>
              <input
                type="number"
                placeholder="250000"
                value={dealValueRs}
                onChange={(e) => setDealValueRs(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Monthly Bill or Reference #</label>
              <input
                type="text"
                placeholder="e.g. ₹4500 or REF-1092"
                value={monthlyBillRs}
                onChange={(e) => setMonthlyBillRs(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Roof Type</label>
              <select
                value={roofType}
                onChange={(e) => setRoofType(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
              >
                <option value="RCC Flat Roof">RCC Flat Roof</option>
                <option value="Tin / Metal Sheet">Tin / Metal Sheet</option>
                <option value="Elevated Structure">Elevated Structure</option>
                <option value="Ground Mount">Ground Mount</option>
              </select>
            </div>

            {/* ASSIGN TO EMPLOYEE (Zero default assignment as required) */}
            <div>
              <label className="block font-bold text-[#1a3882] mb-1">Assign To Employee / User (Optional)</label>
              <select
                value={assignedToUserId}
                onChange={(e) => setAssignedToUserId(e.target.value)}
                className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="">-- Unassigned (Assign Later) --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* OWNER'S MESSAGE / INSTRUCTIONS (Sent directly to employee's panel) */}
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <label className="block font-bold text-amber-900 mb-1">
              Owner's Message / Instructions for this User:
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Please visit site today at 2:00 PM for shadow analysis. Customer has 3-phase connection."
              value={ownerInstructions}
              onChange={(e) => setOwnerInstructions(e.target.value)}
              className="w-full border border-amber-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-amber-800 mt-1">
              🔔 This message and loud notification will be routed specifically to this assigned user's panel.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Default status will be set to <strong className="text-slate-800 font-bold">"not started"</strong>.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#1a3882] hover:bg-blue-900 rounded-lg shadow cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Assign Lead & Notify User</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
