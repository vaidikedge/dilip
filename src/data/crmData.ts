export type CrmTaskStatus =
  | 'not started'
  | 'in progress'
  | 'pending'
  | 'on hold'
  | 'compleated';

import { NEW_CUSTOMER_TASKS } from './newCustomerTasks.ts';

// ---------------- SOLAR PM SURYA GHAR & DISCOM MILESTONES ---------------- //
export type PmSuryaGharStage =
  | 'site_survey'          // 1. Site Survey & Feasibility Done
  | 'portal_registration'  // 2. National Portal Consumer Registration
  | 'feasibility_approved' // 3. DISCOM (UPPCL) Technical Feasibility Approved
  | 'material_dispatched'  // 4. ALMM DCR Panels & Inverter Dispatched
  | 'installation_done'    // 5. Structure, Panels & Earthing Completed
  | 'meter_commissioned'   // 6. Net Meter Installed & Grid Synchronized
  | 'jir_pcr_uploaded'     // 7. JIR / Project Completion Report Uploaded
  | 'subsidy_credited';    // 8. Direct CFA Subsidy Released

export interface PmSuryaGharStageInfo {
  id: PmSuryaGharStage;
  step: number;
  label: string;
  hindiLabel: string;
  description: string;
}

export const PM_SURYA_GHAR_STAGES: PmSuryaGharStageInfo[] = [
  {
    id: 'site_survey',
    step: 1,
    label: 'Site Survey & Feasibility',
    hindiLabel: '1. Site Survey & Roof Feasibility',
    description: 'Roof measurement, shadow analysis, electrical feasibility'
  },
  {
    id: 'portal_registration',
    step: 2,
    label: 'National Portal Registration',
    hindiLabel: '2. National Portal Application',
    description: 'PM Surya Ghar application submitted with UPPCL consumer no.'
  },
  {
    id: 'feasibility_approved',
    step: 3,
    label: 'DISCOM Feasibility Approved',
    hindiLabel: '3. UPPCL DISCOM Feasibility Approval',
    description: 'Technical feasibility sanctioned by local DISCOM division'
  },
  {
    id: 'material_dispatched',
    step: 4,
    label: 'DCR Material Dispatch',
    hindiLabel: '4. DCR Solar Material Dispatch',
    description: 'ALMM approved DCR panels, inverter and mounting dispatched'
  },
  {
    id: 'installation_done',
    step: 5,
    label: 'Installation & Earthing Done',
    hindiLabel: '5. Structure, Modules & Earthing Complete',
    description: 'Solar structure fabricated, panels mounted, earthing pits ready'
  },
  {
    id: 'meter_commissioned',
    step: 6,
    label: 'Net Meter Commissioned',
    hindiLabel: '6. Net Metering & Grid Synchronization',
    description: 'DISCOM inspection passed, bi-directional net meter installed'
  },
  {
    id: 'jir_pcr_uploaded',
    step: 7,
    label: 'PCR & JIR Uploaded',
    hindiLabel: '7. PCR & JIR Report Upload',
    description: 'Joint Inspection Report & Project Completion Report submitted'
  },
  {
    id: 'subsidy_credited',
    step: 8,
    label: 'CFA Subsidy Credited',
    hindiLabel: '8. CFA Subsidy Credited to Bank',
    description: 'Central Financial Assistance subsidy credited to customer bank'
  }
];

export interface SolarFeasibilityData {
  roofAreaSqFt?: number;
  roofType?: 'RCC Flat Roof' | 'Tin / Metal Sheet' | 'Ground Mount' | 'Elevated Structure';
  phase?: 'Single Phase (230V)' | 'Three Phase (415V)';
  sanctionedLoadKw?: number;
  inverterDistanceM?: number;
  meterDistanceM?: number;
  earthingPits?: number;
  feederName?: string;
  surveyRemarks?: string;
  surveyDate?: string;
  surveyorName?: string;
  shadowFreePercentage?: number;
}

export interface SolarEquipmentBOM {
  panelBrand?: string; // Waaree, Adani, Tata, Goldi, Vikram, etc.
  panelWattageWp?: number; // 545, 550, etc.
  panelCount?: number;
  inverterBrand?: string; // Growatt, Solis, Sungrow, Luminous, etc.
  inverterCapacityKw?: number;
  inverterSerialNo?: string;
  netMeterSerialNo?: string;
  discomSealNo?: string;
  structureType?: string; // e.g. Hot Dip Galvanized, Elevated GI
  batteryCapacityAh?: string; // For hybrid
}

export interface CrmUser {
  id: string;
  username: string; // Used for login identifier
  password?: string; // Optional user password for credentials
  authUid?: string; // Firebase Authentication UID
  name: string;
  role: 'owner' | 'employee';
  roleTitle: string; // e.g. 'Lead Solar Engineer', 'Site Technician', 'Owner & Super Admin'
  assignedTaskStep?: number; // 1, 2, 3, 4, 5, 6, 7
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
  joinDate?: string;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  lastActionAt?: string;
  hasTaskAccess?: (stepNumber: number, taskOrWfId?: string, customerName?: string) => boolean;
}

export interface TaskRemark {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'owner' | 'employee';
  statusChangedTo?: CrmTaskStatus;
  message?: string;
  timestamp: string;
}

export interface CrmTask {
  id: string;
  businessId?: string; // Multi-business identifier (e.g. 'biz-solar-dilip', 'biz-balaji-electrical')
  businessName?: string;
  taskCode: string; // e.g. DE-TASK-101
  title: string;
  projectTitle?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  capacityKw: number;
  systemType:
    | 'On-Grid Rooftop'
    | 'Hybrid Solar'
    | 'Off-Grid'
    | 'Solar Water Pump'
    | 'Commercial HT'
    | string;
  monthlyBillRs?: string;
  uppclAccountNo?: string;
  roofType?: 'RCC Flat Roof' | 'Tin / Metal Sheet' | 'Ground Mount' | 'Elevated Structure';
  priority: 'Normal' | 'High' | 'Urgent';
  assignedToUserId: string;
  assignedToUserName: string;
  assignedUserIds?: string[]; // All assigned team members across SOP steps
  assignedUserNames?: string[];
  workflowId?: string; // Associated ActiveLeadWorkflow ID
  assignedBy: string;
  assignedAt: string; // ISO date string when created
  ownerInstructions?: string; // Owner message sent to this specific employee
  status: CrmTaskStatus; // Default: 'not started'
  firstRespondedAt?: string; // ISO date string when employee or owner first updated status or added message
  firstRespondedBy?: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  remarksHistory: TaskRemark[];
  templateId?: string;
  customStepAssignments?: Record<number, string[]>;
  dealValueRs?: number;
  dueDate?: string; // e.g. YYYY-MM-DD
  leadSource?: string; // e.g. 'Website Survey', 'UPPCL Bill Upload', 'Quotation Calculator', 'Direct Call', 'Walk-in'
  customerEmail?: string;
  sanctionedLoadKw?: string;
  discom?: string; // e.g. 'UPPCL - Purvanchal Vidyut Vitran Nigam (PuVVNL)'
  isArchived?: boolean;
  // Solar specific dealer fields
  pmSuryaGharStage?: PmSuryaGharStage;
  consumerAppNo?: string;
  netMeterChallanNo?: string;
  feasibility?: SolarFeasibilityData;
  equipmentBOM?: SolarEquipmentBOM;
  subsidyAmountClaimed?: number;
  // Owner Supremacy (Master Override) flags
  isOwnerOverride?: boolean;
  ownerOverrideBy?: string;
  ownerOverrideAt?: string;
  ownerOverrideMessage?: string;
  lockedAgainstStaffModification?: boolean;
}

