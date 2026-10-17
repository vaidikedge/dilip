import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Activity,
  FileBarChart,
  Users,
  CheckSquare,
  UserPlus,
  AlertCircle,
  LogOut,
  Settings,
  Menu,
  X,
  Search,
  Filter,
  Plus,
  Phone,
  MessageCircle,
  FileText,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  Lock,
  Unlock,
  Building2,
  Home,
  MapPin,
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Wrench,
  Sun,
  Globe,
  ArrowLeft,
  Check,
  Sparkles
} from 'lucide-react';
import {
  fetchAllLeads,
  updateLeadStatus,
  deleteLeadRecord,
  saveLeadToFirestore,
  saveDirectiveToFirestore,
  fetchUsersFromFirestore,
  subscribeToUsersFromFirestore,
  fetchDirectivesFromFirestore,
  saveTaskToFirestore,
  saveLeadWorkflowToFirestore,
  fetchWorkflowTemplatesFromFirestore,
  StoredLeadRecord
} from '../lib/firebase';
import {
  WorkProgressItem,
  WorkReportItem,
  StaffUser,
  TaskTemplate,
  ComplaintTicket,
  LoginDetail,
  CrmTask,
  INITIAL_WORK_PROGRESS,
  INITIAL_WORK_REPORTS,
  INITIAL_STAFF_USERS,
  INITIAL_TASK_TEMPLATES,
  INITIAL_COMPLAINT_TICKETS,
  INITIAL_LOGIN_DETAILS
} from '../data/crmData';
import {
  TaskWorkflowTemplate,
  INITIAL_TASK_WORKFLOW_TEMPLATES,
  createLeadWorkflowFromTemplate,
  getStoredWorkflowTemplates,
  resolveStaffUser
} from '../data/workflowTemplateData';
import { handleOwnerLeadCreation } from '../utils/notificationRoutingEngine';
import { COMPANY_INFO } from '../data/solarData';
import { PageId } from '../types';

interface AdminLeadsViewProps {
  onNavigate?: (page: PageId) => void;
}

type TabType =
  | 'dashboard'
  | 'work-progress'
  | 'work-report'
  | 'manage-users'
  | 'task-template'
  | 'customer-leads'
  | 'complaint';

