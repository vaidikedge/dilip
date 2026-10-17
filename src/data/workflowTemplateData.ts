import { CrmUser, INITIAL_CRM_USERS } from './crmData';

export type WorkflowStepStatus = 'not started' | 'in progress' | 'pending' | 'on hold' | 'compleated';

export const WORKFLOW_STATUS_CONFIG: Record<
  WorkflowStepStatus,
  { label: string; stepNumber: number; bg: string; text: string; border: string; dot: string }
> = {
  'not started': {
    label: '1. Not Started',
    stepNumber: 1,
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  'in progress': {
    label: '2. In Progress',
    stepNumber: 2,
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700/60',
    dot: 'bg-amber-500',
  },
  pending: {
    label: '3. Pending',
    stepNumber: 3,
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700/60',
    dot: 'bg-blue-500',
  },
  'on hold': {
    label: '4. On Hold',
    stepNumber: 4,
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700/60',
    dot: 'bg-rose-500',
  },
  compleated: {
    label: '5. Completed',
    stepNumber: 5,
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
  },
};

export interface WorkflowTemplateStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  assignedUserIds: string[]; // Owner can assign multiple users to each step
  assignedUserNames?: string[];
  estimatedDays?: number;
}

export interface TaskWorkflowTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: WorkflowTemplateStep[];
  createdAt: string;
  updatedAt: string;
}

export interface StepUpdateHistoryItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole?: string;
  previousStatus: WorkflowStepStatus;
  newStatus: WorkflowStepStatus;
  workDescription: string;
}

export interface ActiveWorkflowStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  assignedUserIds: string[];
  assignedUserNames: string[];
  status: WorkflowStepStatus;
  isNotified: boolean; // True if this step is currently in the active notification flow
  notifiedAt?: string;
  lastUpdatedAt?: string;
  lastUpdatedByUserId?: string;
  lastUpdatedByName?: string;
  lastWorkDescription?: string;
  history: StepUpdateHistoryItem[];
  // Owner Supremacy (Master Override) fields
  isOwnerOverride?: boolean;
  ownerOverrideBy?: string;
  ownerOverrideAt?: string;
  ownerOverrideMessage?: string;
  lockedAgainstStaffModification?: boolean;
}