export interface UserAuditLog {
  id: string;
  userId: string;
  username: string;
  userName: string;
  userRole: 'owner' | 'employee';
  roleTitle?: string;
  userPhone?: string;
  userEmail?: string;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'AUTO_LOGOUT_5MIN_INACTIVITY'
    | 'FORCE_LOGOUT'
    | 'STATUS_CHANGE'
    | 'REMARK_ADDED'
    | 'TASK_ASSIGNED'
    | 'TASK_UPDATED'
    | 'MESSAGE_SENT'
    | 'DIRECTIVE_DISPATCHED'
    | 'LEAD_CREATED'
    | 'COMPLAINT_REGISTERED'
    | 'COMPLAINT_RESOLVED'
    | 'USER_CREATED'
    | 'USER_EDITED'
    | 'USER_DELETED';
  details: string;
  targetUserName?: string;
  targetUserId?: string;
  projectCode?: string;
  taskCode?: string;
  projectTitle?: string;
  customerName?: string;
  oldStatus?: string;
  newStatus?: string;
  remarks?: string;
  messageContent?: string;
  timestamp: string; // ISO string
  formattedTime: string;
  timeOnly?: string;
  dateOnly?: string;
  ipAddress: string;
  deviceInfo: string;
}

export interface UserSession {
  id: string;
  userId: string;
  username: string;
  userName: string;
  userRole: 'owner' | 'employee';
  roleTitle?: string;
  loginTime: string; // ISO string
  loginFormatted: string; // e.g. "04 Sep 2026, 09:48:23 pm"
  logoutTime?: string; // ISO string if logged out
  logoutFormatted?: string; // e.g. "04 Sep 2026, 09:48:42 pm"
  durationFormatted?: string; // e.g. "19s", "14m 20s"
  durationSeconds?: number;
  status: 'ONLINE' | 'MANUAL_LOGOUT' | 'AUTO_LOGOUT_5MIN_INACTIVITY';
  exitReason?: string;
  ipAddress: string;
  deviceInfo: string;
  lastActiveTime?: number;
}

export interface ProjectNotification {
  id: string;
  itemType: 'TASK' | 'COMPLAINT' | 'USER_ACTIVITY' | 'LOGIN' | 'NOTE';
  taskId?: string; // Associated task id
  taskCode?: string; // e.g. "DE-TASK-106"
  projectTitle: string; // e.g. "2kW Hybrid Solar - aman"
  customerName?: string; // e.g. "aman"
  customerPhone?: string; // e.g. "9795598171"
  customerAddress?: string; // e.g. "chowk prayagraj"
  capacityKw?: number; // e.g. 2
  actionType:
    | 'STATUS_COMPLEATED'
    | 'STATUS_IN_PROGRESS'
    | 'STATUS_PENDING'
    | 'STATUS_ON_HOLD'
    | 'STATUS_NOT_STARTED'
    | 'REMARK_ADDED'
    | 'TASK_ASSIGNED'
    | 'COMPLAINT_REGISTERED'
    | 'COMPLAINT_RESOLVED'
    | 'LOGIN'
    | 'AUTO_LOGOUT_5MIN_INACTIVITY';
  newStatus: string;
  oldStatus?: string;
  authorId: string;
  authorName: string; // e.g. "Amit Patel"
  authorRole: string; // e.g. "employee" / "Technician"
  message: string;
  optionalRemarks?: string;
  timestamp: number; // Unix epoch ms
  formattedTime: string; // e.g. "04 Sep 2026, 09:20:15 pm"
  isRead: boolean;
  readByUserIds?: string[];
  readAt?: string;
  priority?: 'Urgent' | 'High' | 'Normal';
}

export interface OwnerDirectiveNotification {
  id: string;
  leadId?: string;
  targetUserId: string; // e.g. "usr-emp-3" (Priya Sharma)
  targetUserName: string; // "Priya Sharma"
  taskId?: string;
  taskCode?: string; // e.g. "DE-TASK-106"
  taskStep?: number;
  projectDetails?: any;
  complaintId?: string;
  complaintTicketNo?: string;
  itemType: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'OWNER_COMMAND' | 'COMPLAINT_ASSIGNED';
  projectTitle: string; // e.g. "2kW Hybrid Solar - aman"
  customerName: string; // "aman"
  customerPhone?: string;
  customerAddress?: string;
  capacityKw?: number;
  ownerCommand: string; // Owner's direct instruction/command
  priority: 'Urgent' | 'High' | 'Normal';
  status: string; // e.g. "Pending", "In Progress"
  assignedBy: string; // e.g. "Dilip Enterprises (Owner)"
  assignedAt: string; // ISO string or human formatted
  updatedAt?: string;
  isOwnerInitiated?: boolean;
  isNotificationOnly?: boolean;
  isRead: boolean; // false = Unread (with NEW and badge), true = Normal (viewed)
  readByUserIds?: string[];
  readAt?: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  category: string;
  estimatedDays: number;
  description: string;
  steps: string[];
}

export interface ComplaintTicket {
  id: string;
  businessId?: string;
  ticketNo: string;
  taskId?: string;
  taskCode?: string;
  customerName: string;
  phone: string;
  address: string;
  systemCapacity: string;
  issueType:
    | 'Inverter Error Code'
    | 'Low Daily Generation'
    | 'UPPCL Net Meter Reading Mismatch'
    | 'Wiring / MC4 / Earthing Issue'
    | 'General Maintenance / Cleaning'
    | string;
  description: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: CrmTaskStatus | 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo: string;
  assignedToUserId?: string;
  assignedBy?: string;
  assignedAt?: string;
  ownerInstructions?: string;
  createdAt: string;
  firstRespondedAt?: string;
  firstRespondedBy?: string;
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
  resolutionNotes?: string;
  partsReplaced?: string;
  rootCause?: string;
  remarksHistory?: TaskRemark[];
}