export const AdminLeadsView: React.FC<AdminLeadsViewProps> = ({ onNavigate }) => {
  // Authentication state (supports PIN 2017 / admin / solar)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('dilip_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Leads from Firestore
  const [leads, setLeads] = useState<StoredLeadRecord[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<StoredLeadRecord | null>(null);

  // CRM Data States (persisted to localStorage)
  const [workProgress, setWorkProgress] = useState<WorkProgressItem[]>(() => {
    const saved = localStorage.getItem('dilip_crm_work_progress');
    return saved ? JSON.parse(saved) : INITIAL_WORK_PROGRESS;
  });

  const [workReports, setWorkReports] = useState<WorkReportItem[]>(() => {
    const saved = localStorage.getItem('dilip_crm_work_reports');
    return saved ? JSON.parse(saved) : INITIAL_WORK_REPORTS;
  });

  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('dilip_crm_staff_users');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_USERS;
  });

  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>(() => {
    const saved = localStorage.getItem('dilip_crm_task_templates');
    return saved ? JSON.parse(saved) : INITIAL_TASK_TEMPLATES;
  });

  const [complaints, setComplaints] = useState<ComplaintTicket[]>(() => {
    const saved = localStorage.getItem('dilip_crm_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINT_TICKETS;
  });

  const [loginDetails] = useState<LoginDetail[]>(INITIAL_LOGIN_DETAILS);

  // Search & Filter States
  const [workSearch, setWorkSearch] = useState('');
  const [workStageFilter, setWorkStageFilter] = useState('all');
  const [complaintFilter, setComplaintFilter] = useState('all');

  // Modals
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isAddComplaintOpen, setIsAddComplaintOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkProgressItem | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  // Form states for modals
  const [newWork, setNewWork] = useState({
    clientName: '',
    phone: '',
    address: '',
    capacityKw: 3,
    systemType: 'On-Grid Rooftop' as const,
    stage: 'Site Survey' as const,
    assignedEngineer: 'Er. Devashish',
    targetDate: '',
    inverterBrand: 'Growatt Grid-Tie',
    panelBrand: 'Waaree Mono PERC',
    notes: '',
  });

  const [newReport, setNewReport] = useState({
    date: new Date().toISOString().split('T')[0],
    engineerName: 'Er. Devashish',
    clientOrSite: '',
    workDone: '',
    uppclStatus: '',
    materialsUsed: '',
    nextDayPlan: '',
  });

  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Solar Engineer' as const,
    phone: '',
    email: '',
    status: 'Active' as const,
  });

  const [newLeadForm, setNewLeadForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    location: 'Prayagraj',
    propertyType: 'Home / Residential' as const,
    monthlyBillRs: '3500',
    desiredCapacityKw: '3',
    roofType: 'RCC Flat Roof' as const,
    message: '',
    uppclAccountNumber: '',
    sanctionedLoadKw: '3',
    selectedTemplateId: 'tmpl-wf-residential-ongrid',
    step1UserIds: ['usr-emp-1', 'usr-emp-3'] as string[],
    step2UserIds: ['usr-emp-2'] as string[],
  });

  const [workflowTemplates, setWorkflowTemplates] = useState<TaskWorkflowTemplate[]>(() => {
    return getStoredWorkflowTemplates();
  });

  const handleLeadTemplateChange = (templateId: string) => {
    const tmpl = workflowTemplates.find((t) => t.id === templateId);
    const s1 = tmpl?.steps?.find((s) => s.stepNumber === 1)?.assignedUserIds || [];
    const s2 = tmpl?.steps?.find((s) => s.stepNumber === 2)?.assignedUserIds || [];
    setNewLeadForm((prev) => ({
      ...prev,
      selectedTemplateId: templateId,
      step1UserIds: s1,
      step2UserIds: s2,
    }));
  };

  const toggleLeadStep1User = (userId: string) => {
    setNewLeadForm((prev) => {
      const exists = prev.step1UserIds.includes(userId);
      const updated = exists ? prev.step1UserIds.filter((id) => id !== userId) : [...prev.step1UserIds, userId];
      return { ...prev, step1UserIds: updated };
    });
  };

  const toggleLeadStep2User = (userId: string) => {
    setNewLeadForm((prev) => {
      const exists = prev.step2UserIds.includes(userId);
      const updated = exists ? prev.step2UserIds.filter((id) => id !== userId) : [...prev.step2UserIds, userId];
      return { ...prev, step2UserIds: updated };
    });
  };

  const [newComplaint, setNewComplaint] = useState({
    customerName: '',
    phone: '',
    address: '',
    systemCapacity: '3 kW',
    issueType: 'Inverter Error Code' as const,
    description: '',
    priority: 'High' as const,
    assignedTo: 'Er. Devashish',
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('dilip_crm_work_progress', JSON.stringify(workProgress));
  }, [workProgress]);

  useEffect(() => {
    localStorage.setItem('dilip_crm_work_reports', JSON.stringify(workReports));
  }, [workReports]);

  useEffect(() => {
    localStorage.setItem('dilip_crm_staff_users', JSON.stringify(staffUsers));
  }, [staffUsers]);

  useEffect(() => {
    localStorage.setItem('dilip_crm_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // Load leads from Firestore
  const loadLeads = async () => {
    setLeadsLoading(true);
    try {
      const data = await fetchAllLeads(100);
      setLeads(data);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLeads();
      const unsubUsers = subscribeToUsersFromFirestore((liveUsers) => {
        if (Array.isArray(liveUsers) && liveUsers.length > 0) {
          setStaffUsers(liveUsers as any);
        }
      });
      return () => {
        unsubUsers();
      };
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pinInput.trim().toLowerCase();
    if (clean === '2017' || clean === 'admin' || clean === 'solar' || clean === 'devashish' || clean === 'dilip') {
      setIsAuthenticated(true);
      sessionStorage.setItem('dilip_admin_auth', 'true');
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Default access PIN is 2017.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of Dilip Enterprises TMS?')) {
      setIsAuthenticated(false);
      sessionStorage.removeItem('dilip_admin_auth');
    }
  };

  // Lead actions
  const handleLeadStatusChange = async (
    leadId: string,
    newStatus: 'new' | 'contacted' | 'survey_scheduled' | 'installed' | 'cancelled'
  ) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
      alert('Could not update status.');
    }
  };

  const handleDeleteLead = async (leadId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to completely delete "${name}"?\n\nThis will perform a Complete Cascade Delete removing all associated tasks, active workflow SOPs, and notifications across all staff panels (Sunny, Site Engineers, etc.).`)) return;
    try {
      const targetLead = leads.find((l) => l.id === leadId);
      await deleteLeadRecord(leadId, {
        fullName: targetLead?.fullName || name,
        phone: targetLead?.phone,
      });
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      if (selectedLead?.id === leadId) setSelectedLead(null);
    } catch (err) {
      console.error('Error deleting lead:', err);
      alert('Failed to delete lead.');
    }
  };

  // Add Walk-in Lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = await saveLeadToFirestore(newLeadForm, 'tms-internal-crm');
      const createdRecord: StoredLeadRecord = {
        ...newLeadForm,
        id,
        status: 'new',
        source: 'tms-internal-crm',
        createdAt: new Date().toISOString(),
      };
      setLeads((prev) => [createdRecord, ...prev]);

      // Strict Flowchart Routing: Dispatches project details and notifications EXCLUSIVELY to Task 1 & Task 2
      try {
        const liveUsers = staffUsers.length > 0 ? staffUsers : [];

        // 1. Fetch or resolve workflow template
        let templates: TaskWorkflowTemplate[] = workflowTemplates;
        if (!templates || templates.length === 0) {
          try {
            templates = await fetchWorkflowTemplatesFromFirestore();
          } catch (e) {}
        }
        if (!templates || templates.length === 0) {
          try {
            const raw = localStorage.getItem('dilip_crm_workflow_templates_v2');
            if (raw) templates = JSON.parse(raw);
          } catch (e) {}
        }
        const activeTmpl: TaskWorkflowTemplate =
          (templates && templates.find((t) => t.id === newLeadForm.selectedTemplateId)) ||
          (templates && templates.find((t) => t.category?.toLowerCase().includes('solar'))) ||
          (templates && templates[0]) ||
          INITIAL_TASK_WORKFLOW_TEMPLATES[0];

        // 2. Identify assigned users directly from the selected master Task Template
        const step1Users = activeTmpl.steps?.find((s) => s.stepNumber === 1)?.assignedUserIds || [];
        const step2Users = activeTmpl.steps?.find((s) => s.stepNumber === 2)?.assignedUserIds || [];
        const allTemplateStaffIds = Array.from(
          new Set(activeTmpl.steps?.flatMap((s) => s.assignedUserIds || []) || [])
        ).filter(Boolean);
        const assignedIdsForStep1And2: string[] = Array.from(new Set([...step1Users, ...step2Users]));

        const userStepMap: Record<string, number> = {};
        step1Users.forEach((uid) => { userStepMap[uid] = 1; });
        step2Users.forEach((uid) => { if (!userStepMap[uid]) userStepMap[uid] = 2; });

        const cap = parseFloat(createdRecord.desiredCapacityKw) || 3;

        // 3. Create ActiveLeadWorkflow with inherited template assignments
        const newWf = createLeadWorkflowFromTemplate(
          activeTmpl,
          {
            leadId: id,
            customerName: createdRecord.fullName,
            customerPhone: createdRecord.phone,
            customerAddress: createdRecord.location,
            capacityKw: cap,
          },
          liveUsers as any
        );
        await saveLeadWorkflowToFirestore(newWf);

        try {
          const rawWfs = localStorage.getItem('dilip_crm_lead_workflows_v2');
          const existingWfs = rawWfs ? JSON.parse(rawWfs) : [];
          localStorage.setItem('dilip_crm_lead_workflows_v2', JSON.stringify([newWf, ...existingWfs]));
        } catch (e) {}

        // 4. Create CRM Task assigned to all task users configured in this template
        const primaryUserId = step1Users[0] || allTemplateStaffIds[0] || '';
        const primaryUser = liveUsers.find((u) => u.id === primaryUserId);
        const taskCode = `WF-${(createdRecord.fullName || 'LEAD').substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

        const allTemplateStaffNames = allTemplateStaffIds.map((uid) => liveUsers.find((u) => u.id === uid)?.name || uid);
        const step1And2Names = assignedIdsForStep1And2.map((uid) => liveUsers.find((u) => u.id === uid)?.name || uid);

        const newTask: CrmTask = {
          id: `task-${id}`,
          taskCode,
          title: `${cap}kW Rooftop Solar - ${createdRecord.fullName}`,
          customerName: createdRecord.fullName,
          customerPhone: createdRecord.phone,
          customerEmail: createdRecord.email,
          customerAddress: createdRecord.location || 'Prayagraj',
          capacityKw: cap,
          systemType: 'On-Grid Rooftop',
          monthlyBillRs: createdRecord.monthlyBillRs || '3500',
          priority: 'High',
          assignedToUserId: primaryUserId,
          assignedToUserName: primaryUser?.name || allTemplateStaffNames[0] || 'Unassigned',
          assignedUserIds: allTemplateStaffIds, // All appointed staff from the template
          assignedUserNames: allTemplateStaffNames,
          assignedBy: 'Dilip Enterprises (Owner / Super Admin)',
          assignedAt: new Date().toISOString(),
          ownerInstructions: `[Template: ${activeTmpl.title}] Inbound Lead created via Super Admin. Dispatched to Task 1 & Task 2 staff (${step1And2Names.join(', ') || 'Template Staff'}).`,
          status: 'not started',
          lastUpdatedAt: new Date().toISOString(),
          lastUpdatedBy: 'Dilip Enterprises (Owner / Super Admin)',
          dealValueRs: cap * 65000,
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          leadSource: 'Super Admin Desk Inbound Lead',
          businessId: 'biz-solar-dilip',
          businessName: 'Dilip Enterprises',
          workflowId: newWf.id,
          templateId: activeTmpl.id,
          customStepAssignments: {
            1: step1Users,
            2: step2Users,
          },
          remarksHistory: [
            {
              id: `rem-${Date.now()}`,
              authorId: 'usr-owner-1',
              authorName: 'Dilip Enterprises',
              authorRole: 'owner',
              statusChangedTo: 'not started',
              message: `[Super Admin Command Enforced] Lead entered by Super Admin: ${createdRecord.fullName}. Dispatched EXCLUSIVELY to appointed staff: ${step1And2Names.join(', ') || 'None'}.`,
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

        // 5. Dispatch Owner Directive Notifications (Strictly Task 1 & Task 2)
        const { directivesToDeliver } = handleOwnerLeadCreation(
          {
            leadId: newTask.id,
            customerName: createdRecord.fullName,
            customerPhone: createdRecord.phone,
            customerAddress: createdRecord.location,
            capacityKw: cap,
            priority: 'High',
            source: 'tms-internal-crm',
            creatorName: 'Dilip Enterprises (Owner)',
            taskCode: newTask.taskCode,
            projectTitle: `⚡ [RULE 1 / N1] Lead Initialized: ${createdRecord.fullName} (${cap}kW Solar)`,
            ownerCommand: `[RULE 1 / N1 Enforced] New lead created. Action required for Task 1 & Task 2 appointed staff.`,
          },
          liveUsers,
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

        // 6. Create Super Admin Project Notification for Rule 1 (N1) verification
        const ownerNotif = {
          id: `pnotif-admin-${Date.now()}`,
          itemType: 'TASK',
          taskCode: newTask.taskCode,
          projectTitle: `⚡ [RULE 1 / N1 APPLIED]: Walk-in Lead - ${newTask.customerName}`,
          customerName: newTask.customerName,
          customerPhone: newTask.customerPhone,
          customerAddress: newTask.customerAddress,
          capacityKw: newTask.capacityKw,
          actionType: 'TASK_ASSIGNED',
          newStatus: 'not started',
          authorId: 'usr-owner-1',
          authorName: 'Dilip Enterprises (Owner)',
          authorRole: 'owner',
          message: `⚡ [RULE 1 / N1 Followed]: Walk-in lead details & initial notifications sent EXCLUSIVELY to Task 1 & Task 2 assigned staff: ${step1And2Names.join(', ')}. (Task 3–7 staff do NOT have lead access).`,
          timestamp: Date.now(),
          formattedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          isRead: false,
          priority: 'High',
        };
        try {
          const rawP = localStorage.getItem('dilip_crm_project_notifications_v3');
          const existP = rawP ? JSON.parse(rawP) : [];
          localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify([ownerNotif, ...existP]));
        } catch (e) {}

        // Broadcast cross-tab update
        try {
          const payload = {
            type: 'OWNER_DIRECTIVE',
            id: `lead-admin-${Date.now()}`,
            authorName: 'Dilip Enterprises',
            authorRole: 'owner',
            itemType: 'TASK',
            taskCode: newTask.taskCode,
            projectTitle: `⚡ [RULE 1 / N1] ${newTask.customerName}`,
            customerName: newTask.customerName,
            newStatus: newTask.status,
            message: `[RULE 1 / N1 Enforced]: Lead dispatched exclusively to Task 1 & Task 2 staff: ${step1And2Names.join(', ')}.`,
            timestamp: Date.now(),
            projectNotification: ownerNotif,
            _nonce: `${Date.now()}-${Math.random()}`,
          };
          localStorage.setItem('dilip_crm_last_user_update_event', JSON.stringify(payload));
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('dilip_crm_realtime_events_channel');
            bc.postMessage(payload);
            bc.close();
          }
        } catch (e) {}
      } catch (routingErr) {
        console.warn('Failed to route owner lead creation directives:', routingErr);
      }

      setIsAddLeadOpen(false);
      setNewLeadForm({
        fullName: '',
        phone: '',
        email: '',
        location: 'Prayagraj',
        propertyType: 'Home / Residential',
        monthlyBillRs: '3500',
        desiredCapacityKw: '3',
        roofType: 'RCC Flat Roof',
        message: '',
        uppclAccountNumber: '',
        sanctionedLoadKw: '3',
        selectedTemplateId: 'tmpl-wf-residential-ongrid',
        step1UserIds: ['usr-emp-1', 'usr-emp-3'],
        step2UserIds: ['usr-emp-2'],
      });
      alert(`✅ [RULE 1 (N1) EXECUTED]: New lead "${createdRecord.fullName}" added successfully!\n\n📋 Lead details & initial notifications have been dispatched EXCLUSIVELY to Task 1 & Task 2 assigned staff.\n🔒 Task 3–7 staff access is locked.`);
    } catch (err) {
      console.error('Failed to save lead:', err);
      alert('Error creating lead.');
    }
  };

  // Add Work Progress Order
  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const item: WorkProgressItem = {
      id: `wp-${Date.now()}`,
      projectCode: `DE-2026-${String(workProgress.length + 85).padStart(3, '0')}`,
      clientName: newWork.clientName.trim(),
      phone: newWork.phone.trim(),
      address: newWork.address.trim(),
      capacityKw: Number(newWork.capacityKw) || 3,
      systemType: newWork.systemType,
      stage: newWork.stage,
      progressPercent: newWork.stage === 'Site Survey' ? 20 : newWork.stage === 'Commissioned' ? 100 : 50,
      assignedEngineer: newWork.assignedEngineer,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: newWork.targetDate || '2026-09-30',
      inverterBrand: newWork.inverterBrand,
      panelBrand: newWork.panelBrand,
      notes: newWork.notes.trim(),
    };
    setWorkProgress([item, ...workProgress]);
    setIsAddWorkOpen(false);
    setNewWork({
      clientName: '',
      phone: '',
      address: '',
      capacityKw: 3,
      systemType: 'On-Grid Rooftop',
      stage: 'Site Survey',
      assignedEngineer: 'Er. Devashish',
      targetDate: '',
      inverterBrand: 'Growatt Grid-Tie',
      panelBrand: 'Waaree Mono PERC',
      notes: '',
    });
    alert('New Work Order created successfully!');
  };

  // Add Daily Work Report
  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const report: WorkReportItem = {
      id: `rep-${Date.now()}`,
      date: newReport.date,
      engineerName: newReport.engineerName,
      clientOrSite: newReport.clientOrSite.trim(),
      workDone: newReport.workDone.trim(),
      uppclStatus: newReport.uppclStatus.trim(),
      materialsUsed: newReport.materialsUsed.trim() ? [newReport.materialsUsed.trim()] : [],
      nextDayPlan: newReport.nextDayPlan.trim(),
      status: 'Submitted',
    };
    setWorkReports([report, ...workReports]);
    setIsAddReportOpen(false);
    setNewReport({
      date: new Date().toISOString().split('T')[0],
      engineerName: 'Er. Devashish',
      clientOrSite: '',
      workDone: '',
      uppclStatus: '',
      materialsUsed: '',
      nextDayPlan: '',
    });
    alert('Daily Work Report logged successfully!');
  };

  // Add Staff User
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const staff: StaffUser = {
      id: `usr-${Date.now()}`,
      name: newStaff.name.trim(),
      role: newStaff.role,
      phone: newStaff.phone.trim(),
      email: newStaff.email.trim(),
      status: newStaff.status,
      joinDate: new Date().toISOString().split('T')[0],
    };
    setStaffUsers([...staffUsers, staff]);
    setIsAddUserOpen(false);
    setNewStaff({
      name: '',
      role: 'Solar Engineer',
      phone: '',
      email: '',
      status: 'Active',
    });
    alert('Staff member registered successfully!');
  };

  // Add Complaint Ticket
  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket: ComplaintTicket = {
      id: `comp-${Date.now()}`,
      ticketNo: `DE-SRV-${1026 + complaints.length}`,
      customerName: newComplaint.customerName.trim(),
      phone: newComplaint.phone.trim(),
      address: newComplaint.address.trim(),
      systemCapacity: newComplaint.systemCapacity,
      issueType: newComplaint.issueType,
      description: newComplaint.description.trim(),
      priority: newComplaint.priority,
      status: 'Open',
      assignedTo: newComplaint.assignedTo,
      createdAt: new Date().toLocaleString('en-IN'),
    };
    setComplaints([ticket, ...complaints]);
    setIsAddComplaintOpen(false);
    setNewComplaint({
      customerName: '',
      phone: '',
      address: '',
      systemCapacity: '3 kW',
      issueType: 'Inverter Error Code',
      description: '',
      priority: 'High',
      assignedTo: 'Er. Devashish',
    });
    alert('Service complaint ticket logged successfully!');
  };

  // Export Leads to CSV
  const exportLeadsCSV = () => {
    if (!leads.length) {
      alert('No leads to export.');
      return;
    }
    const headers = [
      'Lead ID',
      'Date',
      'Name',
      'Phone',
      'Location',
      'Property Type',
      'Bill (Rs)',
      'Capacity (kW)',
      'UPPCL Account',
      'Status',
    ];
    const rows = leads.map((l) => [
      l.id,
      new Date(l.createdAt).toLocaleDateString('en-IN'),
      `"${l.fullName.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.location.replace(/"/g, '""')}"`,
      `"${l.propertyType}"`,
      `"${l.monthlyBillRs}"`,
      `"${l.desiredCapacityKw}"`,
      `"${l.uppclAccountNumber || ''}"`,
      l.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dilip_enterprises_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.fullName.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.phone.includes(leadSearch) ||
      l.location.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.uppclAccountNumber && l.uppclAccountNumber.includes(leadSearch));
    const matchesStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Work Progress
  const filteredWork = workProgress.filter((w) => {
    const matchesSearch =
      w.clientName.toLowerCase().includes(workSearch.toLowerCase()) ||
      w.address.toLowerCase().includes(workSearch.toLowerCase()) ||
      w.projectCode.toLowerCase().includes(workSearch.toLowerCase());
    const matchesStage = workStageFilter === 'all' || w.stage === workStageFilter;
    return matchesSearch && matchesStage;
  });

  // Filtered Complaints
  const filteredComplaints = complaints.filter((c) => {
    if (complaintFilter === 'all') return true;
    return c.status === complaintFilter;
  });

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Top Banner */}
          <div className="bg-[#1a3882] p-6 text-white text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-3 text-slate-950 shadow-lg">
              <Sun className="w-9 h-9 animate-[spin_20s_linear_infinite]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-serif">DILIP ENTERPRISES</h1>
            <p className="text-xs text-blue-200 uppercase tracking-widest mt-0.5">
              Task Management & CRM Portal (TMS)
            </p>
            <div className="inline-block mt-3 bg-blue-900/60 border border-blue-400/30 text-blue-100 text-[11px] px-3 py-1 rounded-full">
              Prayagraj Solar Solutions • Internal Admin Access
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  User ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value="dilipenterprises"
                    readOnly
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-800"
                  />
                  <ShieldCheck className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Master Access PIN / Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter PIN (e.g. 2017)"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    autoFocus
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3882] focus:border-[#1a3882]"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                {pinError && <p className="text-xs text-rose-600 font-medium mt-1.5">{pinError}</p>}
                <p className="text-[11px] text-slate-600 mt-1">
                  Default access PIN: <strong className="text-slate-800">2017</strong> (or click instant login below)
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a3882] hover:bg-[#142c66] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Log In to TMS Dashboard</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthenticated(true);
                    sessionStorage.setItem('dilip_admin_auth', 'true');
                  }}
                  className="text-xs text-[#1a3882] hover:underline font-semibold cursor-pointer"
                >
                  ⚡ One-Click Instant Login (Owner Access)
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-200 text-center">
              <button
                onClick={() => onNavigate && onNavigate('home')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Solar Website</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN TMS DASHBOARD
  return (
    <div className="min-h-screen flex bg-slate-100 font-sans text-slate-800 antialiased">
      {/* ================= LEFT SIDEBAR (Navy Blue #1a3882) ================= */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#1a3882] text-white flex flex-col shrink-0 transition-all duration-300 z-30 shadow-xl border-r border-blue-900`}
      >
        {/* Brand / Top Portal Header */}
        <div className="p-4 border-b border-blue-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-md">
              <Sun className="w-6 h-6 animate-[spin_24s_linear_infinite]" />
            </div>
            {sidebarOpen && (
              <div className="truncate">
                <h2 className="text-sm font-black tracking-tight uppercase font-serif truncate">
                  DILIP ENTERPRISES
                </h2>
                <span className="text-[10px] text-blue-200 tracking-wider uppercase block">
                  Solar TMS & CRM
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-700 text-white shadow-inner font-bold'
                : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          {/* 2. Work Progress */}
          <button
            onClick={() => setActiveTab('work-progress')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'work-progress'
                ? 'bg-blue-700 text-white shadow-inner font-bold'
                : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
            }`}
            title="Work Progress"
          >
            <Activity className="w-4 h-4 shrink-0" />
            {sidebarOpen && (
              <div className="flex-1 flex items-center justify-between">
                <span>Work Progress</span>
                <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded text-[10px]">
                  {workProgress.length}
                </span>
              </div>
            )}
          </button>

          {/* 3. Work Report */}
          <button
            onClick={() => setActiveTab('work-report')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'work-report'
                ? 'bg-blue-700 text-white shadow-inner font-bold'
                : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
            }`}
            title="Work Report"
          >
            <FileBarChart className="w-4 h-4 shrink-0" />
            {sidebarOpen && (
              <div className="flex-1 flex items-center justify-between">
                <span>Work Report</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </div>
            )}
          </button>

          {/* 4. Manage Users */}
          <button
            onClick={() => setActiveTab('manage-users')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'manage-users'
                ? 'bg-blue-700 text-white shadow-inner font-bold'
                : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
            }`}
            title="Manage Users"
          >
            <Users className="w-4 h-4 shrink-0" />
            {sidebarOpen && (
              <div className="flex-1 flex items-center justify-between">
                <span>Manage Users</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </div>
            )}
          </button>

          {/* 5. Task Template */}
          <button
            onClick={() => setActiveTab('task-template')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'task-template'
                ? 'bg-blue-700 text-white shadow-inner font-bold'
                : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
            }`}
            title="Task Template"
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            {sidebarOpen && (
              <div className="flex-1 flex items-center justify-between">
                <span>Task Template</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </div>
            )}
          </button>

          {/* 6. Customer / Leads */}
          <button
            onClick={() => setActiveTab('customer-leads')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'customer-leads'
                ? 'bg-blue-700 text-white shadow-inner font-bold'
                : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
            }`}
            title="Customer / Leads"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            {sidebarOpen && (
              <div className="flex-1 flex items-center justify-between">
                <span>Customer / Leads</span>
                <span className="bg-emerald-400 text-slate-950 font-bold px-1.5 py-0.2 rounded text-[10px]">
                  {leads.length}
                </span>
              </div>
            )}
          </button>

          {/* 7. Complaint */}
          <button
            onClick={() => setActiveTab('complaint')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'complaint'
                ? 'bg-blue-700 text-white shadow-inner font-bold'
                : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
            }`}
            title="Complaint"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {sidebarOpen && (
              <div className="flex-1 flex items-center justify-between">
                <span>Complaint</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </div>
            )}
          </button>

          {/* 8. Logout */}
          <div className="pt-4 border-t border-blue-900/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-200 hover:bg-rose-900/40 hover:text-white transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4 shrink-0 text-rose-300" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </nav>

        {/* Bottom Shortcut: Back to Public Website */}
        <div className="p-3 bg-[#132961] border-t border-blue-900/80 text-xs">
          <button
            onClick={() => onNavigate && onNavigate('home')}
            className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            {sidebarOpen && <span>View Public Website</span>}
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Banner with Nature / Mountain Backdrop matching screenshot */}
        <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md">
          {/* Background image overlay of pine trees/mountains */}
          <div
            className="absolute inset-0 opacity-35 bg-cover bg-center mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')`,
            }}
          />

          <div className="relative z-10 px-6 py-4 flex items-center justify-between">
            {/* Left: Hamburger + Welcome text */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:text-amber-400 transition-colors p-1.5 rounded-md hover:bg-white/10 cursor-pointer"
                title="Toggle Sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
                  <span>Welcome back, dilipenterprises</span>
                </h1>
                <p className="text-xs text-blue-200">
                  Dilip Enterprises Solar Solutions Prayagraj • Task Management System
                </p>
              </div>
            </div>

            {/* Right: Level : Admin, Settings, Logout */}
            <div className="flex items-center gap-3">
              <div className="bg-black/40 backdrop-blur-sm border border-white/20 px-3 py-1 rounded text-xs font-bold tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Level : Admin</span>
              </div>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded hover:bg-white/10 text-white hover:text-amber-400 transition-colors cursor-pointer"
                title="Settings / Account Details"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded hover:bg-rose-600/30 text-white hover:text-rose-400 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ============================================================== */}
          {/* TAB 1: DASHBOARD (Matching User Screenshot Layout) */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Welcome Card (Exact text from screenshot) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
                  Welcome <span className="underline decoration-slate-400 underline-offset-4">Dilipenterprises</span>, Your session has been started.
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You can view Contents by using the links at the LEFT side of the page. If you want to change your own details (your User ID and password), click the Change Password link towards the top of the page.{' '}
                  <span className="text-rose-600 font-bold">
                    Security Tip : Please Log Out before closing the browser.
                  </span>
                </p>

                {/* Quick Action Buttons for Internal Work */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsAddWorkOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#1a3882] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ New Work Order</span>
                  </button>

                  <button
                    onClick={() => setIsAddReportOpen(true)}
                    className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow cursor-pointer transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>+ Submit Work Report</span>
                  </button>

                  <button
                    onClick={() => setIsAddLeadOpen(true)}
                    className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow cursor-pointer transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Add Walk-in Lead</span>
                  </button>

                  <button
                    onClick={() => setIsAddComplaintOpen(true)}
                    className="inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow cursor-pointer transition-all"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>+ Log Service Ticket</span>
                  </button>
                </div>
              </div>

              {/* KPI Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab('work-progress')}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Active Work Progress
                      </p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">
                        {workProgress.filter((w) => w.stage !== 'Commissioned').length} Sites
                      </h3>
                      <span className="text-[11px] text-blue-600 font-medium">
                        Total {workProgress.length} projects recorded
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('customer-leads')}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Customer Leads (CRM)
                      </p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">
                        {leads.length} Leads
                      </h3>
                      <span className="text-[11px] text-emerald-600 font-medium">
                        {leads.filter((l) => l.status === 'new').length} New Pending Action
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <UserPlus className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('work-report')}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Site Work Reports
                      </p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">
                        {workReports.length} Submitted
                      </h3>
                      <span className="text-[11px] text-amber-600 font-medium">
                        Daily engineer logs active
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileBarChart className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('complaint')}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-rose-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Customer Complaints
                      </p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">
                        {complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length} Open
                      </h3>
                      <span className="text-[11px] text-rose-600 font-medium">
                        {complaints.length} Total Service Tickets
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Login Details Table (From user's screenshot) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#1a3882]" />
                    <span>Last Login Details</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Auto-recorded session security log
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#23499d] text-white">
                        <th className="py-3 px-4 font-semibold border-r border-blue-900">Name of User</th>
                        <th className="py-3 px-4 font-semibold border-r border-blue-900">Last Login</th>
                        <th className="py-3 px-4 font-semibold border-r border-blue-900">Last IP</th>
                        <th className="py-3 px-4 font-semibold">OS/browser Information</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {loginDetails.map((log, idx) => (
                        <tr
                          key={log.id}
                          className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-slate-50/70 hover:bg-blue-50/50'}
                        >
                          <td className="py-3 px-4 font-medium text-slate-900 border-r border-slate-200">
                            {log.name}
                          </td>
                          <td className="py-3 px-4 text-slate-700 border-r border-slate-200">
                            {log.lastLogin}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 border-r border-slate-200">
                            {log.lastIp}
                          </td>
                          <td className="py-3 px-4 text-slate-700">{log.browserInfo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: WORK PROGRESS (Project Lifecycle & Installation Tracking) */}
          {/* ============================================================== */}
          {activeTab === 'work-progress' && (
            <div className="space-y-5 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#1a3882]" />
                    <span>Solar Installation Work Progress</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track site surveys, structure fabrication, UPPCL net-metering & commissioning.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddWorkOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#1a3882] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Work Order</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by client name, address, or code..."
                    value={workSearch}
                    onChange={(e) => setWorkSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={workStageFilter}
                    onChange={(e) => setWorkStageFilter(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="all">All Stages</option>
                    <option value="Site Survey">Site Survey</option>
                    <option value="Structure Fabrication">Structure Fabrication</option>
                    <option value="Panel Mounting & Wiring">Panel Mounting & Wiring</option>
                    <option value="Inverter & Earthing">Inverter & Earthing</option>
                    <option value="UPPCL Net Metering">UPPCL Net Metering</option>
                    <option value="Commissioned">Commissioned</option>
                  </select>
                </div>
              </div>

              {/* Projects Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#23499d] text-white">
                        <th className="py-3 px-4 font-semibold">Code / Client</th>
                        <th className="py-3 px-4 font-semibold">Site Address</th>
                        <th className="py-3 px-4 font-semibold">Capacity & Inverter</th>
                        <th className="py-3 px-4 font-semibold">Stage & Progress</th>
                        <th className="py-3 px-4 font-semibold">Engineer</th>
                        <th className="py-3 px-4 font-semibold">Target Date</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredWork.map((item, idx) => (
                        <tr
                          key={item.id}
                          className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50/40' : 'bg-slate-50/60 hover:bg-blue-50/40'}
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{item.clientName}</div>
                            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {item.projectCode}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div className="flex items-center gap-1 text-slate-800">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{item.address}</span>
                            </div>
                            <span className="text-[11px] text-slate-500">{item.phone}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-amber-700">{item.capacityKw} kW {item.systemType}</div>
                            <span className="text-[11px] text-slate-600">{item.inverterBrand}</span>
                          </td>
                          <td className="py-3 px-4 min-w-[170px]">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-semibold text-slate-800">{item.stage}</span>
                              <span className="font-bold text-[#1a3882]">{item.progressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.stage === 'Commissioned'
                                    ? 'bg-emerald-600'
                                    : item.progressPercent > 70
                                    ? 'bg-blue-600'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${item.progressPercent}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {item.assignedEngineer}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {item.targetDate}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedWorkItem(item)}
                              className="text-xs bg-slate-100 hover:bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded cursor-pointer transition-colors"
                            >
                              View / Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredWork.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                            No work progress records found. Click "+ New Work Order" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: WORK REPORT (Field Technicians Daily Log) */}
          {/* ============================================================== */}
          {activeTab === 'work-report' && (
            <div className="space-y-5 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileBarChart className="w-5 h-5 text-[#1a3882]" />
                    <span>Daily Field Work Reports</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Technician site logs, UPPCL liaison remarks, materials used & next-day schedules.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddReportOpen(true)}
                    className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit Work Report</span>
                  </button>
                </div>
              </div>

              {/* Reports Grid / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#1a3882]" />
                          <span>{report.date}</span>
                        </span>
                        <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {report.status}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Engineer: {report.engineerName}</span>
                      </div>

                      <div className="text-xs font-bold text-amber-700 mb-2">
                        Site: {report.clientOrSite}
                      </div>

                      <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div>
                          <strong className="text-slate-900 block mb-0.5">Work Done:</strong>
                          <p className="leading-relaxed">{report.workDone}</p>
                        </div>
                        {report.uppclStatus && (
                          <div>
                            <strong className="text-slate-900 block mb-0.5">UPPCL Status:</strong>
                            <p className="text-blue-900">{report.uppclStatus}</p>
                          </div>
                        )}
                        {report.materialsUsed && (
                          <div>
                            <strong className="text-slate-900 block mb-0.5">Materials Consumed:</strong>
                            <p className="text-slate-600">{report.materialsUsed}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Next Plan: {report.nextDayPlan || 'Continue mounting'}</span>
                      <button
                        onClick={() => {
                          setWorkReports(workReports.filter((r) => r.id !== report.id));
                        }}
                        className="text-rose-600 hover:text-rose-800 cursor-pointer"
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: MANAGE USERS (Staff & Field Engineers) */}
          {/* ============================================================== */}
          {activeTab === 'manage-users' && (
            <div className="space-y-5 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#1a3882]" />
                    <span>Internal Staff & Solar Engineers</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage team roles, contact information, and access credentials.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => setIsAddUserOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#1a3882] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Staff Member</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#23499d] text-white">
                      <th className="py-3 px-4 font-semibold">Name</th>
                      <th className="py-3 px-4 font-semibold">Designation / Role</th>
                      <th className="py-3 px-4 font-semibold">Contact Phone</th>
                      <th className="py-3 px-4 font-semibold">Email</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {staffUsers.map((user, idx) => (
                      <tr
                        key={user.id}
                        className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50/40' : 'bg-slate-50/60 hover:bg-blue-50/40'}
                      >
                        <td className="py-3 px-4 font-bold text-slate-900">{user.name}</td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-50 text-[#1a3882] border border-blue-200 px-2 py-0.5 rounded font-medium text-[11px]">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{user.phone}</td>
                        <td className="py-3 px-4 text-slate-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              user.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : user.status === 'On Site'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`tel:${user.phone.replace(/[^0-9+]/g, '')}`}
                            className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded hover:bg-emerald-100 font-semibold"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: TASK TEMPLATE (Standard Operating Procedures) */}
          {/* ============================================================== */}
          {activeTab === 'task-template' && (
            <div className="space-y-5 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-[#1a3882]" />
                    <span>Solar Installation Task Templates & SOPs</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Standard operational checklists for residential, commercial & solar pump installations.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {taskTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {tmpl.category}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ~{tmpl.estimatedDays} Days
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-2">{tmpl.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tmpl.description}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Standard Steps ({tmpl.steps.length}):
                        </h4>
                        <ol className="space-y-1.5 text-xs text-slate-700 list-decimal pl-4">
                          {tmpl.steps.slice(0, 5).map((step, i) => (
                            <li key={i} className="leading-snug">
                              {step}
                            </li>
                          ))}
                          {tmpl.steps.length > 5 && (
                            <li className="text-blue-700 font-semibold list-none -ml-4 pt-1">
                              + {tmpl.steps.length - 5} more steps in full checklist
                            </li>
                          )}
                        </ol>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTemplate(tmpl)}
                      className="w-full bg-slate-100 hover:bg-[#1a3882] hover:text-white text-slate-800 text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      View Full Checklist
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: CUSTOMER / LEADS (Live CRM Lead Database) */}
          {/* ============================================================== */}
          {activeTab === 'customer-leads' && (
            <div className="space-y-5 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#1a3882]" />
                    <span>Customer Leads & Inquiries (CRM)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live database connected to website quotes, bill uploads, subsidy calculations & direct walk-ins.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={loadLeads}
                    disabled={leadsLoading}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${leadsLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={exportLeadsCSV}
                    className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setIsAddLeadOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-[#1a3882] hover:bg-blue-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Walk-in Lead</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by customer name, phone, town, or UPPCL account..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="all">All Statuses ({leads.length})</option>
                    <option value="new">New ({leads.filter((l) => l.status === 'new').length})</option>
                    <option value="contacted">Contacted</option>
                    <option value="survey_scheduled">Survey Scheduled</option>
                    <option value="installed">Installed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Leads Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#23499d] text-white">
                        <th className="py-3 px-4 font-semibold">Date & Customer</th>
                        <th className="py-3 px-4 font-semibold">Phone & Location</th>
                        <th className="py-3 px-4 font-semibold">Capacity & Bill</th>
                        <th className="py-3 px-4 font-semibold">UPPCL / Document</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredLeads.map((lead, idx) => {
                        const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
                        const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                        return (
                          <tr
                            key={lead.id}
                            className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50/40' : 'bg-slate-50/60 hover:bg-blue-50/40'}
                          >
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{lead.fullName}</div>
                              <span className="text-[11px] text-slate-500">
                                {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">{lead.phone}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{lead.location}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                {lead.desiredCapacityKw} kW
                              </span>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                Bill: ₹{Number(lead.monthlyBillRs || 0).toLocaleString('en-IN')}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {lead.uppclAccountNumber ? (
                                <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                                  Acc: {lead.uppclAccountNumber}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">N/A</span>
                              )}
                              {lead.billFileData && (
                                <button
                                  onClick={() => setSelectedLead(lead)}
                                  className="block text-[11px] text-blue-700 hover:underline font-semibold mt-0.5"
                                >
                                  📄 View Attached Bill
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={lead.status}
                                onChange={(e) =>
                                  handleLeadStatusChange(
                                    lead.id,
                                    e.target.value as any
                                  )
                                }
                                className={`text-xs font-bold px-2 py-1 rounded border ${
                                  lead.status === 'new'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : lead.status === 'contacted'
                                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                                    : lead.status === 'survey_scheduled'
                                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                                    : lead.status === 'installed'
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : 'bg-slate-100 text-slate-700 border-slate-300'
                                }`}
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="survey_scheduled">Survey Scheduled</option>
                                <option value="installed">Installed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <a
                                href={`tel:${cleanPhone}`}
                                className="inline-flex items-center justify-center w-7 h-7 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                title="Call Customer"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                                  `नमस्ते ${lead.fullName} जी! दिलीप एंटरप्राइजेज सोलर सॉल्यूशंस (प्रयागराज) से आपका स्वागत है। आपके ${lead.desiredCapacityKw}kW सोलर रूफटॉप के संबंध में संपर्क कर रहे हैं।`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-7 h-7 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => setSelectedLead(lead)}
                                className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-800"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.id, lead.fullName)}
                                className="inline-flex items-center justify-center w-7 h-7 rounded bg-rose-50 text-rose-600 hover:bg-rose-100"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredLeads.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                            No customer leads found matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: COMPLAINT (After-Sales Support & Service Ticketing) */}
          {/* ============================================================== */}
          {activeTab === 'complaint' && (
            <div className="space-y-5 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#1a3882]" />
                    <span>Customer Service & Solar Complaints</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Inverter fault codes, generation drop, net-metering billing disputes & AMC ticketing.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddComplaintOpen(true)}
                    className="inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log New Service Ticket</span>
                  </button>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700">Filter Status:</span>
                {(['all', 'Open', 'In Progress', 'Resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setComplaintFilter(st)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      complaintFilter === st
                        ? 'bg-[#1a3882] text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'All Tickets' : st}
                  </button>
                ))}
              </div>

              {/* Tickets Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#23499d] text-white">
                      <th className="py-3 px-4 font-semibold">Ticket # & Date</th>
                      <th className="py-3 px-4 font-semibold">Customer & System</th>
                      <th className="py-3 px-4 font-semibold">Issue Type & Description</th>
                      <th className="py-3 px-4 font-semibold">Assigned To</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredComplaints.map((ticket, idx) => (
                      <tr
                        key={ticket.id}
                        className={idx % 2 === 0 ? 'bg-white hover:bg-rose-50/30' : 'bg-slate-50/60 hover:bg-rose-50/30'}
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {ticket.ticketNo}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-1">{ticket.createdAt}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{ticket.customerName}</div>
                          <span className="text-[11px] text-slate-600">{ticket.phone}</span>
                          <div className="text-[11px] text-amber-700 font-semibold">{ticket.systemCapacity}</div>
                        </td>
                        <td className="py-3 px-4 max-w-md">
                          <span className="font-bold text-slate-900 block">{ticket.issueType}</span>
                          <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
                            {ticket.description}
                          </p>
                          {ticket.resolutionNotes && (
                            <div className="mt-1.5 p-2 bg-emerald-50 rounded border border-emerald-200 text-[11px] text-emerald-800">
                              <strong>Resolution:</strong> {ticket.resolutionNotes}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {ticket.assignedTo}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={ticket.status}
                            onChange={(e) => {
                              const newSt = e.target.value as any;
                              setComplaints(
                                complaints.map((c) =>
                                  c.id === ticket.id ? { ...c, status: newSt } : c
                                )
                              );
                            }}
                            className={`text-xs font-bold px-2 py-1 rounded border ${
                              ticket.status === 'Open'
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : ticket.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`tel:${ticket.phone.replace(/[^0-9+]/g, '')}`}
                            className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-100 font-semibold"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                    {filteredComplaints.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                          No service complaints found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: ADD NEW WORK ORDER ================= */}
      {isAddWorkOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#1a3882]" />
                <span>Create New Solar Installation Order</span>
              </h3>
              <button
                onClick={() => setIsAddWorkOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra Verma"
                  value={newWork.clientName}
                  onChange={(e) => setNewWork({ ...newWork, clientName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98390..."
                    value={newWork.phone}
                    onChange={(e) => setNewWork({ ...newWork, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Capacity (kW) *</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    step="0.5"
                    required
                    value={newWork.capacityKw}
                    onChange={(e) => setNewWork({ ...newWork, capacityKw: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Site Address in Prayagraj *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 15, Near Medical College, Lowther Road"
                  value={newWork.address}
                  onChange={(e) => setNewWork({ ...newWork, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Type</label>
                  <select
                    value={newWork.systemType}
                    onChange={(e) => setNewWork({ ...newWork, systemType: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="On-Grid Rooftop">On-Grid Rooftop</option>
                    <option value="Hybrid Solar">Hybrid Solar</option>
                    <option value="Off-Grid">Off-Grid</option>
                    <option value="Solar Pump">Solar Pump</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Stage</label>
                  <select
                    value={newWork.stage}
                    onChange={(e) => setNewWork({ ...newWork, stage: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="Site Survey">Site Survey</option>
                    <option value="Structure Fabrication">Structure Fabrication</option>
                    <option value="Panel Mounting & Wiring">Panel Mounting & Wiring</option>
                    <option value="Inverter & Earthing">Inverter & Earthing</option>
                    <option value="UPPCL Net Metering">UPPCL Net Metering</option>
                    <option value="Commissioned">Commissioned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Solar Engineer</label>
                  <select
                    value={newWork.assignedEngineer}
                    onChange={(e) => setNewWork({ ...newWork, assignedEngineer: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="Er. Devashish">Er. Devashish (Lead Engineer)</option>
                    <option value="Amit Patel">Amit Patel (Fabrication In-charge)</option>
                    <option value="Priya Sharma">Priya Sharma (Subsidy/Liaison)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Handover Date</label>
                  <input
                    type="date"
                    value={newWork.targetDate}
                    onChange={(e) => setNewWork({ ...newWork, targetDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Site Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 3-phase connection required, south-facing shadow-free RCC roof."
                  value={newWork.notes}
                  onChange={(e) => setNewWork({ ...newWork, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddWorkOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1a3882] hover:bg-blue-900 rounded-lg shadow cursor-pointer"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SUBMIT WORK REPORT ================= */}
      {isAddReportOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-emerald-700" />
                <span>Submit Daily Field Work Report</span>
              </h3>
              <button
                onClick={() => setIsAddReportOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newReport.date}
                    onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Engineer / Technician *</label>
                  <select
                    value={newReport.engineerName}
                    onChange={(e) => setNewReport({ ...newReport, engineerName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="Er. Devashish">Er. Devashish</option>
                    <option value="Amit Patel">Amit Patel</option>
                    <option value="Priya Sharma">Priya Sharma</option>
                    <option value="Dilip Enterprises">Dilip Enterprises</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Site / Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Alok Verma, Lowther Road"
                  value={newReport.clientOrSite}
                  onChange={(e) => setNewReport({ ...newReport, clientOrSite: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Done Today *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed work completed on roof, structure, wiring, or inverter..."
                  value={newReport.workDone}
                  onChange={(e) => setNewReport({ ...newReport, workDone: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">UPPCL / Discom Liaison Status</label>
                <input
                  type="text"
                  placeholder="e.g. Net meter inspection fee deposited at Kalyani Devi sub-division."
                  value={newReport.uppclStatus}
                  onChange={(e) => setNewReport({ ...newReport, uppclStatus: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Materials Used</label>
                  <input
                    type="text"
                    placeholder="e.g. 20m 4sqmm DC cable, 4 MC4"
                    value={newReport.materialsUsed}
                    onChange={(e) => setNewReport({ ...newReport, materialsUsed: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Next Day Plan</label>
                  <input
                    type="text"
                    placeholder="e.g. Inverter earthing testing"
                    value={newReport.nextDayPlan}
                    onChange={(e) => setNewReport({ ...newReport, nextDayPlan: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddReportOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow cursor-pointer"
                >
                  Submit Daily Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD WALK-IN LEAD ================= */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1a3882]" />
                <span>Add Walk-in / Phone Customer Lead</span>
              </h3>
              <button
                onClick={() => setIsAddLeadOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Chandra"
                  value={newLeadForm.fullName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9415..."
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Town / Area in Prayagraj *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Naini, Jhunsi, Civil Lines"
                    value={newLeadForm.location}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, location: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Desired Capacity (kW)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newLeadForm.desiredCapacityKw}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, desiredCapacityKw: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Bill (₹)</label>
                  <input
                    type="number"
                    placeholder="3500"
                    value={newLeadForm.monthlyBillRs}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, monthlyBillRs: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={newLeadForm.propertyType}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, propertyType: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="Home / Residential">Home / Residential</option>
                    <option value="Housing Society">Housing Society</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Agriculture / Farm">Agriculture / Farm</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Roof Type</label>
                  <select
                    value={newLeadForm.roofType}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, roofType: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="RCC Flat Roof">RCC Flat Roof</option>
                    <option value="Tin / Metal Sheet">Tin / Metal Sheet</option>
                    <option value="Ground Mount">Ground Mount</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">UPPCL 10-Digit Account No.</label>
                <input
                  type="text"
                  placeholder="e.g. 7218492019"
                  value={newLeadForm.uppclAccountNumber}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, uppclAccountNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Requirement</label>
                <textarea
                  rows={2}
                  placeholder="Customer visited Kydganj office inquiring for 3kW PM Surya Ghar subsidy."
                  value={newLeadForm.message}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, message: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>

              {/* SUPER ADMIN TASK & USER COMMAND (Rule 1 / N1 SOP) */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#1a3882]">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Super Admin Task & User Command (Rule 1 / N1)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Strict SOP Routing
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Super Admin command is final. Whichever user is appointed to Task 1 & Task 2 will exclusively receive this project, notifications, and permission to update status.
                </p>

                {/* Select Workflow Template (Compulsory) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-xs text-[#1a3882]">
                      Workflow SOP Template * (Compulsory)
                    </label>
                    <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                      Compulsory
                    </span>
                  </div>
                  <select
                    required
                    value={newLeadForm.selectedTemplateId}
                    onChange={(e) => handleLeadTemplateChange(e.target.value)}
                    className="w-full border-2 border-blue-600 bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  >
                    <option value="" disabled>-- Select Task Workflow Template (Compulsory) --</option>
                    {workflowTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.steps.length} Steps • {t.category})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Har project ke liye task users alag alag nahi honge — is Task Template me jo task users set hain, wahi is project me automatically appoint ho jaenge.
                  </p>
                </div>

                {/* Active Template Appointed Staff Preview */}
                {(() => {
                  const activeTmpl = workflowTemplates.find((t) => t.id === newLeadForm.selectedTemplateId) || workflowTemplates[0];
                  if (!activeTmpl) return null;
                  return (
                    <div className="bg-white rounded-xl p-3 border border-blue-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="font-bold text-slate-800 text-[11px]">
                          Template: <strong>{activeTmpl.title}</strong>
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {activeTmpl.steps.length} Sequential Tasks
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {activeTmpl.steps.map((st) => {
                          const uNames = (st.assignedUserIds || []).map((uid) => staffUsers.find((u) => u.id === uid)?.name || uid);
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
                    </div>
                  );
                })()}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1a3882] hover:bg-blue-900 rounded-lg shadow cursor-pointer"
                >
                  Save to CRM Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD COMPLAINT ================= */}
      {isAddComplaintOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-700" />
                <span>Log Customer Service Ticket / Complaint</span>
              </h3>
              <button
                onClick={() => setIsAddComplaintOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Jaiswal"
                  value={newComplaint.customerName}
                  onChange={(e) => setNewComplaint({ ...newComplaint, customerName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-rose-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9415..."
                    value={newComplaint.phone}
                    onChange={(e) => setNewComplaint({ ...newComplaint, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Capacity</label>
                  <input
                    type="text"
                    placeholder="3 kW On-Grid"
                    value={newComplaint.systemCapacity}
                    onChange={(e) => setNewComplaint({ ...newComplaint, systemCapacity: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Type *</label>
                <select
                  value={newComplaint.issueType}
                  onChange={(e) => setNewComplaint({ ...newComplaint, issueType: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                >
                  <option value="Inverter Error Code">Inverter Error Code</option>
                  <option value="Low Daily Generation">Low Daily Generation</option>
                  <option value="UPPCL Net Meter Reading Mismatch">UPPCL Net Meter Reading Mismatch</option>
                  <option value="Wiring / MC4 / Earthing Issue">Wiring / MC4 / Earthing Issue</option>
                  <option value="General Maintenance / Cleaning">General Maintenance / Cleaning</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe error symptoms, LED blinking, or customer feedback..."
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-rose-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newComplaint.priority}
                    onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="High">High (Immediate site visit)</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign Technician</label>
                  <select
                    value={newComplaint.assignedTo}
                    onChange={(e) => setNewComplaint({ ...newComplaint, assignedTo: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="Er. Devashish">Er. Devashish</option>
                    <option value="Amit Patel">Amit Patel</option>
                    <option value="Priya Sharma">Priya Sharma</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddComplaintOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow cursor-pointer"
                >
                  Log Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD STAFF ================= */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1a3882]" />
                <span>Add Internal Team Member</span>
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikas Gupta"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role / Designation *</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                >
                  <option value="Solar Engineer">Solar Engineer</option>
                  <option value="Installation Technician">Installation Technician</option>
                  <option value="Documentation & Subsidy Desk">Documentation & Subsidy Desk</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9415..."
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="vikas@dilipenterprises.in"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1a3882] hover:bg-blue-900 rounded-lg shadow cursor-pointer"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW LEAD & ATTACHED BILL ================= */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedLead.fullName}</h3>
                <span className="text-xs text-slate-500">
                  Lead received on {new Date(selectedLead.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500 block">Phone:</span>
                  <span className="font-bold text-slate-900">{selectedLead.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location:</span>
                  <span className="font-bold text-slate-900">{selectedLead.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Property Type:</span>
                  <span className="font-bold text-slate-900">{selectedLead.propertyType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Roof Type:</span>
                  <span className="font-bold text-slate-900">{selectedLead.roofType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Desired Capacity:</span>
                  <span className="font-bold text-amber-700">{selectedLead.desiredCapacityKw} kW</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Monthly Electricity Bill:</span>
                  <span className="font-bold text-slate-900">
                    ₹{Number(selectedLead.monthlyBillRs || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">UPPCL 10-Digit Account:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedLead.uppclAccountNumber || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sanctioned Load:</span>
                  <span className="font-bold text-slate-900">
                    {selectedLead.sanctionedLoadKw ? `${selectedLead.sanctionedLoadKw} kW` : 'Not provided'}
                  </span>
                </div>
              </div>

              {selectedLead.message && (
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <span className="font-bold text-blue-900 block mb-1">Customer Message / Remarks:</span>
                  <p className="text-slate-700 leading-relaxed">{selectedLead.message}</p>
                </div>
              )}

              {/* Uploaded Bill View */}
              {selectedLead.billFileData ? (
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span>Uploaded UPPCL Electricity Bill: {selectedLead.billFileName}</span>
                  </span>
                  {selectedLead.billFileType?.includes('image') ? (
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white p-2">
                      <img
                        src={selectedLead.billFileData}
                        alt="Customer UPPCL Bill"
                        className="max-h-72 w-full object-contain rounded"
                      />
                    </div>
                  ) : (
                    <a
                      href={selectedLead.billFileData}
                      download={selectedLead.billFileName || 'uppcl_bill.pdf'}
                      className="inline-flex items-center gap-2 bg-[#1a3882] text-white px-3 py-1.5 rounded text-xs font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Bill File</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic">
                  No electricity bill file uploaded with this lead.
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Status:</span>
                  <select
                    value={selectedLead.status}
                    onChange={(e) =>
                      handleLeadStatusChange(selectedLead.id, e.target.value as any)
                    }
                    className="border border-slate-300 rounded px-2 py-1 bg-white font-bold"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="survey_scheduled">Survey Scheduled</option>
                    <option value="installed">Installed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedLead.phone.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded font-bold hover:bg-emerald-700"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded font-semibold hover:bg-slate-200 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW TASK TEMPLATE CHECKLIST ================= */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  {selectedTemplate.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedTemplate.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">{selectedTemplate.description}</p>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                Sequential SOP Checklist ({selectedTemplate.steps.length} Steps):
              </h4>
              {selectedTemplate.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80"
                >
                  <span className="w-5 h-5 rounded-full bg-[#1a3882] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 leading-relaxed font-medium">{step}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-right">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 bg-[#1a3882] text-white rounded-lg text-xs font-bold hover:bg-blue-900 cursor-pointer"
              >
                Close Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SETTINGS / MY ACCOUNT ================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#1a3882]" />
                <span>Admin TMS Account & Settings</span>
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">User ID:</span>
                  <span className="font-bold text-slate-900">dilipenterprises</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Access Level:</span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    Admin (Super Owner)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Default Master PIN:</span>
                  <span className="font-mono font-bold text-slate-900">2017</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Registered Office:</span>
                  <span className="text-slate-800 text-right">Kydganj, Prayagraj, UP</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-slate-800">
                <strong className="block text-amber-900 mb-1">Company Contact Information:</strong>
                <p>Phone: {COMPANY_INFO.phone}</p>
                <p>Email: {COMPANY_INFO.email}</p>
                <p className="mt-1 text-[11px] text-slate-600">
                  PM Surya Ghar Muft Bijli Yojana & UPNEDA Authorized Vendor
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Log Out of Session
                </button>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-[#1a3882] text-white rounded-lg font-bold text-xs hover:bg-blue-900 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