export interface ActiveLeadWorkflow {
  id: string;
  leadId?: string;
  taskId?: string;
  templateId: string;
  templateTitle: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  capacityKw?: number;
  currentActiveFlowStepNumbers: number[]; // e.g. initially [1, 2], cascades to [2, 3], [3, 4], [4, 5]
  notifiedSteps?: number[]; // Synchronized alias for active notified step numbers
  steps: ActiveWorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_TASK_WORKFLOW_TEMPLATES: TaskWorkflowTemplate[] = [
  {
    id: 'tmpl-wf-solar-rooftop',
    title: 'Residential On-Grid Rooftop Solar EPC (7-Step Flow)',
    category: 'Residential Solar',
    description: 'Complete 7-step turnkey workflow from initial lead qualification to UPPCL net meter and DBT subsidy.',
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Customer Verification & Sanction Load Check',
        description: 'Verify phone number, check electricity bill, verify consumer account number and connected load.',
        assignedUserIds: ['usr-emp-1', 'usr-emp-3'],
        assignedUserNames: ['Er. Devashish', 'Priya Sharma'],
        estimatedDays: 1,
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Physical Site Survey & Shadow Analysis',
        description: 'Inspect RCC roof, azimuth angle, measure 100 sqft/kW area, check south orientation & take photos.',
        assignedUserIds: ['usr-emp-2'],
        assignedUserNames: ['Amit Patel'],
        estimatedDays: 2,
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Quotation, Contract & Portal Registration',
        description: 'Submit formal BOM quote, collect token advance, upload application on PM Surya Ghar portal.',
        assignedUserIds: ['usr-emp-4', 'usr-emp-3'],
        assignedUserNames: ['Vikas Yadav', 'Priya Sharma'],
        estimatedDays: 2,
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Hot-Dip Structure Fabrication & Anchoring',
        description: 'Galvanized structure mounting, Hilti anchor chemical fastener grouting, torque inspection.',
        assignedUserIds: ['usr-emp-4', 'usr-emp-2'],
        assignedUserNames: ['Vikas Yadav', 'Amit Patel'],
        estimatedDays: 2,
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Bifacial Solar Module Mounting & DC Wiring',
        description: 'Mount DCR Mono PERC modules, run UV-resistant DC solar cable, configure string voltage.',
        assignedUserIds: ['usr-emp-1'],
        assignedUserNames: ['Er. Devashish'],
        estimatedDays: 1,
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Inverter Installation & 3-Pit Chemical Earthing',
        description: 'Mount on-grid solar inverter, dual DC/AC SPD Type-II boxes, 3-pit chemical earthing with ESE LA.',
        assignedUserIds: ['usr-emp-2'],
        assignedUserNames: ['Amit Patel'],
        estimatedDays: 1,
      },
      {
        id: 'step-7',
        stepNumber: 7,
        title: 'UPPCL Net-Metering, Inspection & DBT Subsidy',
        description: 'Substation JE liaison, install bi-directional smart meter, upload geo-tagged photo for direct DBT subsidy.',
        assignedUserIds: ['usr-emp-4'],
        assignedUserNames: ['Vikas Yadav'],
        estimatedDays: 3,
      },
    ],
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'tmpl-wf-commercial-ht',
    title: 'Commercial & Industrial HT Solar EPC (6-Step Flow)',
    category: 'Commercial Solar',
    description: 'High tension grid-tied solar project workflow for industrial factories, hospitals, and cold storages.',
    steps: [
      {
        id: 'step-c1',
        stepNumber: 1,
        title: 'HT Feasibility & Structural Load Analysis',
        description: 'Shed truss load calculation, HT line clearance check, UP Electricity Inspectorate guidelines review.',
        assignedUserIds: ['usr-emp-1', 'usr-emp-3'],
        assignedUserNames: ['Er. Devashish', 'Priya Sharma'],
        estimatedDays: 3,
      },
      {
        id: 'step-c2',
        stepNumber: 2,
        title: 'Electrical Drawings & CEIG Clearance Liaison',
        description: 'Prepare single-line diagram (SLD), protection relay schemes, and file CEIG UP application.',
        assignedUserIds: ['usr-emp-2'],
        assignedUserNames: ['Amit Patel'],
        estimatedDays: 4,
      },
      {
        id: 'step-c3',
        stepNumber: 3,
        title: 'Walkways, Cable Trays & Mounting Structure',
        description: 'Install aluminum maintenance walkways, heavy-duty cable trays, and rail clamps.',
        assignedUserIds: ['usr-emp-4'],
        assignedUserNames: ['Vikas Yadav'],
        estimatedDays: 4,
      },
      {
        id: 'step-c4',
        stepNumber: 4,
        title: 'String Inverters & HT Switchgear Synchronisation',
        description: 'Install 50kW+ multi-MPPT inverters, VCB/ACB protection breaker panel, RS485 SCADA monitoring.',
        assignedUserIds: ['usr-emp-1', 'usr-emp-4'],
        assignedUserNames: ['Er. Devashish', 'Vikas Yadav'],
        estimatedDays: 3,
      },
      {
        id: 'step-c5',
        stepNumber: 5,
        title: 'Transformer Interconnection & CT/PT Metering',
        description: 'Interconnect step-up transformer, high-accuracy CT/PT net meter testing with Discom executive engineer.',
        assignedUserIds: ['usr-emp-3'],
        assignedUserNames: ['Priya Sharma'],
        estimatedDays: 2,
      },
      {
        id: 'step-c6',
        stepNumber: 6,
        title: 'Commercial Commissioning & Handover PR Test',
        description: 'Perform Performance Ratio (PR) test, sign commercial handover certificate, configure telemetry dashboard.',
        assignedUserIds: ['usr-emp-1'],
        assignedUserNames: ['Er. Devashish'],
        estimatedDays: 2,
      },
    ],
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-08-05T10:00:00Z',
  },
  {
    id: 'tmpl-wf-solar-pump',
    title: 'PM-KUSUM Solar Water Pump Scheme (5-Step Flow)',
    category: 'Agricultural Solar',
    description: 'Agricultural solar water pumping installation for farmers under state agriculture subsidy.',
    steps: [
      {
        id: 'step-p1',
        stepNumber: 1,
        title: 'Borewell GPM & Water Table Depth Test',
        description: 'Test static water table depth, dynamic discharge, farmer land title verification.',
        assignedUserIds: ['usr-emp-1', 'usr-emp-3'],
        assignedUserNames: ['Er. Devashish', 'Priya Sharma'],
        estimatedDays: 1,
      },
      {
        id: 'step-p2',
        stepNumber: 2,
        title: 'Foundation & Dual-Axis Tracker / Structure Erection',
        description: 'Cast concrete pillar foundation, mount manual or seasonal tracking solar structure.',
        assignedUserIds: ['usr-emp-2'],
        assignedUserNames: ['Amit Patel'],
        estimatedDays: 2,
      },
      {
        id: 'step-p3',
        stepNumber: 3,
        title: 'Submersible Pump Lowering & High-Head Piping',
        description: 'Lower 3HP/5HP/7.5HP SS-304 submersible pump with HDPE column pipes and safety rope.',
        assignedUserIds: ['usr-emp-4'],
        assignedUserNames: ['Vikas Yadav'],
        estimatedDays: 1,
      },
      {
        id: 'step-p4',
        stepNumber: 4,
        title: 'VFD Solar Controller & Lightning Protection',
        description: 'Connect MPPT solar pump VFD drive, dry run sensor, and dedicated copper earthing.',
        assignedUserIds: ['usr-emp-1', 'usr-emp-2'],
        assignedUserNames: ['Er. Devashish', 'Amit Patel'],
        estimatedDays: 1,
      },
      {
        id: 'step-p5',
        stepNumber: 5,
        title: 'Department Inspection, Discharge Audit & Handover',
        description: 'Agriculture department official inspection, measure LPM water discharge, handover token receipt.',
        assignedUserIds: ['usr-emp-3'],
        assignedUserNames: ['Priya Sharma'],
        estimatedDays: 2,
      },
    ],
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-10T10:00:00Z',
  },
];