// ---------------- INITIAL PRE-POPULATED USERS ---------------- //
export const INITIAL_CRM_USERS: CrmUser[] = [
  {
    id: 'usr-owner-1',
    username: 'dilipenterprises',
    name: 'Dilip Enterprises',
    password: 'DilipSolar@2025',
    role: 'owner',
    roleTitle: 'Owner & Super Admin',
    phone: '+91 94152 14777',
    email: 'dilipenterprises@gmail.com',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-09-04T08:00:00.000Z',
  },
  {
    id: 'usr-emp-1',
    username: 'devashish',
    name: 'Er. Devashish',
    password: 'Devashish@2025',
    role: 'employee',
    roleTitle: 'Lead Solar Engineer',
    assignedTaskStep: 1,
    phone: '+91 98390 12345',
    email: 'devashish.solar@dilipenterprises.in',
    status: 'active',
    createdAt: '2026-02-10T00:00:00.000Z',
    lastLoginAt: '2026-09-04T07:45:00.000Z',
  },
  {
    id: 'usr-emp-2',
    username: 'amit',
    name: 'Amit Patel',
    password: 'Amit@2025',
    role: 'employee',
    roleTitle: 'Site Fabrication In-Charge',
    assignedTaskStep: 2,
    phone: '+91 94155 87654',
    email: 'amit.patel@dilipenterprises.in',
    status: 'active',
    createdAt: '2026-03-01T00:00:00.000Z',
    lastLoginAt: '2026-09-04T06:30:00.000Z',
  },
  {
    id: 'usr-emp-3',
    username: 'priya',
    name: 'Priya Sharma',
    password: 'Priya@2025',
    role: 'employee',
    roleTitle: 'UPPCL Net-Metering & Subsidy Desk',
    assignedTaskStep: 1,
    phone: '+91 99180 55432',
    email: 'priya.subsidy@dilipenterprises.in',
    status: 'active',
    createdAt: '2026-03-15T00:00:00.000Z',
    lastLoginAt: '2026-09-03T17:20:00.000Z',
  },
  {
    id: 'usr-emp-4',
    username: 'vikas',
    name: 'Vikas Yadav',
    password: 'Vikas@2025',
    role: 'employee',
    roleTitle: 'Field Technician & Inverter Setup',
    assignedTaskStep: 3,
    phone: '+91 88530 99876',
    email: 'vikas.tech@dilipenterprises.in',
    status: 'active',
    createdAt: '2026-04-01T00:00:00.000Z',
    lastLoginAt: '2026-09-03T16:10:00.000Z',
  },
  {
    id: 'usr-emp-5',
    username: 'poonam',
    name: 'Poonam Maurya',
    password: 'Poonam@2025',
    role: 'employee',
    roleTitle: 'Bifacial Solar Module & DC Wiring Engineer',
    assignedTaskStep: 4,
    phone: '+91 94520 11223',
    email: 'poonam.solar@dilipenterprises.in',
    status: 'active',
    createdAt: '2026-04-10T00:00:00.000Z',
    lastLoginAt: '2026-09-03T15:00:00.000Z',
  },
  {
    id: 'usr-emp-6',
    username: 'rahul',
    name: 'Rahul Verma',
    password: 'Rahul@2025',
    role: 'employee',
    roleTitle: 'Inverter Installation & Earthing Specialist',
    assignedTaskStep: 5,
    phone: '+91 98388 33445',
    email: 'rahul.inverter@dilipenterprises.in',
    status: 'active',
    createdAt: '2026-04-15T00:00:00.000Z',
    lastLoginAt: '2026-09-03T14:30:00.000Z',
  },
  {
    id: 'usr-emp-7',
    username: 'sanjay',
    name: 'Sanjay Singh',
    password: 'Sanjay@2025',
    role: 'employee',
    roleTitle: 'UPPCL Net-Metering & DBT Subsidy Officer',
    assignedTaskStep: 6,
    phone: '+91 99360 77889',
    email: 'sanjay.subsidy@dilipenterprises.in',
    status: 'active',
    createdAt: '2026-04-20T00:00:00.000Z',
    lastLoginAt: '2026-09-03T14:00:00.000Z',
  },
];

// Helper to compute realistic past timestamps for demo response delay
const hoursAgo = (hours: number, minutes = 0) => {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
};

// ---------------- INITIAL PRE-POPULATED TASKS (168 REAL CUSTOMERS) ---------------- //
export const INITIAL_CRM_TASKS: CrmTask[] = NEW_CUSTOMER_TASKS;

