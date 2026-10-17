import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle,
  Phone,
  Sun,
  ShieldCheck,
  MessageCircle,
  MapPin,
  Database,
  Loader2,
  FileCheck2,
  Zap
} from 'lucide-react';
import { COMPANY_INFO } from '../data/solarData';
import { SolarConsultationLead } from '../types';
import {
  saveLeadToFirestore,
  saveDirectiveToFirestore,
  fetchUsersFromFirestore,
  saveTaskToFirestore,
  saveLeadWorkflowToFirestore,
  fetchWorkflowTemplatesFromFirestore,
} from '../lib/firebase';
import { CrmUser, CrmTask, OwnerDirectiveNotification } from '../data/crmData';
import {
  TaskWorkflowTemplate,
  INITIAL_TASK_WORKFLOW_TEMPLATES,
  createLeadWorkflowFromTemplate,
  resolveStaffUser,
} from '../data/workflowTemplateData';
import { handleOwnerLeadCreation } from '../utils/notificationRoutingEngine';
import { BillUploadBox, BillUploadData } from './BillUploadBox';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCapacity?: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  defaultCapacity = '3 kW',
}) => {
  const [formData, setFormData] = useState<SolarConsultationLead>({
    fullName: '',
    phone: '',
    email: '',
    location: 'Prayagraj',
    propertyType: 'Home / Residential',
    monthlyBillRs: '₹3,000 - ₹5,000',
    desiredCapacityKw: defaultCapacity,
    roofType: 'RCC Flat Roof',
    message: '',
  });

  const [billUpload, setBillUpload] = useState<BillUploadData | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [sanctionedLoad, setSanctionedLoad] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadDocId, setLeadDocId] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    setIsSubmitting(true);

    const submissionData: SolarConsultationLead = {
      ...formData,
      uppclAccountNumber: accountNumber.trim() || billUpload?.accountNumber || '',
      sanctionedLoadKw: sanctionedLoad.trim() || billUpload?.sanctionedLoad || '',
      billFileName: billUpload?.fileName || '',
      billFileType: billUpload?.fileType || '',
      billFileSize: billUpload?.fileSize || 0,
      billFileData: billUpload?.fileData || '',
    };

    let createdId = '';
    try {
      // 1. Save directly to Firebase Firestore database
      createdId = await saveLeadToFirestore(submissionData, 'site-survey-modal');
      setLeadDocId(createdId);

      // Strict Flowchart Routing: Dispatches project details and notifications EXCLUSIVELY to Task 1 & Task 2
      try {
        // 1. Fetch live staff users from Firestore (dynamically appointed users)
        const liveFirestoreUsers = await fetchUsersFromFirestore();
        const activeStaffUsers: (CrmUser | any)[] =
          Array.isArray(liveFirestoreUsers) && liveFirestoreUsers.length > 0
            ? liveFirestoreUsers
            : [];

        // 2. Fetch or resolve workflow template
        let templates: TaskWorkflowTemplate[] = [];
        try {
          templates = await fetchWorkflowTemplatesFromFirestore();
        } catch (e) {}
        if (!templates || templates.length === 0) {
          try {
            const raw = localStorage.getItem('dilip_crm_workflow_templates_v2');
            if (raw) templates = JSON.parse(raw);
          } catch (e) {}
        }
        const defaultTmpl: TaskWorkflowTemplate =
          (templates && templates.find((t) => t.category?.toLowerCase().includes('solar'))) ||
          (templates && templates[0]) ||
          INITIAL_TASK_WORKFLOW_TEMPLATES[0];

        // 3. Identify assigned users for Step 1 and Step 2
        const step1Users = defaultTmpl?.steps?.find((s) => s.stepNumber === 1)?.assignedUserIds || [];
        const step2Users = defaultTmpl?.steps?.find((s) => s.stepNumber === 2)?.assignedUserIds || [];
        const assignedIdsForStep1And2: string[] = Array.from(new Set([...step1Users, ...step2Users]));

        const userStepMap: Record<string, number> = {};
        step1Users.forEach((uid) => { userStepMap[uid] = 1; });
        step2Users.forEach((uid) => { if (!userStepMap[uid]) userStepMap[uid] = 2; });

        const cap = parseFloat(formData.desiredCapacityKw) || 3;

        // 4. Create ActiveLeadWorkflow and save
        const newWf = createLeadWorkflowFromTemplate(
          defaultTmpl,
          {
            leadId: createdId,
            customerName: formData.fullName,
            customerPhone: formData.phone,
            customerAddress: formData.location,
            capacityKw: cap,
          },
          activeStaffUsers as any
        );
        await saveLeadWorkflowToFirestore(newWf);

        try {
          const rawWfs = localStorage.getItem('dilip_crm_lead_workflows_v2');
          const existingWfs = rawWfs ? JSON.parse(rawWfs) : [];
          localStorage.setItem('dilip_crm_lead_workflows_v2', JSON.stringify([newWf, ...existingWfs]));
        } catch (e) {}

        // 5. Create CRM Task and save
        const primaryUserId = step1Users[0] || assignedIdsForStep1And2[0] || '';
        const primaryUser = activeStaffUsers.find((u) => u.id === primaryUserId);
        const taskCode = `WF-${(formData.fullName || 'LEAD').substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

        const allTmplStepUserIds = Array.from(new Set(newWf.steps.flatMap((s) => s.assignedUserIds || []))).filter(Boolean);
        const allTmplStepUserNames = Array.from(
          new Set(
            newWf.steps.flatMap((s) => [
              ...(s.assignedUserNames || []),
              ...(s.assignedUserIds || []).map((uid) => activeStaffUsers.find((u) => u.id === uid)?.name || uid),
            ])
          )
        ).filter((n): n is string => Boolean(n && !n.startsWith('usr-')));

        const newTask: CrmTask = {
          id: `task-${createdId}`,
          taskCode,
          title: `${cap}kW Rooftop Solar - ${formData.fullName}`,
          customerName: formData.fullName,
          customerPhone: formData.phone,
          customerEmail: formData.email,
          customerAddress: formData.location || 'Prayagraj',
          capacityKw: cap,
          systemType: 'On-Grid Rooftop',
          monthlyBillRs: formData.monthlyBillRs || '3500',
          priority: 'High',
          assignedToUserId: primaryUserId,
          assignedToUserName: primaryUser?.name || assignedIdsForStep1And2.map((uid) => activeStaffUsers.find((u) => u.id === uid)?.name || uid)[0] || 'Er. Devashish',
          assignedUserIds: assignedIdsForStep1And2, // STRICT RULE 1: ONLY Task 1 & Task 2 users!
          assignedUserNames: assignedIdsForStep1And2.map((uid) => activeStaffUsers.find((u) => u.id === uid)?.name || uid),
          assignedBy: 'Website Consultation Inquiry',
          assignedAt: new Date().toISOString(),
          ownerInstructions: `Inbound website consultation lead. Flowchart initialized (${defaultTmpl.title}).`,
          status: 'not started',
          lastUpdatedAt: new Date().toISOString(),
          lastUpdatedBy: 'Website Consultation Inquiry',
          dealValueRs: cap * 65000,
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          leadSource: 'Website Consultation Modal',
          businessId: 'biz-solar-dilip',
          businessName: 'Dilip Enterprises',
          workflowId: newWf.id,
          remarksHistory: [
            {
              id: `rem-${Date.now()}`,
              authorId: 'system',
              authorName: 'Website System',
              authorRole: 'employee',
              statusChangedTo: 'not started',
              message: `Inbound consultation form submitted by ${formData.fullName} (${cap}kW). Flowchart attached.`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
        await saveTaskToFirestore(newTask);

        try {
          const rawTasks = localStorage.getItem('dilip_crm_tasks_v3');
          const existingTasks = rawTasks ? JSON.parse(rawTasks) : [];
          localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify([newTask, ...existingTasks]));
        } catch (e) {}

        // 6. Dispatch Owner Directive Notifications to Task 1 & 2 users
        const { directivesToDeliver } = handleOwnerLeadCreation(
          {
            leadId: newTask.id,
            customerName: formData.fullName,
            customerPhone: formData.phone,
            customerAddress: formData.location,
            capacityKw: cap,
            priority: 'High',
            source: 'site-survey-modal',
            creatorName: 'Website Consultation Inquiry',
            taskCode: newTask.taskCode,
            projectTitle: `⚡ Flowchart Initialized: ${formData.fullName} (${cap}kW Solar)`,
            ownerCommand: `New website inquiry received. Action required for Task Step.`,
          },
          activeStaffUsers,
          assignedIdsForStep1And2,
          userStepMap
        );

        if (directivesToDeliver.length > 0) {
          directivesToDeliver.forEach((d) => {
            saveDirectiveToFirestore(d).catch((err) => console.error(err));
          });
          try {
            const rawDirs = localStorage.getItem('dilip_crm_owner_directives_v1');
            const existingDirs = rawDirs ? JSON.parse(rawDirs) : [];
            localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify([...directivesToDeliver, ...existingDirs]));
          } catch (e) {}
        }
      } catch (routingErr) {
        console.warn('Failed to route consultation lead creation directives:', routingErr);
      }
    } catch (err) {
      console.error('Failed to save to Firestore:', err);
      // Even if offline, we continue gracefully
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }

    // Build WhatsApp URL with the full lead info & Lead ID
    const refTag = createdId ? `[Ref ID: #${createdId.slice(-6).toUpperCase()}]` : '';
    const accLine = submissionData.uppclAccountNumber ? `• *UPPCL Account No.:* ${submissionData.uppclAccountNumber}\n` : '';
    const loadLine = submissionData.sanctionedLoadKw ? `• *Sanctioned Load:* ${submissionData.sanctionedLoadKw}\n` : '';
    const billLine = billUpload ? `• *Electricity Bill:* Attached (${billUpload.fileName})\n` : '';

    const text =
      `*New Solar Inquiry from Website* ${refTag}\n\n` +
      `• *Name:* ${formData.fullName}\n` +
      `• *Phone:* ${formData.phone}\n` +
      `• *Location:* ${formData.location}\n` +
      `• *Property:* ${formData.propertyType}\n` +
      `• *Monthly Bill:* ${formData.monthlyBillRs}\n` +
      `• *Desired Capacity:* ${formData.desiredCapacityKw}\n` +
      accLine +
      loadLine +
      billLine +
      `• *Roof Type:* ${formData.roofType}\n` +
      (formData.message ? `• *Note:* ${formData.message}\n` : '') +
      `\nPlease schedule a free site survey.`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${COMPANY_INFO.phoneClean}?text=${encodedText}`;

    // Auto open WhatsApp in new tab
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
            <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full">
              UPNEDA Authorized Partner
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif">Book Free Site Survey</h3>
          <p className="text-xs text-amber-100 mt-1">
            Get 3D shadow analysis, UPPCL net-metering feasibility & PM Surya Ghar subsidy claim.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 sm:p-8 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lead Successfully Saved in Database</span>
            </div>
            <h4 className="text-2xl font-bold text-slate-900">Thank You, {formData.fullName}!</h4>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Your solar site inspection request has been logged in our system{leadDocId ? ` with Reference ID ` : ''}
              {leadDocId && (
                <strong className="text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  #{leadDocId.slice(-6).toUpperCase()}
                </strong>
              )}.
            </p>

            {/* Bill Upload summary badge if uploaded */}
            {billUpload && (
              <div className="max-w-md mx-auto p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">UPPCL Bill Attached</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{billUpload.fileName}</div>
                  </div>
                </div>
                {accountNumber && (
                  <span className="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-amber-200 text-[11px]">
                    Acc: {accountNumber}
                  </span>
                )}
              </div>
            )}

            <p className="text-slate-600 text-xs max-w-md mx-auto">
              Our engineering team in Prayagraj will inspect your UPPCL sanctioned load and reach out to schedule your free rooftop inspection.
            </p>
            <div className="pt-4 flex flex-col gap-2.5">
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat on WhatsApp Directly</span>
              </a>
              <a
                href={`tel:${COMPANY_INFO.phoneClean}`}
                className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold py-2.5 px-6 rounded-xl text-sm transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call Mr. Devashish: {COMPANY_INFO.phone}</span>
              </a>
              <button
                onClick={onClose}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-1"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit Mobile Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  City / Area in Prayagraj
                </label>
                <input
                  type="text"
                  placeholder="e.g. Civil Lines, Kydganj, Naini"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Property Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      propertyType: e.target.value as SolarConsultationLead['propertyType'],
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Home / Residential">Home / Residential</option>
                  <option value="Housing Society">Housing Society</option>
                  <option value="Commercial">Commercial / Office</option>
                  <option value="Industrial">Industrial / Factory</option>
                  <option value="Agriculture / Farm">Agriculture / Farm Pump</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Estimated Monthly Bill
                </label>
                <select
                  value={formData.monthlyBillRs}
                  onChange={(e) => setFormData({ ...formData, monthlyBillRs: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Below ₹1,500">Below ₹1,500</option>
                  <option value="₹1,500 - ₹3,000">₹1,500 - ₹3,000</option>
                  <option value="₹3,000 - ₹5,000">₹3,000 - ₹5,000</option>
                  <option value="₹5,000 - ₹10,000">₹5,000 - ₹10,000</option>
                  <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                  <option value="Above ₹25,000">Above ₹25,000</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Interested Capacity
                </label>
                <select
                  value={formData.desiredCapacityKw}
                  onChange={(e) => setFormData({ ...formData, desiredCapacityKw: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="1 kW">1 kW (₹45,000 Subsidy)</option>
                  <option value="2 kW">2 kW (₹90,000 Subsidy)</option>
                  <option value="3 kW">3 kW (₹1,08,000 Subsidy)</option>
                  <option value="4 kW">4 kW</option>
                  <option value="5 kW">5 kW</option>
                  <option value="10 kW+">10 kW+</option>
                  <option value="Solar Water Pump">Solar Water Pump</option>
                  <option value="Solar Street Light">Solar Street Light</option>
                  <option value="Solar Water Heater">Solar Water Heater</option>
                </select>
              </div>
            </div>

            {/* ELECTRICITY BILL (UPPCL BILL) UPLOAD OPTION */}
            <BillUploadBox
              value={billUpload}
              onChange={setBillUpload}
              accountNumber={accountNumber}
              onAccountNumberChange={setAccountNumber}
              sanctionedLoad={sanctionedLoad}
              onSanctionedLoadChange={setSanctionedLoad}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Roof Type
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['RCC Flat Roof', 'Tin / Metal Sheet', 'Ground Mount'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, roofType: r })}
                    className={`py-2 px-1 rounded-xl border text-center font-medium ${
                      formData.roofType === r
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Any specific question or message (optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Need high-rise elevated structure for walking space..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-amber-500/25 transition-all text-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit & Book Free Site Survey</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved securely in Dilip Enterprises database • Zero obligation</span>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