// Initial demo lead workflow instances showing the 2-step flow chart in action
export const INITIAL_ACTIVE_LEAD_WORKFLOWS: ActiveLeadWorkflow[] = [
  {
    id: 'lead-wf-ritika',
    leadId: 'lead-ritika',
    taskId: 'task-ritika',
    templateId: 'tmpl-wf-solar-rooftop',
    templateTitle: 'Residential On-Grid Rooftop Solar EPC (7-Step Flow)',
    customerName: 'Ritika',
    customerPhone: '+91 98394 55120',
    customerAddress: 'Tagore Town, Prayagraj',
    capacityKw: 5,
    currentActiveFlowStepNumbers: [1, 2], // Task 1 and 2 initially have notifications
    notifiedSteps: [1, 2],
    steps: [
      {
        id: 'inst-step-ritika-1',
        stepNumber: 1,
        title: 'Customer Verification & Sanction Load Check',
        description: 'Verify phone number, check electricity bill, verify consumer account number and connected load.',
        assignedUserIds: ['usr-emp-1', 'usr-emp-3'],
        assignedUserNames: ['Er. Devashish', 'Priya Sharma'],
        status: 'not started',
        isNotified: true,
        notifiedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        history: [],
      },
      {
        id: 'inst-step-ritika-2',
        stepNumber: 2,
        title: 'Physical Site Survey & Shadow Analysis',
        description: 'Inspect RCC roof, azimuth angle, measure 100 sqft/kW area, check south orientation & take photos.',
        assignedUserIds: ['usr-emp-2'],
        assignedUserNames: ['Amit Patel'],
        status: 'not started',
        isNotified: true,
        notifiedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        history: [],
      },
      {
        id: 'inst-step-ritika-3',
        stepNumber: 3,
        title: 'Quotation, Contract & Portal Registration',
        description: 'Submit formal BOM quote, collect token advance, upload application on PM Surya Ghar portal.',
        assignedUserIds: ['usr-emp-4', 'usr-emp-3'],
        assignedUserNames: ['Vikas Yadav', 'Priya Sharma'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-ritika-4',
        stepNumber: 4,
        title: 'Hot-Dip Structure Fabrication & Anchoring',
        description: 'Galvanized structure mounting, Hilti anchor chemical fastener grouting, torque inspection.',
        assignedUserIds: ['usr-emp-4'],
        assignedUserNames: ['Vikas Yadav'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-ritika-5',
        stepNumber: 5,
        title: 'Bifacial Solar Module Mounting & DC Wiring',
        description: 'Mount DCR Mono PERC modules, run UV-resistant DC solar cable, configure string voltage.',
        assignedUserIds: ['usr-emp-5'],
        assignedUserNames: ['Poonam Maurya'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-ritika-6',
        stepNumber: 6,
        title: 'Inverter Installation & 3-Pit Chemical Earthing',
        description: 'Mount on-grid solar inverter, dual DC/AC SPD Type-II boxes, 3-pit chemical earthing with ESE LA.',
        assignedUserIds: ['usr-emp-6'],
        assignedUserNames: ['Rahul Verma'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-ritika-7',
        stepNumber: 7,
        title: 'UPPCL Net-Metering, Inspection & DBT Subsidy',
        description: 'Substation JE liaison, install bi-directional smart meter, upload geo-tagged photo for direct DBT subsidy.',
        assignedUserIds: ['usr-emp-7'],
        assignedUserNames: ['Sanjay Singh'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-wf-shreya',
    leadId: 'lead-shreya',
    taskId: 'task-shreya',
    templateId: 'tmpl-wf-solar-rooftop',
    templateTitle: 'Residential On-Grid Rooftop Solar EPC (7-Step Flow)',
    customerName: 'Shreya Verma',
    customerPhone: '+91 98392 11045',
    customerAddress: 'Civil Lines, Prayagraj',
    capacityKw: 3,
    currentActiveFlowStepNumbers: [1, 2], // Task 1 and 2 initially have notifications
    notifiedSteps: [1, 2],
    steps: [
      {
        id: 'inst-step-shreya-1',
        stepNumber: 1,
        title: 'Customer Verification & Sanction Load Check',
        description: 'Verify phone number, check electricity bill, verify consumer account number and connected load.',
        assignedUserIds: ['usr-emp-1', 'usr-emp-3'],
        assignedUserNames: ['Er. Devashish', 'Priya Sharma'],
        status: 'not started',
        isNotified: true,
        notifiedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        history: [],
      },
      {
        id: 'inst-step-shreya-2',
        stepNumber: 2,
        title: 'Physical Site Survey & Shadow Analysis',
        description: 'Inspect RCC roof, azimuth angle, measure 100 sqft/kW area, check south orientation & take photos.',
        assignedUserIds: ['usr-emp-2'],
        assignedUserNames: ['Amit Patel'],
        status: 'not started',
        isNotified: true,
        notifiedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        history: [],
      },
      {
        id: 'inst-step-shreya-3',
        stepNumber: 3,
        title: 'Quotation, Contract & Portal Registration',
        description: 'Submit formal BOM quote, collect token advance, upload application on PM Surya Ghar portal.',
        assignedUserIds: ['usr-emp-4', 'usr-emp-3'],
        assignedUserNames: ['Vikas Yadav', 'Priya Sharma'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-shreya-4',
        stepNumber: 4,
        title: 'Hot-Dip Structure Fabrication & Anchoring',
        description: 'Galvanized structure mounting, Hilti anchor chemical fastener grouting, torque inspection.',
        assignedUserIds: ['usr-emp-4'],
        assignedUserNames: ['Vikas Yadav'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-shreya-5',
        stepNumber: 5,
        title: 'Bifacial Solar Module Mounting & DC Wiring',
        description: 'Mount DCR Mono PERC modules, run UV-resistant DC solar cable, configure string voltage.',
        assignedUserIds: ['usr-emp-5'],
        assignedUserNames: ['Poonam Maurya'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-shreya-6',
        stepNumber: 6,
        title: 'Inverter Installation & 3-Pit Chemical Earthing',
        description: 'Mount on-grid solar inverter, dual DC/AC SPD Type-II boxes, 3-pit chemical earthing with ESE LA.',
        assignedUserIds: ['usr-emp-6'],
        assignedUserNames: ['Rahul Verma'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-shreya-7',
        stepNumber: 7,
        title: 'UPPCL Net-Metering, Inspection & DBT Subsidy',
        description: 'Substation JE liaison, install bi-directional smart meter, upload geo-tagged photo for direct DBT subsidy.',
        assignedUserIds: ['usr-emp-7'],
        assignedUserNames: ['Sanjay Singh'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
    ],
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-wf-anju',
    leadId: 'lead-anju',
    taskId: 'task-anju',
    templateId: 'tmpl-wf-solar-rooftop',
    templateTitle: 'Residential On-Grid Rooftop Solar EPC (7-Step Flow)',
    customerName: 'Anju Devi',
    customerPhone: '+91 98380 44219',
    customerAddress: 'Civil Lines, Near Subhash Chauraha, Prayagraj',
    capacityKw: 3,
    currentActiveFlowStepNumbers: [1, 2], // Task 1 and 2 initially have notifications
    notifiedSteps: [1, 2],
    steps: [
      {
        id: 'inst-step-anju-1',
        stepNumber: 1,
        title: 'Customer Verification & Sanction Load Check',
        description: 'Verify phone number, check electricity bill, verify consumer account number and connected load.',
        assignedUserIds: ['usr-emp-1', 'usr-emp-3'],
        assignedUserNames: ['Er. Devashish', 'Priya Sharma'],
        status: 'not started',
        isNotified: true,
        notifiedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        history: [],
      },
      {
        id: 'inst-step-anju-2',
        stepNumber: 2,
        title: 'Physical Site Survey & Shadow Analysis',
        description: 'Inspect RCC roof, azimuth angle, measure 100 sqft/kW area, check south orientation & take photos.',
        assignedUserIds: ['usr-emp-2'],
        assignedUserNames: ['Amit Patel'],
        status: 'not started',
        isNotified: true, // Notified in initial 1-2 flow!
        notifiedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        history: [],
      },
      {
        id: 'inst-step-anju-3',
        stepNumber: 3,
        title: 'Quotation, Contract & Portal Registration',
        description: 'Submit formal BOM quote, collect token advance, upload application on PM Surya Ghar portal.',
        assignedUserIds: ['usr-emp-4', 'usr-emp-3'],
        assignedUserNames: ['Vikas Yadav', 'Priya Sharma'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-anju-4',
        stepNumber: 4,
        title: 'Hot-Dip Structure Fabrication & Anchoring',
        description: 'Galvanized structure mounting, Hilti anchor chemical fastener grouting, torque inspection.',
        assignedUserIds: ['usr-emp-4'],
        assignedUserNames: ['Vikas Yadav'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-anju-5',
        stepNumber: 5,
        title: 'Bifacial Solar Module Mounting & DC Wiring',
        description: 'Mount DCR Mono PERC modules, run UV-resistant DC solar cable, configure string voltage.',
        assignedUserIds: ['usr-emp-5'],
        assignedUserNames: ['Poonam Maurya'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-anju-6',
        stepNumber: 6,
        title: 'Inverter Installation & 3-Pit Chemical Earthing',
        description: 'Mount on-grid solar inverter, dual DC/AC SPD Type-II boxes, 3-pit chemical earthing with ESE LA.',
        assignedUserIds: ['usr-emp-6'],
        assignedUserNames: ['Rahul Verma'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-anju-7',
        stepNumber: 7,
        title: 'UPPCL Net-Metering, Inspection & DBT Subsidy',
        description: 'Substation JE liaison, install bi-directional smart meter, upload geo-tagged photo for direct DBT subsidy.',
        assignedUserIds: ['usr-emp-7'],
        assignedUserNames: ['Sanjay Singh'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
    ],
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-wf-101',
    leadId: 'lead-1',
    templateId: 'tmpl-wf-solar-rooftop',
    templateTitle: 'Residential On-Grid Rooftop Solar EPC (7-Step Flow)',
    customerName: 'Shri Ram Prakash Dwivedi',
    customerPhone: '+91 94151 22890',
    customerAddress: 'Tagore Town, Near Colonelganj Inter College, Prayagraj',
    capacityKw: 5,
    currentActiveFlowStepNumbers: [1, 2], // Task 1 and 2 initially have notifications
    steps: [
      {
        id: 'inst-step-1',
        stepNumber: 1,
        title: 'Customer Verification & Sanction Load Check',
        description: 'Verify phone number, check electricity bill, verify consumer account number and connected load.',
        assignedUserIds: ['usr-emp-1'],
        assignedUserNames: ['Er. Devashish'],
        status: 'in progress',
        isNotified: true,
        notifiedAt: '2026-09-09T09:00:00Z',
        lastUpdatedAt: '2026-09-09T14:30:00Z',
        lastUpdatedByUserId: 'usr-owner-1',
        lastUpdatedByName: 'Dilip Enterprises (Owner)',
        lastWorkDescription: 'Verified UPPCL account #78192384. Connected load is 4kW, initiated load enhancement application for 5kW.',
        history: [
          {
            id: 'hist-1',
            timestamp: '2026-09-09T14:30:00Z',
            userId: 'usr-owner-1',
            userName: 'Dilip Enterprises (Owner)',
            previousStatus: 'not started',
            newStatus: 'in progress',
            workDescription: 'Verified UPPCL account #78192384. Connected load is 4kW, initiated load enhancement application for 5kW.',
          },
        ],
      },
      {
        id: 'inst-step-2',
        stepNumber: 2,
        title: 'Physical Site Survey & Shadow Analysis',
        description: 'Inspect RCC roof, azimuth angle, measure 100 sqft/kW area, check south orientation & take photos.',
        assignedUserIds: ['usr-emp-2'],
        assignedUserNames: ['Amit Patel'],
        status: 'not started',
        isNotified: true, // Also notified in the 1-2 initial flow!
        notifiedAt: '2026-09-09T09:00:00Z',
        history: [],
      },
      {
        id: 'inst-step-3',
        stepNumber: 3,
        title: 'Quotation, Contract & Portal Registration',
        description: 'Submit formal BOM quote, collect token advance, upload application on PM Surya Ghar portal.',
        assignedUserIds: ['usr-emp-3'],
        assignedUserNames: ['Priya Sharma'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-4',
        stepNumber: 4,
        title: 'Hot-Dip Structure Fabrication & Anchoring',
        description: 'Galvanized structure mounting, Hilti anchor chemical fastener grouting, torque inspection.',
        assignedUserIds: ['usr-emp-4'],
        assignedUserNames: ['Vikas Yadav'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-5',
        stepNumber: 5,
        title: 'Bifacial Solar Module Mounting & DC Wiring',
        description: 'Mount DCR Mono PERC modules, run UV-resistant DC solar cable, configure string voltage.',
        assignedUserIds: ['usr-emp-5'],
        assignedUserNames: ['Poonam Maurya'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-6',
        stepNumber: 6,
        title: 'Inverter Installation & 3-Pit Chemical Earthing',
        description: 'Mount on-grid solar inverter, dual DC/AC SPD Type-II boxes, 3-pit chemical earthing with ESE LA.',
        assignedUserIds: ['usr-emp-6'],
        assignedUserNames: ['Rahul Verma'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
      {
        id: 'inst-step-7',
        stepNumber: 7,
        title: 'UPPCL Net-Metering, Inspection & DBT Subsidy',
        description: 'Substation JE liaison, install bi-directional smart meter, upload geo-tagged photo for direct DBT subsidy.',
        assignedUserIds: ['usr-emp-7'],
        assignedUserNames: ['Sanjay Singh'],
        status: 'not started',
        isNotified: false,
        history: [],
      },
    ],
    createdAt: '2026-09-09T09:00:00Z',
    updatedAt: '2026-09-09T14:30:00Z',
  },
];

// Local Storage Keys (v2 clean zero-default assignments)
export const WORKFLOW_TEMPLATES_STORAGE_KEY = 'dilip_crm_task_workflow_templates_v2';
export const LEAD_WORKFLOWS_STORAGE_KEY = 'dilip_crm_lead_workflows_v2';

export function getStoredWorkflowTemplates(): TaskWorkflowTemplate[] {
  try {
    if (typeof window === 'undefined') return INITIAL_TASK_WORKFLOW_TEMPLATES;
    const saved = localStorage.getItem(WORKFLOW_TEMPLATES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse workflow templates from localStorage:', e);
  }
  return INITIAL_TASK_WORKFLOW_TEMPLATES;
}

export function saveStoredWorkflowTemplates(templates: TaskWorkflowTemplate[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WORKFLOW_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    }
  } catch (e) {
    console.warn('Failed to save workflow templates:', e);
  }
}

export function getStoredLeadWorkflows(): ActiveLeadWorkflow[] {
  try {
    if (typeof window === 'undefined') return INITIAL_ACTIVE_LEAD_WORKFLOWS;
    const saved = localStorage.getItem(LEAD_WORKFLOWS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const workflows: ActiveLeadWorkflow[] = parsed.map((wf: ActiveLeadWorkflow) => {
          const processedSteps = (wf.steps || []).map((st) => {
            const uids = normalizeStaffUserIds(st.assignedUserIds || [], INITIAL_CRM_USERS);
            const names =
              st.assignedUserNames && st.assignedUserNames.length > 0
                ? st.assignedUserNames
                : uids.map((uid) => resolveStaffUser(uid, INITIAL_CRM_USERS)?.name || uid);

            return {
              ...st,
              assignedUserIds: uids,
              assignedUserNames: names,
              isNotified: st.isNotified ?? (st.stepNumber === 1 || st.stepNumber === 2),
            };
          });

          return {
            ...wf,
            currentActiveFlowStepNumbers:
              wf.currentActiveFlowStepNumbers && wf.currentActiveFlowStepNumbers.length > 0
                ? wf.currentActiveFlowStepNumbers
                : [1, 2],
            steps: processedSteps,
          };
        });

        // Chronological descending sort: most recently added/updated lead is #1
        workflows.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
          return timeB - timeA;
        });

        return workflows;
      }
    }
  } catch (e) {
    console.warn('Failed to parse active lead workflows from localStorage:', e);
  }
  return INITIAL_ACTIVE_LEAD_WORKFLOWS;
}

export function saveStoredLeadWorkflows(workflows: ActiveLeadWorkflow[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LEAD_WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
    }
  } catch (e) {
    console.warn('Failed to save active lead workflows:', e);
  }
}

/**
 * Helper to safely resolve a staff user by ID, username, or legacy ID alias
 */
export function resolveStaffUser(uid: string, staffUsers: CrmUser[]): CrmUser | undefined {
  if (!uid) return undefined;
  const direct = staffUsers.find((u) => u.id === uid);
  if (direct) return direct;

  const normalized = uid.toLowerCase().trim();
  // Check username match
  const byUsername = staffUsers.find((u) => u.username.toLowerCase() === normalized);
  if (byUsername) return byUsername;

  // Check legacy aliases
  if (normalized === 'usr-amit' || normalized === 'amit') {
    return staffUsers.find((u) => u.username === 'amit' || u.name.toLowerCase().includes('amit'));
  }
  if (normalized === 'usr-priya' || normalized === 'priya') {
    return staffUsers.find((u) => u.username === 'priya' || u.name.toLowerCase().includes('priya'));
  }
  if (normalized === 'usr-devashish' || normalized === 'devashish' || normalized === 'usr-emp-1') {
    return staffUsers.find((u) => u.username === 'devashish' || u.name.toLowerCase().includes('devashish'));
  }
  if (normalized === 'usr-vikas' || normalized === 'vikas' || normalized === 'usr-emp-4') {
    return staffUsers.find((u) => u.username === 'vikas' || u.name.toLowerCase().includes('vikas'));
  }

  // Name match fallback
  return staffUsers.find((u) => u.name.toLowerCase().includes(normalized));
}

/**
 * Normalizes legacy user IDs to their canonical CrmUser id
 */
export function normalizeStaffUserIds(ids: string[] | undefined, staffUsers: CrmUser[]): string[] {
  if (!ids || !Array.isArray(ids)) return [];
  return ids.map((id) => {
    const user = resolveStaffUser(id, staffUsers);
    return user ? user.id : id;
  });
}

/**
 * 2-Step Flow-Chart Notification Calculator (Ratio of 2 strictly forward)
 * 
 * Rules specified by user:
 * - When lead added: notifications go to Task 1 & Task 2.
 * - When Task 1 is updated: notification flows strictly to Task 2 & Task 3 (Task 1 does not get notified).
 * - When Task 2 is updated: notification flows strictly to Task 3 & Task 4 (Task 1 & Task 2 do not get notified).
 * - When Task 3 is updated: notification flows strictly to Task 4 & Task 5 (previous tasks do not get notified).
 * - When Task 4 is updated: notification flows strictly to Task 5 & Task 6.
 * - When Task K is updated: notification flows strictly to Task K+1 & Task K+2.
 */
export function calculateNextFlowchartNotificationSteps(
  updatedStepNumber: number,
  totalSteps: number
): number[] {
  const next1 = updatedStepNumber + 1;
  const next2 = updatedStepNumber + 2;
  const steps: number[] = [];

  // Strictly next 2 steps forward
  if (next1 <= totalSteps) steps.push(next1);
  if (next2 <= totalSteps) steps.push(next2);

  return steps;
}

/**
 * THE ONLY CANONICAL RESOLVER for who is assigned to a step.
 * Returns CrmUser objects matching the step's assignedUserIds.
 * Zero fallback, zero guessing, zero role-based default mapping.
 */
export function getStepAssignedUsers(
  stepOrIds: { assignedUserIds?: string[] } | string[] | undefined,
  allStaffUsers: CrmUser[]
): CrmUser[] {
  const ids: string[] = Array.isArray(stepOrIds)
    ? stepOrIds
    : Array.isArray(stepOrIds?.assignedUserIds)
    ? stepOrIds.assignedUserIds
    : [];

  return ids
    .map((uid) => resolveStaffUser(uid, allStaffUsers))
    .filter((u): u is CrmUser => Boolean(u));
}

/**
 * Resolves assigned staff users for a workflow step strictly from assignedUserIds.
 * Direct assignments on the step ONLY - NO fallback or blind role-based assignment.
 */
export function resolveStepAssignedUsers(
  _stepNumber: number | any,
  currentStepAssignedIds: any,
  _taskAssignedIds: any,
  allStaffUsers: CrmUser[]
): CrmUser[] {
  const ids = Array.isArray(currentStepAssignedIds)
    ? currentStepAssignedIds
    : Array.isArray(_stepNumber?.assignedUserIds)
    ? _stepNumber.assignedUserIds
    : Array.isArray(_stepNumber)
    ? _stepNumber
    : [];

  return getStepAssignedUsers(ids, allStaffUsers);
}

/**
 * Factory to instantiate a new ActiveLeadWorkflow from a template
 */
export function createLeadWorkflowFromTemplate(
  template: TaskWorkflowTemplate,
  leadInfo: {
    leadId?: string;
    taskId?: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    capacityKw?: number;
  },
  staffUsers: CrmUser[],
  customStepAssignments?: Record<number, string[]>
): ActiveLeadWorkflow {
  const now = new Date().toISOString();

  const steps: ActiveWorkflowStep[] = template.steps.map((st) => {
    // Initial rule: notification goes to task 1 and task 2 on lead creation!
    const isInitiallyNotified = st.stepNumber === 1 || st.stepNumber === 2;

    // Super Admin Command Supremacy:
    // If Super Admin explicitly commanded staff for this step via customStepAssignments, use it!
    // Otherwise use template.steps[n].assignedUserIds.
    // NO forced default staff!
    const commandedUserIds =
      customStepAssignments && customStepAssignments[st.stepNumber] !== undefined
        ? customStepAssignments[st.stepNumber]
        : (st.assignedUserIds || []);

    const normalizedUserIds = normalizeStaffUserIds(commandedUserIds, staffUsers);
    const names = normalizedUserIds.map((uid) => resolveStaffUser(uid, staffUsers)?.name || uid);

    return {
      id: `inst-${template.id}-${st.stepNumber}-${Date.now()}`,
      stepNumber: st.stepNumber,
      title: st.title,
      description: st.description,
      assignedUserIds: normalizedUserIds,
      assignedUserNames: names,
      status: 'not started', // Default is "not started"
      isNotified: isInitiallyNotified,
      notifiedAt: isInitiallyNotified ? now : undefined,
      history: [],
    };
  });

  return {
    id: `wf-inst-${Date.now()}`,
    leadId: leadInfo.leadId,
    taskId: leadInfo.taskId,
    templateId: template.id,
    templateTitle: template.title,
    customerName: leadInfo.customerName,
    customerPhone: leadInfo.customerPhone,
    customerAddress: leadInfo.customerAddress,
    capacityKw: leadInfo.capacityKw,
    currentActiveFlowStepNumbers: [1, 2], // Only step 1 and 2 get notification on lead add
    notifiedSteps: [1, 2],
    steps,
    createdAt: now,
    updatedAt: now,
  };
}