// ---------------- INITIAL AUDIT LOGS ---------------- //
export const INITIAL_AUDIT_LOGS: UserAuditLog[] = [
  {
    id: 'log-seed-1',
    userId: 'usr-owner-1',
    username: 'dilipenterprises',
    userName: 'Dilip Enterprises (Owner)',
    userRole: 'owner',
    roleTitle: 'Owner & Managing Director',
    userPhone: '+91 94152 14321',
    userEmail: 'dilipenterprises.solar@gmail.com',
    action: 'LOGIN',
    details: 'Dilip Enterprises (Owner) logged into Master Solar CRM Panel. Full admin access enabled.',
    timestamp: hoursAgo(1, 45),
    formattedTime: '04 Sep 2026, 06:15:20 AM',
    timeOnly: '06:15:20 AM',
    dateOnly: '04 Sep 2026',
    ipAddress: '122.162.148.24',
    deviceInfo: 'Windows 11 / Chrome 128',
  },
  {
    id: 'log-seed-2',
    userId: 'usr-owner-1',
    username: 'dilipenterprises',
    userName: 'Dilip Enterprises (Owner)',
    userRole: 'owner',
    roleTitle: 'Owner & Managing Director',
    action: 'DIRECTIVE_DISPATCHED',
    targetUserName: 'Er. Devashish',
    targetUserId: 'usr-emp-1',
    customerName: 'Sachin',
    projectCode: 'DIL-104',
    messageContent: 'New Lead Flowchart Assignment: You are assigned to Step #1 (Site Survey & Feasibility Assessment) for customer "Sachin". Please update status when ready.',
    details: 'Dispatched flowchart Ratio-2 assignment to Er. Devashish for customer "Sachin" (10kW Solar On-Grid) Step #1.',
    timestamp: hoursAgo(1, 40),
    formattedTime: '04 Sep 2026, 06:20:15 AM',
    timeOnly: '06:20:15 AM',
    dateOnly: '04 Sep 2026',
    ipAddress: '122.162.148.24',
    deviceInfo: 'Windows 11 / Chrome 128',
  },
  {
    id: 'log-seed-3',
    userId: 'usr-emp-1',
    username: 'devashish',
    userName: 'Er. Devashish',
    userRole: 'employee',
    roleTitle: 'Task 1: Solar Design & Site Survey Engineer',
    userPhone: '+91 98380 44211',
    userEmail: 'devashish.solar@dilipenterprises.com',
    action: 'LOGIN',
    details: 'Employee Er. Devashish logged in. Authenticated via mobile.',
    timestamp: hoursAgo(1, 35),
    formattedTime: '04 Sep 2026, 06:25:10 AM',
    timeOnly: '06:25:10 AM',
    dateOnly: '04 Sep 2026',
    ipAddress: '106.213.82.11',
    deviceInfo: 'Android 14 / Chrome Mobile',
  },
  {
    id: 'log-seed-4',
    userId: 'usr-emp-1',
    username: 'devashish',
    userName: 'Er. Devashish',
    userRole: 'employee',
    roleTitle: 'Task 1: Solar Design & Site Survey Engineer',
    action: 'STATUS_CHANGE',
    customerName: 'Sachin',
    projectCode: 'DIL-104',
    oldStatus: 'not started',
    newStatus: 'in progress',
    messageContent: 'Site survey initiated. Physical shadow analysis and roof structure inspected on site.',
    details: 'Er. Devashish updated project DIL-104 (Sachin) status from "not started" to "in progress". Note: "Site survey initiated. Physical shadow analysis and roof structure inspected on site."',
    timestamp: hoursAgo(1, 15),
    formattedTime: '04 Sep 2026, 06:45:00 AM',
    timeOnly: '06:45:00 AM',
    dateOnly: '04 Sep 2026',
    ipAddress: '106.213.82.11',
    deviceInfo: 'Android 14 / Chrome Mobile',
  },
  {
    id: 'log-seed-5',
    userId: 'usr-emp-1',
    username: 'devashish',
    userName: 'Er. Devashish',
    userRole: 'employee',
    roleTitle: 'Task 1: Solar Design & Site Survey Engineer',
    action: 'MESSAGE_SENT',
    targetUserName: 'Dilip Enterprises (Owner)',
    targetUserId: 'usr-owner-1',
    messageContent: 'Hello Dilip sir, foundation check complete at Lowther Road 10kW On-Grid site. South-facing 24-degree tilt angle is optimal. Sharing photos and live site GPS location.',
    details: 'Sent message to Dilip Enterprises (Owner): "Hello Dilip sir, foundation check complete at Lowther Road 10kW On-Grid site. South-facing 24-degree tilt angle is optimal. Sharing photos and live site GPS location."',
    timestamp: hoursAgo(1, 10),
    formattedTime: '04 Sep 2026, 06:50:32 AM',
    timeOnly: '06:50:32 AM',
    dateOnly: '04 Sep 2026',
    ipAddress: '106.213.82.11',
    deviceInfo: 'Android 14 / Chrome Mobile',
  },
  {
    id: 'log-seed-6',
    userId: 'usr-emp-3',
    username: 'priya',
    userName: 'Priya Sharma',
    userRole: 'employee',
    roleTitle: 'Task 2: UPPCL Net-Metering & Banking Executive',
    userPhone: '+91 97921 55670',
    userEmail: 'priya.crm@dilipenterprises.com',
    action: 'LOGIN',
    details: 'Employee Priya Sharma logged in from desktop billing desk.',
    timestamp: hoursAgo(1, 0),
    formattedTime: '04 Sep 2026, 07:00:15 AM',
    timeOnly: '07:00:15 AM',
    dateOnly: '04 Sep 2026',
    ipAddress: '122.162.148.45',
    deviceInfo: 'Windows 10 / Chrome 128',
  },
  {
    id: 'log-seed-7',
    userId: 'usr-emp-3',
    username: 'priya',
    userName: 'Priya Sharma',
    userRole: 'employee',
    roleTitle: 'Task 2: UPPCL Net-Metering & Banking Executive',
    action: 'MESSAGE_SENT',
    targetUserName: 'General Team & Field Updates (All Members)',
    targetUserId: 'group-all',
    messageContent: 'Sir, the UPPCL DISCOM net-metering approval for Advocate Alok Verma\'s 3kW solar plant has been updated on the portal. Attached the sanction report.',
    details: 'Sent message to General Team & Field Updates (All Members): "Sir, the UPPCL DISCOM net-metering approval for Advocate Alok Verma\'s 3kW solar plant has been updated on the portal. Attached the sanction report."',
    timestamp: hoursAgo(0, 45),
    formattedTime: '04 Sep 2026, 07:15:42 AM',
    timeOnly: '07:15:42 AM',
    dateOnly: '04 Sep 2026',
    ipAddress: '122.162.148.45',
    deviceInfo: 'Windows 10 / Chrome 128',
  },
  {
    id: 'log-seed-8',
    userId: 'usr-emp-2',
    username: 'amit',
    userName: 'Amit Patel',
    userRole: 'employee',
    roleTitle: 'Task 3: Installation & Electrical Commissioning Head',
    userPhone: '+91 94500 88234',
    userEmail: 'amit.technical@dilipenterprises.com',
    action: 'STATUS_CHANGE',
    customerName: 'aman',
    projectCode: 'DE-TASK-106',
    oldStatus: 'in progress',
    newStatus: 'compleated',
    messageContent: 'Solar system installed, inverter tested, and connection activated successfully.',
    details: 'Amit Patel updated project DE-TASK-106 (aman) status from "in progress" to "compleated". Note: "Solar system installed, inverter tested, and connection activated successfully."',
    timestamp: hoursAgo(0, 30),
    formattedTime: '04 Sep 2026, 07:30:18 AM',
    timeOnly: '07:30:18 AM',
    dateOnly: '04 Sep 2026',
    ipAddress: '106.213.82.99',
    deviceInfo: 'Mobile Device',
  },
  {
    id: 'log-seed-9',
    userId: 'usr-emp-4',
    username: 'vikas',
    userName: 'Vikas Yadav',
    userRole: 'employee',
    roleTitle: 'Task 4: Maintenance & Civil Mounting Lead',
    userPhone: '+91 93350 11987',
    userEmail: 'vikas.site@dilipenterprises.com',
    action: 'AUTO_LOGOUT_5MIN_INACTIVITY',
    details: 'Security auto-logout: User inactive for 5 minutes without any keyboard or mouse activity.',
    timestamp: hoursAgo(0, 20),
    formattedTime: '04 Sep 2026, 07:40:05 AM',
    timeOnly: '07:40:05 AM',
    dateOnly: '04 Sep 2026',
    ipAddress: '223.187.12.90',
    deviceInfo: 'Windows 10 / Edge 127',
  },
  {
    id: 'log-seed-10',
    userId: 'usr-emp-5',
    username: 'poonam',
    userName: 'Poonam Maurya',
    userRole: 'employee',
    roleTitle: 'Task 4: PM Surya Ghar Subsidy & Documentation Lead',
    userPhone: '+91 98399 22341',
    userEmail: 'poonam.subsidy@dilipenterprises.com',
    action: 'LOGOUT',
    details: 'User Poonam Maurya logged out manually from portal.',
    timestamp: hoursAgo(0, 10),
    formattedTime: '04 Sep 2026, 07:50:24 AM',
    timeOnly: '07:50:24 AM',
    dateOnly: '04 Sep 2026',
    ipAddress: '122.162.148.99',
    deviceInfo: 'Desktop / Laptop',
  },
];

// ---------------- TASK TEMPLATES / SOP ---------------- //
export const INITIAL_TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tmpl-res-1',
    title: 'Residential On-Grid Rooftop SOP (PM Surya Ghar 1-10kW)',
    category: 'Residential Rooftop',
    estimatedDays: 7,
    description: 'Standard Operating Procedure for home solar rooftop with UPPCL net metering and direct DBT bank subsidy.',
    steps: [
      '1. Site Inspection & Shadow Analysis (RCC Flat / Tin shed, check southern azimuth and 100 sqft/kW space).',
      '2. Sanctioned Load Verification with UPPCL bill (ensure load is >= requested solar capacity or apply for load enhancement).',
      '3. Hot-Dip Galvanized Structure Fabrication with 80-100 micron coating & chemical grouting anchoring.',
      '4. DCR Bifacial / Mono PERC Panel Mounting with stainless steel hardware (torque tested).',
      '5. Inverter Installation & Dual DC/AC Surge Protection (SPD Type II + MCB/MCCB disconnects).',
      '6. 3-Pit Chemical Earthing (Inverter, DC Solar, AC Grid) + Early Streamer Lightning Arrester (LA).',
      '7. UPPCL Sub-station Liaison for Net-Meter inspection & bi-directional smart meter installation.',
      '8. National Portal for Rooftop Solar Geo-tagged photo upload (inverter, panels, earthing & net meter).',
      '9. Handover Certificate signing & customer app configuration for daily unit generation monitoring.',
    ],
  },
  {
    id: 'tmpl-com-1',
    title: 'Commercial & Industrial HT Solar SOP (10kW - 100kW+)',
    category: 'Commercial / C&I',
    estimatedDays: 15,
    description: 'Engineered checklist for commercial complexes, hospitals, petrol pumps, cold storages & industrial sheds.',
    steps: [
      '1. Roof Structural Strength Audit & High-Tension (HT) Line Clearances.',
      '2. Sub-station Electrical Inspectorate (UP Electricity Inspector) Drawing Approval.',
      '3. Aluminum Walkways, Life-Line Safety Cables & Module Cleaning Piping System.',
      '4. String Inverter / Multi-MPPT Configuration with online SCADA / RS485 telemetry.',
      '5. HT / LT Switchgear Interconnection, VCB / ACB Protection and Net-Meter Testing.',
      '6. CEIG (Chief Electrical Inspector to Govt of UP) Final Inspection & Clearance certificate.',
      '7. Commercial Commissioning & Performance Ratio (PR) Verification.',
    ],
  },
  {
    id: 'tmpl-pump-1',
    title: 'PM-KUSUM Solar Water Pump Installation SOP (3HP - 10HP)',
    category: 'Agriculture Pump',
    estimatedDays: 5,
    description: 'Agricultural solar submersible & surface water pumping installation and testing.',
    steps: [
      '1. Borewell Depth & Water Table GPM testing with farmer consent.',
      '2. Heavy Duty Dual-Axis Manual / Auto Tracking Mounting Structure installation.',
      '3. Solar PV Stringing and IP65 Solar VFD Controller wiring with dry-run sensor protection.',
      '4. Submersible Pump Lowering with SS safety cable and HDPE pipe clamping.',
      '5. Earthing & Lighting Surge arrestor testing.',
      '6. Water Discharge flow test (liters per hour measurement under noon sun).',
      '7. Farmer training for daily filter cleaning and controller operation.',
    ],
  },
];

// ---------------- COMPLAINTS TICKETING ---------------- //
export const INITIAL_COMPLAINT_TICKETS: ComplaintTicket[] = [
  {
    id: 'comp-1',
    ticketNo: 'DE-SRV-1024',
    customerName: 'Dr. Ashok Agrawal',
    phone: '+91 94151 44556',
    address: 'Near Medical College, Lowther Road, Prayagraj',
    systemCapacity: '5 kW On-Grid',
    issueType: 'Inverter Error Code',
    description: 'Growatt inverter display shows "Error 02: Grid Voltage High" between 1:00 PM and 3:00 PM.',
    priority: 'High',
    status: 'in progress',
    assignedTo: 'Er. Devashish',
    assignedToUserId: 'usr-emp-1',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: hoursAgo(22, 0),
    ownerInstructions: 'Carry multimeter to check grid voltage at ACDB. Coordinate with local UPPCL JE if line voltage exceeds 260V.',
    createdAt: '03 Sep 2026, 04:30 PM',
    firstRespondedAt: hoursAgo(18, 0),
    firstRespondedBy: 'Er. Devashish',
    lastUpdatedAt: hoursAgo(16, 0),
    lastUpdatedBy: 'Er. Devashish',
    rootCause: 'UPPCL transformer tap setting causing 268V over-voltage in afternoon.',
    partsReplaced: 'Adjusted inverter upper grid voltage trip parameter to 265V with DISCOM approval.',
    resolutionNotes: 'Site visited. Line voltage from UPPCL transformer reaches 268V. Voltage trip limit adjusted safely with sub-station junior engineer.',
    remarksHistory: [
      {
        id: 'rem-c1',
        authorId: 'usr-emp-1',
        authorName: 'Er. Devashish',
        authorRole: 'employee',
        statusChangedTo: 'in progress',
        message: 'Visited site at Lowther Road. High grid voltage verified. Working on inverter threshold adjustment.',
        timestamp: hoursAgo(18, 0),
      },
    ],
  },
  {
    id: 'comp-2',
    ticketNo: 'DE-SRV-1025',
    customerName: 'Mishra Jewellers (Rajesh Mishra)',
    phone: '+91 98390 33221',
    address: 'Chowk, Prayagraj',
    systemCapacity: '8 kW Commercial',
    issueType: 'Low Daily Generation',
    description: 'Customer noticed generation dropped from 32 units/day to 22 units/day over the last 3 weeks.',
    priority: 'Medium',
    status: 'not started',
    assignedTo: 'Amit Patel',
    assignedToUserId: 'usr-emp-2',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: hoursAgo(5, 0),
    ownerInstructions: 'Inspect panel surface soiling and check MC4 DC string string voltages. Clean modules if needed.',
    createdAt: '04 Sep 2026, 09:15 AM',
    remarksHistory: [],
  },
];

// ---------------- RESPONSE LAG HELPER FUNCTION ---------------- //
export function calculateResponseLag(assignedAt: string, firstRespondedAt?: string) {
  const assignedTime = new Date(assignedAt).getTime();

  if (firstRespondedAt) {
    const respondedTime = new Date(firstRespondedAt).getTime();
    const diffMs = Math.max(0, respondedTime - assignedTime);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let timeText = '';
    if (hours > 0) timeText += `${hours} hr `;
    timeText += `${mins} min`;

    return {
      isResponded: true,
      text: `Responded in ${timeText}`,
      hours,
      mins,
      delayClass: hours >= 4 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  }

  // Not responded yet!
  const now = Date.now();
  const diffMs = Math.max(0, now - assignedTime);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let timeText = '';
  if (hours > 0) timeText += `${hours} hr `;
  timeText += `${mins} min`;

  return {
    isResponded: false,
    text: `⚠️ Awaiting response: ${timeText} elapsed`,
    hours,
    mins,
    isUrgent: hours >= 3,
    delayClass: hours >= 4 ? 'text-rose-700 bg-rose-50 border-rose-300 animate-pulse' : 'text-amber-700 bg-amber-50 border-amber-300',
  };
}

// Friendly relative time helper for sorting and display (e.g., "2h ago", "3h ago")
export function formatTimeAgo(timestamp?: string): string {
  if (!timestamp) return 'Recently';
  const time = new Date(timestamp).getTime();
  if (isNaN(time) || time <= 0) return 'Recently';
  const diffMs = Math.max(0, Date.now() - time);
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) {
    const remMins = mins % 60;
    return remMins > 0 ? `${hours}h ${remMins}m ago` : `${hours}h ago`;
  }
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
}

export function getPmSuryaGharStageInfo(stage?: PmSuryaGharStage): PmSuryaGharStageInfo {
  if (!stage) return PM_SURYA_GHAR_STAGES[0];
  const found = PM_SURYA_GHAR_STAGES.find((s) => s.id === stage);
  return found || PM_SURYA_GHAR_STAGES[0];
}

export interface SolarQuotationResult {
  capacityKw: number;
  systemType: string;
  approxAreaSqFt: number;
  monthlyGenerationUnits: number;
  annualGenerationUnits: number;
  monthlySavingsRs: number;
  annualSavingsRs: number;
  baseCostRs: number;
  gstAmountRs: number;
  totalGrossCostRs: number;
  centralSubsidyCfaRs: number;
  upStateSubsidyRs: number;
  totalSubsidyRs: number;
  netPayableRs: number;
  paybackYears: number;
  twentyFiveYearSavingsRs: number;
  carbonSavedTonnesPerYear: number;
}

export function calculateSolarQuotationBreakdown(
  capacityKw: number,
  systemType: 'On-Grid Rooftop' | 'Hybrid Solar' | 'Off-Grid' | 'Commercial HT' = 'On-Grid Rooftop',
  isResidentialSuryaGhar = true
): SolarQuotationResult {
  const cap = Math.max(1, capacityKw);
  const approxAreaSqFt = cap * 85;
  const monthlyGenerationUnits = Math.round(cap * 125);
  const annualGenerationUnits = monthlyGenerationUnits * 12;
  const unitTariff = 7.2; // UP average residential tariff ₹/kWh
  const monthlySavingsRs = Math.round(monthlyGenerationUnits * unitTariff);
  const annualSavingsRs = monthlySavingsRs * 12;

  // Realistic Dealer Pricing benchmarks for UP (incl structure, cables, BOS, installation)
  let perKwRate = 58000;
  if (systemType === 'Hybrid Solar') perKwRate = 84000;
  else if (systemType === 'Off-Grid') perKwRate = 88000;
  else if (systemType === 'Commercial HT') perKwRate = 48000;

  const baseCostRs = Math.round(cap * perKwRate);
  const gstAmountRs = Math.round(baseCostRs * 0.12);
  const totalGrossCostRs = baseCostRs + gstAmountRs;

  // PM Surya Ghar Central Financial Assistance (CFA)
  let centralSubsidyCfaRs = 0;
  let upStateSubsidyRs = 0;

  if (isResidentialSuryaGhar && (systemType === 'On-Grid Rooftop' || systemType === 'Hybrid Solar')) {
    if (cap === 1) {
      centralSubsidyCfaRs = 30000;
      upStateSubsidyRs = 15000;
    } else if (cap === 2) {
      centralSubsidyCfaRs = 60000;
      upStateSubsidyRs = 30000;
    } else {
      // 3kW and above: Capped at ₹78,000 CFA
      centralSubsidyCfaRs = 78000;
      upStateSubsidyRs = 30000;
    }
  }

  const totalSubsidyRs = centralSubsidyCfaRs + upStateSubsidyRs;
  const netPayableRs = Math.max(0, totalGrossCostRs - totalSubsidyRs);
  const paybackYears = Number((netPayableRs / annualSavingsRs).toFixed(1));
  const twentyFiveYearSavingsRs = Math.round(annualSavingsRs * 25 - netPayableRs);
  const carbonSavedTonnesPerYear = Number((annualGenerationUnits * 0.00082).toFixed(1));

  return {
    capacityKw: cap,
    systemType,
    approxAreaSqFt,
    monthlyGenerationUnits,
    annualGenerationUnits,
    monthlySavingsRs,
    annualSavingsRs,
    baseCostRs,
    gstAmountRs,
    totalGrossCostRs,
    centralSubsidyCfaRs,
    upStateSubsidyRs,
    totalSubsidyRs,
    netPayableRs,
    paybackYears: isNaN(paybackYears) ? 3.4 : paybackYears,
    twentyFiveYearSavingsRs,
    carbonSavedTonnesPerYear,
  };
}

// ---------------- BACKWARD COMPATIBILITY EXPORTS ---------------- //
export type StaffUser = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: string;
  joinDate?: string;
  username?: string;
  password?: string;
  roleTitle?: string;
  createdAt?: string;
  lastLoginAt?: string;
};

export type WorkProgressItem = {
  id: string;
  projectCode?: string;
  leadId?: string;
  title?: string;
  customerName?: string;
  clientName?: string;
  phone?: string;
  address?: string;
  capacityKw?: number;
  systemType?: string;
  assignedTo?: string;
  assignedEngineer?: string;
  currentStage?: string;
  stage?: string;
  progressPercent?: number;
  startDate?: string;
  expectedCompletion?: string;
  notes?: string;
  [key: string]: any;
};

export type WorkReportItem = {
  id: string;
  projectId?: string;
  engineerName?: string;
  technicianName?: string;
  clientOrSite?: string;
  date?: string;
  hoursWorked?: number;
  stageCompleted?: string;
  workDone?: string;
  uppclStatus?: string;
  materialsUsed?: string[];
  notes?: string;
  customerFeedback?: string;
  approvedByOwner?: boolean;
  [key: string]: any;
};

export type LoginDetail = {
  id: string;
  username: string;
  name?: string;
  role: string;
  loginTime: string;
  lastLogin?: string;
  logoutTime?: string;
  duration?: string;
  ipAddress?: string;
  lastIp?: string;
  device?: string;
  browserInfo?: string;
  status: 'Active' | 'Logged Out' | 'Timed Out (5min)';
  actionsPerformed?: string[];
};

export const INITIAL_STAFF_USERS: StaffUser[] = INITIAL_CRM_USERS;

export const INITIAL_WORK_PROGRESS: WorkProgressItem[] = [
  {
    id: 'prog-1',
    title: '5kW Rooftop Solar - George Town',
    customerName: 'Shri R.K. Srivastava',
    phone: '+91 94151 22890',
    address: 'George Town, Prayagraj',
    capacityKw: 5,
    systemType: 'On-Grid Rooftop',
    assignedTo: 'Er. Devashish',
    currentStage: 'Structure Fabrication',
    progressPercent: 45,
    startDate: '01 Sep 2026',
    expectedCompletion: '08 Sep 2026',
    notes: 'Structure mounted, bifacial panels ready for stringing.',
  },
];

export const INITIAL_WORK_REPORTS: WorkReportItem[] = [
  {
    id: 'rep-1',
    projectId: 'prog-1',
    technicianName: 'Er. Devashish',
    date: '03 Sep 2026',
    hoursWorked: 6,
    stageCompleted: 'Mounting Structure',
    materialsUsed: ['GI Channels 80u', 'Anchor Fasteners 12mm', 'SS304 Bolts'],
    notes: 'Chemical grouting finished on RCC roof.',
    customerFeedback: 'Very satisfied with neat work.',
    approvedByOwner: true,
  },
];

export const INITIAL_LOGIN_DETAILS: LoginDetail[] = [
  {
    id: 'log-hist-1',
    username: 'dilipenterprises',
    role: 'Owner & Super Admin',
    loginTime: '04 Sep 2026, 06:53 AM',
    ipAddress: '122.162.148.24',
    device: 'Chrome on Windows 11',
    status: 'Active',
    actionsPerformed: ['Checked daily inquiries', 'Assigned lead to Er. Devashish'],
  },
  {
    id: 'log-hist-2',
    username: 'devashish',
    role: 'Solar Engineer',
    loginTime: '04 Sep 2026, 06:18 AM',
    ipAddress: '106.213.82.11',
    device: 'Mobile Safari on iOS',
    status: 'Active',
    actionsPerformed: ['Logged in', 'Updated George Town progress to 45%'],
  },
  {
    id: 'log-hist-3',
    username: 'vikas',
    role: 'Site Technician',
    loginTime: '04 Sep 2026, 05:00 AM',
    logoutTime: '04 Sep 2026, 05:05 AM',
    duration: '5 mins',
    ipAddress: '223.187.12.90',
    device: 'Edge on Windows 10',
    status: 'Timed Out (5min)',
    actionsPerformed: ['Auto-logged out after 5 minutes inactivity'],
  },
];

export const INITIAL_OWNER_DIRECTIVES: OwnerDirectiveNotification[] = [
  {
    id: 'dir-priya-ritika',
    targetUserId: 'usr-emp-3',
    targetUserName: 'Priya Sharma',
    taskId: 'task-ritika',
    taskCode: 'DE-TASK-109',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '⚡ Flowchart Assignment (Task 1 & Task 2): Ritika (5kW Rooftop Solar)',
    customerName: 'Ritika',
    customerPhone: '+91 98394 55120',
    customerAddress: 'Tagore Town, Prayagraj',
    capacityKw: 5,
    ownerCommand: 'New Lead Flowchart Assignment: Dilip Enterprises (Owner) assigned customer "Ritika" (5kW On-Grid Rooftop Solar, Tagore Town, Prayagraj, Phone: +91 98394 55120) to Task 1 & Task 2. Both Task 1 and Task 2 users have full authorization to coordinate, execute work, and update status (Work description is compulsory).',
    priority: 'High',
    status: 'not started',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-devashish-ritika',
    targetUserId: 'usr-emp-1',
    targetUserName: 'Er. Devashish',
    taskId: 'task-ritika',
    taskCode: 'DE-TASK-109',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '⚡ Flowchart Assignment (Task 1 & Task 2): Ritika (5kW Rooftop Solar)',
    customerName: 'Ritika',
    customerPhone: '+91 98394 55120',
    customerAddress: 'Tagore Town, Prayagraj',
    capacityKw: 5,
    ownerCommand: 'New Lead Flowchart Assignment: Dilip Enterprises (Owner) assigned customer "Ritika" (5kW On-Grid Rooftop Solar, Tagore Town, Prayagraj, Phone: +91 98394 55120) to Task 1 & Task 2. Both Task 1 and Task 2 users have full authorization to coordinate, execute work, and update status (Work description is compulsory).',
    priority: 'High',
    status: 'not started',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-amit-ritika',
    targetUserId: 'usr-emp-2',
    targetUserName: 'Amit Patel',
    taskId: 'task-ritika',
    taskCode: 'DE-TASK-109',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '⚡ Flowchart Assignment (Task 1 & Task 2): Ritika (5kW Rooftop Solar)',
    customerName: 'Ritika',
    customerPhone: '+91 98394 55120',
    customerAddress: 'Tagore Town, Prayagraj',
    capacityKw: 5,
    ownerCommand: 'New Lead Flowchart Assignment: Dilip Enterprises (Owner) assigned customer "Ritika" (5kW On-Grid Rooftop Solar, Tagore Town, Prayagraj, Phone: +91 98394 55120) to Task 1 & Task 2. Both Task 1 and Task 2 users have full authorization to coordinate, execute work, and update status (Work description is compulsory).',
    priority: 'High',
    status: 'not started',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-priya-shreya',
    targetUserId: 'usr-emp-3',
    targetUserName: 'Priya Sharma',
    taskId: 'task-shreya',
    taskCode: 'DE-TASK-108',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '⚡ Flowchart Assignment (Task 1 & Task 2): Shreya Verma (3kW Rooftop Solar)',
    customerName: 'Shreya Verma',
    customerPhone: '+91 98392 11045',
    customerAddress: 'Civil Lines, Prayagraj',
    capacityKw: 3,
    ownerCommand: 'New Lead Flowchart Assignment: Dilip Enterprises (Owner) assigned customer "Shreya Verma" (3kW On-Grid Rooftop Solar, Civil Lines, Prayagraj, Phone: +91 98392 11045) to Task 1 & Task 2. Both Task 1 and Task 2 users have full authorization to coordinate, execute work, and update status (Work description is compulsory).',
    priority: 'High',
    status: 'not started',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-devashish-shreya',
    targetUserId: 'usr-emp-1',
    targetUserName: 'Er. Devashish',
    taskId: 'task-shreya',
    taskCode: 'DE-TASK-108',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '⚡ Flowchart Assignment (Task 1 & Task 2): Shreya Verma (3kW Rooftop Solar)',
    customerName: 'Shreya Verma',
    customerPhone: '+91 98392 11045',
    customerAddress: 'Civil Lines, Prayagraj',
    capacityKw: 3,
    ownerCommand: 'New Lead Flowchart Assignment: Dilip Enterprises (Owner) assigned customer "Shreya Verma" (3kW On-Grid Rooftop Solar, Civil Lines, Prayagraj, Phone: +91 98392 11045) to Task 1 & Task 2. Both Task 1 and Task 2 users have full authorization to coordinate, execute work, and update status (Work description is compulsory).',
    priority: 'High',
    status: 'not started',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-amit-shreya',
    targetUserId: 'usr-emp-2',
    targetUserName: 'Amit Patel',
    taskId: 'task-shreya',
    taskCode: 'DE-TASK-108',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '⚡ Flowchart Assignment (Task 1 & Task 2): Shreya Verma (3kW Rooftop Solar)',
    customerName: 'Shreya Verma',
    customerPhone: '+91 98392 11045',
    customerAddress: 'Civil Lines, Prayagraj',
    capacityKw: 3,
    ownerCommand: 'New Lead Flowchart Assignment: Dilip Enterprises (Owner) assigned customer "Shreya Verma" (3kW On-Grid Rooftop Solar, Civil Lines, Prayagraj, Phone: +91 98392 11045) to Task 1 & Task 2. Both Task 1 and Task 2 users have full authorization to coordinate, execute work, and update status (Work description is compulsory).',
    priority: 'High',
    status: 'not started',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-priya-anju',
    targetUserId: 'usr-emp-3',
    targetUserName: 'Priya Sharma',
    taskId: 'task-anju',
    taskCode: 'DE-TASK-107',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '⚡ Flowchart Assignment (Task 1 & Task 2): Anju Devi (3kW Rooftop Solar)',
    customerName: 'Anju Devi',
    customerPhone: '+91 98380 44219',
    customerAddress: 'Civil Lines, Near Subhash Chauraha, Prayagraj',
    capacityKw: 3,
    ownerCommand: 'New Lead Flowchart Assignment: Dilip Enterprises (Owner) assigned customer "Anju Devi" (3kW On-Grid Rooftop Solar, Civil Lines, Prayagraj, Phone: +91 98380 44219) to Task 1 & Task 2. Both Task 1 and Task 2 users have full authorization to coordinate, execute work, and update status (Work description is compulsory).',
    priority: 'High',
    status: 'not started',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-amit-anju',
    targetUserId: 'usr-emp-2',
    targetUserName: 'Amit Patel',
    taskId: 'task-anju',
    taskCode: 'DE-TASK-107',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '⚡ Flowchart Assignment (Task 1 & Task 2): Anju Devi (3kW Rooftop Solar)',
    customerName: 'Anju Devi',
    customerPhone: '+91 98380 44219',
    customerAddress: 'Civil Lines, Near Subhash Chauraha, Prayagraj',
    capacityKw: 3,
    ownerCommand: 'New Lead Flowchart Assignment: Dilip Enterprises (Owner) assigned customer "Anju Devi" (3kW On-Grid Rooftop Solar, Civil Lines, Prayagraj, Phone: +91 98380 44219) to Task 1 & Task 2. Both Task 1 and Task 2 users have full authorization to coordinate, execute work, and update status (Work description is compulsory).',
    priority: 'High',
    status: 'not started',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-devashish-anju',
    targetUserId: 'usr-emp-1',
    targetUserName: 'Er. Devashish',
    taskId: 'task-anju',
    taskCode: 'DE-TASK-107',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '⚡ Flowchart Assignment (Task 1 & Task 2): Anju Devi (3kW Rooftop Solar)',
    customerName: 'Anju Devi',
    customerPhone: '+91 98380 44219',
    customerAddress: 'Civil Lines, Near Subhash Chauraha, Prayagraj',
    capacityKw: 3,
    ownerCommand: 'New Lead Flowchart Assignment: Dilip Enterprises (Owner) assigned customer "Anju Devi" (3kW On-Grid Rooftop Solar, Civil Lines, Prayagraj, Phone: +91 98380 44219) to Task 1 & Task 2. Both Task 1 and Task 2 users have full authorization to coordinate, execute work, and update status (Work description is compulsory).',
    priority: 'High',
    status: 'not started',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-priya-106',
    targetUserId: 'usr-emp-3',
    targetUserName: 'Priya Sharma',
    taskId: 'task-6',
    taskCode: 'DE-TASK-106',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '2kW Hybrid Solar - aman',
    customerName: 'aman',
    customerPhone: '9795598171',
    customerAddress: 'Chowk, Prayagraj',
    capacityKw: 2,
    ownerCommand: 'Priya ji, check UPPCL PuVVNL net-metering portal application today. Verify 2kW hybrid solar load sanction and speed up PM Surya Ghar subsidy approval without delay.',
    priority: 'High',
    status: 'Pending',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-priya-103',
    targetUserId: 'usr-emp-3',
    targetUserName: 'Priya Sharma',
    taskId: 'task-3',
    taskCode: 'DE-TASK-103',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '10kW Commercial Solar Plant - Transport Nagar',
    customerName: 'Gupta Transport Logistics (Mahesh Gupta)',
    customerPhone: '+91 94152 90123',
    customerAddress: 'Warehouse No 4, Transport Nagar, Dhoomanganj, Prayagraj',
    capacityKw: 10,
    ownerCommand: 'Submit UPPCL DISCOM net-metering portal application today. Check sanctioned load 15kW and follow up with Kalyani Devi sub-division inspection challan.',
    priority: 'Urgent',
    status: 'In Progress',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-devashish-101',
    targetUserId: 'usr-emp-1',
    targetUserName: 'Er. Devashish',
    taskId: 'task-1',
    taskCode: 'DE-TASK-101',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '5kW Rooftop Solar - George Town',
    customerName: 'Shri R.K. Srivastava',
    customerPhone: '+91 94151 22890',
    customerAddress: 'Plot 42, Near Tagore Town Crossing, George Town, Prayagraj',
    capacityKw: 5,
    ownerCommand: 'Customer needs survey urgently today. Please verify 3-phase meter feasibility and RCC anchor pull-out test.',
    priority: 'Urgent',
    status: 'In Progress',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-amit-102',
    targetUserId: 'usr-emp-2',
    targetUserName: 'Amit Patel',
    taskId: 'task-2',
    taskCode: 'DE-TASK-102',
    itemType: 'TASK_ASSIGNED',
    projectTitle: '3kW Residential PM Surya Ghar Subsidy - Civil Lines',
    customerName: 'Advocate Alok Verma',
    customerPhone: '+91 98391 76543',
    customerAddress: '15/A Sardar Patel Marg, Civil Lines, Prayagraj',
    capacityKw: 3,
    ownerCommand: 'Structure fabrication check needed. Elevated pergola structure requested by customer. Inspect GI channels today.',
    priority: 'High',
    status: 'Not Started',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dir-vikas-cmp1',
    targetUserId: 'usr-emp-4',
    targetUserName: 'Vikas Yadav',
    complaintId: 'cmp-1',
    complaintTicketNo: 'CMP-2026-004',
    itemType: 'COMPLAINT_ASSIGNED',
    projectTitle: 'Service Ticket: Inverter Error Code E031',
    customerName: 'Kailash Nath Verma',
    customerPhone: '+91 94153 11223',
    customerAddress: 'Naini Industrial Area, Prayagraj',
    capacityKw: 5,
    ownerCommand: 'Vikas, visit Naini site by 11:00 AM. Check Growatt 5kW inverter DC isolator and earthing resistance.',
    priority: 'Urgent',
    status: 'Open',
    assignedBy: 'Dilip Enterprises (Owner)',
    assignedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    isRead: false,
  },
];

// ---------------- INTERNAL TEAM MESSAGES & CHAT ---------------- //
export interface ChatAttachment {
  type: 'image' | 'file' | 'location';
  url?: string; // base64 or photo URL
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  mapsUrl?: string;
}

export interface CrmChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'owner' | 'employee';
  receiverId: string; // 'group-all' for General Team, or specific userId
  receiverName: string;
  text: string;
  attachments?: ChatAttachment[];
  timestamp: string; // ISO string
  isRead: boolean;
}

export const INITIAL_CHAT_MESSAGES: CrmChatMessage[] = [
  {
    id: 'msg-seed-1',
    senderId: 'usr-owner-1',
    senderName: 'Dilip Enterprises (Owner)',
    senderRole: 'owner',
    receiverId: 'group-all',
    receiverName: 'General Team & Field Updates (All Members)',
    text: 'Good morning team! Today 3 installations are scheduled across Prayagraj. All engineers must strictly use safety harnesses and helmets.',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-seed-2',
    senderId: 'usr-emp-3',
    senderName: 'Priya Sharma',
    senderRole: 'employee',
    receiverId: 'group-all',
    receiverName: 'General Team & Field Updates (All Members)',
    text: 'Sir, the UPPCL DISCOM net-metering approval for Advocate Alok Verma\'s 3kW solar plant has been updated on the portal. Attached the sanction report.',
    attachments: [
      {
        type: 'file',
        fileName: 'UPPCL_Sanction_Order_CivilLines.pdf',
        fileSize: '340 KB',
        fileType: 'application/pdf',
      },
    ],
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-seed-3',
    senderId: 'usr-emp-1',
    senderName: 'Er. Devashish',
    senderRole: 'employee',
    receiverId: 'usr-owner-1',
    receiverName: 'Dilip Enterprises (Owner)',
    text: 'Hello Dilip sir, foundation check complete at Lowther Road 10kW On-Grid site. South-facing 24-degree tilt angle is optimal. Sharing photos and live site GPS location.',
    attachments: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
        fileName: 'Lowther_Road_Site_Structure.jpg',
      },
      {
        type: 'location',
        latitude: 25.4358,
        longitude: 81.8463,
        locationName: 'Lowther Road, Near Medical College, Prayagraj',
        mapsUrl: 'https://www.google.com/maps?q=25.4358,81.8463',
      },
    ],
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'msg-seed-4',
    senderId: 'usr-owner-1',
    senderName: 'Dilip Enterprises (Owner)',
    senderRole: 'owner',
    receiverId: 'usr-emp-1',
    receiverName: 'Er. Devashish',
    text: 'Great work Devashish! Please forward the module wiring diagram to Amit as well so the grounding copper strip is laid on schedule.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-seed-5',
    senderId: 'usr-emp-2',
    senderName: 'Amit Patel',
    senderRole: 'employee',
    receiverId: 'usr-owner-1',
    receiverName: 'Dilip Enterprises (Owner)',
    text: 'Dilip sir, 80mm hot-dip GI channels loaded from Transport Nagar warehouse. Delivery to site expected within 30 minutes.',
    attachments: [
      {
        type: 'location',
        latitude: 25.4211,
        longitude: 81.7925,
        locationName: 'Transport Nagar Warehouse Dispatch, Prayagraj',
        mapsUrl: 'https://www.google.com/maps?q=25.4211,81.7925',
      },
    ],
    timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'msg-seed-6',
    senderId: 'usr-emp-1',
    senderName: 'Er. Devashish',
    senderRole: 'employee',
    receiverId: 'usr-emp-2',
    receiverName: 'Amit Patel',
    text: 'Amit, please bring the MC4 crimping tool and multimeter to the Lowther Road site.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isRead: true,
  },
];


