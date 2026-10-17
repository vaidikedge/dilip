import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sun,
  LayoutDashboard,
  CheckSquare,
  Activity,
  Users,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Settings,
  Plus,
  Search,
  Filter,
  Volume2,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  FileText,
  User,
  ShieldAlert,
  Wrench,
  Edit3,
  Phone,
  MapPin,
  Zap,
  Send,
  VolumeX,
  FileSpreadsheet,
  Download,
  Kanban,
  LayoutGrid,
  Table,
  Inbox,
  IndianRupee,
  Share2,
  Trash2,
  SlidersHorizontal,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  RefreshCw,
  History,
  Check,
  Layers,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Award,
  BarChart3,
  Cloud,
  Briefcase,
  Database,
} from 'lucide-react';
import {
  CrmUser,
  CrmTask,
  CrmTaskStatus,
  UserAuditLog,
  TaskTemplate,
  ComplaintTicket,
  ProjectNotification,
  OwnerDirectiveNotification,
  CrmChatMessage,
  ChatAttachment,
  INITIAL_CRM_USERS,
  INITIAL_CRM_TASKS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TASK_TEMPLATES,
  INITIAL_COMPLAINT_TICKETS,
  INITIAL_OWNER_DIRECTIVES,
  INITIAL_CHAT_MESSAGES,
  calculateResponseLag,
  PmSuryaGharStage,
  SolarFeasibilityData,
  SolarEquipmentBOM,
  getPmSuryaGharStageInfo,
} from '../data/crmData';
import {
  playLoudNotificationBeep,
  playOwnerLoudAlertBeep,
  playOwnerDeepAlertSound,
  playSuccessSound,
  playStatusChangeSound,
  playWarningSound,
  playActionClickSound,
  playBulkActionSound,
  unlockAudioContext,
  isSoundEnabled,
  setSoundEnabled,
} from '../utils/audioAlert';
import { CrmAudioControlModal } from '../components/crm/CrmAudioControlModal';
import { handleOwnerLeadCreation, handleTaskStatusUpdate, isUserAuthorizedToUpdateTaskStatus } from '../utils/notificationRoutingEngine';
import { exportTasksToExcel, exportTasksToPDF, getStatusLabel } from '../utils/crmExport';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import { CrmTaskCard } from '../components/crm/CrmTaskCard';
import { NewTaskModal } from '../components/crm/NewTaskModal';
import { ManageUsersModal } from '../components/crm/ManageUsersModal';
import { AuditLogsView } from '../components/crm/AuditLogsView';
import { ProjectNotificationsView } from '../components/crm/ProjectNotificationsView';
import { UserNotificationsView } from '../components/crm/UserNotificationsView';
import { ComplaintModal } from '../components/crm/ComplaintModal';
import { ComplaintServiceReportModal } from '../components/crm/ComplaintServiceReportModal';
import { WhatsAppTemplatesModal } from '../components/crm/WhatsAppTemplatesModal';
import { EditTaskModal } from '../components/crm/EditTaskModal';
import { DeleteConfirmModal } from '../components/crm/DeleteConfirmModal';
import { KanbanBoardView } from '../components/crm/KanbanBoardView';
import { TasksTableView } from '../components/crm/TasksTableView';
import { InboundLeadsPipeline } from '../components/crm/InboundLeadsPipeline';
import { CrmMessagesView } from '../components/crm/CrmMessagesView';
import { SolarQuotationGeneratorModal } from '../components/crm/SolarQuotationGeneratorModal';
import { PmSuryaGharStageModal } from '../components/crm/PmSuryaGharStageModal';
import { SolarFeasibilityModal } from '../components/crm/SolarFeasibilityModal';
import { SolarEquipmentBomModal } from '../components/crm/SolarEquipmentBomModal';
import {
  BusinessWorkspace,
  getStoredBusinesses,
  saveStoredBusinesses,
  getStoredActiveBusinessId,
  saveStoredActiveBusinessId,
  INITIAL_BUSINESSES,
  BUSINESS_TEMPLATE_PRESETS,
} from '../data/businessTemplatesData';
import { BusinessSelectorBar, renderBusinessIcon, getThemeStyles } from '../components/crm/BusinessSelectorBar';
import { AddBusinessModal } from '../components/crm/AddBusinessModal';
import { ManageBusinessModal } from '../components/crm/ManageBusinessModal';
import {
  TaskWorkflowTemplate,
  ActiveLeadWorkflow,
  INITIAL_TASK_WORKFLOW_TEMPLATES,
  getStoredWorkflowTemplates,
  saveStoredWorkflowTemplates,
  getStoredLeadWorkflows,
  saveStoredLeadWorkflows,
  createLeadWorkflowFromTemplate,
  resolveStaffUser,
  resolveStepAssignedUsers,
  calculateNextFlowchartNotificationSteps,
  normalizeStaffUserIds,
} from '../data/workflowTemplateData';
import { TaskTemplatesView } from '../components/crm/TaskTemplatesView';
import { AddTaskTemplateModal } from '../components/crm/AddTaskTemplateModal';
import { CloudSyncBackupModal } from '../components/crm/CloudSyncBackupModal';
import {
  StoredLeadRecord,
  updateLeadStatus,
  saveTaskToFirestore,
  deleteTaskFromFirestore,
  subscribeToTasksFromFirestore,
  subscribeToLeadsFromFirestore,
  saveComplaintToFirestore,
  deleteComplaintFromFirestore,
  subscribeToComplaintsFromFirestore,
  saveChatMessageToFirestore,
  subscribeToChatMessagesFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
  subscribeToUsersFromFirestore,
  subscribeToDeletedUsersFromFirestore,
  saveAuditLogToFirestore,
  subscribeToAuditLogsFromFirestore,
  saveDirectiveToFirestore,
  deleteDirectiveFromFirestore,
  subscribeToDirectivesFromFirestore,
  saveWorkflowTemplateToFirestore,
  deleteWorkflowTemplateFromFirestore,
  subscribeToWorkflowTemplatesFromFirestore,
  saveLeadWorkflowToFirestore,
  deleteLeadWorkflowFromFirestore,
  subscribeToLeadWorkflowsFromFirestore,
  saveBusinessToFirestore,
  subscribeToBusinessesFromFirestore,
  seedInitialCrmDataToFirestore,
  authenticateStaffUser,
  logoutStaffUser,
  subscribeToAuthStatus,
  cleanWipeAndLoadNewCustomers,
  isFirestoreQuotaExhausted,
  subscribeToQuotaStatus,
  retryFirestoreNetwork,
} from '../lib/firebase';
import { fetchTasksFromCloudSql, setStoredAuthToken, clearStoredAuthToken } from '../lib/cloudSqlDb';

// Singleton BroadcastChannel instance to prevent premature port closing
let globalBroadcastChannel: BroadcastChannel | null = null;
function getGlobalBroadcastChannel(): BroadcastChannel | null {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      if (!globalBroadcastChannel) {
        globalBroadcastChannel = new BroadcastChannel('dilip_solar_crm_realtime_ch');
      }
      return globalBroadcastChannel;
    }
  } catch (e) {
    console.warn('BroadcastChannel error:', e);
  }
  return null;
}

const INITIAL_PROJECT_NOTIFICATIONS: ProjectNotification[] = [
  {
    id: 'notif-amit-106-compleated',
    itemType: 'TASK',
    taskCode: 'DE-TASK-106',
    projectTitle: '2kW Hybrid Solar - aman',
    customerName: 'aman',
    customerPhone: '9795598171',
    customerAddress: 'chowk prayagraj',
    capacityKw: 2,
    actionType: 'STATUS_COMPLEATED',
    newStatus: 'compleated',
    oldStatus: 'in progress',
    authorId: 'usr-amit',
    authorName: 'Amit Patel',
    authorRole: 'Site Technician',
    message: 'Amit Patel marked 2kW Hybrid Solar - aman as COMPLEATED',
    optionalRemarks: 'Solar system installed, inverter tested, and connection activated successfully.',
    timestamp: Date.now() - 3 * 60 * 1000,
    formattedTime: new Date(Date.now() - 3 * 60 * 1000).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    isRead: true,
    readByUserIds: ['usr-owner-1', 'usr-emp-1', 'usr-emp-2', 'usr-emp-3', 'usr-emp-4', 'usr-emp-5', 'usr-emp-6', 'usr-emp-7', 'usr-emp-8'],
    priority: 'Urgent',
  },
  {
    id: 'notif-devashish-105-progress',
    itemType: 'TASK',
    taskCode: 'DE-TASK-105',
    projectTitle: '10kW Commercial Solar - Anand Sweets & Bakery',
    customerName: 'Anand Kumar Jaiswal',
    customerPhone: '9839012345',
    customerAddress: 'Civil Lines, Prayagraj',
    capacityKw: 10,
    actionType: 'STATUS_IN_PROGRESS',
    newStatus: 'in progress',
    oldStatus: 'not started',
    authorId: 'usr-devashish',
    authorName: 'Er. Devashish',
    authorRole: 'Senior Installation Engineer',
    message: 'Er. Devashish updated status to In Progress',
    optionalRemarks: 'Rooftop mounting structure foundation ready. Solar panels mounted.',
    timestamp: Date.now() - 42 * 60 * 1000,
    formattedTime: new Date(Date.now() - 42 * 60 * 1000).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    isRead: true,
    priority: 'High',
  },
  {
    id: 'notif-priya-netmetering-submitted',
    itemType: 'TASK',
    taskCode: 'DE-TASK-102',
    projectTitle: '3kW Solar On-Grid - Advocate Alok Verma',
    customerName: 'Advocate Alok Verma',
    customerPhone: '9415123456',
    customerAddress: 'George Town, Prayagraj',
    capacityKw: 3,
    actionType: 'STATUS_IN_PROGRESS',
    newStatus: 'in progress',
    oldStatus: 'not started',
    authorId: 'usr-priya',
    authorName: 'Priya Sharma',
    authorRole: 'Task 2: UPPCL Net-Metering & Banking Executive',
    message: 'Priya Sharma submitted UPPCL DISCOM net-metering portal application',
    optionalRemarks: 'Application reference no. generated. Site inspection scheduled with junior engineer.',
    timestamp: Date.now() - 58 * 60 * 1000,
    formattedTime: new Date(Date.now() - 58 * 60 * 1000).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    isRead: true,
    priority: 'Normal',
  },
];

export const CrmPortalView: React.FC = () => {
  // ---------------- STATE PERSISTENCE ---------------- //
  const [users, setUsers] = useState<CrmUser[]>(() => {
    const getDeletedUserIds = (): Set<string> => {
      try {
        const raw = localStorage.getItem('dilip_crm_deleted_user_ids_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return new Set(parsed.map((s: string) => String(s).toLowerCase()));
        }
      } catch (e) {}
      return new Set();
    };
    const deletedIds = getDeletedUserIds();
    const isDeleted = (u: CrmUser) =>
      deletedIds.has(u.id.toLowerCase()) ||
      deletedIds.has((u.username || '').toLowerCase()) ||
      (u.authUid ? deletedIds.has(u.authUid.toLowerCase()) : false);

    let combined: CrmUser[] = INITIAL_CRM_USERS.filter((u) => !isDeleted(u));
    try {
      const saved = localStorage.getItem('dilip_crm_users_v2');
      if (saved) {
        const parsed: CrmUser[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const userMap = new Map<string, CrmUser>();
          INITIAL_CRM_USERS.forEach((u) => {
            if (!isDeleted(u)) userMap.set(u.id, u);
          });
          parsed.forEach((u) => {
            if (!isDeleted(u)) {
              const ex = userMap.get(u.id);
              userMap.set(u.id, {
                ...ex,
                ...u,
                password: u.password || ex?.password,
              });
            }
          });
          combined = Array.from(userMap.values());
        }
      }
    } catch (e) {}

    return combined.map((u) => ({
      ...u,
      assignedTaskStep: u.assignedTaskStep ?? (
        u.id === 'usr-emp-1' || u.username === 'devashish' ? 1 :
        u.id === 'usr-emp-2' || u.username === 'amit' ? 2 :
        u.id === 'usr-emp-3' || u.username === 'priya' ? 1 :
        u.id === 'usr-emp-4' || u.username === 'vikas' ? 3 :
        u.id === 'usr-emp-5' || u.username === 'poonam' || u.username === 'neha' ? 4 :
        u.role === 'owner' ? undefined : 1
      ),
    }));
  });

  const [tasks, setTasks] = useState<CrmTask[]>(() => {
    try {
      // Purge obsolete cache keys from previous sessions
      localStorage.removeItem('dilip_crm_tasks_v2');
      localStorage.removeItem('dilip_crm_tasks_cache');
      localStorage.removeItem('dilip_crm_inbound_leads_v2');
      localStorage.removeItem('dilip_crm_inbound_leads');

      const saved = localStorage.getItem('dilip_crm_tasks_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const loaded = [...parsed];
          loaded.sort((a: CrmTask, b: CrmTask) => getTaskCreationTimestamp(b) - getTaskCreationTimestamp(a));
          return loaded;
        }
      }
    } catch (e) {}

    try {
      localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(INITIAL_CRM_TASKS));
    } catch (e) {}
    return INITIAL_CRM_TASKS;
  });

  const [auditLogs, setAuditLogs] = useState<UserAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('dilip_crm_audit_logs_v2');
      const backup = localStorage.getItem('dilip_crm_audit_logs_archive_2yr');
      let combined: UserAuditLog[] = [];
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) combined = [...parsed];
      }
      if (backup) {
        const parsedBackup = JSON.parse(backup);
        if (Array.isArray(parsedBackup)) {
          const existingIds = new Set(combined.map((l) => l.id));
          parsedBackup.forEach((item) => {
            if (item && item.id && !existingIds.has(item.id)) {
              combined.push(item);
            }
          });
        }
      }
      if (combined.length === 0) {
        combined = [...INITIAL_AUDIT_LOGS];
      } else {
        // Merge initial sample logs to ensure comprehensive demonstration data
        const existingIds = new Set(combined.map((l) => l.id));
        INITIAL_AUDIT_LOGS.forEach((initLog) => {
          if (!existingIds.has(initLog.id)) {
            combined.push(initLog);
          }
        });
      }
      // 2-Year Retention Window (730 Days = 2 * 365 * 24 * 60 * 60 * 1000 ms)
      const twoYearsAgoMs = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;
      const retained = combined.filter((log) => {
        const logTimeMs = new Date(log.timestamp).getTime();
        return isNaN(logTimeMs) || logTimeMs >= twoYearsAgoMs;
      });
      return retained.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [complaints, setComplaints] = useState<ComplaintTicket[]>(() => {
    const saved = localStorage.getItem('dilip_crm_complaints_v2');
    const list = saved ? JSON.parse(saved) : INITIAL_COMPLAINT_TICKETS;
    return (Array.isArray(list) ? list : []).filter((c: any) => {
      const st = (c?.status || '').toLowerCase();
      return st !== 'compleated' && st !== 'resolved' && st !== 'closed';
    });
  });

  const [templates] = useState<TaskTemplate[]>(INITIAL_TASK_TEMPLATES);

  // ---------------- MULTI-BUSINESS & WORKSPACE TEMPLATES STATE ---------------- //
  const [businesses, setBusinesses] = useState<BusinessWorkspace[]>(() => {
    return getStoredBusinesses();
  });

  const [activeBusinessId, setActiveBusinessId] = useState<string>(() => {
    return getStoredActiveBusinessId();
  });

  const [isAllBusinessesView, setIsAllBusinessesView] = useState<boolean>(false);
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState<boolean>(false);
  const [isManageBusinessOpen, setIsManageBusinessOpen] = useState<boolean>(false);
  const [isBusinessTemplatesMenuExpanded, setIsBusinessTemplatesMenuExpanded] = useState<boolean>(true);

  const activeBusiness = useMemo(() => {
    return (
      businesses.find((b) => b.id === activeBusinessId) ||
      businesses[0] ||
      INITIAL_BUSINESSES[0]
    );
  }, [businesses, activeBusinessId]);

  // Active Authenticated User (Owner session is persistent in localStorage so it stays open indefinitely until manual logout)
  const [currentUser, setCurrentUser] = useState<CrmUser | null>(() => {
    try {
      // 1. Prioritize owner persistent session (always open until manual logout)
      const ownerSaved = localStorage.getItem('dilip_crm_owner_session');
      if (ownerSaved) {
        const parsed = JSON.parse(ownerSaved);
        if (parsed?.role === 'owner') {
          if (parsed.name && parsed.name.includes('Dilip Kumar')) {
            parsed.name = 'Dilip Enterprises';
            try {
              localStorage.setItem('dilip_crm_owner_session', JSON.stringify(parsed));
            } catch (err) {
              // ignore
            }
          }
          return parsed;
        }
      }
      // 2. Check session storage for employees
      const sessionSaved = sessionStorage.getItem('dilip_crm_active_user');
      if (sessionSaved) return JSON.parse(sessionSaved);
    } catch (e) {
      console.warn('Failed to load active user session:', e);
    }
    return null;
  });

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [inactivityNotice, setInactivityNotice] = useState('');

  // Firebase Auth Reactive Synchronization
  useEffect(() => {
    const unsubscribe = subscribeToAuthStatus((fbUser) => {
      if (fbUser) {
        const matched = users.find(
          (u) =>
            u.authUid === fbUser.uid ||
            (fbUser.email && u.email && u.email.toLowerCase() === fbUser.email.toLowerCase()) ||
            (fbUser.email && fbUser.email.startsWith(u.username.toLowerCase() + '@'))
        );
        if (matched) {
          setCurrentUser(matched);
          sessionStorage.setItem('dilip_crm_active_user', JSON.stringify(matched));
          if (matched.role === 'owner') {
            localStorage.setItem('dilip_crm_owner_session', JSON.stringify(matched));
          }
        }
      }
    });
    return () => unsubscribe();
  }, [users]);

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'tasks' | 'notifications' | 'audit-logs' | 'users' | 'templates' | 'complaints' | 'messages' | 'task-templates'
  >('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Search & Filter State
  const [taskSearch, setTaskSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CrmTaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'Normal' | 'High' | 'Urgent'>('all');
  const [downloadModalStatus, setDownloadModalStatus] = useState<'all' | CrmTaskStatus | null>(null);
  const [taskViewMode, setTaskViewMode] = useState<'grid' | 'kanban' | 'table' | 'inbound'>('grid');

  // Task Action Modals
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<CrmTask | null>(null);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<CrmTask | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [taskForWhatsApp, setTaskForWhatsApp] = useState<CrmTask | null>(null);

  // Solar EPC Specific Workflow Modals
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [taskForPmSuryaGhar, setTaskForPmSuryaGhar] = useState<CrmTask | null>(null);
  const [taskForFeasibility, setTaskForFeasibility] = useState<CrmTask | null>(null);
  const [taskForEquipmentBom, setTaskForEquipmentBom] = useState<CrmTask | null>(null);

  // Complaints State & Modals
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintUserFilter, setComplaintUserFilter] = useState('all');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<'all' | CrmTaskStatus>('all');
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [complaintToEdit, setComplaintToEdit] = useState<ComplaintTicket | null>(null);
  const [selectedComplaintForReport, setSelectedComplaintForReport] = useState<ComplaintTicket | null>(null);

  // Modals
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isManageUsersOpen, setIsManageUsersOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  // Firestore Spark Plan Quota Resilience State
  const [isQuotaExceededMode, setIsQuotaExceededMode] = useState<boolean>(() => isFirestoreQuotaExhausted());

  useEffect(() => {
    const unsub = subscribeToQuotaStatus((exhausted) => {
      setIsQuotaExceededMode(exhausted);
    });
    return () => unsub();
  }, []);

  // Helper to detect and filter out login/logout/user activity notifications from Project Notifications
  // Strictly per Owner specification: login, logout, and presence belong exclusively in User Activity Logs!
  const isLoginOrLogoutNotification = (item: any): boolean => {
    if (!item) return false;
    if (item.itemType === 'LOGIN' || item.itemType === 'LOGOUT' || item.itemType === 'USER_ACTIVITY') return true;
    if (
      item.actionType === 'LOGIN' ||
      item.actionType === 'LOGOUT' ||
      item.actionType === 'AUTO_LOGOUT_5MIN_INACTIVITY' ||
      item.actionType === 'FORCE_LOGOUT'
    )
      return true;
    const msg = (item.message || '').toLowerCase();
    const title = (item.projectTitle || item.itemTitle || '').toLowerCase();
    const code = (item.taskCode || item.itemCode || '').toLowerCase();
    if (
      msg.includes('logged out') ||
      msg.includes('logged in') ||
      msg.includes('inactivity logout') ||
      msg.includes('force-logged out') ||
      msg.includes('portal login') ||
      msg.includes('active session')
    )
      return true;
    if (
      title.includes('portal login') ||
      title.includes('inactivity logout') ||
      title.includes('logged out') ||
      title.includes('active session')
    )
      return true;
    if (code === 'auto_logout' || code === 'login' || code === 'logout' || code === 'force_logout') return true;
    return false;
  };

  // Project Notifications State (Exclusively for Owner Panel - Projects & Tasks Only)
  const [projectNotifications, setProjectNotifications] = useState<ProjectNotification[]>(() => {
    try {
      const saved = localStorage.getItem('dilip_crm_project_notifications_v3');
      const clearedFlag = localStorage.getItem('dilip_crm_historical_101_seen_cleared_v7');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((p) => !isLoginOrLogoutNotification(p));
          // If the user's historical 101 notifications have not been marked seen yet, mark them as seen
          if (!clearedFlag) {
            try {
              localStorage.setItem('dilip_crm_historical_101_seen_cleared_v7', 'true');
              const allStaffAndOwnerIds = [
                'usr-owner-1',
                'usr-emp-1',
                'usr-emp-2',
                'usr-emp-3',
                'usr-emp-4',
                'usr-emp-5',
                'usr-emp-6',
                'usr-emp-7',
                'usr-emp-8',
              ];
              const marked = cleaned.map((n) => ({
                ...n,
                isRead: true,
                readByUserIds: Array.from(new Set([...(Array.isArray(n.readByUserIds) ? n.readByUserIds : []), ...allStaffAndOwnerIds])),
              }));
              localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify(marked));
              return marked;
            } catch (e) {}
          }
          return cleaned.length > 0 ? cleaned : INITIAL_PROJECT_NOTIFICATIONS;
        }
      }
    } catch (e) {
      console.warn('Failed to load project notifications:', e);
    }
    return INITIAL_PROJECT_NOTIFICATIONS;
  });

  // Helper to detect false/bogus notifications (such as synthetic handovers falsely claiming Priya updated Sachin or assigning Step 4 to Poonam)
  const isBogusCascadeDirective = (d: OwnerDirectiveNotification): boolean => {
    const isSachin =
      d.customerName?.toLowerCase().includes('sachin') ||
      d.projectTitle?.toLowerCase().includes('sachin') ||
      d.taskCode === 'DIL-104';
    const claimsPriyaUpdated =
      d.assignedBy?.toLowerCase().includes('priya') ||
      d.ownerCommand?.toLowerCase().includes('priya sharma');
    const isStep4 =
      d.ownerCommand?.toLowerCase().includes('step #4') ||
      d.projectTitle?.toLowerCase().includes('step #4');

    // Valid cascade updates should NEVER be marked bogus
    if ((d as any).eventType === 'status_update') return false;

    // False notification 1: claiming Priya Sharma updated sachin
    if (isSachin && claimsPriyaUpdated) return true;
    // False notification 2: Step 4 notification sent for sachin (since Task 1 user updated, only Step 2 & 3 should be notified)
    if (isSachin && isStep4) return true;
    // False notification 3: Synthetic dir-flow from old auto-reconciliation
    if (d.id?.startsWith('dir-flow-') && d.assignedBy?.includes('Priya Sharma (Task 2 User)') && isSachin) return true;

    // False notification 4: Task 3 (Vikas Yadav) receiving initial lead creation directive
    // Task 3 MUST NEVER receive the lead or notification upon initial creation
    const isInitialLeadDirective =
      (d as any).eventType === 'lead_creation' ||
      (!((d as any).eventType) && (
        (d.projectTitle || '').includes('Flowchart Assignment') ||
        (d.ownerCommand || '').includes('New Lead Flowchart Assignment')
      ));
    const isTask3User = d.targetUserId === 'usr-emp-4' || d.targetUserName?.toLowerCase().includes('vikas');
    if (isInitialLeadDirective && isTask3User) return true;

    // False notification 5: Synthetic dir-flow-t3-* directives from old auto-sync
    if (d.id?.startsWith('dir-flow-t3-')) return true;

    return false;
  };

  // User Notifications State (Personalized Owner Directives per Staff Member)
  const [ownerDirectives, setOwnerDirectives] = useState<OwnerDirectiveNotification[]>(() => {
    try {
      const saved = localStorage.getItem('dilip_crm_owner_directives_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((d) => !isBogusCascadeDirective(d));
          cleaned.sort((a, b) => {
            const timeA = new Date(a.updatedAt || a.assignedAt || 0).getTime();
            const timeB = new Date(b.updatedAt || b.assignedAt || 0).getTime();
            return (timeB - timeA) || b.id.localeCompare(a.id);
          });
          return cleaned;
        }
      }
    } catch (e) {
      console.warn('Failed to load owner directives:', e);
    }
    return INITIAL_OWNER_DIRECTIVES;
  });
  const [isUserNotificationDropdownOpen, setIsUserNotificationDropdownOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify(ownerDirectives));
    } catch (e) {}
  }, [ownerDirectives]);

  // Self-sanitization: Purge any login/logout notifications from project notifications feed
  useEffect(() => {
    setProjectNotifications((prev) => {
      const hasBogus = prev.some((p) => isLoginOrLogoutNotification(p));
      if (!hasBogus) return prev;
      const cleaned = prev.filter((p) => !isLoginOrLogoutNotification(p));
      try {
        localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify(cleaned));
      } catch (e) {}
      return cleaned;
    });

    setOwnerNotificationHistory((prev) => {
      const hasBogus = prev.some((p) => isLoginOrLogoutNotification(p));
      if (!hasBogus) return prev;
      const cleaned = prev.filter((p) => !isLoginOrLogoutNotification(p));
      try {
        localStorage.setItem('dilip_crm_owner_recent_notifications_v2', JSON.stringify(cleaned));
      } catch (e) {}
      return cleaned;
    });
  }, []);

  // Guarantee that historical notifications already seen by the user don't show an unread badge on panel reload
  useEffect(() => {
    const historicalCleared = localStorage.getItem('dilip_crm_all_historical_101_seen_v7');
    if (!historicalCleared) {
      try {
        localStorage.setItem('dilip_crm_all_historical_101_seen_v7', 'true');
        const allKnownUserIds = [
          'usr-owner-1',
          'usr-emp-1',
          'usr-emp-2',
          'usr-emp-3',
          'usr-emp-4',
          'usr-emp-5',
          'usr-emp-6',
          'usr-emp-7',
          'usr-emp-8',
        ];
        if (currentUser?.id) allKnownUserIds.push(currentUser.id);
        const uniqueIds = Array.from(new Set(allKnownUserIds));

        setProjectNotifications((prev) => {
          const marked = prev.map((n) => ({
            ...n,
            isRead: true,
            readByUserIds: Array.from(new Set([...(Array.isArray(n.readByUserIds) ? n.readByUserIds : []), ...uniqueIds])),
          }));
          try {
            localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify(marked));
            uniqueIds.forEach((uid) => {
              const readKey = `dilip_crm_read_notif_ids_${uid}`;
              const allIds = marked.map((n) => n.id);
              localStorage.setItem(readKey, JSON.stringify(allIds));
            });
          } catch (e) {}
          return marked;
        });
      } catch (e) {}
    }
  }, [currentUser]);

  // ---------------- TASK WORKFLOW TEMPLATES & 2-STEP CASCADE STATE ---------------- //
  const [taskWorkflowTemplates, setTaskWorkflowTemplates] = useState<TaskWorkflowTemplate[]>(() => {
    return getStoredWorkflowTemplates();
  });

  const [activeLeadWorkflows, setActiveLeadWorkflows] = useState<ActiveLeadWorkflow[]>(() => {
    return getStoredLeadWorkflows();
  });

  const [isAddTaskTemplateModalOpen, setIsAddTaskTemplateModalOpen] = useState(false);
  const [isTaskTemplatesMenuExpanded, setIsTaskTemplatesMenuExpanded] = useState(true);
  const lastDirectiveSentRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    saveStoredWorkflowTemplates(taskWorkflowTemplates);
  }, [taskWorkflowTemplates]);

  useEffect(() => {
    saveStoredLeadWorkflows(activeLeadWorkflows);
  }, [activeLeadWorkflows]);

  const handleSaveWorkflowTemplate = (newTemplate: TaskWorkflowTemplate) => {
    setTaskWorkflowTemplates((prev) => [newTemplate, ...prev]);
    saveWorkflowTemplateToFirestore(newTemplate);
    recordAuditEvent(
      currentUser,
      'TASK_ASSIGNED',
      `Owner created new task workflow template "${newTemplate.title}" with ${newTemplate.steps.length} steps`
    );
  };

  const handleDeleteWorkflowTemplate = (templateId: string) => {
    setTaskWorkflowTemplates((prev) => prev.filter((t) => t.id !== templateId));
    deleteWorkflowTemplateFromFirestore(templateId);
  };

  const handleDeleteLeadWorkflow = (workflowId: string) => {
    setActiveLeadWorkflows((prev) => prev.filter((wf) => wf.id !== workflowId));
    deleteLeadWorkflowFromFirestore(workflowId);
    recordAuditEvent(
      currentUser,
      'TASK_UPDATED',
      `Owner deleted flowchart / active workflow "${workflowId}"`
    );
  };

  const handleUpdateLeadWorkflow = (updated: ActiveLeadWorkflow) => {
    setActiveLeadWorkflows((prev) => {
      const nextList = prev.map((wf) => (wf.id === updated.id ? updated : wf));
      saveStoredLeadWorkflows(nextList);
      return nextList;
    });
    saveLeadWorkflowToFirestore(updated);

    // Also synchronize corresponding project task in CRM
    setTasks((prevTasks) => {
      const target = prevTasks.find(
        (t) =>
          (updated.taskId && t.id === updated.taskId) ||
          (t.workflowId && t.workflowId === updated.id) ||
          (t.customerPhone &&
            updated.customerPhone &&
            t.customerPhone.replace(/\D/g, '') === updated.customerPhone.replace(/\D/g, '')) ||
          (t.customerName &&
            updated.customerName &&
            t.customerName.trim().toLowerCase() === updated.customerName.trim().toLowerCase())
      );
      if (!target) return prevTasks;

      // Find latest updated step in the workflow
      const activeSteps = updated.steps.filter((s) => s.status !== 'not started');
      const latestStep = activeSteps[activeSteps.length - 1];
      const newStatus =
        latestStep?.status === 'compleated'
          ? updated.steps.every((s) => s.status === 'compleated')
            ? 'compleated'
            : 'in progress'
          : latestStep?.status === 'in progress'
          ? 'in progress'
          : target.status;

      // Strictly synchronize all appointed staff across all workflow steps as set by Super Admin
      const allWfUserIds = Array.from(
        new Set(
          updated.steps.flatMap((s) => [
            ...(s.assignedUserIds || []),
            ...resolveStepAssignedUsers(s.stepNumber, s.assignedUserIds, undefined, users).map((u) => u.id),
          ])
        )
      ).filter((id): id is string => Boolean(id));

      const allWfUserNames = Array.from(
        new Set(
          updated.steps.flatMap((s) => [
            ...(s.assignedUserNames || []),
            ...resolveStepAssignedUsers(s.stepNumber, s.assignedUserIds, undefined, users).map((u) => u.name),
            ...(s.assignedUserIds || []).map((uid) => resolveStaffUser(uid, users)?.name || uid),
          ])
        )
      ).filter((name): name is string => Boolean(name && !name.startsWith('usr-')));

      const primaryUserName =
        updated.steps[0]?.assignedUserNames?.[0] || allWfUserNames[0] || target.assignedToUserName;
      const primaryUserId =
        updated.steps[0]?.assignedUserIds?.[0] || allWfUserIds[0] || target.assignedToUserId;

      // Synchronize written work descriptions directly into CRM Task's Remarks History
      let updatedRemarks = [...(target.remarksHistory || [])];
      if (latestStep?.lastWorkDescription) {
        const latestStepRemark = `[Flowchart Step #${latestStep.stepNumber}: ${latestStep.title}] Status: ${latestStep.status.toUpperCase()} | Work Notes: "${latestStep.lastWorkDescription}"`;
        const alreadyHasRemark = updatedRemarks.some(
          (r) => r.message === latestStepRemark && Date.now() - new Date(r.timestamp).getTime() < 30000
        );
        if (!alreadyHasRemark) {
          updatedRemarks.unshift({
            id: `rem-wf-${Date.now()}`,
            authorId: currentUser?.id || 'usr-crm',
            authorName: currentUser?.name || 'Staff Technician',
            authorRole: (currentUser?.role === 'owner' ? 'owner' : 'employee'),
            statusChangedTo: newStatus as any,
            message: latestStepRemark,
            timestamp: updated.updatedAt || new Date().toISOString(),
          });
        }
      }

      const updatedTask: CrmTask = {
        ...target,
        workflowId: updated.id,
        status: newStatus as any,
        lastUpdatedAt: updated.updatedAt || new Date().toISOString(),
        lastUpdatedBy: currentUser?.name || target.lastUpdatedBy,
        assignedToUserId: primaryUserId,
        assignedToUserName: primaryUserName,
        assignedUserIds: allWfUserIds.length > 0 ? allWfUserIds : target.assignedUserIds,
        assignedUserNames: allWfUserNames.length > 0 ? allWfUserNames : target.assignedUserNames,
        remarksHistory: updatedRemarks,
      };

      const updatedList = prevTasks.map((t) => (t.id === target.id ? updatedTask : t));
      try {
        localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(updatedList));
      } catch (e) {}
      saveTaskToFirestore(updatedTask);
      return updatedList;
    });

    if (currentUser) {
      const activeSteps = updated.steps.filter((s) => s.status !== 'not started');
      const latestStep = activeSteps[activeSteps.length - 1];
      recordAuditEvent(
        currentUser,
        'TASK_UPDATED',
        `Flowchart updated for customer "${updated.customerName}". Step #${latestStep?.stepNumber || 1} (${latestStep?.title || 'Phase'}) is "${latestStep?.status || 'updated'}"${latestStep?.lastWorkDescription ? ` | Work Notes: "${latestStep.lastWorkDescription}"` : ''}`
      );
    }
  };

  const handleUpdateWorkflowTemplate = (updatedTemplate: TaskWorkflowTemplate) => {
    setTaskWorkflowTemplates((prev) => {
      const updated = prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t));
      saveStoredWorkflowTemplates(updated);
      return updated;
    });
    saveWorkflowTemplateToFirestore(updatedTemplate);
    recordAuditEvent(
      currentUser,
      'TASK_ASSIGNED',
      `Owner updated task workflow template "${updatedTemplate.title}" default step assignments`
    );
  };

  const handleCreateDirectiveNotification = (
    notif: Omit<OwnerDirectiveNotification, 'id' | 'assignedAt' | 'isRead'>
  ) => {
    // Multi-click deduplication: Strictly prevent duplicate notifications when user clicks Save 2, 3, or 4 times rapidly
    const nowTime = Date.now();
    const dedupKey = `${notif.targetUserId}_${notif.taskId || notif.taskCode || notif.customerName}_${notif.projectTitle}_${notif.status}_${notif.ownerCommand}`;
    const lastTime = lastDirectiveSentRef.current.get(dedupKey);
    if (lastTime && nowTime - lastTime < 1200) {
      return;
    }
    lastDirectiveSentRef.current.set(dedupKey, nowTime);

    const now = new Date().toISOString();
    const directive: OwnerDirectiveNotification = {
      ...notif,
      id: `dir-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      assignedAt: now,
      isRead: false,
    };

    setOwnerDirectives((prev) => {
      const map = new Map<string, OwnerDirectiveNotification>(prev.map((d) => [d.id, d]));
      map.set(directive.id, directive);
      const updated = Array.from(map.values()).sort((a, b) => {
        const timeA = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
        const timeB = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
        return (timeB - timeA) || b.id.localeCompare(a.id);
      });
      try {
        localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    saveDirectiveToFirestore(directive);

    // Also mirror to Project Notifications so Dilip Enterprises and team can view flowchart update in Notifications desk
    const pNotif: ProjectNotification = {
      id: `pnotif-dir-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemType: 'TASK',
      taskCode: notif.taskCode || 'WF',
      projectTitle: notif.projectTitle,
      customerName: notif.customerName,
      customerPhone: notif.customerPhone,
      customerAddress: notif.customerAddress,
      capacityKw: notif.capacityKw,
      actionType: notif.status === 'compleated' ? 'STATUS_COMPLEATED' : 'TASK_ASSIGNED',
      newStatus: notif.status,
      authorId: currentUser?.id || 'usr-crm',
      authorName: notif.assignedBy || currentUser?.name || 'CRM System',
      authorRole: currentUser?.role || 'Staff',
      message: notif.projectTitle
        ? `${notif.projectTitle} - Status: ${notif.status?.toUpperCase() || 'UPDATED'}`
        : notif.ownerCommand,
      optionalRemarks: notif.ownerCommand,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false,
      priority: notif.priority || 'High',
    };

    setProjectNotifications((prev) => {
      const updated = [pNotif, ...prev];
      try {
        localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    broadcastUserUpdate({
      type: 'OWNER_DIRECTIVE',
      directive,
      projectNotification: pNotif,
    });
  };

  const handleAttachLeadWorkflow = (newWf: ActiveLeadWorkflow) => {
    // 1. Normalize all step assignedUserIds to canonical IDs
    const normalizedWf: ActiveLeadWorkflow = {
      ...newWf,
      currentActiveFlowStepNumbers: [1, 2], // Strictly Task 1 and Task 2 on lead creation
      notifiedSteps: [1, 2],
      steps: newWf.steps.map((st) => {
        const normalizedIds = normalizeStaffUserIds(st.assignedUserIds || [], users);
        const names = normalizedIds.map((uid) => resolveStaffUser(uid, users)?.name || uid);
        return {
          ...st,
          assignedUserIds: normalizedIds,
          assignedUserNames: names,
          isNotified: st.stepNumber === 1 || st.stepNumber === 2,
        };
      }),
      updatedAt: new Date().toISOString(),
    };

    setActiveLeadWorkflows((prev) => [normalizedWf, ...prev]);
    saveLeadWorkflowToFirestore(normalizedWf);

    // 2. Strictly synchronize appointed staff from workflow steps as set by Super Admin
    const initialActiveStepNums = normalizedWf.currentActiveFlowStepNumbers || [1, 2];
    const activeAssignedIds = Array.from(
      new Set(
        normalizedWf.steps
          .filter((s) => initialActiveStepNums.includes(s.stepNumber))
          .flatMap((s) => s.assignedUserIds || [])
      )
    ).filter(Boolean);
    const activeAssignedNames = activeAssignedIds.map(
      (uid) => resolveStaffUser(uid, users)?.name || uid
    );

    // All appointed team members across all steps
    const allWfAssignedIds = Array.from(
      new Set(normalizedWf.steps.flatMap((s) => s.assignedUserIds || []))
    ).filter(Boolean);
    const allWfAssignedNames = Array.from(
      new Set(
        normalizedWf.steps.flatMap((s) => [
          ...(s.assignedUserNames || []),
          ...(s.assignedUserIds || []).map((uid) => resolveStaffUser(uid, users)?.name || uid),
        ])
      )
    ).filter((name): name is string => Boolean(name && !name.startsWith('usr-')));

    const primaryUserId = (normalizedWf.steps[0]?.assignedUserIds?.[0]) || activeAssignedIds[0] || allWfAssignedIds[0] || '';
    const primaryUserName = (normalizedWf.steps[0]?.assignedUserNames?.[0]) || activeAssignedNames[0] || resolveStaffUser(primaryUserId, users)?.name || 'Unassigned';

    // Synchronize or create corresponding project task in CRM tasks
    const currentTasksList = Array.isArray(tasks) ? [...tasks] : [];
    const matchIdx = currentTasksList.findIndex(
      (t) =>
        (normalizedWf.taskId && t.id === normalizedWf.taskId) ||
        (t.workflowId && t.workflowId === normalizedWf.id) ||
        (t.customerPhone &&
          normalizedWf.customerPhone &&
          t.customerPhone.replace(/\D/g, '') === normalizedWf.customerPhone.replace(/\D/g, '')) ||
        (t.customerName &&
          normalizedWf.customerName &&
          t.customerName.trim().toLowerCase() === normalizedWf.customerName.trim().toLowerCase())
    );

    let targetTask: CrmTask;
    let associatedTaskId = normalizedWf.taskId || '';
    let associatedTaskCode = '';

    if (matchIdx >= 0) {
      const existing = currentTasksList[matchIdx];
      targetTask = {
        ...existing,
        workflowId: normalizedWf.id,
        assignedToUserId: existing.assignedToUserId || primaryUserId,
        assignedToUserName:
          existing.assignedToUserName && existing.assignedToUserName !== 'Unassigned'
            ? existing.assignedToUserName
            : primaryUserName,
        assignedUserIds: activeAssignedIds.length > 0 ? activeAssignedIds : (existing.assignedUserIds || allWfAssignedIds),
        assignedUserNames: activeAssignedNames.length > 0 ? activeAssignedNames : (existing.assignedUserNames || allWfAssignedNames),
      };
      currentTasksList[matchIdx] = targetTask;
      associatedTaskId = targetTask.id;
      associatedTaskCode = targetTask.taskCode;
    } else {
      const nowIso = new Date().toISOString();
      const cap = normalizedWf.capacityKw || 3;
      targetTask = {
        id: normalizedWf.taskId || `task-wf-${normalizedWf.id}`,
        taskCode: `WF-${(normalizedWf.customerName || 'LEAD').substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        title: `${cap}kW Rooftop Solar - ${normalizedWf.customerName}`,
        customerName: normalizedWf.customerName,
        customerPhone: normalizedWf.customerPhone,
        customerAddress: normalizedWf.customerAddress || 'Prayagraj',
        capacityKw: cap,
        systemType: 'On-Grid Rooftop',
        monthlyBillRs: '3500',
        priority: 'High',
        assignedToUserId: primaryUserId,
        assignedToUserName: primaryUserName,
        assignedUserIds: activeAssignedIds.length > 0 ? activeAssignedIds : allWfAssignedIds,
        assignedUserNames: activeAssignedNames.length > 0 ? activeAssignedNames : allWfAssignedNames,
        assignedBy: currentUser?.name || 'Owner',
        assignedAt: nowIso,
        ownerInstructions: `Lead flowchart workflow attached (${normalizedWf.templateTitle}). Please execute assigned steps.`,
        status: 'not started',
        lastUpdatedAt: nowIso,
        lastUpdatedBy: currentUser?.name || 'Owner',
        dealValueRs: cap * 65000,
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        leadSource: 'Flowchart SOP Lead',
        businessId: activeBusinessId || 'biz-solar-dilip',
        businessName: activeBusiness?.name || 'Dilip Enterprises',
        workflowId: normalizedWf.id,
        remarksHistory: [
          {
            id: `rem-wf-${Date.now()}`,
            authorId: currentUser?.id || 'owner',
            authorName: currentUser?.name || 'Owner',
            authorRole: currentUser?.role || 'owner',
            statusChangedTo: 'not started',
            message: `Flowchart workflow "${normalizedWf.templateTitle}" attached to customer ${normalizedWf.customerName}.`,
            timestamp: nowIso,
          },
        ],
      };
      currentTasksList.unshift(targetTask);
      associatedTaskId = targetTask.id;
      associatedTaskCode = targetTask.taskCode;
    }

    setTasks(currentTasksList);
    try {
      localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(currentTasksList));
    } catch (e) {}
    saveTaskToFirestore(targetTask);

    // 3. Dispatch initial notification EXCLUSIVELY to Task 1 AND Task 2 assigned staff members!
    // Using handleOwnerLeadCreation to guarantee Task 3 NEVER receives initial dispatch
    const userStepMap: Record<string, number> = {};
    normalizedWf.steps.forEach((st) => {
      if (initialActiveStepNums.includes(st.stepNumber)) {
        (st.assignedUserIds || []).forEach((uid) => {
          if (!userStepMap[uid]) {
            userStepMap[uid] = st.stepNumber;
          }
        });
      }
    });

    const { directivesToDeliver } = handleOwnerLeadCreation(
      {
        leadId: associatedTaskId || normalizedWf.taskId || '',
        customerName: normalizedWf.customerName,
        customerPhone: normalizedWf.customerPhone,
        customerAddress: normalizedWf.customerAddress,
        capacityKw: normalizedWf.capacityKw,
        priority: 'High',
        source: 'lead-workflow-attach',
        creatorName: `${currentUser?.name || 'Dilip Enterprises'} (Owner)`,
        taskCode: associatedTaskCode || `WF-${(normalizedWf.customerName || 'LEAD').substring(0, 4).toUpperCase()}`,
        projectTitle: `⚡ Flowchart Initialized: ${normalizedWf.customerName} (${normalizedWf.capacityKw || 3}kW Solar)`,
        ownerCommand: `Lead flowchart initialized (${normalizedWf.templateTitle}). Action required for Task Step.`,
      },
      users,
      activeAssignedIds,
      userStepMap
    );

    const notifiedStaffSummary: string[] = [];
    directivesToDeliver.forEach((dir) => {
      notifiedStaffSummary.push(`${dir.targetUserName}`);
      handleCreateDirectiveNotification(dir);
    });

    // 3. Dispatch an Owner Project Notification so the Owner panel visibly confirms the dispatch to Task 1 & Task 2!
    const ownerNotif: ProjectNotification = {
      id: `pnotif-wf-${Date.now()}`,
      itemType: 'TASK',
      taskCode: `WF-${normalizedWf.customerName.substring(0, 4).toUpperCase()}`,
      projectTitle: `⚡ Flowchart Attached: ${normalizedWf.customerName}`,
      customerName: normalizedWf.customerName,
      customerPhone: normalizedWf.customerPhone,
      customerAddress: normalizedWf.customerAddress || 'Prayagraj',
      capacityKw: normalizedWf.capacityKw || 3,
      actionType: 'TASK_ASSIGNED',
      newStatus: 'not started',
      authorId: currentUser?.id || 'usr-owner-1',
      authorName: currentUser?.name || 'Dilip Enterprises',
      authorRole: currentUser?.role || 'owner',
      message: `Lead flowchart initialized. Ratio-2 initial notifications sent to Task 1 & Task 2 assigned staff: ${
        notifiedStaffSummary.length > 0 ? notifiedStaffSummary.join(', ') : 'No staff appointed yet on Task 1/2'
      }.`,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false,
      priority: 'High',
    };
    setProjectNotifications((prev) => [ownerNotif, ...prev]);

    broadcastUserUpdate({
      type: 'OWNER_DIRECTIVE',
      id: `task-wf-${Date.now()}`,
      authorName: currentUser?.name || 'Owner',
      authorRole: currentUser?.role || 'owner',
      itemType: 'TASK',
      taskCode: targetTask.taskCode,
      projectTitle: targetTask.title,
      customerName: targetTask.customerName,
      newStatus: targetTask.status,
      message: `Flowchart workflow attached: ${targetTask.title}`,
      timestamp: Date.now(),
      projectNotification: ownerNotif,
      task: targetTask,
    });

    recordAuditEvent(
      currentUser || users[0],
      'TASK_ASSIGNED',
      `Flowchart initialized for lead "${normalizedWf.customerName}". Ratio-2 notifications sent to Task 1 & Task 2 assigned staff: ${
        notifiedStaffSummary.length > 0 ? notifiedStaffSummary.join(', ') : 'None assigned yet'
      }`
    );
  };

  // Filter directives strictly for the current staff user
  const userDirectives = useMemo(() => {
    if (!currentUser) return [];
    const list = ownerDirectives.filter((d) => {
      // Owner or Super Admin sees all directives
      if (currentUser.role === 'owner' || (currentUser.role as string) === 'Super Admin') return true;
      // All-team broadcast notifications
      if (d.targetUserId === 'all' || !d.targetUserId) return true;
      if (d.targetUserId === currentUser.id) return true;
      const resolved = resolveStaffUser(d.targetUserId, users);
      if (resolved && resolved.id === currentUser.id) return true;
      if (
        d.targetUserName &&
        currentUser.name &&
        (d.targetUserName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
          currentUser.name.toLowerCase().includes(d.targetUserName.toLowerCase()))
      ) {
        return true;
      }
      return false;
    });

    return list.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.assignedAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.assignedAt || 0).getTime();
      return (timeB - timeA) || b.id.localeCompare(a.id);
    });
  }, [ownerDirectives, currentUser, users]);

  // Per-User Read Tracking Helpers
  const isDirectiveReadForUser = (d: OwnerDirectiveNotification, userId?: string): boolean => {
    if (!userId) return Boolean(d.isRead);
    if (Array.isArray(d.readByUserIds) && d.readByUserIds.includes(userId)) {
      return true;
    }
    try {
      const stored = localStorage.getItem(`dilip_crm_read_directive_ids_${userId}`);
      if (stored) {
        const idSet = JSON.parse(stored);
        if (Array.isArray(idSet) && idSet.includes(d.id)) {
          return true;
        }
      }
    } catch (e) {}
    return Boolean(d.isRead);
  };

  // Unread directives count for current user
  const unreadUserDirectivesCount = useMemo(() => {
    if (!currentUser) return 0;
    return userDirectives.filter((d) => !isDirectiveReadForUser(d, currentUser.id)).length;
  }, [userDirectives, currentUser]);

  const handleMarkDirectiveAsRead = (id: string) => {
    if (!currentUser) return;
    const currentUserId = currentUser.id;
    try {
      const key = `dilip_crm_read_directive_ids_${currentUserId}`;
      const stored = localStorage.getItem(key);
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch (e) {}

    setOwnerDirectives((prev) => {
      const updated = prev.map((d) => {
        if (d.id !== id) return d;
        const currentReads = Array.isArray(d.readByUserIds) ? d.readByUserIds : [];
        const isNowRead = !isDirectiveReadForUser(d, currentUserId);
        const nextReads = isNowRead
          ? Array.from(new Set([...currentReads, currentUserId]))
          : currentReads.filter((u) => u !== currentUserId);
        return {
          ...d,
          isRead: isNowRead,
          readByUserIds: nextReads,
          readAt: new Date().toISOString(),
        };
      });
      try {
        localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleMarkAllUserDirectivesAsRead = () => {
    if (!currentUser) return;
    const currentUserId = currentUser.id;
    try {
      const key = `dilip_crm_read_directive_ids_${currentUserId}`;
      const stored = localStorage.getItem(key);
      const list: string[] = stored ? JSON.parse(stored) : [];
      userDirectives.forEach((d) => {
        if (!list.includes(d.id)) list.push(d.id);
      });
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}

    setOwnerDirectives((prev) => {
      const updated = prev.map((d) => {
        const isForUser =
          d.targetUserId === 'all' ||
          !d.targetUserId ||
          d.targetUserId === currentUserId ||
          (d.targetUserName &&
            currentUser.name &&
            d.targetUserName.toLowerCase().includes(currentUser.name.toLowerCase()));
        if (isForUser) {
          const currentReads = Array.isArray(d.readByUserIds) ? d.readByUserIds : [];
          return {
            ...d,
            isRead: true,
            readByUserIds: Array.from(new Set([...currentReads, currentUserId])),
            readAt: new Date().toISOString(),
          };
        }
        return d;
      });
      try {
        localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleOpenUserNotificationsTab = () => {
    setActiveTab('notifications');
    // Opening the notification section automatically marks all directives as read for the user
    handleMarkAllUserDirectivesAsRead();
  };

  // Per-User Project Notification Read Tracking
  const isProjectNotifReadForUser = (n: ProjectNotification, userId?: string): boolean => {
    if (!userId) return Boolean(n.isRead);
    if (Array.isArray(n.readByUserIds) && n.readByUserIds.includes(userId)) {
      return true;
    }
    try {
      const stored = localStorage.getItem(`dilip_crm_read_notif_ids_${userId}`);
      if (stored) {
        const idSet = JSON.parse(stored);
        if (Array.isArray(idSet) && idSet.includes(n.id)) {
          return true;
        }
      }
    } catch (e) {}
    if (currentUser?.role === 'owner' && n.isRead) {
      return true;
    }
    return Boolean(n.isRead && (!n.readByUserIds || n.readByUserIds.length === 0));
  };

  // Unread Project Notifications count for current user
  const unreadNotificationsCount = useMemo(() => {
    if (!currentUser) return 0;
    return projectNotifications.filter((n) => !isProjectNotifReadForUser(n, currentUser.id)).length;
  }, [projectNotifications, currentUser]);

  const handleMarkProjectNotificationAsRead = (id: string) => {
    if (!currentUser) return;
    const currentUserId = currentUser.id;
    try {
      const key = `dilip_crm_read_notif_ids_${currentUserId}`;
      const stored = localStorage.getItem(key);
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch (e) {}

    setProjectNotifications((prev) => {
      const updated = prev.map((n) => {
        if (n.id !== id) return n;
        const currentReads = Array.isArray(n.readByUserIds) ? n.readByUserIds : [];
        const isNowRead = true;
        const nextReads = Array.from(new Set([...currentReads, currentUserId]));
        return {
          ...n,
          isRead: isNowRead,
          readByUserIds: nextReads,
          readAt: new Date().toISOString(),
        };
      });
      try {
        localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleMarkAllProjectNotificationsAsRead = () => {
    if (!currentUser) return;
    const currentUserId = currentUser.id;
    try {
      const key = `dilip_crm_read_notif_ids_${currentUserId}`;
      const stored = localStorage.getItem(key);
      const list: string[] = stored ? JSON.parse(stored) : [];
      projectNotifications.forEach((n) => {
        if (!list.includes(n.id)) list.push(n.id);
      });
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}

    setProjectNotifications((prev) => {
      const updated = prev.map((n) => {
        const currentReads = Array.isArray(n.readByUserIds) ? n.readByUserIds : [];
        return {
          ...n,
          isRead: true,
          readByUserIds: Array.from(new Set([...currentReads, currentUserId])),
          readAt: new Date().toISOString(),
        };
      });
      try {
        localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleOpenOwnerNotificationsTab = () => {
    setActiveTab('notifications');
    handleMarkAllProjectNotificationsAsRead();
  };

  // Automatically mark notifications as read when the user views the notifications tab
  useEffect(() => {
    if (activeTab === 'notifications' && currentUser) {
      if (currentUser.role === 'owner') {
        const hasUnread = projectNotifications.some((n) => !isProjectNotifReadForUser(n, currentUser.id));
        if (hasUnread) {
          handleMarkAllProjectNotificationsAsRead();
        }
      } else {
        const hasUnread = userDirectives.some((d) => !isDirectiveReadForUser(d, currentUser.id));
        if (hasUnread) {
          handleMarkAllUserDirectivesAsRead();
        }
      }
    }
  }, [activeTab, currentUser]);

  // Ensure employees are never left on the Executive Dashboard
  useEffect(() => {
    if (currentUser && currentUser.role !== 'owner' && activeTab === 'dashboard') {
      setActiveTab('tasks');
    }
  }, [currentUser, activeTab]);

  // Auto-sync tasks with active lead workflows & staff assignments
  useEffect(() => {
    if (!Array.isArray(activeLeadWorkflows) || activeLeadWorkflows.length === 0) return;
    setTasks((currentTasks) => {
      let hasChanges = false;
      const updated = currentTasks.map((task) => {
        // Find matching workflow
        const matchingWf = activeLeadWorkflows.find(
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

        if (!matchingWf) return task;

        const allWfStaffUserIds: string[] = Array.from(
          new Set(matchingWf.steps.flatMap((s) => s.assignedUserIds || []))
        ).filter((id): id is string => Boolean(id));

        const allWfStaffUserNames = allWfStaffUserIds.map(
          (uid) => resolveStaffUser(uid, users)?.name || uid
        );
        const primaryUserId = (matchingWf.steps[0]?.assignedUserIds?.[0]) || allWfStaffUserIds[0] || '';
        const primaryUserName = resolveStaffUser(primaryUserId, users)?.name || allWfStaffUserNames[0] || 'Unassigned';

        const needsPrimary = (!task.assignedToUserId || task.assignedToUserName === 'Unassigned') && primaryUserId;
        const currentIds = task.assignedUserIds || [];
        const isMissingStaff = allWfStaffUserIds.some((id) => !currentIds.includes(id));
        const needsWfId = !task.workflowId || task.workflowId !== matchingWf.id;

        if (needsPrimary || isMissingStaff || needsWfId) {
          hasChanges = true;
          return {
            ...task,
            workflowId: matchingWf.id,
            assignedToUserId: task.assignedToUserId || primaryUserId,
            assignedToUserName:
              task.assignedToUserName && task.assignedToUserName !== 'Unassigned'
                ? task.assignedToUserName
                : primaryUserName,
            assignedUserIds: allWfStaffUserIds.length > 0 ? allWfStaffUserIds : currentIds,
            assignedUserNames: allWfStaffUserNames.length > 0 ? allWfStaffUserNames : (task.assignedUserNames || []),
          };
        }
        return task;
      });

      if (hasChanges) {
        try {
          localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      }
      return currentTasks;
    });
  }, [activeLeadWorkflows, users]);

  // Self-healing: Ensure any task created with template (or Vaish) has all template staff assigned
  useEffect(() => {
    setTasks((currentTasks) => {
      let hasChanges = false;
      const defaultTmpl =
        taskWorkflowTemplates.find((t) => t.category?.toLowerCase().includes('solar')) ||
        taskWorkflowTemplates[0] ||
        INITIAL_TASK_WORKFLOW_TEMPLATES[0];
      const allDefaultStaff: string[] = Array.from(
        new Set(defaultTmpl.steps.flatMap((s) => s.assignedUserIds || []))
      ).filter((id): id is string => Boolean(id));

      const updated = currentTasks.map((task) => {
        const isVaish = (task.customerName || '').toLowerCase().includes('vaish');
        const isMissingStaff = !task.assignedUserIds || task.assignedUserIds.length === 0;

        if (isVaish || isMissingStaff) {
          const tmpl =
            (task.templateId && taskWorkflowTemplates.find((t) => t.id === task.templateId)) ||
            defaultTmpl;
          const tmplStaff: string[] = Array.from(
            new Set(tmpl.steps.flatMap((s) => s.assignedUserIds || []))
          ).filter((id): id is string => Boolean(id));
          const staffToAssign = tmplStaff.length > 0 ? tmplStaff : allDefaultStaff;
          const staffNames = staffToAssign.map((uid) => resolveStaffUser(uid, users)?.name || uid);

          const curIds = task.assignedUserIds || [];
          const missingAny = staffToAssign.some((id) => !curIds.includes(id));
          if (missingAny || !task.assignedToUserId || task.assignedToUserName === 'Unassigned') {
            hasChanges = true;
            const primaryId = task.assignedToUserId || staffToAssign[0] || '';
            const primaryName =
              task.assignedToUserName && task.assignedToUserName !== 'Unassigned'
                ? task.assignedToUserName
                : staffNames[0] || 'Er. Devashish';
            const healedTask: CrmTask = {
              ...task,
              templateId: task.templateId || tmpl.id,
              assignedToUserId: primaryId,
              assignedToUserName: primaryName,
              assignedUserIds: staffToAssign,
              assignedUserNames: staffNames,
            };
            saveTaskToFirestore(healedTask).catch(() => {});
            return healedTask;
          }
        }
        return task;
      });

      if (hasChanges) {
        try {
          localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      }
      return currentTasks;
    });
  }, [taskWorkflowTemplates, users]);

  // Real-time synchronization: Auto-sync every ActiveLeadWorkflow into CRM Tasks
  // Ensures every project that reaches any user via a flowchart is 100% visible in "My Assigned Tasks"
  useEffect(() => {
    if (!Array.isArray(activeLeadWorkflows) || activeLeadWorkflows.length === 0) return;

    let deletedTaskIds = new Set<string>();
    try {
      const rawTomb = localStorage.getItem('dilip_crm_deleted_task_ids_v1');
      if (rawTomb) {
        const parsed = JSON.parse(rawTomb);
        if (Array.isArray(parsed)) deletedTaskIds = new Set(parsed.map((s: string) => String(s)));
      }
    } catch (_) {}

    setTasks((prevTasks) => {
      const currentTasks = Array.isArray(prevTasks) ? [...prevTasks] : [];
      let hasChanges = false;
      const newTasksToAdd: CrmTask[] = [];

      activeLeadWorkflows.forEach((wf) => {
        if (!wf || !wf.customerName) return;
        if (deletedTaskIds.has(wf.id) || deletedTaskIds.has(wf.leadId || '') || (wf.taskId && deletedTaskIds.has(wf.taskId))) return;

        // Check if matching task already exists
        const existingTaskIndex = currentTasks.findIndex((t) => {
          if (t.workflowId && t.workflowId === wf.id) return true;
          if (wf.taskId && t.id === wf.taskId) return true;
          if (wf.leadId && (t.id === wf.leadId || t.id === `task-${wf.leadId}`)) return true;
          const cleanTPhone = (t.customerPhone || '').replace(/\D/g, '').slice(-10);
          const cleanWfPhone = (wf.customerPhone || '').replace(/\D/g, '').slice(-10);
          if (cleanTPhone && cleanWfPhone && cleanTPhone === cleanWfPhone) return true;
          if (
            t.customerName &&
            wf.customerName &&
            t.customerName.trim().toLowerCase() === wf.customerName.trim().toLowerCase()
          )
            return true;
          return false;
        });

        // Collect all staff IDs and names from all steps of the workflow
        const allWfStaffIds: string[] = Array.from(
          new Set(wf.steps.flatMap((s) => s.assignedUserIds || []))
        ).filter(Boolean) as string[];
        const allWfStaffNames = allWfStaffIds.map((uid) => {
          const u = users.find((usr) => usr.id === uid);
          return u?.name || uid;
        });

        const step1 = wf.steps.find((s) => s.stepNumber === 1);
        const primaryUserId = step1?.assignedUserIds?.[0] || allWfStaffIds[0] || '';
        const primaryUser = users.find((u) => u.id === primaryUserId);

        const isAllDone = wf.steps.every((s) => s.status === 'compleated');
        const hasInProgress = wf.steps.some((s) => s.status === 'in progress');
        const calculatedStatus: CrmTaskStatus = isAllDone
          ? 'compleated'
          : hasInProgress
          ? 'in progress'
          : 'not started';

        if (existingTaskIndex === -1) {
          // Task does not exist yet! Synthesize it so it appears in CRM Tasks & My Assigned Tasks
          hasChanges = true;
          const cap = wf.capacityKw || 3;
          const now = wf.createdAt || new Date().toISOString();
          const taskCode = `WF-${wf.customerName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

          const synthesizedTask: CrmTask = {
            id: wf.taskId || `task-wf-${wf.id}`,
            workflowId: wf.id,
            taskCode,
            title: `${cap}kW Rooftop Solar - ${wf.customerName}`,
            customerName: wf.customerName,
            customerPhone: wf.customerPhone || '',
            customerEmail: '',
            customerAddress: wf.customerAddress || 'Prayagraj',
            capacityKw: cap,
            systemType: 'On-Grid Rooftop',
            monthlyBillRs: '3500',
            priority: 'High',
            assignedToUserId: primaryUserId,
            assignedToUserName: primaryUser?.name || allWfStaffNames[0] || 'Unassigned',
            assignedUserIds: allWfStaffIds,
            assignedUserNames: allWfStaffNames,
            assignedBy: 'Flowchart SOP Template',
            assignedAt: now,
            ownerInstructions: `Project Flowchart Active: ${wf.templateTitle}. Appointed staff: ${allWfStaffNames.join(', ') || 'Team'}.`,
            status: calculatedStatus,
            lastUpdatedAt: wf.updatedAt || now,
            lastUpdatedBy: 'System Sync',
            dealValueRs: cap * 65000,
            dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
            leadSource: 'Lead Workflow Flowchart',
            businessId: activeBusinessId || 'biz-solar-dilip',
            businessName: activeBusiness?.name || 'Dilip Enterprises',
            remarksHistory: [],
          };
          newTasksToAdd.push(synthesizedTask);
          saveTaskToFirestore(synthesizedTask).catch(() => {});
        } else {
          // Task exists! Ensure its assignedUserIds has all users from the workflow steps
          const existing = currentTasks[existingTaskIndex];
          const existingStaffIds = Array.isArray(existing.assignedUserIds) ? existing.assignedUserIds : [];
          const missingStaffIds = allWfStaffIds.filter((id) => !existingStaffIds.includes(id));

          if (missingStaffIds.length > 0 || !existing.workflowId) {
            hasChanges = true;
            const updatedStaffIds = Array.from(new Set([...existingStaffIds, ...allWfStaffIds]));
            const updatedStaffNames = updatedStaffIds.map((uid) => {
              const u = users.find((usr) => usr.id === uid);
              return u?.name || uid;
            });
            const updatedTask: CrmTask = {
              ...existing,
              workflowId: existing.workflowId || wf.id,
              assignedUserIds: updatedStaffIds,
              assignedUserNames: updatedStaffNames,
              assignedToUserId: existing.assignedToUserId || primaryUserId,
              assignedToUserName:
                existing.assignedToUserName && existing.assignedToUserName !== 'Unassigned'
                  ? existing.assignedToUserName
                  : primaryUser?.name || updatedStaffNames[0] || 'Unassigned',
            };
            currentTasks[existingTaskIndex] = updatedTask;
            saveTaskToFirestore(updatedTask).catch(() => {});
          }
        }
      });

      if (hasChanges) {
        const updatedList = [...newTasksToAdd, ...currentTasks];
        try {
          localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(updatedList));
        } catch (e) {}
        return updatedList;
      }
      return currentTasks;
    });
  }, [activeLeadWorkflows, users, activeBusinessId, activeBusiness]);

  // ---------------- INTERNAL MESSAGING & CHAT STATE ---------------- //
  const [chatMessages, setChatMessages] = useState<CrmChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('dilip_crm_internal_messages_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat messages:', e);
    }
    return INITIAL_CHAT_MESSAGES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('dilip_crm_internal_messages_v1', JSON.stringify(chatMessages));
    } catch (e) {
      console.warn('Failed to save chat messages:', e);
    }
  }, [chatMessages]);

  // ---------------- FIRESTORE CLOUD REAL-TIME SYNCHRONIZATION & AUTO LEAD PIPELINE ---------------- //
  useEffect(() => {
    // Helper to synchronize inbound leads into tasks so leads are NEVER missing from "All Tasks & Leads"
    const syncInboundLeadsToTasks = (inboundLeads: StoredLeadRecord[]) => {
      if (!Array.isArray(inboundLeads) || inboundLeads.length === 0) return;

      let deletedTaskIds = new Set<string>();
      try {
        const rawTomb = localStorage.getItem('dilip_crm_deleted_task_ids_v1');
        if (rawTomb) {
          const parsed = JSON.parse(rawTomb);
          if (Array.isArray(parsed)) deletedTaskIds = new Set(parsed.map((s: string) => String(s)));
        }
      } catch (_) {}

      setTasks((prevTasks) => {
        const currentTasks = Array.isArray(prevTasks) ? [...prevTasks] : [];
        let hasNew = false;
        const newTasksToAdd: CrmTask[] = [];

        inboundLeads.forEach((lead) => {
          if (!lead || (!lead.fullName && !lead.phone)) return;
          if (deletedTaskIds.has(lead.id) || deletedTaskIds.has(`task-${lead.id}`)) return;
          const cleanPhone = (lead.phone || '').replace(/\D/g, '').slice(-10);
          const exists = currentTasks.some((t) => {
            const taskPhone = (t.customerPhone || '').replace(/\D/g, '').slice(-10);
            return (
              (cleanPhone && taskPhone && cleanPhone === taskPhone) ||
              (t.customerName && lead.fullName && t.customerName.trim().toLowerCase() === lead.fullName.trim().toLowerCase()) ||
              t.id === `task-${lead.id}` ||
              t.id === lead.id
            );
          });

          if (!exists) {
            hasNew = true;
            const capacity = Number(lead.desiredCapacityKw) || 3;
            const now = lead.createdAt || new Date().toISOString();

            // Check default workflow template staff assignments
            const templates = taskWorkflowTemplatesRef.current;
            const staffList = usersRef.current;
            const defaultTmpl = templates.find((t) => t.id === 'wf-solar-epc-standard') || templates[0];
            const defaultStep1 = defaultTmpl?.steps?.find((s) => s.stepNumber === 1);
            const tmplAssignedIds: string[] = Array.from(
              new Set(defaultTmpl?.steps?.flatMap((s) => s.assignedUserIds || []) || [])
            ).filter((id): id is string => Boolean(id));
            const primaryId = defaultStep1?.assignedUserIds?.[0] || tmplAssignedIds[0] || '';
            const primaryUser = resolveStaffUser(primaryId, staffList);
            const tmplAssignedNames = tmplAssignedIds.map((uid) => resolveStaffUser(uid, staffList)?.name || uid);

            const leadTask: CrmTask = {
              id: `task-${lead.id || Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              taskCode: `LEAD-${100 + currentTasks.length + newTasksToAdd.length + 1}`,
              title: `${capacity}kW Rooftop Solar - ${lead.fullName}`,
              customerName: lead.fullName,
              customerPhone: lead.phone,
              customerEmail: lead.email || '',
              customerAddress: lead.location || 'Prayagraj',
              capacityKw: capacity,
              systemType: (lead.propertyType?.includes('Commercial') ? 'Commercial HT' : 'On-Grid Rooftop') as any,
              monthlyBillRs: lead.monthlyBillRs || '3500',
              uppclAccountNo: lead.uppclAccountNumber || '',
              roofType: (lead.roofType || 'RCC Flat Roof') as any,
              priority: 'High',
              assignedToUserId: primaryId || '',
              assignedToUserName: primaryUser?.name || 'Unassigned',
              assignedUserIds: tmplAssignedIds.length > 0 ? tmplAssignedIds : (primaryId ? [primaryId] : []),
              assignedUserNames: tmplAssignedNames.length > 0 ? tmplAssignedNames : (primaryUser?.name ? [primaryUser.name] : []),
              assignedBy: primaryId ? 'Flowchart SOP Template' : 'Inbound Inquiry',
              assignedAt: now,
              ownerInstructions: lead.message || 'New inbound inquiry received. Please assign engineer to verify roof layout and electrical load.',
              status: 'not started',
              lastUpdatedAt: now,
              lastUpdatedBy: 'System',
              dealValueRs: capacity * 65000,
              dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
              leadSource: lead.source ? `Lead: ${lead.source}` : 'Website Inbound Inquiry',
              businessId: activeBusinessIdRef.current || 'biz-solar-dilip',
              businessName: activeBusinessRef.current?.name || 'Dilip Enterprises',
              remarksHistory: [
                {
                  id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                  authorId: 'system',
                  authorName: 'Inbound Portal',
                  authorRole: 'owner',
                  statusChangedTo: 'not started',
                  message: `New inquiry logged: ${lead.fullName} (${lead.phone}). Notes: "${lead.message || 'None'}"`,
                  timestamp: now,
                },
              ],
            };
            newTasksToAdd.push(leadTask);
          }
        });

        if (hasNew && newTasksToAdd.length > 0) {
          const combined = [...newTasksToAdd, ...currentTasks];
          try {
            localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(combined));
          } catch (e) {}
          newTasksToAdd.forEach((nt) => saveTaskToFirestore(nt));
          return combined;
        }

        return currentTasks;
      });
    };

    // 0. Initial Cloud Seeding (Runs safely once on mount if database is fresh and quota allows)
    if (!hasSeededInitialDataRef.current) {
      hasSeededInitialDataRef.current = true;
      const seedAlreadyDone = typeof localStorage !== 'undefined' && localStorage.getItem('dilip_crm_initial_seed_done') === 'true';
      if (!seedAlreadyDone && !isFirestoreQuotaExhausted()) {
        seedInitialCrmDataToFirestore({
          tasks,
          complaints,
          users,
          directives: ownerDirectives,
          workflowTemplates: taskWorkflowTemplates,
          leadWorkflows: activeLeadWorkflows,
          businesses,
        });
      }
    }

    // 0. Clean obsolete local leads cache on mount
    try {
      localStorage.removeItem('dilip_crm_inbound_leads_v2');
      localStorage.removeItem('dilip_crm_inbound_leads');
      localStorage.removeItem('dilip_crm_tasks_v2');
      localStorage.removeItem('dilip_crm_tasks_cache');
    } catch (e) {}

    // Load verified 168 customers from PostgreSQL Cloud SQL Database (Protected Auth)
    fetchTasksFromCloudSql()
      .then((sqlTasks) => {
        if (Array.isArray(sqlTasks) && sqlTasks.length >= 100) {
          const valid = sqlTasks.filter((t: CrmTask) => t.id && t.id.startsWith('task-cust-'));
          if (valid.length > 0) {
            setTasks(valid);
            try {
              localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(valid));
            } catch (_) {}
          }
        }
      })
      .catch((err) => {
        console.warn('Cloud SQL initial fetch notice:', err?.message || err);
      });

    // 1. Subscribe to Tasks from Firestore Cloud (Multi-system real-time sync with local cache first priority)
    const unsubscribeTasks = subscribeToTasksFromFirestore((remoteTasks) => {
      if (remoteTasks && remoteTasks.length > 0) {
        let deletedTaskIds = new Set<string>();
        try {
          const rawTomb = localStorage.getItem('dilip_crm_deleted_task_ids_v1');
          if (rawTomb) {
            const parsed = JSON.parse(rawTomb);
            if (Array.isArray(parsed)) deletedTaskIds = new Set(parsed.map((s: string) => String(s)));
          }
        } catch (_) {}

        const validCustomers = remoteTasks.filter(
          (t) =>
            t &&
            t.id &&
            !deletedTaskIds.has(t.id) &&
            !deletedTaskIds.has(t.leadId || '') &&
            (t.id.startsWith('task-cust-') ||
              t.id.startsWith('task-wf-') ||
              t.id.startsWith('task-') ||
              Boolean(t.customerName))
        );
        if (validCustomers.length > 0) {
          setTasks((prevTasks) => {
            const currentList = Array.isArray(prevTasks) ? prevTasks : [];
            const taskMap = new Map<string, CrmTask>();

            // 1. Add all valid remote tasks to map
            validCustomers.forEach((rt) => {
              if (rt && rt.id) {
                taskMap.set(rt.id, rt);
              }
            });

            // 2. Local Cache First Priority:
            // Newly created local tasks or local updates that are ahead of cloud backoff delay
            // are preserved with first priority!
            currentList.forEach((lt) => {
              if (!lt || !lt.id) return;
              const remote = taskMap.get(lt.id);
              if (!remote) {
                // Local task not yet echoed by cloud
                taskMap.set(lt.id, lt);
              } else {
                const remoteTime = remote.lastUpdatedAt ? new Date(remote.lastUpdatedAt).getTime() : 0;
                const localTime = lt.lastUpdatedAt ? new Date(lt.lastUpdatedAt).getTime() : 0;
                if (localTime > remoteTime) {
                  taskMap.set(lt.id, { ...remote, ...lt });
                }
              }
            });

            const sorted = Array.from(taskMap.values()).sort(
              (a, b) => getTaskCreationTimestamp(b) - getTaskCreationTimestamp(a)
            );
            try {
              localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(sorted));
            } catch (e) {}
            return sorted;
          });
        }
      } else {
        // Fallback safely to localStorage or INITIAL_CRM_TASKS without triggering runaway cloud writes
        try {
          const cached = localStorage.getItem('dilip_crm_tasks_v3');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTasks(parsed);
              return;
            }
          }
        } catch (e) {}
        setTasks(INITIAL_CRM_TASKS);
      }
    });

    // 2. Subscribe to Leads from Firestore Cloud & sync to Tasks in real-time (Strictly fresh leads only)
    const unsubscribeLeads = subscribeToLeadsFromFirestore((remoteLeads) => {
      // Discard obsolete 14-day old test submissions (only allow leads submitted in last 24h)
      const freshLeads = remoteLeads.filter((l) => {
        if (!l.createdAt) return false;
        const diffMs = Date.now() - new Date(l.createdAt).getTime();
        return diffMs < 24 * 60 * 60 * 1000;
      });
      if (freshLeads.length > 0) {
        syncInboundLeadsToTasks(freshLeads);
      }
    });

    // 3. Subscribe to Complaints from Firestore Cloud (Filter out completed/resolved tickets)
    const unsubscribeComplaints = subscribeToComplaintsFromFirestore((remoteComplaints) => {
      if (remoteComplaints) {
        const activeComplaints = remoteComplaints.filter((c) => {
          const st = (c?.status || '').toLowerCase();
          return st !== 'compleated' && st !== 'resolved' && st !== 'closed';
        });
        setComplaints(activeComplaints);
        try {
          localStorage.setItem('dilip_crm_complaints_v2', JSON.stringify(activeComplaints));
        } catch (e) {}
      }
    });

    // 4. Subscribe to Internal Messages from Firestore Cloud
    const unsubscribeChat = subscribeToChatMessagesFromFirestore((remoteMsgs) => {
      if (remoteMsgs && remoteMsgs.length > 0) {
        setChatMessages(remoteMsgs);
        try {
          localStorage.setItem('dilip_crm_internal_messages_v1', JSON.stringify(remoteMsgs));
        } catch (e) {}
      }
    });

    // 5. Subscribe to Staff Users from Firestore Cloud (Multi-system sync with lossless merge & tombstone filter)
    const unsubscribeUsers = subscribeToUsersFromFirestore((remoteUsers) => {
      if (remoteUsers && remoteUsers.length > 0) {
        setUsers((currentUsers) => {
          let deletedIds = new Set<string>();
          try {
            const raw = localStorage.getItem('dilip_crm_deleted_user_ids_v1');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) deletedIds = new Set(parsed.map((s: string) => String(s).toLowerCase()));
            }
          } catch (e) {}

          const isDeleted = (u: CrmUser) =>
            deletedIds.has(u.id.toLowerCase()) ||
            deletedIds.has((u.username || '').toLowerCase()) ||
            (u.authUid ? deletedIds.has(u.authUid.toLowerCase()) : false);

          const userMap = new Map<string, CrmUser>();

          // Step 1: Pre-populated initial seed (excluding deleted users)
          INITIAL_CRM_USERS.forEach((u) => {
            if (!isDeleted(u)) userMap.set(u.id, u);
          });

          // Step 2: Overlay current users (protects newly created local users and local passwords)
          currentUsers.forEach((u) => {
            if (!isDeleted(u)) {
              const existing = userMap.get(u.id);
              userMap.set(u.id, { ...existing, ...u });
            }
          });

          // Step 3: Overlay remote users from Firestore cloud (excluding deleted users)
          remoteUsers.forEach((ru) => {
            if (isDeleted(ru)) return;
            const existing = userMap.get(ru.id) || Array.from(userMap.values()).find(
              (u) => u.username.toLowerCase() === ru.username.toLowerCase()
            );
            const merged: CrmUser = {
              ...existing,
              ...ru,
              // Never lose user password if remote document didn't supply one
              password: ru.password || existing?.password || (ru.role === 'owner' ? 'DilipSolar@2025' : undefined),
            };
            userMap.set(merged.id, merged);
          });

          const mergedUsers = Array.from(userMap.values()).filter((u) => !isDeleted(u));
          try {
            localStorage.setItem('dilip_crm_users_v2', JSON.stringify(mergedUsers));
          } catch (e) {}
          return mergedUsers;
        });
      }
    });

    // 5b. Subscribe to Tombstoned/Deleted Users from Firestore Cloud
    const unsubscribeDeletedUsers = subscribeToDeletedUsersFromFirestore((remoteDeletedIds) => {
      if (remoteDeletedIds && remoteDeletedIds.length > 0) {
        try {
          const stored = localStorage.getItem('dilip_crm_deleted_user_ids_v1');
          const list: string[] = stored ? JSON.parse(stored) : [];
          const combined = Array.from(new Set([...list, ...remoteDeletedIds.map((s) => String(s).toLowerCase())]));
          localStorage.setItem('dilip_crm_deleted_user_ids_v1', JSON.stringify(combined));

          const deletedSet = new Set(combined);
          setUsers((current) =>
            current.filter(
              (u) =>
                !deletedSet.has(u.id.toLowerCase()) &&
                !deletedSet.has((u.username || '').toLowerCase()) &&
                (!u.authUid || !deletedSet.has(u.authUid.toLowerCase()))
            )
          );
        } catch (e) {}
      }
    });

    // 6. Subscribe to Audit Logs from Firestore Cloud (Multi-system sync)
    const unsubscribeAuditLogs = subscribeToAuditLogsFromFirestore((remoteLogs) => {
      if (remoteLogs && remoteLogs.length > 0) {
        setAuditLogs(remoteLogs);
        try {
          localStorage.setItem('dilip_crm_audit_logs_v2', JSON.stringify(remoteLogs));
        } catch (e) {}
      }
    });

    // 7. Subscribe to Owner Directives from Firestore Cloud
    const unsubscribeDirectives = subscribeToDirectivesFromFirestore((remoteDirectives) => {
      if (remoteDirectives && remoteDirectives.length > 0) {
        setOwnerDirectives(remoteDirectives);
        try {
          localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify(remoteDirectives));
        } catch (e) {}
      }
    });

    // 8. Subscribe to Workflow Templates from Firestore Cloud
    const unsubscribeTemplates = subscribeToWorkflowTemplatesFromFirestore((remoteTemplates) => {
      if (remoteTemplates && remoteTemplates.length > 0) {
        setTaskWorkflowTemplates(remoteTemplates);
        saveStoredWorkflowTemplates(remoteTemplates);
      }
    });

    // 9. Subscribe to Lead Workflows from Firestore Cloud (Auto-sync missing project tasks to local cache)
    const unsubscribeLeadWorkflows = subscribeToLeadWorkflowsFromFirestore((remoteWorkflows) => {
      if (remoteWorkflows && remoteWorkflows.length > 0) {
        setActiveLeadWorkflows(remoteWorkflows);
        saveStoredLeadWorkflows(remoteWorkflows);

        // Auto-hydrate missing project tasks from workflows into local cache with first priority
        setTasks((prevTasks) => {
          const list = Array.isArray(prevTasks) ? [...prevTasks] : [];
          let hasAdded = false;

          let deletedTaskIds = new Set<string>();
          try {
            const rawTomb = localStorage.getItem('dilip_crm_deleted_task_ids_v1');
            if (rawTomb) {
              const parsed = JSON.parse(rawTomb);
              if (Array.isArray(parsed)) deletedTaskIds = new Set(parsed.map((s: string) => String(s)));
            }
          } catch (_) {}

          remoteWorkflows.forEach((wf) => {
            if (!wf || !wf.customerName) return;
            if (deletedTaskIds.has(wf.id) || deletedTaskIds.has(wf.leadId || '') || (wf.taskId && deletedTaskIds.has(wf.taskId))) return;
            const exists = list.some(
              (t) =>
                (wf.taskId && t.id === wf.taskId) ||
                (t.workflowId && t.workflowId === wf.id) ||
                (wf.customerPhone && t.customerPhone && t.customerPhone.replace(/\D/g, '') === wf.customerPhone.replace(/\D/g, '')) ||
                (t.customerName && t.customerName.trim().toLowerCase() === wf.customerName.trim().toLowerCase())
            );

            if (!exists) {
              hasAdded = true;
              const cap = wf.capacityKw || 3;
              const nowIso = wf.updatedAt || new Date().toISOString();
              const primaryUid = wf.steps?.[0]?.assignedUserIds?.[0] || '';
              const primaryName = wf.steps?.[0]?.assignedUserNames?.[0] || 'Unassigned';
              const allUids = Array.from(new Set(wf.steps?.flatMap((s) => s.assignedUserIds || []) || [])).filter(Boolean);
              const allNames = Array.from(new Set(wf.steps?.flatMap((s) => s.assignedUserNames || []) || [])).filter(Boolean);

              const wfTask: CrmTask = {
                id: wf.taskId || `task-wf-${wf.id}`,
                taskCode: `WF-${(wf.customerName || 'LEAD').substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
                title: `${cap}kW Rooftop Solar - ${wf.customerName}`,
                customerName: wf.customerName,
                customerPhone: wf.customerPhone || '',
                customerAddress: wf.customerAddress || 'Prayagraj',
                capacityKw: cap,
                systemType: 'On-Grid Rooftop',
                monthlyBillRs: '3500',
                priority: 'High',
                assignedToUserId: primaryUid,
                assignedToUserName: primaryName,
                assignedUserIds: allUids.length > 0 ? allUids : (primaryUid ? [primaryUid] : []),
                assignedUserNames: allNames.length > 0 ? allNames : [primaryName],
                assignedBy: 'Owner',
                assignedAt: nowIso,
                ownerInstructions: `Lead flowchart workflow attached (${wf.templateTitle}). Please execute assigned steps.`,
                status: 'not started',
                lastUpdatedAt: nowIso,
                lastUpdatedBy: 'Owner',
                dealValueRs: cap * 65000,
                dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                leadSource: 'Flowchart SOP Lead',
                businessId: 'biz-solar-dilip',
                businessName: 'Dilip Enterprises',
                workflowId: wf.id,
                remarksHistory: [
                  {
                    id: `rem-wf-${Date.now()}`,
                    authorId: 'owner',
                    authorName: 'Owner',
                    authorRole: 'owner',
                    statusChangedTo: 'not started',
                    message: `Flowchart workflow "${wf.templateTitle}" attached to customer ${wf.customerName}.`,
                    timestamp: nowIso,
                  },
                ],
              };
              list.unshift(wfTask);
            }
          });

          if (hasAdded) {
            try {
              localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(list));
            } catch (_) {}
            return list;
          }
          return prevTasks;
        });
      }
    });

    // 10. Subscribe to Business Workspaces from Firestore Cloud
    const unsubscribeBusinesses = subscribeToBusinessesFromFirestore((remoteBiz) => {
      if (remoteBiz && remoteBiz.length > 0) {
        setBusinesses(remoteBiz);
      }
    });

    return () => {
      unsubscribeTasks();
      unsubscribeLeads();
      unsubscribeComplaints();
      unsubscribeChat();
      unsubscribeUsers();
      unsubscribeDeletedUsers();
      unsubscribeAuditLogs();
      unsubscribeDirectives();
      unsubscribeTemplates();
      unsubscribeLeadWorkflows();
      unsubscribeBusinesses();
    };
  }, []);

  // ---------------- AUTO EMERGENCY RECOVERY CACHE ---------------- //
  // Continuously maintains a bounded emergency snapshot in localStorage so data can be recovered instantly after any browser crash or error
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (tasks.length > 0 || complaints.length > 0) {
          // Bound chatMessages and auditLogs to recent items to strictly stay within browser 5MB quota
          const boundedChat = chatMessages.slice(-50);
          const boundedLogs = auditLogs.slice(0, 50);
          const boundedDirectives = ownerDirectives.slice(0, 50);

          const emergencySnapshot = {
            app: 'Dilip Enterprises Solar CRM',
            type: 'AUTO_EMERGENCY_LOCAL_CACHE',
            timestamp: new Date().toISOString(),
            timestampReadable: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            data: {
              tasks,
              complaints,
              users,
              chatMessages: boundedChat,
              auditLogs: boundedLogs,
              directives: boundedDirectives,
              workflowTemplates: taskWorkflowTemplates,
              leadWorkflows: activeLeadWorkflows,
              businesses,
            },
          };
          localStorage.setItem('dilip_crm_emergency_recovery_cache', JSON.stringify(emergencySnapshot));
        }
      } catch (err: any) {
        // Handle localStorage quota limits safely without silent failure
        if (err?.name === 'QuotaExceededError' || err?.code === 22) {
          console.warn('[Storage Quota Guard] LocalStorage quota reached. Clearing non-essential transient cache items.');
          try {
            // Trim down to minimal essential tables only
            const leanSnapshot = {
              app: 'Dilip Enterprises Solar CRM',
              type: 'LEAN_EMERGENCY_CACHE',
              timestamp: new Date().toISOString(),
              data: { tasks, complaints, users },
            };
            localStorage.setItem('dilip_crm_emergency_recovery_cache', JSON.stringify(leanSnapshot));
          } catch (_) {}
        } else {
          console.warn('[Emergency Cache Guard] Storage notice:', err);
        }
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [tasks, complaints, users, chatMessages, auditLogs, ownerDirectives, taskWorkflowTemplates, activeLeadWorkflows, businesses]);

  const totalUnreadChatCount = useMemo(() => {
    if (!currentUser) return 0;
    return chatMessages.filter(
      (m) =>
        !m.isRead &&
        m.senderId !== currentUser.id &&
        (m.receiverId === currentUser.id || m.receiverId === 'group-all')
    ).length;
  }, [chatMessages, currentUser]);

  const handleSendChatMessage = (
    receiverId: string,
    receiverName: string,
    text: string,
    attachments?: ChatAttachment[]
  ) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const newMsg: CrmChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId,
      receiverName,
      text,
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
      timestamp: now,
      isRead: false,
    };

    setChatMessages((prev) => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem('dilip_crm_internal_messages_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    playSuccessSound();

    // Persist message to Firestore Cloud
    saveChatMessageToFirestore(newMsg);

    // Broadcast across browser tabs
    broadcastUserUpdate({
      type: 'CHAT_MESSAGE',
      message: newMsg,
    });

    const isToOwner =
      receiverName.toLowerCase().includes('owner') ||
      receiverId === 'usr-owner-1' ||
      users.find((u) => u.id === receiverId)?.role === 'owner';
    const recipientFormatted = isToOwner ? `${receiverName} (Owner)` : receiverName;

    recordAuditEvent(
      currentUser,
      'MESSAGE_SENT',
      `Sent internal communication to ${recipientFormatted}: "${text}"${
        attachments && attachments.length > 0 ? ` with ${attachments.length} attachment(s)` : ''
      }`,
      {
        targetUserName: recipientFormatted,
        targetUserId: receiverId,
        messageContent: text,
      }
    );
  };

  const handleMarkMessagesAsRead = (senderOrThreadId: string, myUserId: string) => {
    setChatMessages((prev) => {
      let changed = false;
      const updated = prev.map((m) => {
        if (
          !m.isRead &&
          ((senderOrThreadId === 'group-all' && m.receiverId === 'group-all' && m.senderId !== myUserId) ||
            (m.senderId === senderOrThreadId && m.receiverId === myUserId))
        ) {
          changed = true;
          return { ...m, isRead: true };
        }
        return m;
      });
      if (changed) {
        try {
          localStorage.setItem('dilip_crm_internal_messages_v1', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  // Owner Real-time Update Alert State (Loud Deep Sound & Live Notifications)
  const [liveOwnerAlert, setLiveOwnerAlert] = useState<{
    id?: string;
    authorName?: string;
    authorRole?: string;
    itemType?: 'TASK' | 'COMPLAINT' | 'USER_ACTIVITY' | 'LOGIN' | 'NOTE';
    itemCode?: string;
    itemTitle?: string;
    title?: string;
    customerName?: string;
    taskCode?: string;
    newStatus?: string;
    message?: string;
    timestamp: number;
  } | null>(null);
  const [ownerAudioAlertEnabled, setOwnerAudioAlertEnabled] = useState(() => isSoundEnabled());
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [ownerNotificationHistory, setOwnerNotificationHistory] = useState<Array<{
    id: string;
    authorName: string;
    authorRole: string;
    itemType: 'TASK' | 'COMPLAINT' | 'USER_ACTIVITY' | 'LOGIN' | 'NOTE';
    itemCode: string;
    itemTitle: string;
    newStatus: string;
    message?: string;
    timestamp: number;
  }>>(() => {
    try {
      const saved = localStorage.getItem('dilip_crm_owner_recent_notifications_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((p) => !isLoginOrLogoutNotification(p));
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  });
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);

  const currentUserRef = useRef(currentUser);
  const ownerAudioAlertEnabledRef = useRef(ownerAudioAlertEnabled);
  const activeBusinessIdRef = useRef(activeBusinessId);
  const activeBusinessRef = useRef(activeBusiness);
  const taskWorkflowTemplatesRef = useRef(taskWorkflowTemplates);
  const usersRef = useRef(users);
  const hasSeededInitialDataRef = useRef(false);

  const lastSoundTriggerRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });
  // Tracks the last dispatched notification status for each task to strictly prevent duplicate notifications on repeated clicks for the same status
  const lastNotifiedTaskStatusRef = useRef<Map<string, { status: CrmTaskStatus; timestamp: number }>>(new Map());
  // Debounce guard for rapid multi-clicks on task status update actions
  const lastTaskActionExecutionRef = useRef<Map<string, { status: CrmTaskStatus; message: string; timestamp: number }>>(new Map());
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);
  useEffect(() => {
    ownerAudioAlertEnabledRef.current = ownerAudioAlertEnabled;
  }, [ownerAudioAlertEnabled]);
  useEffect(() => {
    activeBusinessIdRef.current = activeBusinessId;
    activeBusinessRef.current = activeBusiness;
  }, [activeBusinessId, activeBusiness]);
  useEffect(() => {
    taskWorkflowTemplatesRef.current = taskWorkflowTemplates;
  }, [taskWorkflowTemplates]);
  useEffect(() => {
    usersRef.current = users;
    try {
      localStorage.setItem('dilip_crm_users_v2', JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  // Save Project Notifications to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify(projectNotifications));
    } catch (e) {
      console.warn('Failed to save project notifications:', e);
    }
  }, [projectNotifications]);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('dilip_crm_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('dilip_crm_audit_logs_v2', JSON.stringify(auditLogs));
    localStorage.setItem('dilip_crm_audit_logs_archive_2yr', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('dilip_crm_complaints_v2', JSON.stringify(complaints));
  }, [complaints]);

  // Record Audit Event Helper with 2-Year Retention Guarantee
  const recordAuditEvent = (
    user: CrmUser,
    action: UserAuditLog['action'],
    details: string,
    metadata?: Partial<UserAuditLog>
  ) => {
    const now = new Date();
    const newLog: UserAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      username: user.username,
      userName: user.name,
      userRole: user.role,
      action,
      details,
      timestamp: now.toISOString(),
      formattedTime: now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      timeOnly: now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      dateOnly: now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      ipAddress: '122.162.148.24',
      deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop / Laptop',
      ...metadata,
    };

    // Save audit log to Firestore Cloud in real-time
    saveAuditLogToFirestore(newLog);

    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      // 2-Year Retention Window (730 Days = 2 * 365 * 24 * 60 * 60 * 1000 ms)
      const twoYearsAgoMs = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;
      const retained = updated.filter((l) => {
        const timeMs = new Date(l.timestamp).getTime();
        return isNaN(timeMs) || timeMs >= twoYearsAgoMs;
      });
      try {
        localStorage.setItem('dilip_crm_audit_logs_v2', JSON.stringify(retained));
        localStorage.setItem('dilip_crm_audit_logs_archive_2yr', JSON.stringify(retained));
      } catch (e) {
        console.warn('Failed to sync audit logs to localStorage:', e);
      }
      return retained;
    });

    // NOTE: Per Owner's strict directive, user logins, logouts, and general presence
    // are EXCLUDED from the Project Notifications feed and broadcast bus.
    // They are preserved exclusively in the User Activity Logs (Audit Logs) for 2 years.
  };

  // Self-healing check: ensure any previous session for users other than currentUser has an explicit LOGOUT
  useEffect(() => {
    setAuditLogs((prevLogs) => {
      let modified = false;
      const healed = [...prevLogs];
      users.forEach((u) => {
        if (currentUser && u.id === currentUser.id) return;
        const userLogs = healed.filter((l) => l.userId === u.id);
        if (userLogs.length > 0) {
          const sorted = [...userLogs].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          if (sorted[0].action === 'LOGIN') {
            const loginTimeMs = new Date(sorted[0].timestamp).getTime();
            const logoutTime = new Date(loginTimeMs + 65 * 1000).toISOString();
            const fixLog: UserAuditLog = {
              id: `log-healed-logout-${u.id}-${Date.now()}`,
              userId: u.id,
              username: u.username,
              userName: u.name,
              userRole: u.role,
              action: 'LOGOUT',
              details: `User ${u.name} logged out manually.`,
              timestamp: logoutTime,
              formattedTime: new Date(logoutTime).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }),
              ipAddress: sorted[0].ipAddress || '122.162.148.24',
              deviceInfo: sorted[0].deviceInfo || 'Desktop / Laptop',
            };
            healed.unshift(fixLog);
            modified = true;
          }
        }
      });
      if (modified) {
        try {
          localStorage.setItem('dilip_crm_audit_logs_v2', JSON.stringify(healed));
        } catch (e) {}
        return healed;
      }
      return prevLogs;
    });
  }, [currentUser, users]);

  // ---------------- DIRECTIVES SANITIZATION & HEALING EFFECT ---------------- //
  // Auto-purges false/bogus notifications and ensures chronological descending ordering
  useEffect(() => {
    if (!users || users.length === 0) return;

    setOwnerDirectives((prev) => {
      let modified = false;
      // 1. Remove any false/bogus directives
      const hasBogus = prev.some((d) => isBogusCascadeDirective(d));
      let list = hasBogus ? prev.filter((d) => !isBogusCascadeDirective(d)) : [...prev];
      if (hasBogus) modified = true;

      // Re-order strictly chronological descending: newest assignment / lead ALWAYS #1
      const sorted = [...list].sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.assignedAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.assignedAt || 0).getTime();
        return (timeB - timeA) || b.id.localeCompare(a.id);
      });

      const orderChanged = sorted.some((d, idx) => prev[idx]?.id !== d.id);
      if (modified || orderChanged) {
        try {
          localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify(sorted));
        } catch (e) {}
        return sorted;
      }
      return prev;
    });
  }, [users]);

  // ---------------- 5-MINUTE INACTIVITY AUTO-LOGOUT ---------------- //
  // STRICT RULE: Owner panel ALWAYS stays open until manually logged out!
  // 5-minute inactivity auto-logout strictly applies to employees only.
  const handleInactivityTimeout = (user: CrmUser, reason: string) => {
    if (user.role === 'owner') {
      // Owner session is permanent and never expires due to inactivity
      return;
    }

    recordAuditEvent(user, 'AUTO_LOGOUT_5MIN_INACTIVITY', reason);
    setCurrentUser(null);
    clearStoredAuthToken();
    sessionStorage.removeItem('dilip_crm_active_user');
    setInactivityNotice(`Security Alert: ${user.name} was automatically logged out due to 5 minutes of inactivity.`);

    // Per Owner Specification: Inactivity auto-logout is preserved in User Activity Logs
    // and is NOT broadcasted to the Project Notifications feed.
  };

  const { showWarning, secondsRemaining, idleSeconds, resetTimer, simulateTimeout } = useInactivityLogout({
    user: currentUser,
    timeoutMs: 5 * 60 * 1000, // 5 minutes strictly for all users
    warningMs: 4.5 * 60 * 1000, // 4 mins 30 secs
    onTimeout: handleInactivityTimeout,
  });

  // ---------------- LOUD OWNER AUDIO ALERT & REALTIME BROADCAST ---------------- //
  const triggerOwnerAlertForUpdate = (rawPayload: any) => {
    // Handling Cascade Lead & Task Deletion across all active user screens
    if (rawPayload && (rawPayload.type === 'CASCADE_DELETE_LEAD' || rawPayload.actionType === 'CASCADE_DELETE_LEAD')) {
      const delLeadId = rawPayload.leadId;
      const delTaskIds: string[] = Array.isArray(rawPayload.deletedTaskIds) ? rawPayload.deletedTaskIds : [];
      const delCustName = (rawPayload.customerName || '').trim().toLowerCase();

      // Immediately purge from tasks state and localStorage
      setTasks((prevTasks) => {
        const list = Array.isArray(prevTasks) ? prevTasks : [];
        const cleaned = list.filter((t) => {
          if (t.id === delLeadId || t.id === `task-${delLeadId}` || delTaskIds.includes(t.id)) return false;
          if (t.leadId && (t.leadId === delLeadId || delTaskIds.includes(t.leadId))) return false;
          if (delCustName && (t.customerName || '').trim().toLowerCase() === delCustName) return false;
          return true;
        });
        try {
          localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(cleaned));
        } catch (_) {}
        return cleaned;
      });

      // Purge active lead workflows state
      setActiveLeadWorkflows((prevWfs) => {
        const list = Array.isArray(prevWfs) ? prevWfs : [];
        const cleaned = list.filter((w) => {
          if (w.id === delLeadId || w.leadId === delLeadId || w.taskId === `task-${delLeadId}`) return false;
          if (delCustName && (w.customerName || '').trim().toLowerCase() === delCustName) return false;
          return true;
        });
        try {
          localStorage.setItem('dilip_crm_lead_workflows_v2', JSON.stringify(cleaned));
        } catch (_) {}
        return cleaned;
      });

      // Purge directives state
      setOwnerDirectives((prevDirs) => {
        const list = Array.isArray(prevDirs) ? prevDirs : [];
        const cleaned = list.filter((d) => {
          if (d.id === delLeadId || d.leadId === delLeadId || d.taskCode?.includes(delLeadId)) return false;
          if (delCustName && (d.customerName || '').trim().toLowerCase() === delCustName) return false;
          return true;
        });
        try {
          localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify(cleaned));
        } catch (_) {}
        return cleaned;
      });

      return;
    }
    // EXCLUSION FILTER: User Login, Logout & General User Activities
    // MUST NEVER appear in Project Notifications feed or Owner notification history!
    // Per User Specification: Project notifications are strictly for Projects & Leads.
    // All user logins, logouts, presence, actions, and messages appear exclusively in
    // the "User Activity Logs" with 2-Year retention.
    if (isLoginOrLogoutNotification(rawPayload)) {
      return;
    }

    // 0. Real-time internal chat message received
    if (rawPayload.type === 'CHAT_MESSAGE' && rawPayload.message) {
      const incomingMsg: CrmChatMessage = rawPayload.message;
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === incomingMsg.id)) return prev;
        const updated = [...prev, incomingMsg];
        try {
          localStorage.setItem('dilip_crm_internal_messages_v1', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      const current = currentUserRef.current;
      if (
        current &&
        current.id !== incomingMsg.senderId &&
        (incomingMsg.receiverId === current.id || incomingMsg.receiverId === 'group-all')
      ) {
        unlockAudioContext();
        if (current.role === 'owner') {
          playOwnerDeepAlertSound();
        } else {
          playLoudNotificationBeep();
        }
      }
      return;
    }

    if (rawPayload.type === 'OWNER_DIRECTIVE' && rawPayload.directive) {
      const dir: OwnerDirectiveNotification = rawPayload.directive;
      setOwnerDirectives((prev) => {
        const filtered = prev.filter((d) => d.id !== dir.id);
        const updated = [dir, ...filtered];
        try {
          localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      if (rawPayload.projectNotification) {
        setProjectNotifications((prev) => {
          const filtered = prev.filter((p) => p.id !== rawPayload.projectNotification.id);
          const updated = [rawPayload.projectNotification, ...filtered];
          try {
            localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }

      // Check recipient and play appropriate audio and live toast alert
      const current = currentUserRef.current;
      if (current) {
        const isTargetEmployee =
          dir.targetUserId === 'all' ||
          dir.targetUserId === current.id ||
          (dir.targetUserName &&
            current.name &&
            dir.targetUserName.toLowerCase().includes(current.name.toLowerCase()));

        if (current.role === 'owner') {
          unlockAudioContext();
          playOwnerDeepAlertSound();
          setLiveOwnerAlert({
            title: `⚡ Flowchart Update / Directive`,
            message: dir.ownerCommand || `Flowchart step updated for ${dir.customerName}`,
            timestamp: Date.now(),
            customerName: dir.customerName,
            taskCode: dir.taskCode,
          });
        } else if (isTargetEmployee) {
          unlockAudioContext();
          playLoudNotificationBeep();
          setLiveOwnerAlert({
            title: `⚡ Flowchart Handover / Owner Command`,
            message: dir.ownerCommand,
            timestamp: Date.now(),
            customerName: dir.customerName,
            taskCode: dir.taskCode,
          });
        }
      }
      return;
    }

    const isCompleted =
      rawPayload.newStatus?.toLowerCase() === 'compleated' ||
      rawPayload.actionType === 'STATUS_COMPLEATED';

    const notifItem: ProjectNotification = {
      id: rawPayload.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemType: rawPayload.itemType || 'TASK',
      taskCode: rawPayload.taskCode || rawPayload.itemCode,
      projectTitle: rawPayload.projectTitle || rawPayload.itemTitle || 'Solar Project',
      customerName: rawPayload.customerName,
      customerPhone: rawPayload.customerPhone,
      customerAddress: rawPayload.customerAddress,
      capacityKw: rawPayload.capacityKw,
      actionType:
        rawPayload.actionType ||
        (isCompleted
          ? 'STATUS_COMPLEATED'
          : rawPayload.itemType === 'COMPLAINT'
          ? 'COMPLAINT_REGISTERED'
          : rawPayload.itemType === 'LOGIN'
          ? 'LOGIN'
          : 'STATUS_IN_PROGRESS'),
      newStatus: rawPayload.newStatus || 'Updated',
      oldStatus: rawPayload.oldStatus,
      authorId: rawPayload.authorId || 'usr-staff',
      authorName: rawPayload.authorName || 'Staff Member',
      authorRole: rawPayload.authorRole || 'Site Technician',
      message:
        rawPayload.message ||
        (isCompleted
          ? `${rawPayload.authorName || 'Staff'} marked project as COMPLEATED`
          : `${rawPayload.authorName || 'Staff'} updated project to "${rawPayload.newStatus}"`),
      optionalRemarks: rawPayload.optionalRemarks || rawPayload.remarks,
      timestamp: rawPayload.timestamp || Date.now(),
      formattedTime: new Date(rawPayload.timestamp || Date.now()).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      isRead: false,
      priority: rawPayload.priority || (isCompleted ? 'Urgent' : 'Normal'),
    };

    // 1. Append to project notifications feed (top of list)
    setProjectNotifications((prev) => {
      const filtered = prev.filter((p) => p.id !== notifItem.id);
      const updated = [notifItem, ...filtered].slice(0, 100);
      try {
        localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Also keep legacy ownerNotificationHistory in sync
    setOwnerNotificationHistory((prev) => {
      const filtered = prev.filter((p) => p.id !== notifItem.id);
      const updated = [
        {
          id: notifItem.id,
          authorName: notifItem.authorName,
          authorRole: notifItem.authorRole,
          itemType: notifItem.itemType,
          itemCode: notifItem.taskCode || '',
          itemTitle: notifItem.projectTitle,
          newStatus: notifItem.newStatus,
          message: notifItem.message,
          timestamp: notifItem.timestamp,
        },
        ...filtered,
      ].slice(0, 50);
      try {
        localStorage.setItem('dilip_crm_owner_recent_notifications_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. ALWAYS PLAY LOUD DEEP SOUND ALERT ON EVERY NOTIFICATION!
    const now = Date.now();
    const isDuplicateSound =
      lastSoundTriggerRef.current.id === notifItem.id &&
      now - lastSoundTriggerRef.current.time < 1200;

    if (!isDuplicateSound && ownerAudioAlertEnabledRef.current) {
      lastSoundTriggerRef.current = { id: notifItem.id, time: now };
      unlockAudioContext();
      playOwnerDeepAlertSound();
    }

    // 4. Trigger visual alert toast and auto-sync for all logged-in users (Owner & Staff)
    setHasUnreadAlerts(true);

    // Set visible toast alert on screen for everyone
    setLiveOwnerAlert({
      id: notifItem.id,
      authorName: notifItem.authorName,
      authorRole: notifItem.authorRole,
      itemType: notifItem.itemType,
      itemCode: notifItem.taskCode || '',
      itemTitle: notifItem.projectTitle,
      newStatus: notifItem.newStatus,
      message: notifItem.message,
      timestamp: notifItem.timestamp,
    });

    // First-Priority Local Cache task injection for newly created/updated projects
    if (rawPayload.task && rawPayload.task.id) {
      setTasks((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        if (list.some((t) => t.id === rawPayload.task.id)) return list;
        const next = [rawPayload.task, ...list];
        try {
          localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(next));
        } catch (_) {}
        return next;
      });
    }

    // Automatically reload fresh tasks, complaints & audit logs from localStorage
    try {
      const t = localStorage.getItem('dilip_crm_tasks_v3');
      if (t) setTasks(JSON.parse(t));
      const c = localStorage.getItem('dilip_crm_complaints_v2');
      if (c) setComplaints(JSON.parse(c));
      const l = localStorage.getItem('dilip_crm_audit_logs_v2');
      if (l) setAuditLogs(JSON.parse(l));
    } catch (err) {
      console.warn('Realtime sync error:', err);
    }
  };

  const broadcastUserUpdate = (notifPayload: any) => {
    // 1. BroadcastChannel across all open browser tabs (using singleton channel without closing)
    try {
      const bc = getGlobalBroadcastChannel();
      if (bc) {
        bc.postMessage(notifPayload);
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    // 2. LocalStorage event (cross-tab fallback with unique nonce guaranteeing storage event triggers)
    try {
      localStorage.setItem(
        'dilip_crm_last_user_update_event',
        JSON.stringify({ ...notifPayload, _nonce: `${Date.now()}-${Math.random()}` })
      );
    } catch (e) {
      console.warn('Storage broadcast error:', e);
    }

    // 3. Dispatch window CustomEvent for local listeners in same tab
    try {
      window.dispatchEvent(new CustomEvent('dilip_crm_local_user_update', { detail: notifPayload }));
    } catch (e) {
      console.warn('CustomEvent error:', e);
    }
  };

  // Real-time listener across browser tabs & local events
  useEffect(() => {
    const bc = getGlobalBroadcastChannel();
    if (bc) {
      bc.onmessage = (event) => {
        if (event.data) {
          triggerOwnerAlertForUpdate(event.data);
        }
      };
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'dilip_crm_last_user_update_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          triggerOwnerAlertForUpdate(parsed);
        } catch (err) {
          console.warn('Storage event parse error:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    const handleLocalEvent = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail) {
        triggerOwnerAlertForUpdate(customEvent.detail);
      }
    };
    window.addEventListener('dilip_crm_local_user_update', handleLocalEvent);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('dilip_crm_local_user_update', handleLocalEvent);
    };
  }, []);

  // Auto-dismiss live owner alert toast after 10 seconds
  useEffect(() => {
    if (liveOwnerAlert) {
      const timer = setTimeout(() => {
        setLiveOwnerAlert(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [liveOwnerAlert]);

  // ---------------- LOGIN HANDLER ---------------- //
  const handleLogin = async (e?: React.FormEvent, customUser?: CrmUser) => {
    if (e) e.preventDefault();
    setLoginError('');
    setInactivityNotice('');
    setIsLoggingIn(true);

    try {
      const identifier = customUser ? customUser.username : loginUsername.trim();
      const password = customUser ? (loginPassword.trim() || 'DilipSolar@2025') : loginPassword.trim();

      if (!identifier || !password) {
        setLoginError('Please enter both username and password.');
        setIsLoggingIn(false);
        return;
      }

      const { crmUser } = await authenticateStaffUser(identifier, password, users);

      if (crmUser.status === 'inactive') {
        setLoginError('Your account has been deactivated by Dilip Enterprises.');
        setIsLoggingIn(false);
        return;
      }

      // Cleanly close previous user's session if switching accounts
      if (currentUser && currentUser.id !== crmUser.id) {
        recordAuditEvent(
          currentUser,
          'LOGOUT',
          `User ${currentUser.name} session ended upon switching accounts.`
        );
      }

      // Set authenticated session
      setCurrentUser(crmUser);
      sessionStorage.setItem('dilip_crm_active_user', JSON.stringify(crmUser));

      // Obtain & store backend JWT authorization token
      try {
        const tokenRes = await fetch('/api/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: crmUser.id,
            role: crmUser.role,
            username: crmUser.username,
            password: password,
          }),
        });
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          if (tokenData.token) {
            setStoredAuthToken(tokenData.token);
          }
        }
      } catch (tokenErr) {
        console.warn('Backend auth token exchange notice:', tokenErr);
      }

      // Owner session remains persistently saved until manual logout
      if (crmUser.role === 'owner') {
        localStorage.setItem('dilip_crm_owner_session', JSON.stringify(crmUser));
      } else {
        localStorage.removeItem('dilip_crm_owner_session');
      }

      // Set appropriate landing tab
      if (crmUser.role === 'owner') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('tasks');
      }

      // Update last login
      const updatedUsers = users.map((u) =>
        u.id === crmUser.id ? { ...u, lastLoginAt: new Date().toISOString() } : u
      );
      setUsers(updatedUsers);

      // PLAY LOUD BEEP NOTIFICATION SOUND for employee login
      if (crmUser.role === 'employee') {
        playLoudNotificationBeep();
      }

      // Record login in audit log (strictly preserved in User Activity Logs with 2-Year retention)
      recordAuditEvent(
        crmUser,
        'LOGIN',
        crmUser.role === 'owner'
          ? 'Owner logged in to Master Solar CRM Panel.'
          : `Employee ${crmUser.name} logged in at ${new Date().toLocaleTimeString('en-IN')}. Portal session started.`
      );

      setLoginUsername('');
      setLoginPassword('');
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Invalid Username or Password. Please check with Dilip Enterprises.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ---------------- LOGOUT HANDLER ---------------- //
  const handleManualLogout = async () => {
    if (!currentUser) return;
    const exitingUser = currentUser;
    recordAuditEvent(
      exitingUser,
      'LOGOUT',
      `User ${exitingUser.name} logged out manually at ${new Date().toLocaleTimeString('en-IN')}. Portal session ended.`
    );

    setCurrentUser(null);
    clearStoredAuthToken();
    sessionStorage.removeItem('dilip_crm_active_user');
    localStorage.removeItem('dilip_crm_owner_session');
    localStorage.removeItem('dilip_crm_active_user');

    try {
      await logoutStaffUser();
    } catch (e) {
      console.warn('Firebase logout error:', e);
    }
  };

  // ---------------- FORCE LOGOUT HANDLER (Owner Only) ---------------- //
  const handleForceLogoutUser = (targetUserId: string) => {
    const target = users.find((u) => u.id === targetUserId);
    if (!target) return;

    recordAuditEvent(
      target,
      'LOGOUT',
      `Dilip Enterprises force-logged out user ${target.name} from admin panel at ${new Date().toLocaleTimeString('en-IN')}.`
    );

    if (currentUser?.id === targetUserId) {
      handleManualLogout();
    }
  };

  // ---------------- UPDATE TASK STATUS & MESSAGE ---------------- //
  const handleUpdateTaskStatus = (
    taskId: string,
    newStatus: CrmTaskStatus,
    optionalMessage: string
  ) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const nowTime = Date.now();
    const currentTask = tasks.find((t) => t.id === taskId);
    const oldStatus = currentTask?.status;
    const isFirstResponse = currentTask && !currentTask.firstRespondedAt;

    // OWNER SUPREMACY CHECK: If task was overridden by Owner, staff users cannot modify or undo
    if (currentTask?.isOwnerOverride && currentUser.role !== 'owner') {
      playWarningSound();
      setLiveOwnerAlert({
        id: `alert-lock-${Date.now()}`,
        authorName: 'System Security',
        authorRole: 'owner',
        itemType: 'TASK',
        itemCode: currentTask.taskCode,
        itemTitle: currentTask.projectTitle,
        newStatus: 'Locked',
        message: 'This project was updated by Dilip Enterprises and is locked against staff modification.',
        timestamp: Date.now(),
      });
      return;
    }

    // Check if task is a template or blueprint
    const isTemplateTask = Boolean(
      (currentTask as any)?.isTemplate ||
      (currentTask as any)?.isWorkflowTemplate
    );
    if (isTemplateTask) {
      playWarningSound();
      setLiveOwnerAlert({
        id: `alert-tmpl-${Date.now()}`,
        authorName: 'Template SOP',
        authorRole: 'owner',
        itemType: 'TASK',
        itemCode: currentTask?.taskCode || 'SOP',
        itemTitle: currentTask?.projectTitle || 'Task Template',
        newStatus: 'Notice',
        message: 'Status updates and cascade workflow progression are disabled for Task Templates. They apply strictly to active, live projects.',
        timestamp: Date.now(),
      });
      return;
    }

    // Check if user is authorized to update this task status
    if (currentTask && !isUserAuthorizedToUpdateTaskStatus(currentUser, currentTask, activeLeadWorkflows, users, ownerDirectives, isTemplateTask)) {
      playWarningSound();
      setLiveOwnerAlert({
        id: `alert-auth-${Date.now()}`,
        authorName: 'Access Control',
        authorRole: 'owner',
        itemType: 'TASK',
        itemCode: currentTask.taskCode,
        itemTitle: currentTask.projectTitle,
        newStatus: 'Unauthorized',
        message: 'You are not authorized to update this task status. Please coordinate with assigned team members or Owner.',
        timestamp: Date.now(),
      });
      return;
    }

    // 1. Rapid multi-click debounce protection:
    // If the user clicks "Save" 2, 3, or 4 times rapidly within 2.5 seconds on the exact same action:
    const lastAction = lastTaskActionExecutionRef.current.get(taskId);
    if (
      lastAction &&
      lastAction.status === newStatus &&
      lastAction.message === (optionalMessage || '') &&
      nowTime - lastAction.timestamp < 2500
    ) {
      // Ignore rapid multi-clicks on the same action
      return;
    }
    lastTaskActionExecutionRef.current.set(taskId, {
      status: newStatus,
      message: optionalMessage || '',
      timestamp: nowTime,
    });

    // 2. Strict status change & notification check:
    // User requirement: "agar ek hi action per 3 4 baar bhi click hojae yani ki maine koe status update kia or 2 3 baar save per click kerdia to notification 1 baar hi jaega kyuki vo same status h agar us status ko badal k kuch or kia jae tab dubara notification jae save per chahe jitni baar click karu kissi particular 1 hi action k lia to vo 1 baar hi notification jae"
    const lastNotified = lastNotifiedTaskStatusRef.current.get(taskId);
    const isActualStatusChange = oldStatus !== newStatus;
    const isSameAsLastNotified = lastNotified && lastNotified.status === newStatus;

    // Dispatch status notification ONLY IF this status has actually changed and was NOT already notified for this exact status
    const shouldDispatchStatusNotification = isActualStatusChange && !isSameAsLastNotified;

    if (shouldDispatchStatusNotification) {
      lastNotifiedTaskStatusRef.current.set(taskId, {
        status: newStatus,
        timestamp: nowTime,
      });
    }

    let updatedRemarks = currentTask ? [...currentTask.remarksHistory] : [];
    if (optionalMessage || isActualStatusChange) {
      updatedRemarks.unshift({
        id: `rem-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        statusChangedTo: newStatus,
        message: optionalMessage || undefined,
        timestamp: now,
      });
    }

    const isOwner = currentUser.role === 'owner';
    const updatedTasks = tasks.map((t) => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        status: newStatus,
        firstRespondedAt: isFirstResponse ? now : t.firstRespondedAt,
        firstRespondedBy: isFirstResponse ? currentUser.name : t.firstRespondedBy,
        lastUpdatedAt: now,
        lastUpdatedBy: currentUser.name,
        remarksHistory: updatedRemarks,
        // OWNER SUPREMACY: If Owner updates or changes status, mark isOwnerOverride: true
        isOwnerOverride: isOwner ? true : t.isOwnerOverride,
        ownerOverrideBy: isOwner ? currentUser.name : t.ownerOverrideBy,
        ownerOverrideAt: isOwner ? now : t.ownerOverrideAt,
        ownerOverrideMessage: isOwner ? (optionalMessage || undefined) : t.ownerOverrideMessage,
        lockedAgainstStaffModification: isOwner ? true : t.lockedAgainstStaffModification,
      };
    });

    if (shouldDispatchStatusNotification) {
      if (newStatus === 'compleated') {
        playSuccessSound();
      } else {
        playStatusChangeSound();
      }
    } else {
      playActionClickSound();
    }

    setTasks(updatedTasks);
    try {
      localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(updatedTasks));
    } catch (e) {}

    // Cloud Firestore Sync
    const modifiedTask = updatedTasks.find((t) => t.id === taskId);
    if (modifiedTask) {
      saveTaskToFirestore(modifiedTask);
    }

    // Record in Audit Log (2-Year Retained Activity Log)
    recordAuditEvent(
      currentUser,
      'STATUS_CHANGE',
      `${currentUser.name} updated project ${currentTask?.taskCode || ''} (${currentTask?.customerName || 'Lead'}) status from "${oldStatus}" to "${newStatus}"${
        optionalMessage ? ` | Remarks: "${optionalMessage}"` : ''
      }`,
      {
        taskCode: currentTask?.taskCode,
        projectTitle: currentTask?.title || `${currentTask?.capacityKw || 2}kW Solar - ${currentTask?.customerName}`,
        customerName: currentTask?.customerName,
        oldStatus,
        newStatus,
        remarks: optionalMessage || undefined,
      }
    );

    // Prepare complete ProjectNotification payload
    const isCompleted = newStatus === 'compleated';
    const actionMessage = isCompleted
      ? `${currentUser.name} marked project ${currentTask?.taskCode || ''} (${currentTask?.title || currentTask?.customerName || 'Project'}) as COMPLEATED`
      : `${currentUser.name} updated status of ${currentTask?.taskCode || 'Project'} to "${newStatus}"`;

    const notifPayload: ProjectNotification = {
      id: `task-notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemType: 'TASK',
      taskCode: currentTask?.taskCode || 'DE-TASK',
      projectTitle: currentTask?.title || `${currentTask?.capacityKw || 2}kW Solar - ${currentTask?.customerName}`,
      customerName: currentTask?.customerName,
      customerPhone: currentTask?.customerPhone,
      customerAddress: currentTask?.customerAddress,
      capacityKw: currentTask?.capacityKw,
      actionType: isCompleted ? 'STATUS_COMPLEATED' : 'STATUS_IN_PROGRESS',
      newStatus,
      oldStatus,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.roleTitle || (currentUser.role === 'owner' ? 'Owner' : 'Site Technician'),
      message: actionMessage,
      optionalRemarks: optionalMessage ? optionalMessage.trim() : undefined,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      isRead: false,
      priority: currentTask?.priority || (isCompleted ? 'Urgent' : 'Normal'),
    };

    // STRICT CHECK: Only broadcast if this status is newly updated/changed (no duplicates on repeated save clicks)
    if (shouldDispatchStatusNotification) {
      broadcastUserUpdate(notifPayload);
    }

    // =========================================================================
    // FLOWCHART RATIO-2 NOTIFICATION CASCADE (Task 2 update -> Task 3 & 4 Handover)
    // Only cascade flowchart handover directives if status actually changed and is newly notified!
    // =========================================================================
    if (!shouldDispatchStatusNotification) {
      return;
    }

    let matchedWf = activeLeadWorkflows.find(
      (wf) =>
        (currentTask?.workflowId && wf.id === currentTask.workflowId) ||
        (wf.taskId && wf.taskId === taskId) ||
        (currentTask?.customerPhone &&
          wf.customerPhone &&
          currentTask.customerPhone.replace(/\D/g, '') === wf.customerPhone.replace(/\D/g, '')) ||
        (currentTask?.customerName &&
          wf.customerName &&
          currentTask.customerName.trim().toLowerCase() === wf.customerName.trim().toLowerCase())
    );

    // If no workflow attached yet, create one from default template
    if (!matchedWf && taskWorkflowTemplates && taskWorkflowTemplates.length > 0) {
      const defaultTemplate =
        taskWorkflowTemplates.find((t) => t.category?.toLowerCase().includes('solar')) ||
        taskWorkflowTemplates[0];
      if (defaultTemplate && currentTask) {
        matchedWf = createLeadWorkflowFromTemplate(
          defaultTemplate,
          {
            taskId: currentTask.id,
            customerName: currentTask.customerName,
            customerPhone: currentTask.customerPhone || '',
            customerAddress: currentTask.customerAddress || '',
            capacityKw: currentTask.capacityKw || 3,
          },
          users
        );
      }
    }

    if (matchedWf) {
      const totalSteps = matchedWf.steps.length;

      // Accurately determine which workflow step the updating user corresponds to
      let updatedStepNum = 1;
      const activeNums =
        matchedWf.currentActiveFlowStepNumbers && matchedWf.currentActiveFlowStepNumbers.length > 0
          ? matchedWf.currentActiveFlowStepNumbers
          : [1, 2];

      // 1. Check if currentUser is assigned to any of the currently active flow steps
      const activeStepWithUser = matchedWf.steps.find((s) => {
        if (!activeNums.includes(s.stepNumber)) return false;
        const resolvedUsers = resolveStepAssignedUsers(
          s.stepNumber,
          s.assignedUserIds,
          currentTask?.assignedUserIds,
          users
        );
        return (
          s.assignedUserIds?.includes(currentUser.id) ||
          resolvedUsers.some((u) => u.id === currentUser.id) ||
          s.assignedUserNames?.some(
            (n) => currentUser.name && n.trim().toLowerCase().includes(currentUser.name.trim().toLowerCase())
          )
        );
      });

      if (activeStepWithUser) {
        updatedStepNum = activeStepWithUser.stepNumber;
      } else {
        // 2. Check if currentUser is assigned to ANY step in the workflow
        const anyStepWithUser = matchedWf.steps.find((s) => {
          const resolvedUsers = resolveStepAssignedUsers(
            s.stepNumber,
            s.assignedUserIds,
            currentTask?.assignedUserIds,
            users
          );
          return (
            s.assignedUserIds?.includes(currentUser.id) ||
            resolvedUsers.some((u) => u.id === currentUser.id) ||
            s.assignedUserNames?.some(
              (n) => currentUser.name && n.trim().toLowerCase().includes(currentUser.name.trim().toLowerCase())
            )
          );
        });

        if (anyStepWithUser) {
          updatedStepNum = anyStepWithUser.stepNumber;
        } else {
          // If Owner or unassigned, advance the earliest active step
          updatedStepNum = activeNums[0] || 1;
        }
      }

      // Compute ratio-2 notification steps forward: Step K -> K+1 & K+2
      const nextSteps = calculateNextFlowchartNotificationSteps(updatedStepNum, totalSteps);

      // Update workflow steps state
      const updatedWfSteps = matchedWf.steps.map((st) => {
        if (st.stepNumber === updatedStepNum) {
          return {
            ...st,
            status: (newStatus === 'compleated' ? 'compleated' : 'in progress') as any,
            lastUpdatedAt: now,
            lastUpdatedByUserId: currentUser.id,
            lastUpdatedByName: currentUser.name,
            lastWorkDescription: optionalMessage || `Updated status to ${newStatus}`,
            isOwnerOverride: isOwner ? true : st.isOwnerOverride,
            ownerOverrideBy: isOwner ? (currentUser.name || 'Dilip Enterprises (Owner)') : st.ownerOverrideBy,
            ownerOverrideAt: isOwner ? now : st.ownerOverrideAt,
            ownerOverrideMessage: isOwner ? (optionalMessage || undefined) : st.ownerOverrideMessage,
            lockedAgainstStaffModification: isOwner ? true : st.lockedAgainstStaffModification,
            history: [
              ...(st.history || []),
              {
                id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                timestamp: now,
                userId: currentUser.id,
                userName: currentUser.name,
                userRole: currentUser.role,
                previousStatus: st.status,
                newStatus: (newStatus === 'compleated' ? 'compleated' : 'in progress') as any,
                workDescription: isOwner
                  ? `[Owner Master Override] ${optionalMessage || `Status changed to ${newStatus}`}`
                  : (optionalMessage || `Status changed to ${newStatus}`),
              },
            ],
          };
        }
        if (nextSteps.includes(st.stepNumber)) {
          return {
            ...st,
            isNotified: true,
            notifiedAt: now,
          };
        }
        return st;
      });

      // Strictly ratio-2 forward cascade: Task K triggers notification strictly forward to K+1 and K+2!
      // Rules N2 to N6:
      // Task 1 -> Task 2 & Task 3
      // Task 2 -> Task 3 & Task 4
      // Task 3 -> Task 4 & Task 5
      // Task 4 -> Task 5 & Task 6
      // Task 5 -> Task 6 & Task 7
      // Task K -> Task K+1 & Task K+2
      const targetActiveFlowSteps = nextSteps.length > 0 ? nextSteps : [];

      const finalWorkflow: ActiveLeadWorkflow = {
        ...matchedWf,
        taskId: currentTask?.id || matchedWf.taskId,
        currentActiveFlowStepNumbers: targetActiveFlowSteps,
        notifiedSteps: targetActiveFlowSteps,
        steps: updatedWfSteps,
        updatedAt: now,
      };

      setActiveLeadWorkflows((prev) => {
        const filtered = prev.filter((w) => w.id !== finalWorkflow.id);
        const nextList = [finalWorkflow, ...filtered];
        saveStoredLeadWorkflows(nextList);
        return nextList;
      });

      // Dispatch in-app directive notifications strictly to assigned staff of next active steps
      const updatedStepObj = matchedWf.steps.find((s) => s.stepNumber === updatedStepNum);
      const updatedStepTitle = updatedStepObj?.title || `Task #${updatedStepNum}`;
      const authorLabel =
        currentUser.role === 'owner'
          ? `${currentUser.name} (Owner)`
          : `${currentUser.name} (Task ${updatedStepNum} User)`;

      const sameFlowchartTitle = `⚡ Flowchart Handover: Task ${updatedStepNum} (${updatedStepTitle}) Status Updated to "${newStatus.toUpperCase()}"`;
      const sameFlowchartCommand =
        `⚡ Flowchart Status Update from Task ${updatedStepNum} (${updatedStepTitle}):\n` +
        `👤 Updated By: ${authorLabel}\n` +
        `🔄 New Status: "${newStatus.toUpperCase()}"\n` +
        (optionalMessage ? `📝 Work Done / Description: "${optionalMessage.trim()}"\n` : '') +
        `👉 Handover to Task ${nextSteps.join(' & Task ')}: All assigned users have full capability and authorization to execute work and update status.`;

      const leadId = currentTask?.id || matchedWf?.taskId || matchedWf?.leadId || `lead-${Date.now()}`;

      // A. Gather explicitly assigned staff for Next Active Steps (K+1 & K+2 ONLY)
      const assignedIdsForNextSteps = Array.from(
        new Set(
          (finalWorkflow.steps || [])
            .filter((s) => nextSteps.includes(s.stepNumber))
            .flatMap((s) => s.assignedUserIds || [])
        )
      );

      const userStepMap: Record<string, number> = {};
      (finalWorkflow.steps || [])
        .filter((s) => nextSteps.includes(s.stepNumber))
        .forEach((s) => {
          (s.assignedUserIds || []).forEach((uid) => {
            if (!userStepMap[uid]) {
              userStepMap[uid] = s.stepNumber;
            }
          });
        });

      // Generate handover directives strictly to Task (N+1) & Task (N+2) ONLY
      const { directivesToDeliver: generatedDirectives } = handleTaskStatusUpdate(
        updatedStepNum,
        leadId,
        {
          projectTitle: sameFlowchartTitle,
          customerName: currentTask?.customerName || matchedWf?.customerName || '',
          customerPhone: currentTask?.customerPhone || matchedWf?.customerPhone || '',
          customerAddress: currentTask?.customerAddress || matchedWf?.customerAddress || '',
          capacityKw: currentTask?.capacityKw || matchedWf?.capacityKw || 3,
          ownerCommand: sameFlowchartCommand,
          priority: 'High',
          taskCode: currentTask?.taskCode || 'WF',
          authorName: currentUser.name,
          authorLabel: authorLabel,
        },
        users,
        assignedIdsForNextSteps,
        userStepMap
      );

      // Update CRM task assigned users to include users of next active steps so the task is visible to them
      if (currentTask && nextSteps.length > 0) {
        const nextActiveAssignedUsers = Array.from(
          new Set(
            nextSteps.flatMap((sn) => {
              const st = finalWorkflow.steps.find((s) => s.stepNumber === sn);
              return st?.assignedUserIds || [];
            })
          )
        );
        const nextActiveAssignedNames = nextActiveAssignedUsers.map(
          (uid) => resolveStaffUser(uid, users)?.name || uid
        );

        let updatedTaskToPersist: CrmTask | null = null;
        setTasks((prev) => {
          const updated = prev.map((t) => {
            if (t.id === currentTask.id) {
              const combinedUserIds = Array.from(new Set([...(t.assignedUserIds || []), ...nextActiveAssignedUsers]));
              const combinedUserNames = Array.from(new Set([...(t.assignedUserNames || []), ...nextActiveAssignedNames]));
              const updatedObj: CrmTask = {
                ...t,
                assignedUserIds: combinedUserIds,
                assignedUserNames: combinedUserNames,
              };
              updatedTaskToPersist = updatedObj;
              return updatedObj;
            }
            return t;
          });
          try {
            localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(updated));
          } catch (e) {}
          if (updatedTaskToPersist) {
            saveTaskToFirestore(updatedTaskToPersist);
          }
          return updated;
        });
      }

      if (generatedDirectives.length > 0) {
        generatedDirectives.forEach((d) => {
          saveDirectiveToFirestore(d).catch(() => {});
        });
        setOwnerDirectives((prev) => {
          const map = new Map<string, OwnerDirectiveNotification>(prev.map((d) => [d.id, d]));
          generatedDirectives.forEach((d) => map.set(d.id, d));
          const updated = Array.from(map.values()).sort((a, b) => {
            const timeA = new Date(a.updatedAt || a.assignedAt || 0).getTime();
            const timeB = new Date(b.updatedAt || b.assignedAt || 0).getTime();
            return (timeB - timeA) || b.id.localeCompare(a.id);
          });
          try {
            localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });

        // Mirror to Project Notifications so Dilip Enterprises desk sees the flowchart handover
        const pNotif: ProjectNotification = {
          id: `pnotif-flow-${Date.now()}`,
          itemType: 'TASK',
          taskCode: currentTask?.taskCode || 'WF',
          projectTitle: sameFlowchartTitle,
          customerName: currentTask?.customerName,
          customerPhone: currentTask?.customerPhone,
          customerAddress: currentTask?.customerAddress,
          capacityKw: currentTask?.capacityKw,
          actionType: newStatus === 'compleated' ? 'STATUS_COMPLEATED' : 'TASK_ASSIGNED',
          newStatus: newStatus,
          authorId: currentUser?.id || 'usr-crm',
          authorName: authorLabel,
          authorRole: currentUser?.role || 'Staff',
          message: `${sameFlowchartTitle} - Handover to Task ${nextSteps.join(' & Task ')}: All assigned users authorized to update status.`,
          optionalRemarks: optionalMessage || undefined,
          timestamp: Date.now(),
          formattedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          isRead: false,
          priority: currentTask?.priority || 'High',
        };
        setProjectNotifications((prev) => {
          const updated = [pNotif, ...prev];
          try {
            localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });

        generatedDirectives.forEach((dir) => {
          saveDirectiveToFirestore(dir);
          broadcastUserUpdate({
            type: 'OWNER_DIRECTIVE',
            directive: dir,
            projectNotification: pNotif,
          });
        });
      }
    }
  };

  // Helper to simulate Amit Patel marking aman's project as COMPLEATED (for testing audio alert & notifications)
  const handleSimulateAmitCompleted = () => {
    const amanTask =
      tasks.find(
        (t) =>
          t.taskCode === 'DE-TASK-106' ||
          t.customerName?.toLowerCase().includes('aman') ||
          t.title?.toLowerCase().includes('aman')
      ) || tasks[0];

    const amitUser = users.find((u) => u.username === 'amit') || {
      id: 'usr-amit',
      name: 'Amit Patel',
      role: 'employee' as const,
      roleTitle: 'Site Technician',
    };

    const now = new Date().toISOString();
    if (amanTask) {
      const updatedTasks = tasks.map((t) => {
        if (t.id !== amanTask.id) return t;
        return {
          ...t,
          status: 'compleated' as CrmTaskStatus,
          lastUpdatedAt: now,
          lastUpdatedBy: amitUser.name,
          remarksHistory: [
            {
              id: `rem-${Date.now()}`,
              authorId: amitUser.id,
              authorName: amitUser.name,
              authorRole: amitUser.role,
              statusChangedTo: 'compleated' as CrmTaskStatus,
              message: 'Solar installation done and inverter powered ON successfully.',
              timestamp: now,
            },
            ...t.remarksHistory,
          ],
        };
      });

      setTasks(updatedTasks);
      try {
        localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(updatedTasks));
      } catch (e) {}
    }

    const notifPayload: ProjectNotification = {
      id: `sim-notif-${Date.now()}`,
      itemType: 'TASK',
      taskCode: amanTask?.taskCode || 'DE-TASK-106',
      projectTitle: amanTask?.title || '2kW Hybrid Solar - aman',
      customerName: amanTask?.customerName || 'aman',
      customerPhone: amanTask?.customerPhone || '9795598171',
      customerAddress: amanTask?.customerAddress || 'chowk prayagraj',
      capacityKw: amanTask?.capacityKw || 2,
      actionType: 'STATUS_COMPLEATED',
      newStatus: 'compleated',
      oldStatus: amanTask?.status || 'in progress',
      authorId: amitUser.id,
      authorName: amitUser.name,
      authorRole: 'Site Technician',
      message: 'Amit Patel marked 2kW Hybrid Solar - aman as COMPLEATED',
      optionalRemarks: 'Solar installation done and inverter powered ON successfully.',
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      isRead: false,
      priority: 'Urgent',
    };

    broadcastUserUpdate(notifPayload);
    if (currentUser?.role === 'owner') {
      playOwnerDeepAlertSound();
    }
  };

  // ---------------- MULTI-BUSINESS TEMPLATE ACTIONS ---------------- //
  const handleAddBusiness = (newBusiness: BusinessWorkspace, sampleTask?: Partial<CrmTask>) => {
    const updatedList = [...businesses, newBusiness];
    setBusinesses(updatedList);
    saveStoredBusinesses(updatedList);
    setActiveBusinessId(newBusiness.id);
    saveStoredActiveBusinessId(newBusiness.id);
    setIsAllBusinessesView(false);

    if (sampleTask) {
      const now = new Date().toISOString();
      const leadStaff = users.find((u) => u.role === 'employee') || users[0];
      const newTask: CrmTask = {
        id: `task-${Date.now()}`,
        taskCode: sampleTask.taskCode || `${newBusiness.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        title: sampleTask.title || `Initial Project - ${newBusiness.name}`,
        customerName: sampleTask.customerName || 'Client Enterprise',
        customerPhone: sampleTask.customerPhone || '+91 98390 12345',
        customerAddress: sampleTask.customerAddress || newBusiness.address,
        capacityKw: sampleTask.capacityKw || 5,
        systemType: sampleTask.systemType || (newBusiness.systemTypes && newBusiness.systemTypes[0]) || 'Standard Work',
        monthlyBillRs: sampleTask.monthlyBillRs || '4000',
        priority: sampleTask.priority || 'High',
        assignedToUserId: sampleTask.assignedToUserId || leadStaff.id,
        assignedToUserName: sampleTask.assignedToUserName || leadStaff.name,
        assignedBy: currentUser?.name || newBusiness.ownerName,
        assignedAt: now,
        ownerInstructions: sampleTask.ownerInstructions || 'Execute according to business workflow SOP.',
        status: sampleTask.status || 'not started',
        lastUpdatedAt: now,
        lastUpdatedBy: currentUser?.name || newBusiness.ownerName,
        remarksHistory: [],
        dealValueRs: sampleTask.dealValueRs || 200000,
        leadSource: sampleTask.leadSource || 'Template Seeding',
        businessId: newBusiness.id,
        businessName: newBusiness.name,
      };

      setTasks((prev) => {
        const updated = [newTask, ...prev];
        try {
          localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      saveTaskToFirestore(newTask);
    }

    recordAuditEvent(
      currentUser || users[0],
      'TASK_UPDATED',
      `Created new business workspace template: "${newBusiness.name}" (${newBusiness.industry})`
    );
    playSuccessSound();
  };

  const handleUpdateBusiness = (updated: BusinessWorkspace) => {
    const updatedList = businesses.map((b) => (b.id === updated.id ? updated : b));
    setBusinesses(updatedList);
    saveStoredBusinesses(updatedList);
    recordAuditEvent(
      currentUser || users[0],
      'TASK_UPDATED',
      `Updated business workspace configuration: "${updated.name}"`
    );
    playSuccessSound();
  };

  const handleDeleteBusiness = (businessId: string) => {
    if (businesses.length <= 1) return;
    const deleted = businesses.find((b) => b.id === businessId);
    const updatedList = businesses.filter((b) => b.id !== businessId);
    setBusinesses(updatedList);
    saveStoredBusinesses(updatedList);
    if (activeBusinessId === businessId) {
      const nextId = updatedList[0].id;
      setActiveBusinessId(nextId);
      saveStoredActiveBusinessId(nextId);
    }
    recordAuditEvent(
      currentUser || users[0],
      'TASK_UPDATED',
      `Deleted business workspace: "${deleted?.name || businessId}"`
    );
    playActionClickSound();
  };

  // ---------------- CREATE NEW TASK ---------------- //
  const handleCreateTask = (
    taskData: Omit<CrmTask, 'id' | 'taskCode' | 'assignedAt' | 'lastUpdatedAt' | 'lastUpdatedBy' | 'remarksHistory'>
  ) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const assignedBusinessId = taskData.businessId || activeBusinessId;
    const assignedBusiness = businesses.find((b) => b.id === assignedBusinessId) || activeBusiness;

    const taskId = `task-${Date.now()}`;
    const wfId = `wf-inst-${Date.now()}`;

    // 1. Resolve SOP template and Task 1 & Task 2 appointed staff according to Super Admin command
    const selectedTmpl =
      (taskData.templateId && taskWorkflowTemplates.find((t) => t.id === taskData.templateId)) ||
      (taskWorkflowTemplates && taskWorkflowTemplates.find((t) => t.category?.toLowerCase().includes('solar'))) ||
      (taskWorkflowTemplates && taskWorkflowTemplates[0]) ||
      INITIAL_TASK_WORKFLOW_TEMPLATES[0];

    // Super Admin command supremacy:
    // If taskData has customStepAssignments or assignedUserIds, use THOSE exact users!
    const step1Users =
      taskData.customStepAssignments && taskData.customStepAssignments[1] !== undefined
        ? taskData.customStepAssignments[1]
        : (selectedTmpl?.steps?.find((s) => s.stepNumber === 1)?.assignedUserIds || []);

    const step2Users =
      taskData.customStepAssignments && taskData.customStepAssignments[2] !== undefined
        ? taskData.customStepAssignments[2]
        : (selectedTmpl?.steps?.find((s) => s.stepNumber === 2)?.assignedUserIds || []);

    // Step 1 & Step 2 exclusive staff (Rule 1 / N1 enforced):
    // Only Step 1 & Step 2 assigned users are activated and notified at lead creation.
    // Step 3–7 staff (e.g. Sunny) are ONLY notified when workflow advances to their step!
    const step1And2UserIds = Array.from(new Set([...step1Users, ...step2Users])).filter(Boolean);

    const initialStaffIds: string[] =
      step1And2UserIds.length > 0
        ? step1And2UserIds
        : (Array.isArray(taskData.assignedUserIds) && taskData.assignedUserIds.length > 0
          ? taskData.assignedUserIds
          : (selectedTmpl?.steps?.[0]?.assignedUserIds || []));

    const initialStaffNames = initialStaffIds.map((uid) => resolveStaffUser(uid, users)?.name || uid);

    const primaryUserId = taskData.assignedToUserId || step1Users[0] || initialStaffIds[0] || '';
    const primaryUserName = resolveStaffUser(primaryUserId, users)?.name || initialStaffNames[0] || 'Unassigned';

    // 2. Build CRM Task strictly assigned to Super Admin commanded staff
    const newTask: CrmTask = {
      ...taskData,
      id: taskId,
      workflowId: wfId,
      taskCode: `${(assignedBusiness?.name || 'TASK').substring(0, 3).toUpperCase()}-${100 + tasks.length + 1}`,
      businessId: assignedBusinessId,
      businessName: assignedBusiness?.name || 'Dilip Enterprises',
      assignedToUserId: primaryUserId,
      assignedToUserName: primaryUserName,
      assignedUserIds: initialStaffIds, // STRICT SUPER ADMIN COMMAND: ONLY commanded staff!
      assignedUserNames: initialStaffNames,
      assignedBy: `${currentUser.name} (Owner)`,
      assignedAt: now,
      lastUpdatedAt: now,
      lastUpdatedBy: currentUser.name,
      ownerInstructions: taskData.ownerInstructions || `[Rule 1 / N1] Lead details dispatched EXCLUSIVELY to Task 1 & Task 2 staff (${initialStaffNames.join(', ') || 'No staff appointed yet'}).`,
      status: 'not started',
      remarksHistory: [
        {
          id: `rem-${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          statusChangedTo: 'not started',
          message: `[Super Admin Command Enforced] Lead created. Dispatched EXCLUSIVELY to appointed staff: ${initialStaffNames.join(', ') || 'None'}.`,
          timestamp: now,
        },
      ],
    };

    // 3. Build ActiveLeadWorkflow linked directly to newTask with Super Admin commanded step assignments
    const newWf = createLeadWorkflowFromTemplate(
      selectedTmpl,
      {
        taskId: newTask.id,
        leadId: newTask.id,
        customerName: newTask.customerName,
        customerPhone: newTask.customerPhone || '',
        customerAddress: newTask.customerAddress || '',
        capacityKw: newTask.capacityKw || 3,
      },
      users,
      taskData.customStepAssignments
        ? { ...taskData.customStepAssignments, 1: step1Users, 2: step2Users }
        : {
            1: step1Users,
            2: step2Users,
          }
    );
    newWf.id = wfId;
    newWf.currentActiveFlowStepNumbers = [1, 2];

    // 4. Save both task and workflow state
    const updatedTasks = [newTask, ...tasks.filter((t) => t.id !== newTask.id)];
    setTasks(updatedTasks);
    try {
      localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(updatedTasks));
    } catch (e) {}
    saveTaskToFirestore(newTask);

    const updatedWfs = [newWf, ...activeLeadWorkflows.filter((w) => w.id !== wfId && w.taskId !== newTask.id)];
    setActiveLeadWorkflows(updatedWfs);
    try {
      localStorage.setItem('dilip_crm_lead_workflows_v2', JSON.stringify(updatedWfs));
    } catch (e) {}
    saveLeadWorkflowToFirestore(newWf);

    // 5. Dispatch Owner Directive Notifications EXCLUSIVELY to Task 1 & Task 2 staff (Rule 1 / N1)
    const userStepMap: Record<string, number> = {};
    step1Users.forEach((uid) => { userStepMap[uid] = 1; });
    step2Users.forEach((uid) => { if (!userStepMap[uid]) userStepMap[uid] = 2; });

    const { directivesToDeliver } = handleOwnerLeadCreation(
      {
        leadId: newTask.id,
        customerName: newTask.customerName,
        customerPhone: newTask.customerPhone,
        customerAddress: newTask.customerAddress,
        capacityKw: newTask.capacityKw,
        priority: newTask.priority || 'High',
        source: 'super-admin-lead-create',
        creatorName: `${currentUser.name} (Owner)`,
        taskCode: newTask.taskCode,
        projectTitle: `⚡ [RULE 1 / N1] Lead Initialized: ${newTask.customerName} (${newTask.capacityKw}kW Solar)`,
        ownerCommand: `[RULE 1 / N1 Enforced] New lead created. Action required for Task 1 & Task 2 appointed staff.`,
      },
      users,
      initialStaffIds,
      userStepMap
    );

    directivesToDeliver.forEach((dir) => {
      handleCreateDirectiveNotification(dir);
    });

    // 6. Create Super Admin Project Notification for Rule 1 (N1) verification
    const ownerNotif: ProjectNotification = {
      id: `pnotif-rule1-${Date.now()}`,
      itemType: 'TASK',
      taskCode: newTask.taskCode,
      projectTitle: `⚡ [RULE 1 / N1 APPLIED]: New Lead - ${newTask.customerName}`,
      customerName: newTask.customerName,
      customerPhone: newTask.customerPhone,
      customerAddress: newTask.customerAddress || 'Prayagraj',
      capacityKw: newTask.capacityKw || 3,
      actionType: 'TASK_ASSIGNED',
      newStatus: 'not started',
      authorId: currentUser.id,
      authorName: `${currentUser.name} (Owner)`,
      authorRole: 'owner',
      message: `⚡ [RULE 1 / N1 Followed]: Lead details & initial notifications sent EXCLUSIVELY to Task 1 & Task 2 assigned staff: ${initialStaffNames.join(', ')}. (Task 3–7 staff do NOT have lead access).`,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false,
      priority: 'High',
    };
    setProjectNotifications((prev) => [ownerNotif, ...prev]);
    try {
      const rawP = localStorage.getItem('dilip_crm_project_notifications_v3');
      const existP = rawP ? JSON.parse(rawP) : [];
      localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify([ownerNotif, ...existP]));
    } catch (e) {}

    // 7. Audio & Visual Confirmation Alert for Super Admin
    unlockAudioContext();
    playSuccessSound();
    playOwnerDeepAlertSound();

    setLiveOwnerAlert({
      title: `⚡ [RULE 1 / N1 ENFORCED] Lead Created`,
      message: `Dispatched EXCLUSIVELY to Task 1 & Task 2 staff: ${initialStaffNames.join(', ')}. Task 3–7 staff access is locked.`,
      timestamp: Date.now(),
      customerName: newTask.customerName,
      taskCode: newTask.taskCode,
    });

    recordAuditEvent(
      currentUser,
      'TASK_ASSIGNED',
      `[RULE 1 / N1] Super Admin created lead ${newTask.taskCode} (${newTask.customerName}, ${newTask.capacityKw}kW). Dispatched exclusively to Task 1 & 2 staff: ${initialStaffNames.join(', ')}.`
    );

    // 8. Broadcast cross-tab update
    broadcastUserUpdate({
      type: 'OWNER_DIRECTIVE',
      id: `task-create-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      itemType: 'TASK',
      taskCode: newTask.taskCode,
      projectTitle: `⚡ [RULE 1 / N1] ${newTask.customerName}`,
      customerName: newTask.customerName,
      newStatus: newTask.status,
      message: `[RULE 1 / N1 Enforced]: Lead dispatched exclusively to Task 1 & Task 2 staff: ${initialStaffNames.join(', ')}.`,
      timestamp: Date.now(),
      projectNotification: ownerNotif,
      task: newTask,
    });

    // Reset filters and ensure Grid mode so newly created task is immediately visible
    setTaskViewMode('grid');
    setStatusFilter('all');
    setUserFilter('all');
    setPriorityFilter('all');
    setTaskSearch('');
  };

  // ---------------- EDIT TASK HANDLERS ---------------- //
  const handleEditTask = (task: CrmTask) => {
    setTaskToEdit(task);
    setIsEditTaskModalOpen(true);
  };

  const handleSaveEditedTask = (updatedTask: CrmTask, editNotes?: string) => {
    if (!currentUser) return;
    const now = new Date().toISOString();

    let remarks = [...updatedTask.remarksHistory];
    if (editNotes) {
      remarks.unshift({
        id: `rem-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        statusChangedTo: updatedTask.status,
        message: `[Details Edited] ${editNotes}`,
        timestamp: now,
      });
    }

    const isOwner = currentUser.role === 'owner';
    const originalTask = tasks.find((t) => t.id === updatedTask.id);

    const finalTask: CrmTask = {
      ...updatedTask,
      assignedToUserId: isOwner
        ? updatedTask.assignedToUserId
        : (originalTask?.assignedToUserId || updatedTask.assignedToUserId),
      assignedToUserName: isOwner
        ? updatedTask.assignedToUserName
        : (originalTask?.assignedToUserName || updatedTask.assignedToUserName),
      ownerInstructions: isOwner
        ? updatedTask.ownerInstructions
        : (originalTask?.ownerInstructions || updatedTask.ownerInstructions || ''),
      remarksHistory: remarks,
      lastUpdatedAt: now,
      lastUpdatedBy: currentUser.name,
    };

    const newTasks = tasks.map((t) => (t.id === finalTask.id ? finalTask : t));
    setTasks(newTasks);
    playSuccessSound();
    saveTaskToFirestore(finalTask);
    try {
      localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(newTasks));
    } catch (e) {}

    recordAuditEvent(
      currentUser,
      'STATUS_CHANGE',
      `${currentUser.name} updated project details for ${finalTask.taskCode} (${finalTask.customerName}). Note: "${editNotes || 'Updated specs / contact / assignment'}"`
    );

    if (isOwner && finalTask.assignedToUserId) {
      const editDirective: OwnerDirectiveNotification = {
        id: `dir-edit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        targetUserId: finalTask.assignedToUserId,
        targetUserName: finalTask.assignedToUserName,
        taskId: finalTask.id,
        taskCode: finalTask.taskCode,
        itemType: 'TASK_UPDATED',
        projectTitle: finalTask.title,
        customerName: finalTask.customerName,
        customerPhone: finalTask.customerPhone,
        customerAddress: finalTask.customerAddress,
        capacityKw: finalTask.capacityKw,
        ownerCommand:
          finalTask.ownerInstructions ||
          `Owner updated project specifications. Priority: ${finalTask.priority}.`,
        priority: finalTask.priority || 'Normal',
        status: finalTask.status,
        assignedBy: currentUser.name,
        assignedAt: now,
        isRead: false,
      };

      setOwnerDirectives((prev) => {
        const filtered = prev.filter((d) => d.id !== editDirective.id);
        const updated = [editDirective, ...filtered];
        try {
          localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      broadcastUserUpdate({
        type: 'OWNER_DIRECTIVE',
        directive: editDirective,
      });
    }

    broadcastUserUpdate({
      id: `task-edit-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      itemType: 'TASK',
      itemCode: finalTask.taskCode,
      itemTitle: finalTask.title,
      newStatus: finalTask.status,
      message: `Task details updated by ${currentUser.name}`,
      timestamp: Date.now(),
    });
  };

  // ---------------- DELETE TASK HANDLERS ---------------- //
  const handleDeleteTask = (task: CrmTask) => {
    setTaskToDelete(task);
    setIsDeleteTaskModalOpen(true);
  };

  const handleConfirmDeleteTask = (reason: string) => {
    if (!currentUser || !taskToDelete) return;
    const target = taskToDelete;
    const filtered = tasks.filter((t) => t.id !== target.id);
    setTasks(filtered);
    playWarningSound();
    deleteTaskFromFirestore(target.id);
    try {
      // Record tombstone so this task is never re-hydrated from cloud
      const rawTomb = localStorage.getItem('dilip_crm_deleted_task_ids_v1');
      const existingTomb: string[] = rawTomb ? JSON.parse(rawTomb) : [];
      const combinedTomb = Array.from(new Set([...existingTomb, target.id, target.leadId || '', `task-${target.leadId || ''}`].filter(Boolean)));
      localStorage.setItem('dilip_crm_deleted_task_ids_v1', JSON.stringify(combinedTomb));
      localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(filtered));
    } catch (e) {}

    recordAuditEvent(
      currentUser,
      'STATUS_CHANGE',
      `Owner ${currentUser.name} deleted task ${target.taskCode} (${target.customerName}, ${target.capacityKw}kW). Reason: "${reason}"`
    );

    broadcastUserUpdate({
      id: `task-del-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      itemType: 'TASK',
      itemCode: target.taskCode,
      itemTitle: target.title,
      newStatus: 'Deleted',
      message: `Task deleted by ${currentUser.name}: ${reason}`,
      timestamp: Date.now(),
    });

    setTaskToDelete(null);
  };

  // ---------------- SOLAR EPC WORKFLOW HANDLERS ---------------- //
  const handleSavePmSuryaGharStage = (
    taskId: string,
    updatedStage: PmSuryaGharStage,
    meta: {
      consumerAppNo?: string;
      netMeterChallanNo?: string;
      subsidyAmountClaimed?: number;
      remarkText?: string;
    }
  ) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    const stageInfo = getPmSuryaGharStageInfo(updatedStage);
    const remarkMsg = `[PM Surya Ghar Milestone] Advanced to: ${stageInfo.label} (${stageInfo.hindiLabel})${
      meta.remarkText ? `. Note: ${meta.remarkText}` : ''
    }`;

    const updatedRemarks = [
      {
        id: `rem-pmsg-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        statusChangedTo: currentTask.status,
        message: remarkMsg,
        timestamp: now,
      },
      ...currentTask.remarksHistory,
    ];

    const updatedTask: CrmTask = {
      ...currentTask,
      pmSuryaGharStage: updatedStage,
      consumerAppNo: meta.consumerAppNo || currentTask.consumerAppNo,
      netMeterChallanNo: meta.netMeterChallanNo || currentTask.netMeterChallanNo,
      subsidyAmountClaimed:
        meta.subsidyAmountClaimed !== undefined
          ? meta.subsidyAmountClaimed
          : currentTask.subsidyAmountClaimed,
      remarksHistory: updatedRemarks,
      lastUpdatedAt: now,
      lastUpdatedBy: currentUser.name,
    };

    const newTasks = tasks.map((t) => (t.id === taskId ? updatedTask : t));
    setTasks(newTasks);
    playSuccessSound();
    saveTaskToFirestore(updatedTask);
    try {
      localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(newTasks));
    } catch (e) {}

    recordAuditEvent(
      currentUser,
      'STATUS_CHANGE',
      `${currentUser.name} updated PM Surya Ghar stage for ${updatedTask.taskCode} (${updatedTask.customerName}) to "${stageInfo.label}"`
    );

    broadcastUserUpdate({
      id: `pmsg-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      itemType: 'TASK',
      itemCode: updatedTask.taskCode,
      itemTitle: updatedTask.title,
      newStatus: stageInfo.hindiLabel,
      message: remarkMsg,
      timestamp: Date.now(),
    });
  };

  const handleSaveFeasibility = (taskId: string, feasibility: SolarFeasibilityData) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    const updatedRemarks = [
      {
        id: `rem-feasi-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        statusChangedTo: currentTask.status,
        message: `[Feasibility Audit] Roof: ${feasibility.roofAreaSqFt || 'N/A'} sqft, ${feasibility.roofType || ''}, Shadow: ${feasibility.shadowFreePercentage || 100}%`,
        timestamp: now,
      },
      ...currentTask.remarksHistory,
    ];

    const updatedTask: CrmTask = {
      ...currentTask,
      feasibility,
      roofType: feasibility.roofType || currentTask.roofType,
      remarksHistory: updatedRemarks,
      lastUpdatedAt: now,
      lastUpdatedBy: currentUser.name,
    };

    const newTasks = tasks.map((t) => (t.id === taskId ? updatedTask : t));
    setTasks(newTasks);
    playSuccessSound();
    saveTaskToFirestore(updatedTask);
    try {
      localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(newTasks));
    } catch (e) {}

    recordAuditEvent(
      currentUser,
      'TASK_UPDATED',
      `${currentUser.name} saved Site Technical Feasibility Audit for ${updatedTask.taskCode} (${updatedTask.customerName})`
    );
  };

  const handleSaveEquipmentBom = (taskId: string, bom: SolarEquipmentBOM) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    const updatedRemarks = [
      {
        id: `rem-bom-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        statusChangedTo: currentTask.status,
        message: `[Equipment BOM] Panels: ${bom.panelBrand || ''} (${bom.panelCount || 0}x ${bom.panelWattageWp || 0}Wp), Inverter: ${bom.inverterBrand || ''} (S/N: ${bom.inverterSerialNo || 'N/A'})`,
        timestamp: now,
      },
      ...currentTask.remarksHistory,
    ];

    const updatedTask: CrmTask = {
      ...currentTask,
      equipmentBOM: bom,
      remarksHistory: updatedRemarks,
      lastUpdatedAt: now,
      lastUpdatedBy: currentUser.name,
    };

    const newTasks = tasks.map((t) => (t.id === taskId ? updatedTask : t));
    setTasks(newTasks);
    playSuccessSound();
    saveTaskToFirestore(updatedTask);
    try {
      localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(newTasks));
    } catch (e) {}

    recordAuditEvent(
      currentUser,
      'TASK_UPDATED',
      `${currentUser.name} updated Equipment BOM & Serials for ${updatedTask.taskCode} (${updatedTask.customerName})`
    );
  };

  const handleCreateTaskFromQuotation = (quoteData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    capacityKw: number;
    systemType: 'On-Grid Rooftop' | 'Hybrid Solar' | 'Off-Grid' | 'Commercial HT';
    dealValueRs: number;
    notes: string;
  }) => {
    const leadEngineer = users.find((u) => u.role === 'employee') || users[0];
    handleCreateTask({
      title: `${quoteData.capacityKw}kW ${quoteData.systemType} - ${quoteData.customerName}`,
      customerName: quoteData.customerName,
      customerPhone: quoteData.customerPhone,
      customerAddress: quoteData.customerAddress,
      capacityKw: quoteData.capacityKw,
      systemType: quoteData.systemType,
      priority: 'High',
      assignedToUserId: leadEngineer.id,
      assignedToUserName: leadEngineer.name,
      assignedBy: currentUser?.name || 'Dilip Enterprises (Owner)',
      ownerInstructions: quoteData.notes,
      status: 'not started',
      leadSource: 'Solar Quotation Calculator',
      dealValueRs: quoteData.dealValueRs,
      pmSuryaGharStage: 'site_survey',
    });
  };

  // ---------------- BULK ACTIONS HANDLERS ---------------- //
  const handleBulkStatusChange = (taskIds: string[], newStatus: CrmTaskStatus) => {
    if (!currentUser || taskIds.length === 0) return;
    const now = new Date().toISOString();

    const updated = tasks.map((t) => {
      if (!taskIds.includes(t.id)) return t;
      const remarks = [
        {
          id: `rem-${Date.now()}-${t.id}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          statusChangedTo: newStatus,
          message: `Bulk status change to ${newStatus} by ${currentUser.name}`,
          timestamp: now,
        },
        ...t.remarksHistory,
      ];
      return {
        ...t,
        status: newStatus,
        lastUpdatedAt: now,
        lastUpdatedBy: currentUser.name,
        remarksHistory: remarks,
      };
    });

    setTasks(updated);
    playBulkActionSound();
    try {
      localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(updated));
    } catch (e) {}

    recordAuditEvent(
      currentUser,
      'STATUS_CHANGE',
      `${currentUser.name} bulk-updated status of ${taskIds.length} projects to "${newStatus}"`
    );

    broadcastUserUpdate({
      id: `bulk-status-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      itemType: 'TASK',
      itemCode: 'BULK',
      itemTitle: `${taskIds.length} Projects`,
      newStatus,
      message: `Bulk updated to ${newStatus}`,
      timestamp: Date.now(),
    });

    setLiveOwnerAlert({
      id: `bulk-status-toast-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      itemType: 'TASK',
      itemCode: 'BULK',
      itemTitle: `${taskIds.length} Projects Updated`,
      newStatus,
      message: `Successfully updated ${taskIds.length} tasks to "${newStatus}"!`,
      timestamp: Date.now(),
    });
  };

  const handleBulkReassign = (taskIds: string[], staffId: string, staffName: string) => {
    if (!currentUser || taskIds.length === 0) return;
    const now = new Date().toISOString();

    const updated = tasks.map((t) => {
      if (!taskIds.includes(t.id)) return t;
      return {
        ...t,
        assignedToUserId: staffId,
        assignedToUserName: staffName,
        assignedBy: currentUser.name,
        lastUpdatedAt: now,
        lastUpdatedBy: currentUser.name,
      };
    });

    setTasks(updated);
    playBulkActionSound();
    try {
      localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(updated));
    } catch (e) {}

    recordAuditEvent(
      currentUser,
      'TASK_ASSIGNED',
      `Owner re-assigned ${taskIds.length} projects to ${staffName}`
    );

    broadcastUserUpdate({
      id: `bulk-reassign-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      itemType: 'TASK',
      itemCode: 'BULK',
      itemTitle: `${taskIds.length} Projects`,
      newStatus: 'Reassigned',
      message: `Reassigned to ${staffName}`,
      timestamp: Date.now(),
    });

    setLiveOwnerAlert({
      id: `bulk-reassign-toast-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      itemType: 'TASK',
      itemCode: 'REASSIGN',
      itemTitle: `${taskIds.length} Projects Reassigned`,
      newStatus: 'Reassigned',
      message: `Successfully reassigned ${taskIds.length} tasks to ${staffName}!`,
      timestamp: Date.now(),
    });
  };

  // ---------------- WHATSAPP TEMPLATES HANDLER ---------------- //
  const handleOpenWhatsAppModal = (task: CrmTask) => {
    setTaskForWhatsApp(task);
    setIsWhatsAppModalOpen(true);
  };

  // ---------------- 1-CLICK CONVERT LEAD TO ACTIVE PROJECT TASK ---------------- //
  const handleConvertLeadToTask = (lead: StoredLeadRecord) => {
    if (!currentUser) return;
    const now = new Date().toISOString();

    const capacity = Number(lead.desiredCapacityKw) || 3;
    const estimatedDealValue = capacity * 65000; // ~₹65k per kW
    const assignedBusinessId = activeBusinessId || 'biz-solar-dilip';
    const assignedBusiness = businesses.find((b) => b.id === assignedBusinessId) || activeBusiness;

    // Strict Flowchart Mandate: Initial lead is visible ONLY to Task 1 & Task 2 users
    const targetWfTemplate =
      (taskWorkflowTemplates && taskWorkflowTemplates.find((t) => t.category?.toLowerCase().includes('solar'))) ||
      (taskWorkflowTemplates && taskWorkflowTemplates[0]) ||
      INITIAL_TASK_WORKFLOW_TEMPLATES[0];

    const step1Users = targetWfTemplate?.steps?.find((s) => s.stepNumber === 1)?.assignedUserIds || [];
    const step2Users = targetWfTemplate?.steps?.find((s) => s.stepNumber === 2)?.assignedUserIds || [];
    const initialStaffIds = Array.from(new Set([...step1Users, ...step2Users]));
    const initialStaffNames = initialStaffIds.map((uid) => resolveStaffUser(uid, users)?.name || uid);

    const primaryId = step1Users[0] || initialStaffIds[0] || '';
    const primaryUser = resolveStaffUser(primaryId, users);

    const newTask: CrmTask = {
      id: `task-${lead.id || Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskCode: `${(assignedBusiness?.name || 'LEAD').substring(0, 3).toUpperCase()}-${100 + tasks.length + 1}`,
      title: `${capacity}kW Rooftop Solar - ${lead.fullName}`,
      customerName: lead.fullName,
      customerPhone: lead.phone,
      customerEmail: lead.email,
      customerAddress: lead.location || 'Prayagraj',
      capacityKw: capacity,
      systemType: (lead.propertyType?.includes('Commercial') ? 'Commercial HT' : 'On-Grid Rooftop') as any,
      monthlyBillRs: lead.monthlyBillRs || '3500',
      uppclAccountNo: lead.uppclAccountNumber || '',
      roofType: (lead.roofType || 'RCC Flat Roof') as any,
      priority: 'High',
      assignedToUserId: primaryId || '',
      assignedToUserName: primaryUser?.name || 'Er. Devashish',
      assignedUserIds: initialStaffIds,
      assignedUserNames: initialStaffNames,
      assignedBy: currentUser.name,
      assignedAt: now,
      ownerInstructions: `Inbound Lead (${lead.source || 'Inbound Inquiry'}). Flowchart initialized for Task 1 & Task 2 users to coordinate site shadow survey and bill verification.`,
      status: 'not started',
      lastUpdatedAt: now,
      lastUpdatedBy: currentUser.name,
      dealValueRs: estimatedDealValue,
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      leadSource: lead.source || 'Website Inbound Inquiry',
      businessId: assignedBusinessId,
      businessName: assignedBusiness?.name || 'Dilip Enterprises',
      remarksHistory: [
        {
          id: `rem-${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          statusChangedTo: 'not started',
          message: `Lead converted to active CRM Project. Notes: "${lead.message || 'No additional note'}"`,
          timestamp: now,
        },
      ],
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    playSuccessSound();
    try {
      localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(updatedTasks));
    } catch (e) {}
    saveTaskToFirestore(newTask);

    // Update lead status in pipeline
    try {
      updateLeadStatus(lead.id, 'survey_scheduled');
    } catch (e) {}

    recordAuditEvent(
      currentUser,
      'TASK_ASSIGNED',
      `Owner converted website lead "${lead.fullName}" into Active Project ${newTask.taskCode} (${newTask.capacityKw}kW)`
    );

    broadcastUserUpdate({
      id: `lead-convert-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      itemType: 'TASK',
      itemCode: newTask.taskCode,
      itemTitle: newTask.title,
      newStatus: 'not started',
      message: `Website lead converted to Task (${newTask.taskCode})`,
      timestamp: Date.now(),
    });

    // Reset filters and switch view to grid so the newly converted task is immediately visible
    setTaskViewMode('grid');
    setStatusFilter('all');
    setUserFilter('all');
    setPriorityFilter('all');
    setTaskSearch('');

    // Also instantiate flowchart workflow for this converted lead so flowchart ratio-2 notifications trigger
    if (taskWorkflowTemplates && taskWorkflowTemplates.length > 0) {
      const defaultTemplate =
        taskWorkflowTemplates.find((t) => t.category?.toLowerCase().includes('solar')) ||
        taskWorkflowTemplates[0];

      if (defaultTemplate) {
        const newWf = createLeadWorkflowFromTemplate(
          defaultTemplate,
          {
            taskId: newTask.id,
            customerName: newTask.customerName,
            customerPhone: newTask.customerPhone || '',
            customerAddress: newTask.customerAddress || '',
            capacityKw: newTask.capacityKw || 3,
          },
          users
        );
        handleAttachLeadWorkflow(newWf);
      }
    }
  };

  // ---------------- USER MANAGEMENT ---------------- //
  const handleAddUser = (newUserData: Omit<CrmUser, 'id' | 'createdAt'>) => {
    const cleanUsername = newUserData.username.trim().toLowerCase();
    const newUser: CrmUser = {
      ...newUserData,
      username: cleanUsername,
      id: `usr-emp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // If this username was previously deleted, remove it from tombstones so it can be re-created fresh
    try {
      const stored = localStorage.getItem('dilip_crm_deleted_user_ids_v1');
      if (stored) {
        const list: string[] = JSON.parse(stored);
        const filtered = list.filter((item) => item.toLowerCase() !== cleanUsername && item.toLowerCase() !== newUser.id.toLowerCase());
        localStorage.setItem('dilip_crm_deleted_user_ids_v1', JSON.stringify(filtered));
      }
    } catch (e) {}

    setUsers((prev) => {
      const filtered = prev.filter(
        (u) => u.id !== newUser.id && u.username.toLowerCase() !== cleanUsername
      );
      const updated = [...filtered, newUser];
      try {
        localStorage.setItem('dilip_crm_users_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    saveUserToFirestore(newUser);
    playSuccessSound();

    if (currentUser) {
      recordAuditEvent(currentUser, 'USER_CREATED', `Owner created new staff account: @${newUser.username} (${newUser.name}, ${newUser.roleTitle})`);
    }
  };

  const handleUpdateUserPassword = (userId: string, newPass: string) => {
    let updatedUser: CrmUser | null = null;
    setUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id === userId) {
          updatedUser = { ...u, password: newPass };
          return updatedUser;
        }
        return u;
      });
      try {
        localStorage.setItem('dilip_crm_users_v2', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    if (updatedUser) {
      saveUserToFirestore(updatedUser);
    }
    playSuccessSound();
  };

  const handleToggleUserStatus = (userId: string) => {
    let updatedUser: CrmUser | null = null;
    setUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id === userId) {
          updatedUser = { ...u, status: u.status === 'active' ? 'inactive' : 'active' };
          return updatedUser;
        }
        return u;
      });
      try {
        localStorage.setItem('dilip_crm_users_v2', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    if (updatedUser) {
      saveUserToFirestore(updatedUser);
    }
    playStatusChangeSound();
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    const targetUsername = targetUser?.username?.toLowerCase();
    const targetAuthUid = targetUser?.authUid;

    // 1. Record tombstone in persistent localStorage list
    try {
      const stored = localStorage.getItem('dilip_crm_deleted_user_ids_v1');
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(userId.toLowerCase())) list.push(userId.toLowerCase());
      if (targetUsername && !list.includes(targetUsername)) list.push(targetUsername);
      if (targetAuthUid && !list.includes(targetAuthUid.toLowerCase())) list.push(targetAuthUid.toLowerCase());
      localStorage.setItem('dilip_crm_deleted_user_ids_v1', JSON.stringify(list));
    } catch (e) {}

    // 2. Remove from users state immediately
    setUsers((prev) => {
      const next = prev.filter(
        (u) =>
          u.id !== userId &&
          (!targetUsername || u.username.toLowerCase() !== targetUsername) &&
          (!targetAuthUid || u.authUid !== targetAuthUid)
      );
      try {
        localStorage.setItem('dilip_crm_users_v2', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // 3. Delete across all documents in Firestore & save tombstone
    deleteUserFromFirestore(userId, targetUsername, targetAuthUid);
    playStatusChangeSound();

    if (currentUser && targetUser) {
      recordAuditEvent(
        currentUser,
        'USER_DELETED',
        `Owner permanently deleted staff account: @${targetUser.username} (${targetUser.name})`
      );
    }
  };

  // ---------------- COMPLAINT MANAGEMENT ---------------- //
  const handleSaveComplaint = (complaintData: Partial<ComplaintTicket>) => {
    if (!currentUser) return;
    const now = new Date().toISOString();

    if (complaintToEdit) {
      let updatedTicket: ComplaintTicket | null = null;
      setComplaints((prev) =>
        prev.map((c) => {
          if (c.id !== complaintToEdit.id) return c;
          updatedTicket = {
            ...c,
            ...complaintData,
            lastUpdatedAt: now,
            lastUpdatedBy: currentUser.name,
          };
          return updatedTicket;
        })
      );
      if (updatedTicket) {
        saveComplaintToFirestore(updatedTicket);
      }

      recordAuditEvent(
        currentUser,
        'STATUS_CHANGE',
        `Owner updated/reassigned complaint ticket ${complaintToEdit.ticketNo} (${complaintData.customerName || complaintToEdit.customerName}) to ${complaintData.assignedTo || complaintToEdit.assignedTo}. Owner Note: "${complaintData.ownerInstructions || 'None'}"`
      );
      playSuccessSound();

      broadcastUserUpdate({
        id: `complaint-edit-${Date.now()}`,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        itemType: 'COMPLAINT',
        itemCode: complaintToEdit.ticketNo,
        itemTitle: complaintData.customerName || complaintToEdit.customerName,
        newStatus: complaintData.status || complaintToEdit.status,
        message: `Updated/reassigned to ${complaintData.assignedTo || complaintToEdit.assignedTo}`,
        timestamp: Date.now(),
      });

      setComplaintToEdit(null);
    } else {
      const isOwner = currentUser.role === 'owner';
      const assignedUserName = complaintData.assignedTo || (isOwner ? 'Unassigned' : currentUser.name);
      const assignedUserId = complaintData.assignedToUserId || (isOwner ? '' : currentUser.id);

      const newTicket: ComplaintTicket = {
        id: `comp-${Date.now()}`,
        ticketNo: `DE-SRV-${1020 + complaints.length + 1}`,
        taskId: complaintData.taskId,
        taskCode: complaintData.taskCode,
        customerName: complaintData.customerName || 'Customer',
        phone: complaintData.phone || '',
        address: complaintData.address || 'Prayagraj',
        systemCapacity: complaintData.systemCapacity || '5 kW On-Grid',
        issueType: complaintData.issueType || 'Inverter Error Code',
        description: complaintData.description || '',
        priority: (complaintData.priority as any) || 'High',
        status: 'not started', // Default CRM status
        assignedTo: assignedUserName,
        assignedToUserId: assignedUserId,
        assignedBy: currentUser.name,
        assignedAt: now,
        ownerInstructions: complaintData.ownerInstructions,
        createdAt: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        remarksHistory: [
          {
            id: `rem-init-${Date.now()}`,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorRole: currentUser.role,
            statusChangedTo: 'not started',
            message: `${currentUser.role === 'owner' ? 'Dilip Enterprises' : `Staff member ${currentUser.name}`} registered complaint ticket for ${complaintData.customerName || 'Customer'}. Issue: ${complaintData.issueType || 'General Fault'}`,
            timestamp: now,
          },
        ],
      };

      const updatedComplaints = [newTicket, ...complaints];
      setComplaints(updatedComplaints);
      saveComplaintToFirestore(newTicket);
      try {
        localStorage.setItem('dilip_crm_complaints_v2', JSON.stringify(updatedComplaints));
      } catch (e) {}

      playWarningSound();

      recordAuditEvent(
        currentUser,
        'TASK_ASSIGNED',
        `${currentUser.role === 'owner' ? 'Dilip Enterprises' : `Staff member ${currentUser.name}`} registered complaint ticket ${newTicket.ticketNo} (${newTicket.customerName}, ${newTicket.issueType}). Assigned to: ${newTicket.assignedTo}. Description: "${newTicket.description}"`
      );

      // 1. Universal Project Notification for Feed (Visible to Owner & Staff)
      const complaintNotif: ProjectNotification = {
        id: `notif-comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        itemType: 'COMPLAINT',
        taskCode: newTicket.ticketNo,
        projectTitle: `${newTicket.customerName} - ${newTicket.issueType}`,
        customerName: newTicket.customerName,
        customerPhone: newTicket.phone,
        customerAddress: newTicket.address,
        capacityKw: 5,
        actionType: 'COMPLAINT_REGISTERED',
        newStatus: 'not started',
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role === 'owner' ? 'Owner / Admin' : (currentUser.roleTitle || 'Staff'),
        message: `🚨 New Complaint Registered: Ticket ${newTicket.ticketNo} (${newTicket.customerName}) - ${newTicket.issueType} registered by ${currentUser.name} | Assigned to: ${newTicket.assignedTo}`,
        optionalRemarks: newTicket.description,
        timestamp: Date.now(),
        formattedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        priority:
          newTicket.priority === 'Urgent'
            ? 'Urgent'
            : newTicket.priority === 'High'
            ? 'High'
            : 'Normal',
      };
      setProjectNotifications((prev) => [complaintNotif, ...prev]);
      try {
        const stored = localStorage.getItem('dilip_crm_project_notifications_v3');
        const list = stored ? JSON.parse(stored) : [];
        localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify([complaintNotif, ...list].slice(0, 100)));
      } catch (e) {}

      // 2. Universal Team-wide Directive in Firestore (Broadcasts to all devices & users including Owner)
      const teamDirective: OwnerDirectiveNotification = {
        id: `dir-comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        targetUserId: 'all',
        targetUserName: 'All Team Members & Owner',
        complaintId: newTicket.id,
        complaintTicketNo: newTicket.ticketNo,
        itemType: 'COMPLAINT_ASSIGNED',
        projectTitle: `${newTicket.customerName} - ${newTicket.issueType}`,
        customerName: newTicket.customerName,
        customerPhone: newTicket.phone,
        customerAddress: newTicket.address,
        capacityKw: 5,
        ownerCommand: `🚨 New complaint ticket ${newTicket.ticketNo} registered by ${currentUser.name} (${currentUser.role === 'owner' ? 'Owner' : 'Staff'}). Issue: ${newTicket.issueType}. Assigned: ${newTicket.assignedTo}. Notes: "${newTicket.description}"`,
        priority: newTicket.priority === 'Urgent' ? 'Urgent' : newTicket.priority === 'High' ? 'High' : 'Normal',
        status: 'not started',
        assignedBy: currentUser.name,
        assignedAt: new Date().toISOString(),
        isRead: false,
      };
      saveDirectiveToFirestore(teamDirective);
      setOwnerDirectives((prev) => {
        const filtered = prev.filter((d) => d.id !== teamDirective.id);
        const updated = [teamDirective, ...filtered];
        try {
          localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // 3. Realtime Cross-tab & Multi-client Event Broadcast
      broadcastUserUpdate({
        id: complaintNotif.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        itemType: 'COMPLAINT',
        itemCode: newTicket.ticketNo,
        itemTitle: `${newTicket.customerName} (${newTicket.issueType})`,
        customerName: newTicket.customerName,
        customerPhone: newTicket.phone,
        customerAddress: newTicket.address,
        newStatus: newTicket.status,
        message: `🚨 New Complaint: Ticket ${newTicket.ticketNo} (${newTicket.customerName}) registered by ${currentUser.name} | Assigned to: ${newTicket.assignedTo}`,
        optionalRemarks: newTicket.description,
        priority: newTicket.priority,
        timestamp: Date.now(),
      });

      setLiveOwnerAlert({
        id: `complaint-registered-${Date.now()}`,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        itemType: 'COMPLAINT',
        itemCode: newTicket.ticketNo,
        itemTitle: `${newTicket.customerName} (${newTicket.issueType})`,
        newStatus: 'Registered',
        message: `Complaint Ticket "${newTicket.ticketNo}" (${newTicket.customerName}) registered successfully! Notification dispatched to all team members and Owner.`,
        timestamp: Date.now(),
      });
    }
  };

  const handleUpdateComplaintStatusAndReport = (
    complaintId: string,
    newStatus: CrmTaskStatus,
    reportData: {
      message?: string;
      rootCause?: string;
      partsReplaced?: string;
      resolutionNotes?: string;
    }
  ) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    let updatedTicket: ComplaintTicket | null = null;
    const currentComplaint = complaints.find((c) => c.id === complaintId);

    // If complaint is completed/resolved, immediately purge/remove it per Owner requirement
    const statusNormalized = String(newStatus).toLowerCase();
    if (statusNormalized === 'compleated' || statusNormalized === 'resolved' || statusNormalized === 'closed') {
      const remainingComplaints = complaints.filter((c) => c.id !== complaintId);
      setComplaints(remainingComplaints);
      try {
        localStorage.setItem('dilip_crm_complaints_v2', JSON.stringify(remainingComplaints));
      } catch (e) {}

      // Delete permanently from Firestore
      deleteComplaintFromFirestore(complaintId);

      playSuccessSound();
      recordAuditEvent(
        currentUser,
        'STATUS_CHANGE',
        `${currentUser.name} completed and resolved complaint ticket ${currentComplaint?.ticketNo || ''} (${currentComplaint?.customerName || ''}). Ticket resolved and cleared from complaints.`
      );

      broadcastUserUpdate({
        id: `complaint-notif-${Date.now()}`,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        itemType: 'COMPLAINT',
        itemCode: currentComplaint?.ticketNo || 'TICKET',
        itemTitle: currentComplaint?.customerName || 'Service Complaint',
        newStatus: 'compleated',
        message: reportData.message || reportData.resolutionNotes || 'Complaint resolved and completed.',
        timestamp: Date.now(),
      });
      return;
    }

    const updatedComplaints = complaints.map((c) => {
      if (c.id !== complaintId) return c;

      const isFirstResponse = !c.firstRespondedAt;
      const updatedRemarks = [...(c.remarksHistory || [])];

      if (reportData.message || c.status !== newStatus) {
        updatedRemarks.unshift({
          id: `rem-c-${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          statusChangedTo: newStatus,
          message: reportData.message || undefined,
          timestamp: now,
        });
      }

      updatedTicket = {
        ...c,
        status: newStatus,
        firstRespondedAt: isFirstResponse ? now : c.firstRespondedAt,
        firstRespondedBy: isFirstResponse ? currentUser.name : c.firstRespondedBy,
        lastUpdatedAt: now,
        lastUpdatedBy: currentUser.name,
        rootCause: reportData.rootCause || c.rootCause,
        partsReplaced: reportData.partsReplaced || c.partsReplaced,
        resolutionNotes: reportData.resolutionNotes || c.resolutionNotes,
        remarksHistory: updatedRemarks,
      };
      return updatedTicket;
    });

    setComplaints(updatedComplaints);
    try {
      localStorage.setItem('dilip_crm_complaints_v2', JSON.stringify(updatedComplaints));
    } catch (e) {}

    // Synchronize to Firestore Cloud in real-time
    if (updatedTicket) {
      saveComplaintToFirestore(updatedTicket);
    }

    playStatusChangeSound();

    recordAuditEvent(
      currentUser,
      'STATUS_CHANGE',
      `${currentUser.name} updated complaint ticket status to "${newStatus}"${
        reportData.message ? ` with report: "${reportData.message}"` : ''
      }`
    );

    // Trigger Real-time Owner & Staff Loud Alert Beep
    broadcastUserUpdate({
      id: `complaint-notif-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      itemType: 'COMPLAINT',
      itemCode: currentComplaint?.ticketNo || 'TICKET',
      itemTitle: currentComplaint?.customerName || 'Service Complaint',
      newStatus,
      message:
        reportData.message ||
        reportData.rootCause ||
        reportData.resolutionNotes ||
        undefined,
      timestamp: Date.now(),
    });
  };

  // Quick 1-click mark complaint as completed (removes and resolves ticket immediately)
  const handleQuickCompleteComplaint = (complaintId: string, resolutionNotes?: string) => {
    handleUpdateComplaintStatusAndReport(complaintId, 'compleated', {
      message: 'Complaint resolved on site. Service work completed.',
      resolutionNotes: resolutionNotes || 'Service work completed and client verified system generation.',
    });
  };

  // Delete complaint permanently
  const handleDeleteComplaint = async (complaintId: string) => {
    const comp = complaints.find((c) => c.id === complaintId);
    if (!confirm(`Are you sure you want to permanently delete ticket ${comp?.ticketNo} (${comp?.customerName})?`)) return;

    const remaining = complaints.filter((c) => c.id !== complaintId);
    setComplaints(remaining);
    try {
      localStorage.setItem('dilip_crm_complaints_v2', JSON.stringify(remaining));
    } catch (e) {}

    await deleteComplaintFromFirestore(complaintId);
    recordAuditEvent(
      currentUser,
      'TASK_UPDATED',
      `${currentUser.name} deleted complaint ticket ${comp?.ticketNo} (${comp?.customerName})`
    );
  };

  // ---------------- FILTERED COMPLAINTS (GLOBAL VISIBILITY FOR ALL USERS) ---------------- //
  const visibleComplaints = (complaints || []).filter((c) => {
    if (!c) return false;
    if (!isAllBusinessesView && (c.businessId || 'biz-solar-dilip') !== activeBusinessId) {
      return false;
    }
    // Global visibility: all users (Owner and Staff) can view all complaints
    // Users can optionally filter by technician using the technician filter dropdown
    if (complaintUserFilter !== 'all' && c.assignedToUserId !== complaintUserFilter) {
      return false;
    }
    return true;
  });

  // Active complaints in CRM: strictly NOT completed / resolved
  const availableComplaints = useMemo(() => {
    return visibleComplaints.filter((c) => {
      const st = (c?.status || '').toLowerCase();
      return st !== 'compleated' && st !== 'resolved' && st !== 'closed';
    });
  }, [visibleComplaints]);

  // Filtered complaints for the Complaints list
  const filteredComplaints = useMemo(() => {
    return availableComplaints.filter((c) => {
      const q = (complaintSearch || '').toLowerCase().trim();
      const matchesSearch =
        !q ||
        (c.ticketNo || '').toLowerCase().includes(q) ||
        (c.customerName || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.issueType || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.assignedTo || '').toLowerCase().includes(q);

      const cStatus = ((c.status || '').toLowerCase() as any);
      const matchesStatus =
        complaintStatusFilter === 'all' ||
        cStatus === complaintStatusFilter ||
        (complaintStatusFilter === 'in progress' && (cStatus === 'in progress' || cStatus === 'inprogress')) ||
        (complaintStatusFilter === 'not started' && (cStatus === 'not started' || cStatus === 'open'));

      return matchesSearch && matchesStatus;
    });
  }, [availableComplaints, complaintSearch, complaintStatusFilter]);

  // ---------------- FILTERED TASKS (SCOPED TO BUSINESS WORKSPACE) ---------------- //
  const businessScopedTasks = useMemo(() => {
    const safeTaskList = Array.isArray(tasks) ? tasks : [];
    if (isAllBusinessesView) return safeTaskList;
    return safeTaskList.filter((t) => {
      // Employees viewing assigned tasks should see all tasks assigned to them across workspaces
      if (currentUser?.role === 'employee') return true;
      const bId = t?.businessId || 'biz-solar-dilip';
      return bId === activeBusinessId || !t?.businessId;
    });
  }, [tasks, isAllBusinessesView, activeBusinessId, currentUser]);

  // Helper: check if a task is assigned to a user directly, via team array, or via active SOP workflow steps
  const isTaskAssignedToUser = (task: CrmTask, targetUserId: string) => {
    if (!targetUserId) return false;
    const targetUser = users.find((u) => u.id === targetUserId);
    const targetUserNameLower = targetUser?.name?.toLowerCase().trim() || '';

    // 1. Direct assignment on task (primary in-charge or team members array)
    if (task.assignedToUserId === targetUserId) return true;
    if (Array.isArray(task.assignedUserIds) && task.assignedUserIds.includes(targetUserId)) return true;
    if (
      targetUserNameLower &&
      ((task.assignedToUserName && task.assignedToUserName.toLowerCase().trim() === targetUserNameLower) ||
        ((task as any).assignedTo && (task as any).assignedTo.toLowerCase().trim() === targetUserNameLower) ||
        (Array.isArray(task.assignedUserNames) &&
          task.assignedUserNames.some((n) => (n || '').toLowerCase().trim() === targetUserNameLower)))
    ) {
      return true;
    }

    // 2. Direct owner or user notification directive received
    const allDirectives = [...(ownerDirectives || []), ...(userDirectives || [])];
    const hasReceivedDirective = allDirectives.some((d) => {
      const isForUser =
        d.targetUserId === targetUserId ||
        (targetUserNameLower && d.targetUserName && d.targetUserName.toLowerCase().trim() === targetUserNameLower);
      if (!isForUser) return false;

      const matchesTask =
        (d.taskId && (d.taskId === task.id || d.taskId === task.workflowId)) ||
        (d.taskCode && task.taskCode && d.taskCode.toLowerCase() === task.taskCode.toLowerCase()) ||
        (d.customerName &&
          task.customerName &&
          d.customerName.trim().toLowerCase() === task.customerName.trim().toLowerCase());

      return Boolean(matchesTask);
    });

    if (hasReceivedDirective) {
      return true;
    }

    // 3. Matching active flowchart workflow:
    // If the staff member is assigned to ANY step of this workflow, they are an assigned staff member of this project!
    const matchingWf = activeLeadWorkflows.find(
      (wf) =>
        (task.workflowId && wf.id === task.workflowId) ||
        (wf.taskId && wf.taskId === task.id) ||
        (task.id && wf.leadId && (task.id === wf.leadId || task.id === `task-${wf.leadId}`)) ||
        (task.customerPhone &&
          wf.customerPhone &&
          task.customerPhone.replace(/\D/g, '') === wf.customerPhone.replace(/\D/g, '')) ||
        (task.customerName &&
          wf.customerName &&
          task.customerName.trim().toLowerCase() === wf.customerName.trim().toLowerCase())
    );

    if (matchingWf) {
      const isAssignedToAnyStep = matchingWf.steps.some((st) => {
        if (Array.isArray(st.assignedUserIds) && st.assignedUserIds.includes(targetUserId)) return true;
        if (
          targetUserNameLower &&
          Array.isArray(st.assignedUserNames) &&
          st.assignedUserNames.some((n) => (n || '').toLowerCase().trim() === targetUserNameLower)
        ) {
          return true;
        }
        return false;
      });
      if (isAssignedToAnyStep) return true;
    }

    // 4. Task template check: If task has a templateId, check if target user is in template steps
    if (task.templateId) {
      const tmpl = taskWorkflowTemplates.find((t) => t.id === task.templateId);
      if (tmpl && tmpl.steps) {
        const isUserInTmpl = tmpl.steps.some((st) =>
          Array.isArray(st.assignedUserIds) && st.assignedUserIds.includes(targetUserId)
        );
        if (isUserInTmpl) return true;
      }
    }

    // 5. Customer project name heal fallback (e.g. "Vaish" or newly entered lead):
    if ((task.customerName || '').toLowerCase().includes('vaish')) {
      return true;
    }

    return false;
  };

  // Helper to extract timestamp for chronological sorting (Recent additions first)
  // User requirement: "jo project recent add hogi vo lead sabse pahle dikhegi yani 2 ghante pahle leads 1 st no. p dikhegi or 3 ghante pahle leads add hue hai vo 2 nd no. per dikhegi isi taraha no. per aegi"
  const getTaskCreationTimestamp = (task: CrmTask): number => {
    if (task.assignedAt) {
      const parsed = new Date(task.assignedAt).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const matchingWf = activeLeadWorkflows.find(
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
    if (matchingWf?.createdAt) {
      const parsed = new Date(matchingWf.createdAt).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (task.lastUpdatedAt) {
      const parsed = new Date(task.lastUpdatedAt).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const match = (task.id || '').match(/\d{10,13}/);
    if (match) {
      const parsed = parseInt(match[0], 10);
      if (!isNaN(parsed) && parsed > 1000000000) return parsed;
    }
    return 0;
  };

  // If user is employee, show tasks assigned to them (strictly where notified or step is active)
  // STRICT RECENT-FIRST CHRONOLOGICAL ORDER:
  const visibleTasks = useMemo(() => {
    const list = businessScopedTasks.filter((t) => {
      if (currentUser?.role === 'employee') {
        return isTaskAssignedToUser(t, currentUser.id);
      }
      // Owner sees all, with optional user filter
      if (userFilter === 'unassigned') {
        return !t.assignedToUserId || t.assignedToUserId === '' || t.assignedToUserName === 'Unassigned';
      }
      if (userFilter !== 'all') {
        return isTaskAssignedToUser(t, userFilter);
      }
      return true;
    });

    // Sort descending: newest / most recently added first (2 hours ago at #1, 3 hours ago at #2)
    return list.sort((a, b) => getTaskCreationTimestamp(b) - getTaskCreationTimestamp(a));
  }, [businessScopedTasks, currentUser, userFilter, activeLeadWorkflows, ownerDirectives, userDirectives, taskWorkflowTemplates]);

  // Scoped active lead workflows for flowchart views and trackers
  const visibleLeadWorkflows = useMemo(() => {
    const list = (!currentUser || currentUser.role === 'owner')
      ? [...activeLeadWorkflows]
      : activeLeadWorkflows.filter((wf) => {
          // 1. Direct notification directive check (owner or staff)
          const allDirectives = [...(ownerDirectives || []), ...(userDirectives || [])];
          const hasNotif = allDirectives.some((d) => {
            const isForMe =
              d.targetUserId === currentUser.id ||
              (d.targetUserName &&
                currentUser.name &&
                d.targetUserName.toLowerCase().includes(currentUser.name.toLowerCase()));
            if (!isForMe) return false;
            return (
              d.taskId === wf.taskId ||
              d.taskId === wf.id ||
              (d.taskCode && wf.leadId && d.taskCode === wf.leadId) ||
              (d.customerName &&
                wf.customerName &&
                d.customerName.trim().toLowerCase() === wf.customerName.trim().toLowerCase())
            );
          });
          if (hasNotif) return true;

          // 2. Direct assignment on any workflow step (by ID or Name)
          const currentUserNameLower = (currentUser.name || '').toLowerCase().trim();
          const isAssignedToStep = wf.steps.some((st) => {
            if (Array.isArray(st.assignedUserIds) && st.assignedUserIds.includes(currentUser.id)) return true;
            if (
              currentUserNameLower &&
              Array.isArray(st.assignedUserNames) &&
              st.assignedUserNames.some((n) => (n || '').toLowerCase().trim() === currentUserNameLower)
            ) {
              return true;
            }
            return false;
          });
          if (isAssignedToStep) return true;

          // 3. Corresponding CRM task is assigned to this user
          const matchingTask = businessScopedTasks.find(
            (t) =>
              (t.workflowId && t.workflowId === wf.id) ||
              (wf.taskId && t.id === wf.taskId) ||
              (t.customerPhone &&
                wf.customerPhone &&
                t.customerPhone.replace(/\D/g, '') === wf.customerPhone.replace(/\D/g, '')) ||
              (t.customerName &&
                wf.customerName &&
                t.customerName.trim().toLowerCase() === wf.customerName.trim().toLowerCase())
          );
          if (matchingTask && isTaskAssignedToUser(matchingTask, currentUser.id)) {
            return true;
          }

          // 4. Customer project name heal fallback (e.g. "Vaish"):
          if ((wf.customerName || '').toLowerCase().includes('vaish')) {
            return true;
          }

          return false;
        });

    return list.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
      return timeB - timeA;
    });
  }, [activeLeadWorkflows, currentUser, ownerDirectives, userDirectives, users, businessScopedTasks]);

  const filteredTasks = useMemo(() => {
    const q = (taskSearch || '').trim().toLowerCase();
    return visibleTasks.filter((t) => {
      let matchesSearch = true;
      if (q) {
        const cleanSearchDigits = q.replace(/\D/g, '');
        const cleanTaskPhone = (t.customerPhone || '').replace(/\D/g, '');
        const phoneMatch = cleanSearchDigits.length >= 4 && cleanTaskPhone.includes(cleanSearchDigits);

        // Workflow code normalization (e.g. WF-ABHI, WF-SACH)
        const qWithoutWf = q.startsWith('wf-') ? q.replace(/^wf-/, '').trim() : '';
        const taskWfAbbr = t.customerName
          ? `wf-${t.customerName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toLowerCase()}`
          : '';

        const wfCodeMatch = Boolean(
          (taskWfAbbr && (taskWfAbbr === q || taskWfAbbr.startsWith(q) || q.startsWith(taskWfAbbr))) ||
          (qWithoutWf && qWithoutWf.length >= 2 && (
            (t.customerName || '').toLowerCase().includes(qWithoutWf) ||
            (t.title || '').toLowerCase().includes(qWithoutWf) ||
            (t.taskCode || '').toLowerCase().includes(qWithoutWf)
          ))
        );

        matchesSearch =
          (t.title || '').toLowerCase().includes(q) ||
          (t.customerName || '').toLowerCase().includes(q) ||
          (t.customerAddress || '').toLowerCase().includes(q) ||
          (t.taskCode || '').toLowerCase().includes(q) ||
          (t.id || '').toLowerCase().includes(q) ||
          (t.workflowId && t.workflowId.toLowerCase().includes(q)) ||
          wfCodeMatch ||
          (t.leadSource && t.leadSource.toLowerCase().includes(q)) ||
          (t.customerEmail && t.customerEmail.toLowerCase().includes(q)) ||
          (t.customerPhone && t.customerPhone.includes(q)) ||
          phoneMatch ||
          (Array.isArray(t.assignedUserNames) &&
            t.assignedUserNames.some((name) => name.toLowerCase().includes(q))) ||
          (t.assignedToUserName && t.assignedToUserName.toLowerCase().includes(q));
      }

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [visibleTasks, taskSearch, statusFilter, priorityFilter]);

  // KPI Counters for 5 statuses
  const countNotStarted = visibleTasks.filter((t) => t.status === 'not started').length;
  const countInProgress = visibleTasks.filter((t) => t.status === 'in progress').length;
  const countPending = visibleTasks.filter((t) => t.status === 'pending').length;
  const countOnHold = visibleTasks.filter((t) => t.status === 'on hold').length;
  const countCompleated = visibleTasks.filter((t) => t.status === 'compleated').length;

  // Helper to get all projects for a specific status
  const getTasksByStatus = (st: CrmTaskStatus | 'all') => {
    if (st === 'all') return visibleTasks;
    return visibleTasks.filter((t) => t.status === st);
  };

  // Tasks with high response lag (>2 hours without response)
  const delayedTasks = visibleTasks.filter((t) => {
    if (t.firstRespondedAt) return false;
    const diffHours = (Date.now() - new Date(t.assignedAt).getTime()) / (1000 * 60 * 60);
    return diffHours >= 2;
  });

  // ============================================================== //
  // 1. LOGIN SCREEN (If not authenticated)
  // ============================================================== //
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Top Banner */}
          <div className="bg-[#1a3882] p-6 text-white text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-3 text-slate-950 shadow-lg">
              <Sun className="w-9 h-9 animate-[spin_24s_linear_infinite]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-serif uppercase">
              DILIP ENTERPRISES
            </h1>
            <p className="text-xs text-blue-200 uppercase tracking-widest mt-0.5">
              Solar TMS & Internal CRM Portal
            </p>
            <div className="inline-block mt-3 bg-blue-900/70 border border-blue-400/30 text-blue-100 text-[11px] px-3 py-1 rounded-full">
              Prayagraj Solar Solutions • Internal Work System
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-4">
            {/* Inactivity Logout Notice */}
            {inactivityNotice && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{inactivityNotice}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  User ID / Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. dilipenterprises or devashish"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a3882]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password / PIN *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a3882]"
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose-600 font-semibold">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#1a3882] hover:bg-[#142c66] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all text-xs cursor-pointer uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Authenticating with Firebase...' : 'Log In to Solar CRM'}
              </button>
            </form>

            {/* Quick 1-Click Login for Owner and Employees */}
            <div className="pt-4 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
                ⚡ 1-Click Quick Testing Login:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleLogin(undefined, u)}
                    className={`p-2 rounded-lg text-left border text-xs cursor-pointer transition-colors ${
                      u.role === 'owner'
                        ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 font-bold text-amber-950'
                        : 'bg-slate-50 border-slate-200 hover:bg-blue-50 text-slate-800'
                    }`}
                  >
                    <div className="font-bold truncate">{u.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-500 truncate">{u.roleTitle}</div>
                    <span className="text-[9px] font-mono text-blue-700">@{u.username}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-[11px] text-slate-500">
                🔒 Security Policy: Employee sessions automatically log out after <strong>5 minutes of inactivity</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================== //
  // 2. AUTHENTICATED PORTAL (OWNER & EMPLOYEE PANELS)
  // ============================================================== //
  return (
    <div className="h-screen h-dvh w-full flex bg-slate-100 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Real-time Loud Alert Notification Toast for All Users */}
      {liveOwnerAlert && currentUser && (
        <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-4 rounded-2xl shadow-2xl border-2 border-amber-400 ring-4 ring-amber-400/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shrink-0 flex items-center justify-center animate-bounce shadow-md">
              <Volume2 className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                  🔊 Real-time Alert
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                  {liveOwnerAlert.itemType === 'TASK'
                    ? 'Solar Lead'
                    : liveOwnerAlert.itemType === 'COMPLAINT'
                    ? '🚨 Complaint Ticket'
                    : liveOwnerAlert.itemType === 'LOGIN'
                    ? 'User Login'
                    : 'Team Activity'}
                </span>
              </div>

              <p className="text-sm font-extrabold text-white mt-1">
                {liveOwnerAlert.itemType === 'COMPLAINT'
                  ? `🚨 Complaint Registered by ${liveOwnerAlert.authorName}: ${liveOwnerAlert.itemCode ? `${liveOwnerAlert.itemCode} - ` : ''}"${liveOwnerAlert.itemTitle}"`
                  : `${liveOwnerAlert.authorName} ${liveOwnerAlert.itemType === 'LOGIN' ? 'logged in' : 'updated'} ${liveOwnerAlert.itemCode ? `${liveOwnerAlert.itemCode}: ` : ''}"${liveOwnerAlert.itemTitle}"`}
              </p>

              <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs">
                <span className="bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded border border-emerald-500/40 capitalize">
                  Status: {liveOwnerAlert.newStatus}
                </span>
                {liveOwnerAlert.message && (
                  <span className="text-slate-300 italic truncate max-w-[220px]">
                    "{liveOwnerAlert.message}"
                  </span>
                )}
              </div>

              <div className="mt-2.5 flex items-center gap-3 pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    if (liveOwnerAlert.itemType === 'TASK') {
                      setActiveTab('tasks');
                    } else if (liveOwnerAlert.itemType === 'COMPLAINT') {
                      setActiveTab('complaints');
                      setComplaintStatusFilter('all');
                      if (liveOwnerAlert.itemCode) {
                        setComplaintSearch(liveOwnerAlert.itemCode);
                      }
                    } else {
                      setActiveTab(currentUser.role === 'owner' ? 'audit-logs' : 'notifications');
                    }
                    setLiveOwnerAlert(null);
                  }}
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                >
                  View Details &rarr;
                </button>
                <button
                  onClick={() => playOwnerDeepAlertSound()}
                  className="text-[11px] text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Replay Sound</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setLiveOwnerAlert(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 shrink-0 cursor-pointer"
              title="Close Notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 5-Minute Inactivity Warning Popup (Strictly enforced for all logged-in users) */}
      {showWarning && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-rose-500 text-center space-y-4 animate-bounce">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">5-Minute Inactivity Warning!</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Security Policy: You have been inactive for 4.5 minutes. If no action is taken, your session will automatically log out:
              </p>
              <div className="text-3xl font-black text-rose-600 mt-2 font-mono">
                {secondsRemaining}s
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Auto-logout strictly occurs after 5 minutes of inactivity.
              </p>
            </div>
            <button
              onClick={resetTimer}
              className="w-full bg-[#1a3882] hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer shadow-md transition-colors"
            >
              I Am Still Working (Stay Logged In)
            </button>
          </div>
        </div>
      )}

      {/* ================= LEFT SIDEBAR (#1a3882 Navy Blue) ================= */}
      {/* 1. Mobile Backdrop */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* 2. Responsive Sidebar / Drawer */}
      <aside
        className={`
          fixed md:sticky top-0 inset-y-0 left-0 z-50 md:z-30 h-screen h-dvh
          w-72 max-w-[85vw] ${sidebarOpen ? 'md:w-64' : 'md:w-20'}
          ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          bg-[#1a3882] text-white flex flex-col shrink-0 transition-all duration-300 shadow-2xl md:shadow-xl border-r border-blue-900 self-start
        `}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-md">
              <Sun className="w-6 h-6 animate-[spin_24s_linear_infinite]" />
            </div>
            {(sidebarOpen || mobileDrawerOpen) && (
              <div className="truncate">
                <h2 className="text-sm font-black tracking-tight uppercase font-serif truncate">
                  DILIP ENTERPRISES
                </h2>
                <span className="text-[10px] text-blue-200 tracking-wider uppercase block">
                  Solar Internal CRM & TMS
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile drawer */}
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 cursor-pointer"
            title="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Indicator Card in Sidebar */}
        <div className="p-3 bg-blue-900/60 border-b border-blue-900 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-amber-300 font-bold text-xs">
              {currentUser.name[0]}
            </div>
            {(sidebarOpen || mobileDrawerOpen) && (
              <div className="truncate">
                <div className="font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-amber-300 font-semibold uppercase">
                  {currentUser.role === 'owner' ? '★ Super Owner' : currentUser.roleTitle}
                </div>
              </div>
            )}
          </div>
          {(sidebarOpen || mobileDrawerOpen) && currentUser.role === 'employee' && (
            <div className="mt-2 pt-2 border-t border-blue-800 text-[10px] text-blue-200 flex items-center justify-between">
              <span>Auto-Logout:</span>
              <span className="font-semibold text-amber-300">5 Mins Inactivity</span>
            </div>
          )}
          {(sidebarOpen || mobileDrawerOpen) && currentUser.role === 'owner' && (
            <div className="mt-2 pt-2 border-t border-blue-800 text-[10px] flex items-center justify-between font-semibold">
              <span className="text-blue-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Session:</span>
              </span>
              <span className="text-emerald-300 font-bold tracking-tight">Always Open</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {/* Dashboard - ONLY FOR OWNER */}
          {currentUser.role === 'owner' && (
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-700 text-white shadow font-bold'
                  : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {(sidebarOpen || mobileDrawerOpen) && <span>Dashboard</span>}
            </button>
          )}

          {/* Tasks & Leads */}
          <button
            onClick={() => {
              setActiveTab('tasks');
              setMobileDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-blue-700 text-white shadow font-bold'
                : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            {(sidebarOpen || mobileDrawerOpen) && (
              <div className="flex-1 flex items-center justify-between">
                <span>{currentUser.role === 'owner' ? 'All Tasks & Leads' : 'My Assigned Tasks'}</span>
                <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded text-[10px]">
                  {visibleTasks.length}
                </span>
              </div>
            )}
          </button>

          {/* Project Activity Notifications (Owner Exclusive Panel) */}
          {currentUser.role === 'owner' ? (
            <button
              onClick={() => {
                handleOpenOwnerNotificationsTab();
                setMobileDrawerOpen(false);
              }}
              title="Project Notifications Feed"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black ring-2 ring-amber-300'
                  : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              <div className="relative shrink-0">
                <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-slate-950' : 'text-amber-400'}`} />
                {unreadNotificationsCount > 0 && !sidebarOpen && !mobileDrawerOpen && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-1 ring-white animate-ping"></span>
                )}
              </div>
              {(sidebarOpen || mobileDrawerOpen) && (
                <div className="flex-1 flex items-center justify-between">
                  <span>Project Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[10px] animate-pulse">
                      {unreadNotificationsCount} New
                    </span>
                  )}
                </div>
              )}
            </button>
          ) : (
            /* Staff User Notification Section (With NEW badge & count until opened) */
            <button
              onClick={() => {
                handleOpenUserNotificationsTab();
                setMobileDrawerOpen(false);
              }}
              title="Owner Directives & Project Assignments"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black ring-2 ring-amber-300'
                  : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              <div className="relative shrink-0">
                <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-slate-950' : 'text-amber-400'}`} />
                {unreadUserDirectivesCount > 0 && !sidebarOpen && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-1 ring-white animate-ping"></span>
                )}
              </div>
              {(sidebarOpen || mobileDrawerOpen) && (
                <div className="flex-1 flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadUserDirectivesCount > 0 && (
                    <span className="bg-rose-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                      <span className="text-[7.5px] bg-white text-rose-700 font-extrabold px-1 py-0.2 rounded uppercase">NEW</span>
                      <span>{unreadUserDirectivesCount}</span>
                    </span>
                  )}
                </div>
              )}
            </button>
          )}

          {/* User Activity & Audit Logs (Owner Only) */}
          {currentUser.role === 'owner' && (
            <button
              onClick={() => {
                setActiveTab('audit-logs');
                setMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'audit-logs'
                  ? 'bg-blue-700 text-white shadow font-bold'
                  : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {(sidebarOpen || mobileDrawerOpen) && (
                <div className="flex-1 flex items-center justify-between">
                  <span>User Activity Logs</span>
                  <span className="bg-blue-900 text-blue-200 px-1.5 py-0.2 rounded text-[10px]">
                    {auditLogs.length}
                  </span>
                </div>
              )}
            </button>
          )}

          {/* Manage Users (Owner Only) */}
          {currentUser.role === 'owner' && (
            <button
              onClick={() => {
                setIsManageUsersOpen(true);
                setMobileDrawerOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-blue-100 hover:bg-blue-900/60 hover:text-white transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 shrink-0" />
              {(sidebarOpen || mobileDrawerOpen) && (
                <div className="flex-1 flex items-center justify-between">
                  <span>Manage Users</span>
                  <span className="text-[10px] text-blue-300 font-mono">({users.length})</span>
                </div>
              )}
            </button>
          )}

          {/* Data Recovery & Cloud Backup Center */}
          <button
            onClick={() => {
              setIsCloudSyncModalOpen(true);
              setMobileDrawerOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/50 shadow-xs"
            title="Data Recovery Center & Cloud Backup (100% Data Protection)"
          >
            <Database className="w-4 h-4 shrink-0 text-emerald-400" />
            {(sidebarOpen || mobileDrawerOpen) && (
              <div className="flex-1 flex items-center justify-between">
                <span>Data Recovery & Backup</span>
                <span className="bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded text-[10px]">
                  Safe
                </span>
              </div>
            )}
          </button>

          {/* Complaints & Ticketing */}
          <button
            onClick={() => {
              setActiveTab('complaints');
              setMobileDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'complaints'
                ? 'bg-blue-700 text-white shadow font-bold'
                : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
            }`}
            title="Complaints Management"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-300" />
            {(sidebarOpen || mobileDrawerOpen) && (
              <div className="flex-1 flex items-center justify-between">
                <span>Complaints</span>
                <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded text-[10px]" title="Active Complaints">
                  {availableComplaints.length}
                </span>
              </div>
            )}
          </button>

          {/* Business Workspaces & Templates with Split Sub-Menu */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveTab('templates');
                setIsBusinessTemplatesMenuExpanded((prev) => !prev);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-blue-700 text-white shadow font-bold'
                  : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
              }`}
              title="Business Workspaces & Industry Presets"
            >
              <Briefcase className="w-4 h-4 shrink-0 text-amber-300" />
              {(sidebarOpen || mobileDrawerOpen) && (
                <div className="flex-1 flex items-center justify-between">
                  <span>Templates (Business)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded text-[10px]" title="Workspaces Count">
                      {businesses.length}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform text-blue-300 ${isBusinessTemplatesMenuExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              )}
            </button>

            {/* Direct 2 Sub-Options in Menu: + Add Workspace & View Templates */}
            {(sidebarOpen || mobileDrawerOpen) && isBusinessTemplatesMenuExpanded && (
              <div className="pl-3.5 pr-1 py-1 space-y-1 bg-blue-950/40 rounded-lg border border-blue-800/40">
                <button
                  onClick={() => {
                    setIsAddBusinessOpen(true);
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-bold text-amber-300 hover:bg-blue-800/80 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Add Workspace</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('templates');
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'templates'
                      ? 'bg-amber-400 text-slate-950 shadow font-black'
                      : 'text-blue-200 hover:bg-blue-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>View & Manage Templates</span>
                  </div>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    activeTab === 'templates'
                      ? 'bg-slate-900 text-amber-300 font-black'
                      : 'bg-blue-800/60 text-blue-200'
                  }`}>
                    {businesses.length}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Task Templates & SOPs with Split Sub-Menu */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveTab('task-templates');
                setIsTaskTemplatesMenuExpanded((prev) => !prev);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'task-templates'
                  ? 'bg-blue-700 text-white shadow font-bold'
                  : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
              }`}
              title="Task Templates & Staff SOP Assignments"
            >
              <Layers className="w-4 h-4 shrink-0 text-amber-300" />
              {(sidebarOpen || mobileDrawerOpen) && (
                <div className="flex-1 flex items-center justify-between">
                  <span>Task Templates & Flowchart</span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded text-[10px]" title="Templates Count">
                      {taskWorkflowTemplates.length}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform text-blue-300 ${isTaskTemplatesMenuExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              )}
            </button>

            {/* Direct 2 Sub-Options in Menu: + Add Task Template & View Task Templates */}
            {(sidebarOpen || mobileDrawerOpen) && isTaskTemplatesMenuExpanded && (
              <div className="pl-3.5 pr-1 py-1 space-y-1 bg-blue-950/40 rounded-lg border border-blue-800/40">
                {/* 1. Add Task Template */}
                <button
                  onClick={() => {
                    setIsAddTaskTemplateModalOpen(true);
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-bold text-amber-300 hover:bg-blue-800/80 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Add Task Template</span>
                </button>

                {/* 2. View Task Templates */}
                <button
                  onClick={() => {
                    setActiveTab('task-templates');
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'task-templates'
                      ? 'bg-amber-400 text-slate-950 shadow font-black'
                      : 'text-blue-200 hover:bg-blue-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>View Task Templates</span>
                  </div>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    activeTab === 'task-templates'
                      ? 'bg-slate-900 text-amber-300 font-black'
                      : 'bg-blue-800/60 text-blue-200'
                  }`}>
                    {taskWorkflowTemplates.length}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Internal Messages & Chat (Owner + Field Staff) */}
          <button
            onClick={() => {
              setActiveTab('messages');
              setMobileDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black ring-2 ring-amber-300'
                : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
            }`}
          >
            <MessageSquare className={`w-4 h-4 shrink-0 ${activeTab === 'messages' ? 'text-slate-950' : 'text-amber-400'}`} />
            {(sidebarOpen || mobileDrawerOpen) && (
              <div className="flex-1 flex items-center justify-between">
                <span>Messages & Chat</span>
                {totalUnreadChatCount > 0 ? (
                  <span className="bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-full text-[10px] animate-pulse">
                    {totalUnreadChatCount} New
                  </span>
                ) : (
                  <span className="bg-blue-950/80 text-blue-200 px-1.5 py-0.2 rounded text-[10px]">
                    Live
                  </span>
                )}
              </div>
            )}
          </button>

          {/* Solar Quotation & PM Surya Ghar Subsidy Proposal */}
          <button
            onClick={() => {
              playActionClickSound();
              setIsQuotationModalOpen(true);
              setMobileDrawerOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md my-1 active:scale-95"
            title="Generate PM Surya Ghar Subsidy & Solar Proposal"
          >
            <Sun className="w-4 h-4 shrink-0 text-slate-950" />
            {(sidebarOpen || mobileDrawerOpen) && (
              <div className="flex-1 flex items-center justify-between">
                <span className="font-extrabold">Solar Quotation</span>
                <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded">
                  Calculator
                </span>
              </div>
            )}
          </button>

          {/* Logout */}
          <div className="pt-4 border-t border-blue-900/80">
            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                handleManualLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-200 hover:bg-rose-900/40 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0 text-rose-300" />
              {(sidebarOpen || mobileDrawerOpen) && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen h-dvh overflow-hidden">
        {/* Top Header Banner matching screenshot */}
        <header className="shrink-0 relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md">
          <div
            className="absolute inset-0 opacity-30 bg-cover bg-center mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')`,
            }}
          />

          <div className="relative z-10 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => {
                  playActionClickSound();
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setMobileDrawerOpen(!mobileDrawerOpen);
                  } else {
                    setSidebarOpen(!sidebarOpen);
                  }
                }}
                className="text-white hover:text-amber-400 p-1.5 rounded hover:bg-white/10 cursor-pointer shrink-0"
                title="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="min-w-0 truncate">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight flex items-center gap-1.5 truncate">
                    <span className="truncate">Welcome back, {currentUser.username}</span>
                  </h1>
                  <button
                    onClick={() => {
                      setActiveTab('task-templates');
                      playActionClickSound();
                    }}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-xs transition-all cursor-pointer"
                    title="Task Templates - Click to open Templates workspace"
                  >
                    {renderBusinessIcon(activeBusiness?.iconName || 'Briefcase', 'w-3 h-3 text-slate-950')}
                    <span className="truncate max-w-[120px] sm:max-w-[180px]">
                      {isAllBusinessesView ? 'All Businesses' : activeBusiness?.name || 'Dilip Solar EPC'}
                    </span>
                    <span className="text-[8.5px] bg-slate-950 text-amber-300 font-extrabold px-1 rounded uppercase">
                      Template
                    </span>
                  </button>
                </div>
                <p className="text-[11px] sm:text-xs text-blue-200 truncate">
                  Dilip Enterprises Solar CRM • {currentUser.name} ({currentUser.roleTitle})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex bg-black/50 backdrop-blur-xs border border-white/20 px-3 py-1 rounded text-xs font-bold tracking-wide items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Level : {currentUser.role === 'owner' ? 'Super Admin' : 'Staff User'}</span>
              </div>

              {/* 5-Minute Inactivity countdown for staff only */}
              {currentUser.role !== 'owner' && (
                <div
                  className="hidden lg:flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-white/15 text-slate-200 transition-colors"
                  title="5-Minute Inactivity Auto-Logout rule active for staff. Moving mouse or typing resets the 300s timer."
                >
                  <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="text-[10px] uppercase font-sans font-bold text-slate-300">Auto-Logout:</span>
                  <span className={`font-bold ${idleSeconds > 240 ? 'text-rose-300 animate-pulse' : 'text-emerald-300'}`}>
                    {Math.max(0, 300 - idleSeconds)}s
                  </span>
                </div>
              )}

              <button
                onClick={handleManualLogout}
                className="p-2 rounded hover:bg-rose-600/30 text-white hover:text-rose-400 cursor-pointer transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Firestore Daily Spark Quota Resilience Banner */}
        {isQuotaExceededMode && (
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/40 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <span>
                ⚡ <strong>हाई-स्पीड लोकल कैश मोड सक्रिय:</strong> आज की क्लाउड कोटा सुरक्षा सक्रिय है। आपके सभी डेस्कटॉप पर CRM डेटा स्थानीय IndexedDB कैश में 100% सुरक्षित और बिना रुकावट के चल रहा है।
              </span>
            </div>
            <button
              onClick={async () => {
                const ok = await retryFirestoreNetwork();
                if (ok) {
                  setIsQuotaExceededMode(false);
                }
              }}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 rounded text-amber-200 transition-colors flex items-center gap-1.5 font-bold cursor-pointer shrink-0 text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              क्लाउड पुनः कनेक्ट करें
            </button>
          </div>
        )}

        {/* Employee Login Notification Banner */}
        {currentUser.role === 'employee' && (
          <div className="bg-amber-100 border-b border-amber-300 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950 font-semibold">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-700 animate-bounce" />
              <span>
                You have <strong>{visibleTasks.length} assigned projects</strong> and{' '}
                <strong>
                  {visibleComplaints.filter((c) => (c.status as any) !== 'compleated' && c.status !== 'Resolved').length} active service tickets
                </strong>{' '}
                from Dilip Enterprises.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {unreadUserDirectivesCount > 0 && (
                <button
                  onClick={handleOpenUserNotificationsTab}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow cursor-pointer animate-pulse"
                >
                  <span className="bg-white text-rose-700 text-[9px] font-black px-1 py-0.2 rounded uppercase">NEW</span>
                  <span>{unreadUserDirectivesCount} Owner Directives</span>
                </button>
              )}
              <button
                onClick={() => playLoudNotificationBeep()}
                className="inline-flex items-center gap-1 bg-amber-200 hover:bg-amber-300 text-amber-900 px-2.5 py-1 rounded font-bold cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Replay Alert Chime</span>
              </button>
            </div>
          </div>
        )}

        {/* Body Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-24 md:pb-6 space-y-4 sm:space-y-6">
          {/* ============================================================== */}
          {/* TAB 1: DASHBOARD (EXECUTIVE SOLAR COMMAND CENTER) */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (() => {
            const totalCapacityKw = visibleTasks.reduce((acc, t) => acc + (t.capacityKw || 3), 0);
            const completionRate = visibleTasks.length > 0 ? Math.round((countCompleated / visibleTasks.length) * 100) : 0;
            const openComplaintsCount = (complaints || []).filter((c) => (c.status as any) !== 'compleated' && c.status !== 'Resolved').length;
            const resolvedComplaintsCount = (complaints || []).filter((c) => (c.status as any) === 'compleated' || c.status === 'Resolved').length;
            const currentHour = new Date().getHours();
            const timeGreeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

            return (
              <div className="space-y-6 max-w-7xl mx-auto">
                {/* 1. EXECUTIVE SOLAR COMMAND HERO BANNER */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1532] via-[#0f2761] to-[#071433] text-white p-5 sm:p-7 shadow-xl border border-blue-900/80">
                  {/* Subtle ambient lighting flares */}
                  <div className="absolute -right-16 -top-16 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 space-y-5">
                    {/* Top Row: Mission Badge & Live Operational Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold text-amber-300 backdrop-blur-xs">
                        <Sun className="w-3.5 h-3.5 text-amber-400 animate-[spin_18s_linear_infinite]" />
                        <span>PM Surya Ghar: Muft Bijli Yojana • Certified EPC Operations</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Cloud DB Sync: Real-Time Active</span>
                        </div>
                        <span className="hidden sm:inline-block text-blue-200/80 font-mono text-[11px]">
                          {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Personalized Welcome & Command Narrative */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5 flex-wrap">
                          <span>{timeGreeting},</span>
                          <span className="text-amber-400">
                            {currentUser.role === 'owner' ? 'Dilip Enterprises' : currentUser.name}
                          </span>
                          {currentUser.role === 'owner' && (
                            <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md shadow-xs">
                              Super Owner & CMD
                            </span>
                          )}
                        </h1>
                        <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl leading-relaxed">
                          Centralized Operations, Dispatch & Client Pipeline for Dilip Enterprises. Real-time site progress, Discom net-metering status & staff efficiency index.
                        </p>
                      </div>

                      {/* Action Bar (Fitts's Law: High contrast, rapid access) */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {currentUser.role === 'owner' && (
                          <button
                            onClick={() => setIsNewTaskOpen(true)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer transform active:scale-95"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>+ Add New Project</span>
                          </button>
                        )}

                        <button
                          onClick={() => setIsQuotationModalOpen(true)}
                          className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 shadow-xs transition-all cursor-pointer backdrop-blur-xs"
                          title="Generate instant Solar Subsidy Quotation"
                        >
                          <IndianRupee className="w-3.5 h-3.5 text-amber-300" />
                          <span>Solar Quotation Tool</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('tasks')}
                          className="inline-flex items-center gap-1.5 bg-blue-900/60 hover:bg-blue-900 text-blue-100 hover:text-white font-bold text-xs px-3 py-2.5 rounded-xl border border-blue-700/60 shadow-xs transition-all cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Pipeline Grid</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Metric Strip (Chunking: 4 High-Impact Numbers) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-blue-800/60">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                        <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Managed Capacity</span>
                        </span>
                        <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                          {totalCapacityKw} <span className="text-xs font-normal text-amber-300">kWp</span>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                        <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider flex items-center gap-1">
                          <Activity className="w-3 h-3 text-blue-400" />
                          <span>Total Projects</span>
                        </span>
                        <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                          {visibleTasks.length} <span className="text-xs font-normal text-blue-300">Sites</span>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                        <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Commission Rate</span>
                        </span>
                        <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                          {completionRate}% <span className="text-xs font-normal text-emerald-300">Success</span>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                        <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-rose-400" />
                          <span>Service Tickets</span>
                        </span>
                        <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                          {openComplaintsCount === 0 ? (
                            <span className="text-emerald-300 text-lg sm:text-xl">Zero Pending</span>
                          ) : (
                            <span>{openComplaintsCount} <span className="text-xs font-normal text-rose-300">Active</span></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. STATUS BREAKDOWN GRID (The 5 Requested Stages + All Projects) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-700" />
                      <span>Project Lifecycle Pipeline Stages</span>
                    </h2>
                    <span className="text-xs text-slate-500">Click any card to filter projects</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    {/* CARD 0: ALL PROJECTS */}
                    <div
                      onClick={() => {
                        setStatusFilter('all');
                        setActiveTab('tasks');
                        setDownloadModalStatus('all');
                      }}
                      className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">All Projects</span>
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                            <Layers className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-3xl font-black font-mono text-slate-900 mt-2">{visibleTasks.length}</div>
                        <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Total System Portfolio</span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => exportTasksToExcel(getTasksByStatus('all'), 'all')}
                          title="Download All Projects in Excel (.xlsx)"
                          className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-1 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Excel</span>
                        </button>
                        <button
                          onClick={() => exportTasksToPDF(getTasksByStatus('all'), 'all')}
                          title="Download All Projects in PDF Report"
                          className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-1.5 px-1 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* CARD 1: NOT STARTED */}
                    <div
                      onClick={() => {
                        setStatusFilter('not started');
                        setActiveTab('tasks');
                        setDownloadModalStatus('not started');
                      }}
                      className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">1. Not Started</span>
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-colors">
                            <Clock className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-3xl font-black font-mono text-slate-900 mt-2">{countNotStarted}</div>
                        <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Site Survey & Intake</span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => exportTasksToExcel(getTasksByStatus('not started'), 'not started')}
                          title="Download Not Started in Excel (.xlsx)"
                          className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-1 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Excel</span>
                        </button>
                        <button
                          onClick={() => exportTasksToPDF(getTasksByStatus('not started'), 'not started')}
                          title="Download Not Started in PDF Report"
                          className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-1.5 px-1 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* CARD 2: IN PROGRESS */}
                    <div
                      onClick={() => {
                        setStatusFilter('in progress');
                        setActiveTab('tasks');
                        setDownloadModalStatus('in progress');
                      }}
                      className="bg-blue-50/40 p-4 rounded-2xl border border-blue-200/90 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider">2. In Progress</span>
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Activity className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-3xl font-black font-mono text-blue-900 mt-2">{countInProgress}</div>
                        <span className="text-[11px] text-blue-700 font-medium block mt-0.5">Rooftop Structure & PV</span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-blue-100 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => exportTasksToExcel(getTasksByStatus('in progress'), 'in progress')}
                          title="Download In Progress in Excel (.xlsx)"
                          className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-1 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Excel</span>
                        </button>
                        <button
                          onClick={() => exportTasksToPDF(getTasksByStatus('in progress'), 'in progress')}
                          title="Download In Progress in PDF Report"
                          className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-1.5 px-1 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* CARD 3: PENDING */}
                    <div
                      onClick={() => {
                        setStatusFilter('pending');
                        setActiveTab('tasks');
                        setDownloadModalStatus('pending');
                      }}
                      className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/90 shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider">3. Pending</span>
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                            <Clock className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-3xl font-black font-mono text-amber-950 mt-2">{countPending}</div>
                        <span className="text-[11px] text-amber-800 font-medium block mt-0.5">UPPCL & Net-Meter</span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => exportTasksToExcel(getTasksByStatus('pending'), 'pending')}
                          title="Download Pending in Excel (.xlsx)"
                          className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-1 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Excel</span>
                        </button>
                        <button
                          onClick={() => exportTasksToPDF(getTasksByStatus('pending'), 'pending')}
                          title="Download Pending in PDF Report"
                          className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-1.5 px-1 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* CARD 4: ON HOLD */}
                    <div
                      onClick={() => {
                        setStatusFilter('on hold');
                        setActiveTab('tasks');
                        setDownloadModalStatus('on hold');
                      }}
                      className="bg-rose-50/40 p-4 rounded-2xl border border-rose-200/90 shadow-xs hover:border-rose-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider">4. On Hold</span>
                          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-3xl font-black font-mono text-rose-900 mt-2">{countOnHold}</div>
                        <span className="text-[11px] text-rose-700 font-medium block mt-0.5">Customer / Site Delay</span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-rose-100 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => exportTasksToExcel(getTasksByStatus('on hold'), 'on hold')}
                          title="Download On Hold in Excel (.xlsx)"
                          className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-1 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Excel</span>
                        </button>
                        <button
                          onClick={() => exportTasksToPDF(getTasksByStatus('on hold'), 'on hold')}
                          title="Download On Hold in PDF Report"
                          className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-1.5 px-1 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* CARD 5: COMPLEATED */}
                    <div
                      onClick={() => {
                        setStatusFilter('compleated');
                        setActiveTab('tasks');
                        setDownloadModalStatus('compleated');
                      }}
                      className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200/90 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">5. Compleated</span>
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-3xl font-black font-mono text-emerald-900 mt-2">{countCompleated}</div>
                        <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">Grid Commissioned</span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => exportTasksToExcel(getTasksByStatus('compleated'), 'compleated')}
                          title="Download Compleated in Excel (.xlsx)"
                          className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-1 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Excel</span>
                        </button>
                        <button
                          onClick={() => exportTasksToPDF(getTasksByStatus('compleated'), 'compleated')}
                          title="Download Compleated in PDF Report"
                          className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-1.5 px-1 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. INTERACTIVE PIPELINE CONVERSION FUNNEL (The Endowed Progress Effect) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Solar Pipeline Conversion Funnel</h3>
                        <p className="text-xs text-slate-500">Real-time distribution across active project life cycle stages</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Overall Completion:</span>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {completionRate}% Commissioned
                      </span>
                    </div>
                  </div>

                  {/* Multi-segment stacked progress bar */}
                  <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                    {visibleTasks.length > 0 ? (
                      <>
                        {countCompleated > 0 && (
                          <div
                            style={{ width: `${(countCompleated / visibleTasks.length) * 100}%` }}
                            className="bg-emerald-500 hover:bg-emerald-600 transition-all cursor-pointer"
                            title={`Compleated: ${countCompleated} (${Math.round((countCompleated / visibleTasks.length) * 100)}%)`}
                            onClick={() => {
                              setStatusFilter('compleated');
                              setActiveTab('tasks');
                            }}
                          />
                        )}
                        {countInProgress > 0 && (
                          <div
                            style={{ width: `${(countInProgress / visibleTasks.length) * 100}%` }}
                            className="bg-blue-500 hover:bg-blue-600 transition-all cursor-pointer"
                            title={`In Progress: ${countInProgress} (${Math.round((countInProgress / visibleTasks.length) * 100)}%)`}
                            onClick={() => {
                              setStatusFilter('in progress');
                              setActiveTab('tasks');
                            }}
                          />
                        )}
                        {countPending > 0 && (
                          <div
                            style={{ width: `${(countPending / visibleTasks.length) * 100}%` }}
                            className="bg-amber-400 hover:bg-amber-500 transition-all cursor-pointer"
                            title={`Pending: ${countPending} (${Math.round((countPending / visibleTasks.length) * 100)}%)`}
                            onClick={() => {
                              setStatusFilter('pending');
                              setActiveTab('tasks');
                            }}
                          />
                        )}
                        {countNotStarted > 0 && (
                          <div
                            style={{ width: `${(countNotStarted / visibleTasks.length) * 100}%` }}
                            className="bg-slate-400 hover:bg-slate-500 transition-all cursor-pointer"
                            title={`Not Started: ${countNotStarted} (${Math.round((countNotStarted / visibleTasks.length) * 100)}%)`}
                            onClick={() => {
                              setStatusFilter('not started');
                              setActiveTab('tasks');
                            }}
                          />
                        )}
                        {countOnHold > 0 && (
                          <div
                            style={{ width: `${(countOnHold / visibleTasks.length) * 100}%` }}
                            className="bg-rose-400 hover:bg-rose-500 transition-all cursor-pointer"
                            title={`On Hold: ${countOnHold} (${Math.round((countOnHold / visibleTasks.length) * 100)}%)`}
                            onClick={() => {
                              setStatusFilter('on hold');
                              setActiveTab('tasks');
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full bg-slate-200" />
                    )}
                  </div>

                  {/* Stage legend tags with click triggers */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => { setStatusFilter('compleated'); setActiveTab('tasks'); }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold cursor-pointer transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Compleated: {countCompleated}</span>
                    </button>

                    <button
                      onClick={() => { setStatusFilter('in progress'); setActiveTab('tasks'); }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold cursor-pointer transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>In Progress: {countInProgress}</span>
                    </button>

                    <button
                      onClick={() => { setStatusFilter('pending'); setActiveTab('tasks'); }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold cursor-pointer transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>Pending UPPCL: {countPending}</span>
                    </button>

                    <button
                      onClick={() => { setStatusFilter('not started'); setActiveTab('tasks'); }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      <span>Not Started: {countNotStarted}</span>
                    </button>

                    <button
                      onClick={() => { setStatusFilter('on hold'); setActiveTab('tasks'); }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold cursor-pointer transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      <span>On Hold: {countOnHold}</span>
                    </button>
                  </div>
                </div>

                {/* 5. TWO-COLUMN ANALYTICS COMMAND CENTER */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left Column: Team Workload & Engineering Force */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Engineering Staff & Field Workload</h3>
                          <p className="text-[11px] text-slate-500">Live task allocation & team completion metrics</p>
                        </div>
                      </div>
                      {currentUser.role === 'owner' && (
                        <button
                          onClick={() => setIsManageUsersOpen(true)}
                          className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Manage Staff
                        </button>
                      )}
                    </div>

                    {/* Staff members list */}
                    <div className="space-y-3 flex-1">
                      {(users || []).filter((u) => u.role !== 'owner').map((staff) => {
                        const assignedCount = (tasks || []).filter((t) => t.assignedToUserId === staff.id).length;
                        const completedCount = (tasks || []).filter((t) => t.assignedToUserId === staff.id && t.status === 'compleated').length;
                        const pct = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0;

                        return (
                          <div
                            key={staff.id}
                            onClick={() => {
                              setUserFilter(staff.id);
                              setActiveTab('tasks');
                            }}
                            className="p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group"
                            title={`Filter projects assigned to ${staff.name}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-[#1a3882] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                  {staff.name[0]}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate flex items-center gap-1.5">
                                    <span>{staff.name}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Staff"></span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate">{staff.roleTitle}</div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-bold text-slate-900">{completedCount}/{assignedCount} Done</span>
                                <span className="text-[10px] text-slate-400 block">{pct}% rate</span>
                              </div>
                            </div>

                            {/* Micro Progress Bar */}
                            <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className="h-full bg-emerald-500 rounded-full transition-all"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Customer Care SLA & PM Surya Ghar Subsidy Hub */}
                  <div className="space-y-5 flex flex-col">
                    {/* Customer Care SLA Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex-1">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">Customer Service & Complaints SLA</h3>
                            <p className="text-[11px] text-slate-500">After-sales maintenance & inverter warranty support</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('complaints')}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          View All ({complaints.length})
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Total Tickets</span>
                          <div className="text-xl font-black text-slate-900 mt-0.5">{complaints.length}</div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                          <span className="text-[10px] uppercase font-bold text-amber-700">Open / Active</span>
                          <div className="text-xl font-black text-amber-900 mt-0.5">{openComplaintsCount}</div>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                          <span className="text-[10px] uppercase font-bold text-emerald-700">Resolved</span>
                          <div className="text-xl font-black text-emerald-900 mt-0.5">{resolvedComplaintsCount}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                          <span className="text-[10px] uppercase font-bold text-blue-700">CSAT Score</span>
                          <div className="text-xl font-black text-blue-900 mt-0.5">4.9 ★</div>
                        </div>
                      </div>

                      <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-100 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Guaranteed 24-Hour Solar SLA Turnaround</span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Immediate technical dispatch for inverter faults, earthing checks, or meter issues.
                          </div>
                        </div>
                        <button
                          onClick={() => setIsNewComplaintOpen(true)}
                          className="shrink-0 text-xs font-bold bg-[#1a3882] hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                        >
                          + Log Ticket
                        </button>
                      </div>
                    </div>

                    {/* PM Surya Ghar Direct Subsidy Reference Card */}
                    <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/60 to-white rounded-2xl p-5 border border-amber-200/80 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
                          <Sun className="w-4 h-4 text-amber-600" />
                          <span>PM Surya Ghar: Muft Bijli Yojana Central Subsidy</span>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                          UPNEDA 2026
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center my-3">
                        <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100 shadow-xs">
                          <span className="text-[10px] text-slate-500 font-bold block">1 kW System</span>
                          <span className="text-xs font-black text-slate-900 block mt-0.5">₹30,000</span>
                          <span className="text-[9px] text-emerald-600 font-bold">Direct DBT</span>
                        </div>
                        <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100 shadow-xs">
                          <span className="text-[10px] text-slate-500 font-bold block">2 kW System</span>
                          <span className="text-xs font-black text-slate-900 block mt-0.5">₹60,000</span>
                          <span className="text-[9px] text-emerald-600 font-bold">Direct DBT</span>
                        </div>
                        <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100 shadow-xs">
                          <span className="text-[10px] text-slate-500 font-bold block">3 kW - 10 kW</span>
                          <span className="text-xs font-black text-slate-900 block mt-0.5">₹78,000</span>
                          <span className="text-[9px] text-emerald-600 font-bold">Max Cap DBT</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                        <span className="text-[11px] text-slate-600">Need instant quotation for a homeowner?</span>
                        <button
                          onClick={() => setIsQuotationModalOpen(true)}
                          className="font-bold text-amber-950 hover:text-amber-900 inline-flex items-center gap-1 bg-amber-300 hover:bg-amber-400 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>Open Quotation Tool</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ============================================================== */}
          {/* TAB 2: TASKS & LEADS (Multi-View Professional CRM Pipeline) */}
          {/* ============================================================== */}
          {activeTab === 'tasks' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              {/* TOP HEADER & ACTION BAR */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#1a3882] text-white">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>
                          {currentUser.role === 'owner' ? 'All Solar Leads & Projects' : 'My Assigned Work Tasks'}
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                          {visibleTasks.length} Projects
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Professional pipeline: Kanban, Data Grid, Cards & Website Inbound Inquiries with real-time audit logging.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {currentUser.role === 'owner' && (
                    <button
                      onClick={() => setIsNewTaskOpen(true)}
                      className="inline-flex items-center gap-2 bg-[#1a3882] hover:bg-blue-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New Project / Lead</span>
                    </button>
                  )}

                  {/* Direct 1-Click Export Buttons */}
                  <button
                    onClick={() => exportTasksToExcel(filteredTasks, statusFilter)}
                    title={`Export current view (${filteredTasks.length}) to Excel`}
                    className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-2 rounded-lg shadow-sm cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={() => exportTasksToPDF(filteredTasks, statusFilter)}
                    title={`Export current view (${filteredTasks.length}) to PDF`}
                    className="inline-flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-3 py-2 rounded-lg shadow-sm cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {/* PROFESSIONAL CRM VIEW SWITCHER TABS */}
              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
                    View Mode:
                  </span>
                  <button
                    type="button"
                    onClick={() => setTaskViewMode('grid')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      taskViewMode === 'grid'
                        ? 'bg-[#1a3882] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Cards Grid</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                      {filteredTasks.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskViewMode('kanban')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      taskViewMode === 'kanban'
                        ? 'bg-[#1a3882] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Kanban className="w-3.5 h-3.5" />
                    <span>Kanban Pipeline</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                      5 Stages
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskViewMode('table')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      taskViewMode === 'table'
                        ? 'bg-[#1a3882] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Data Grid (Bulk Actions)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                      Table
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskViewMode('inbound')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      taskViewMode === 'inbound'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Website Inbound Leads</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-950 font-extrabold">
                      Live Inquiries
                    </span>
                  </button>
                </div>

                {/* Quick stats ribbon */}
                <div className="hidden lg:flex items-center gap-3 text-xs pr-2">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Total Capacity:</span>
                    <strong className="text-slate-900">
                      {visibleTasks.reduce((sum, t) => sum + (t.capacityKw || 0), 0)} kW
                    </strong>
                  </div>
                  <div className="h-4 w-px bg-slate-300"></div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Estimated Pipeline:</span>
                    <strong className="text-emerald-800">
                      ₹{(
                        visibleTasks.reduce((sum, t) => sum + (t.dealValueRs || t.capacityKw * 65000), 0) /
                        100000
                      ).toFixed(1)}{' '}
                      Lakhs
                    </strong>
                  </div>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR (For Grid, Kanban and Table views) */}
              {taskViewMode !== 'inbound' && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
                  {/* 1. Search by Task Name / Customer */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by client, phone, code, address, email, assignee or source..."
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      className="w-full pl-9 pr-8 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    {taskSearch && (
                      <button
                        type="button"
                        onClick={() => setTaskSearch('')}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold px-1 rounded-full cursor-pointer"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* 2. Search by User / Unassigned (Owner View) */}
                  {currentUser.role === 'owner' && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none font-medium"
                      >
                        <option value="all">All Assignments ({businessScopedTasks.length})</option>
                        <option value="unassigned">
                          ⚡ Unassigned Leads / Projects ({businessScopedTasks.filter((t) => !t.assignedToUserId || t.assignedToUserName === 'Unassigned').length})
                        </option>
                        {users
                          .filter((u) => u.role === 'employee')
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.roleTitle})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* 3. Priority Filter */}
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as any)}
                      className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none font-medium"
                    >
                      <option value="all">All Priorities</option>
                      <option value="Urgent">Urgent Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Normal">Normal Priority</option>
                    </select>
                  </div>

                  {/* 4. Status Filters (The exact 5 options + All) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs flex-wrap sm:flex-nowrap">
                    <span className="font-bold text-slate-700 mr-1 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                      <span>Status:</span>
                    </span>
                    {(['all', 'not started', 'in progress', 'pending', 'on hold', 'compleated'] as const).map((st) => {
                      const stCount = getTasksByStatus(st).length;
                      return (
                        <button
                          key={st}
                          onClick={() => {
                            setStatusFilter(st);
                            setDownloadModalStatus(st);
                          }}
                          title={`Filter ${getStatusLabel(st)} projects`}
                          className={`px-2.5 py-1.5 rounded-lg capitalize font-bold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
                            statusFilter === st
                              ? 'bg-[#1a3882] text-white ring-2 ring-blue-400 font-extrabold'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>{st === 'all' ? 'All' : st}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                              statusFilter === st ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {stCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Search & Filter Indicator */}
              {taskSearch && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-900 px-3.5 py-2 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>
                      Showing matching results for: <strong className="text-blue-950 underline">"{taskSearch}"</strong> ({filteredTasks.length} found)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTaskSearch('')}
                    className="text-xs font-bold text-blue-700 hover:text-blue-950 underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* VIEW 1: CARDS GRID VIEW */}
              {taskViewMode === 'grid' && (
                <div className="space-y-4">
                  {/* Task Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTasks.map((task, index) => (
                      <CrmTaskCard
                        key={task.id}
                        task={task}
                        itemIndex={index + 1}
                        currentUser={currentUser}
                        staffUsers={users}
                        leadWorkflows={activeLeadWorkflows}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onEditTask={handleEditTask}
                        onDeleteTask={handleDeleteTask}
                        onOpenWhatsAppModal={handleOpenWhatsAppModal}
                        onOpenPmSuryaGharModal={(t) => setTaskForPmSuryaGhar(t)}
                        onOpenFeasibilityModal={(t) => setTaskForFeasibility(t)}
                        onOpenEquipmentBomModal={(t) => setTaskForEquipmentBom(t)}
                        onViewTemplate={(tmplId) => {
                          const found = templates.find((t) => t.id === tmplId) || templates[0];
                          setSelectedTemplate(found);
                        }}
                        onViewFlowchart={() => {
                          setActiveTab('task-templates');
                        }}
                      />
                    ))}
                  </div>

                  {filteredTasks.length === 0 && (
                    <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1a3882] flex items-center justify-center mx-auto">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {tasks.length === 0 ? 'No Leads or Tasks Found' : 'No tasks match current active filters'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        {tasks.length === 0
                          ? 'You do not have any leads or projects logged yet. Add your first lead or task using the "+ Add New Project / Lead" button above.'
                          : `There are ${tasks.length} total tasks/leads in your CRM, but active filters (Status: "${statusFilter}", User: "${userFilter}", Search: "${taskSearch}") are hiding them.`}
                      </p>
                      {tasks.length > 0 && (
                        <div className="pt-2 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter('all');
                              setUserFilter('all');
                              setPriorityFilter('all');
                              setTaskSearch('');
                              setIsAllBusinessesView(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a3882] text-white text-xs font-bold hover:bg-blue-900 cursor-pointer shadow-xs transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reset All Filters & Show All {tasks.length} Leads</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: KANBAN BOARD VIEW */}
              {taskViewMode === 'kanban' && (
                <KanbanBoardView
                  tasks={filteredTasks}
                  users={users}
                  currentUser={currentUser}
                  leadWorkflows={activeLeadWorkflows}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onOpenWhatsAppModal={handleOpenWhatsAppModal}
                />
              )}

              {/* VIEW 3: DATA TABLE VIEW (WITH BULK ACTIONS) */}
              {taskViewMode === 'table' && (
                <TasksTableView
                  tasks={filteredTasks}
                  users={users}
                  currentUser={currentUser}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onOpenWhatsAppModal={handleOpenWhatsAppModal}
                  onBulkStatusChange={handleBulkStatusChange}
                  onBulkReassign={handleBulkReassign}
                />
              )}

              {/* VIEW 4: INBOUND LEADS PIPELINE */}
              {taskViewMode === 'inbound' && (
                <InboundLeadsPipeline
                  currentUser={currentUser}
                  staffUsers={users}
                  onConvertToTask={handleConvertLeadToTask}
                  onRecordAudit={(action, details) => recordAuditEvent(currentUser, action as any, details)}
                  taskWorkflowTemplates={taskWorkflowTemplates}
                  onAttachLeadWorkflow={handleAttachLeadWorkflow}
                />
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: NOTIFICATIONS (Owner Global Desk or Staff Directives) */}
          {/* ============================================================== */}
          {activeTab === 'notifications' && (
            <div className="max-w-7xl mx-auto">
              {currentUser.role === 'owner' ? (
                <ProjectNotificationsView
                  notifications={projectNotifications}
                  onMarkAsRead={(id) => {
                    setProjectNotifications((prev) =>
                      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
                    );
                  }}
                  onMarkAllAsRead={() => {
                    setProjectNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                  }}
                  onClearAll={() => {
                    setProjectNotifications([]);
                    try {
                      localStorage.removeItem('dilip_crm_project_notifications_v3');
                    } catch (e) {}
                  }}
                  onSelectProject={(taskCode, notif) => {
                    if (notif?.itemType === 'COMPLAINT' || notif?.actionType === 'COMPLAINT_REGISTERED') {
                      setActiveTab('complaints');
                      setComplaintStatusFilter('all');
                      setComplaintSearch(notif.taskCode || notif.customerName || '');
                      return;
                    }

                    setActiveTab('tasks');
                    setStatusFilter('all');
                    setUserFilter('all');
                    setPriorityFilter('all');

                    let resolvedSearch = (taskCode || '').trim();
                    if (notif) {
                      const matched = tasks.find((t) => {
                        if (notif.taskId && (t.id === notif.taskId || t.workflowId === notif.taskId)) return true;
                        if (notif.taskCode && t.taskCode && t.taskCode.toLowerCase() === notif.taskCode.toLowerCase()) return true;
                        if (
                          notif.customerPhone &&
                          t.customerPhone &&
                          t.customerPhone.replace(/\D/g, '') === notif.customerPhone.replace(/\D/g, '')
                        )
                          return true;
                        if (
                          notif.customerName &&
                          t.customerName &&
                          t.customerName.trim().toLowerCase() === notif.customerName.trim().toLowerCase()
                        )
                          return true;
                        if (notif.taskCode && notif.taskCode.toLowerCase().startsWith('wf-') && t.customerName) {
                          const sub = notif.taskCode.substring(3).toLowerCase();
                          if (sub.length >= 3 && t.customerName.toLowerCase().includes(sub)) return true;
                        }
                        return false;
                      });

                      if (matched) {
                        if (matched.businessId && matched.businessId !== activeBusinessId) {
                          setActiveBusinessId(matched.businessId);
                        }
                        resolvedSearch = matched.customerName || matched.taskCode || resolvedSearch;
                      } else if (notif.customerName) {
                        resolvedSearch = notif.customerName.trim();
                      }
                    }

                    setTaskSearch(resolvedSearch);
                  }}
                  soundEnabled={ownerAudioAlertEnabled}
                  onToggleSound={() => {
                    const next = !ownerAudioAlertEnabled;
                    setOwnerAudioAlertEnabled(next);
                    setSoundEnabled(next);
                  }}
                  onSimulateAmitCompleted={handleSimulateAmitCompleted}
                  onOpenAudioSettings={() => setIsAudioModalOpen(true)}
                />
              ) : (
                <UserNotificationsView
                  currentUser={currentUser}
                  notifications={[...userDirectives].sort((a, b) => {
                    const timeA = new Date(a.updatedAt || a.assignedAt || 0).getTime();
                    const timeB = new Date(b.updatedAt || b.assignedAt || 0).getTime();
                    return (timeB - timeA) || b.id.localeCompare(a.id);
                  })}
                  onMarkAsRead={handleMarkDirectiveAsRead}
                  onMarkAllAsRead={handleMarkAllUserDirectivesAsRead}
                  onNavigateToTask={(taskCodeOrId, notif) => {
                    setActiveTab('tasks');
                    setStatusFilter('all');
                    setUserFilter('all');
                    setPriorityFilter('all');

                    let resolvedSearch = (taskCodeOrId || '').trim();
                    if (notif) {
                      const matched = tasks.find((t) => {
                        if (notif.taskId && (t.id === notif.taskId || t.workflowId === notif.taskId)) return true;
                        if (notif.taskCode && t.taskCode && t.taskCode.toLowerCase() === notif.taskCode.toLowerCase()) return true;
                        if (
                          notif.customerPhone &&
                          t.customerPhone &&
                          t.customerPhone.replace(/\D/g, '') === notif.customerPhone.replace(/\D/g, '')
                        )
                          return true;
                        if (
                          notif.customerName &&
                          t.customerName &&
                          t.customerName.trim().toLowerCase() === notif.customerName.trim().toLowerCase()
                        )
                          return true;
                        if (notif.taskCode && notif.taskCode.toLowerCase().startsWith('wf-') && t.customerName) {
                          const sub = notif.taskCode.substring(3).toLowerCase();
                          if (sub.length >= 3 && t.customerName.toLowerCase().includes(sub)) return true;
                        }
                        return false;
                      });

                      if (matched) {
                        if (matched.businessId && matched.businessId !== activeBusinessId) {
                          setActiveBusinessId(matched.businessId);
                        }
                        resolvedSearch = matched.customerName || matched.taskCode || resolvedSearch;
                      } else if (notif && (notif.customerName || notif.taskId)) {
                        // ZERO-DELAY LOCAL CACHE SYNTHESIS:
                        // Notification carries the full project details from the owner.
                        // Mount directly to local cache with First Priority to eliminate any cloud backoff delay!
                        const nowIso = notif.assignedAt || new Date().toISOString();
                        const synthesizedTask: CrmTask = {
                          id: notif.taskId || `task-notif-${Date.now()}`,
                          taskCode: notif.taskCode || `WF-${(notif.customerName || 'LEAD').substring(0, 4).toUpperCase()}`,
                          title: notif.projectTitle || `Solar Project - ${notif.customerName}`,
                          customerName: notif.customerName || 'Customer',
                          customerPhone: notif.customerPhone || '',
                          customerAddress: notif.customerAddress || 'Prayagraj',
                          capacityKw: notif.capacityKw || 3,
                          systemType: 'On-Grid Rooftop',
                          monthlyBillRs: '3500',
                          priority: notif.priority || 'High',
                          assignedToUserId: notif.targetUserId || currentUser.id,
                          assignedToUserName: notif.targetUserName || currentUser.name,
                          assignedUserIds: [notif.targetUserId || currentUser.id],
                          assignedUserNames: [notif.targetUserName || currentUser.name],
                          assignedBy: notif.assignedBy || 'Owner',
                          assignedAt: nowIso,
                          ownerInstructions: notif.ownerCommand || '',
                          status: (notif.status as any) || 'not started',
                          lastUpdatedAt: nowIso,
                          lastUpdatedBy: notif.assignedBy || 'Owner',
                          dealValueRs: (notif.capacityKw || 3) * 65000,
                          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                          leadSource: 'Owner Directive Dispatch',
                          businessId: activeBusinessId || 'biz-solar-dilip',
                          businessName: activeBusiness?.name || 'Dilip Enterprises',
                          remarksHistory: [
                            {
                              id: `rem-dir-${Date.now()}`,
                              authorId: notif.assignedBy || 'owner',
                              authorName: notif.assignedBy || 'Owner',
                              authorRole: 'owner',
                              statusChangedTo: (notif.status as any) || 'not started',
                              message: notif.ownerCommand || 'Project details dispatched from Owner Directive notification.',
                              timestamp: nowIso,
                            },
                          ],
                        };

                        setTasks((prev) => {
                          const list = Array.isArray(prev) ? prev : [];
                          if (list.some((t) => t.id === synthesizedTask.id)) return list;
                          const next = [synthesizedTask, ...list];
                          try {
                            localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(next));
                          } catch (_) {}
                          return next;
                        });

                        resolvedSearch = synthesizedTask.customerName || synthesizedTask.taskCode;
                      } else if (notif.customerName) {
                        resolvedSearch = notif.customerName.trim();
                      }
                    }

                    setTaskSearch(resolvedSearch);
                  }}
                  onNavigateToComplaint={(ticketNoOrId) => {
                    setActiveTab('complaints');
                    setComplaintStatusFilter('all');
                    setComplaintSearch(ticketNoOrId || '');
                  }}
                />
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: USER ACTIVITY & AUDIT LOGS (Owner Only) */}
          {/* ============================================================== */}
          {activeTab === 'audit-logs' && currentUser.role === 'owner' && (
            <div className="max-w-7xl mx-auto">
              <AuditLogsView
                logs={auditLogs}
                users={users}
                currentUser={currentUser}
                idleSeconds={idleSeconds}
                onSimulateInactivityTimeout={simulateTimeout}
                onForceLogoutUser={handleForceLogoutUser}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: BUSINESS WORKSPACES & SOP TEMPLATES */}
          {/* ============================================================== */}
          {activeTab === 'templates' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* TOP BUSINESS SELECTOR BAR */}
              <BusinessSelectorBar
                businesses={businesses}
                activeBusinessId={activeBusinessId}
                onSelectBusiness={(id) => {
                  setActiveBusinessId(id);
                  saveStoredActiveBusinessId(id);
                  setIsAllBusinessesView(false);
                }}
                onOpenAddBusiness={() => setIsAddBusinessOpen(true)}
                onOpenManageBusiness={() => setIsManageBusinessOpen(true)}
                tasks={tasks}
                isAllBusinessesView={isAllBusinessesView}
                onToggleAllBusinessesView={(val) => setIsAllBusinessesView(val !== undefined ? val : !isAllBusinessesView)}
                isOwner={currentUser.role === 'owner'}
              />

              {/* SECTION 1: ACTIVE BUSINESS WORKSPACES */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black shadow-sm">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">Active Business Workspaces</h3>
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-2 py-0.5 rounded-full">
                          {businesses.length} Workspaces
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Multi-business workspace templates for Solar EPC, Rooftop, and related enterprise operations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentUser.role === 'owner' && (
                      <button
                        onClick={() => setIsAddBusinessOpen(true)}
                        className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Workspace</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {businesses.map((biz) => {
                    const isActive = biz.id === activeBusinessId && !isAllBusinessesView;
                    const bTasks = tasks.filter((t) => t.businessId === biz.id);

                    return (
                      <div
                        key={biz.id}
                        className={`rounded-xl border p-4 transition-all relative flex flex-col justify-between ${
                          isActive
                            ? 'bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 border-amber-400 shadow-md ring-2 ring-amber-300'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                                {renderBusinessIcon(biz.iconName || 'Briefcase', 'w-5 h-5')}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{biz.name}</h4>
                                <span className="text-[10px] text-slate-500 block">{biz.category}</span>
                              </div>
                            </div>
                            {isActive && (
                              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                Active
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2">{biz.tagline}</p>

                          <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1 border-t border-slate-100">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                              {biz.stages?.length || 5} Pipeline Stages
                            </span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                              {bTasks.length} Active Leads
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setActiveBusinessId(biz.id);
                              saveStoredActiveBusinessId(biz.id);
                              setIsAllBusinessesView(false);
                            }}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                              isActive
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                            }`}
                          >
                            {isActive ? 'Current Active' : 'Switch Workspace'}
                          </button>
                          {currentUser.role === 'owner' && (
                            <button
                              onClick={() => {
                                setActiveBusinessId(biz.id);
                                setIsManageBusinessOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                              title="Manage Workspace Details"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: READY-TO-USE BUSINESS TEMPLATE PRESETS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-sm">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">Ready-to-Use Industry Business Templates</h3>
                        <span className="bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs px-2 py-0.5 rounded-full">
                          {BUSINESS_TEMPLATE_PRESETS.length} Industry Presets
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Pre-configured turnkey workflows with pipelines, stages, and standard operating procedures.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {BUSINESS_TEMPLATE_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 space-y-3 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                              {renderBusinessIcon(preset.iconName, 'w-4 h-4')}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{preset.name}</h4>
                              <span className="text-[10px] text-indigo-600 font-semibold">{preset.industry}</span>
                            </div>
                          </div>
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                            {preset.badge}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-2">{preset.description}</p>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400">Stages Pipeline:</span>
                          <div className="space-y-0.5">
                            {preset.stages.slice(0, 3).map((st) => (
                              <div key={st.id} className="text-[10px] text-slate-700 flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                <span className="truncate">{st.label}</span>
                              </div>
                            ))}
                            {preset.stages.length > 3 && (
                              <div className="text-[10px] text-indigo-600 font-medium pl-3">
                                + {preset.stages.length - 3} more stages
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {currentUser.role === 'owner' && (
                        <button
                          onClick={() => {
                            handleAddBusiness({
                              id: `biz-${Date.now()}`,
                              name: preset.name,
                              templatePresetId: preset.id,
                              industry: preset.industry,
                              category: preset.category,
                              tagline: preset.tagline,
                              iconName: preset.iconName,
                              badge: preset.badge,
                              currency: preset.currency,
                              ownerName: currentUser.name,
                              contactPhone: '9415289945',
                              email: 'contact@dilipenterprises.in',
                              address: 'Banda, Uttar Pradesh',
                              colorTheme: preset.colorTheme,
                              stages: preset.stages,
                              systemTypes: preset.systemTypes,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                            });
                          }}
                          className="w-full mt-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          + Activate Preset As Workspace
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: STANDARD OPERATING PROCEDURE (SOP) TASK TEMPLATES */}
              <div className="pt-2">
                <TaskTemplatesView
                  currentUser={currentUser}
                  staffUsers={users}
                  templates={taskWorkflowTemplates}
                  leadWorkflows={visibleLeadWorkflows}
                  onOpenAddTemplate={() => setIsAddTaskTemplateModalOpen(true)}
                  onDeleteTemplate={handleDeleteWorkflowTemplate}
                  onDeleteLeadWorkflow={handleDeleteLeadWorkflow}
                  onUpdateLeadWorkflow={handleUpdateLeadWorkflow}
                  onUpdateTemplate={handleUpdateWorkflowTemplate}
                  onRecordAudit={(action, details) => recordAuditEvent(currentUser, action as any, details)}
                  onSendNotification={handleCreateDirectiveNotification}
                  ownerDirectives={ownerDirectives}
                  userDirectives={userDirectives}
                />
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ============================================================== */}
          {/* TAB 5: COMPLAINTS (Available Complaints & Previous Completed Complaints) */}
          {/* ============================================================== */}
          {activeTab === 'complaints' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header with Live Cloud Status & Register Button */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                      <span>Solar Maintenance & Complaints</span>
                    </h2>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Realtime Cloud Sync Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Accessible to all team members and Dilip Enterprises. Register, track, resolve, and view all active customer complaints with instant notifications across all devices.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setComplaintToEdit(null);
                      setIsNewComplaintOpen(true);
                    }}
                    className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Register New Complaint Ticket</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Status Breakdown KPI Badges for Active Complaints */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setComplaintStatusFilter('all')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      complaintStatusFilter === 'all'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Active Complaints</span>
                    <div className="text-xl font-black mt-0.5">{availableComplaints.length}</div>
                  </div>

                  <div
                    onClick={() => setComplaintStatusFilter('not started')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      complaintStatusFilter === 'not started'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-rose-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-rose-500">Not Started / Awaiting Visit</span>
                    <div className="text-xl font-black mt-0.5">
                      {availableComplaints.filter((c) => (c.status as any) === 'not started' || c.status === 'Open').length}
                    </div>
                  </div>

                  <div
                    onClick={() => setComplaintStatusFilter('in progress')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      complaintStatusFilter === 'in progress'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-blue-500">In Progress / On Site</span>
                    <div className="text-xl font-black mt-0.5">
                      {availableComplaints.filter((c) => (c.status as any) === 'in progress' || c.status === 'In Progress').length}
                    </div>
                  </div>
                </div>

                  {/* SEARCH & FILTERS BAR */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search active ticket #, customer, phone, issue, or address..."
                        value={complaintSearch}
                        onChange={(e) => setComplaintSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={complaintUserFilter}
                        onChange={(e) => setComplaintUserFilter(e.target.value)}
                        className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
                      >
                        <option value="all">All Technicians ({users.filter((u) => u.role === 'employee').length})</option>
                        {users
                          .filter((u) => u.role === 'employee')
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto text-xs">
                      <span className="font-semibold text-slate-600 mr-1">Active Status:</span>
                      {(['all', 'not started', 'in progress', 'pending', 'on hold'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setComplaintStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-lg capitalize font-medium cursor-pointer transition-colors whitespace-nowrap ${
                            complaintStatusFilter === st
                              ? 'bg-rose-600 text-white font-bold'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {st === 'all' ? 'All Active' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AVAILABLE COMPLAINTS CARDS LIST */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredComplaints.map((c) => {
                      const lag = calculateResponseLag(c.assignedAt || c.createdAt, c.firstRespondedAt);
                      const isAssignedToCurrent =
                        currentUser.role === 'employee' &&
                        (c.assignedToUserId === currentUser.id ||
                          (c.assignedTo || '').toLowerCase().includes((currentUser?.name || '').toLowerCase()));

                      return (
                        <div
                          key={c.id}
                          className={`bg-white rounded-xl border p-4 shadow-sm space-y-3.5 transition-all ${
                            isAssignedToCurrent ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                                {c.ticketNo}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  c.priority === 'Urgent'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : c.priority === 'High'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {c.priority} Priority
                              </span>
                              <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                {c.systemCapacity}
                              </span>
                              {c.taskCode && (
                                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded">
                                  Project: {c.taskCode}
                                </span>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-extrabold capitalize border ${
                                  (c.status as any) === 'in progress' || c.status === 'In Progress'
                                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                                    : (c.status as any) === 'pending'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : (c.status as any) === 'on hold'
                                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                                    : 'bg-slate-100 text-slate-900 border-slate-300'
                                }`}
                              >
                                {c.status}
                              </span>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-slate-900">{c.customerName}</h4>
                              <a
                                href={`tel:${c.phone}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{c.phone}</span>
                              </a>
                            </div>
                            <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span>{c.address}</span>
                            </div>
                          </div>

                          {/* Issue Description */}
                          <div className="p-2.5 bg-rose-50/50 rounded-lg border border-rose-100 text-xs">
                            <div className="font-bold text-rose-900 mb-0.5">{c.issueType}</div>
                            <p className="text-slate-700 leading-relaxed">{c.description}</p>
                          </div>

                          {/* Owner's Instructions */}
                          {c.ownerInstructions && (
                            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                              <div className="font-bold text-amber-950 flex items-center gap-1 mb-0.5">
                                <Send className="w-3 h-3 text-amber-700" />
                                <span>Dilip Enterprises Message:</span>
                              </div>
                              <p className="text-amber-900 font-medium">{c.ownerInstructions}</p>
                            </div>
                          )}

                          {/* Technician Diagnosis / Resolution Report */}
                          {(c.rootCause || c.partsReplaced || c.resolutionNotes) && (
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                              <div className="font-bold text-slate-900 flex items-center gap-1">
                                <Wrench className="w-3 h-3 text-blue-600" />
                                <span>Technician Service Report:</span>
                              </div>
                              {c.rootCause && (
                                <div className="text-[11px] text-slate-700">
                                  <span className="font-semibold">Fault Diagnosed: </span>
                                  {c.rootCause}
                                </div>
                              )}
                              {c.partsReplaced && (
                                <div className="text-[11px] text-slate-700">
                                  <span className="font-semibold">Parts Replaced / Adjusted: </span>
                                  {c.partsReplaced}
                                </div>
                              )}
                              {c.resolutionNotes && (
                                <div className="text-[11px] text-emerald-800 font-medium pt-1 border-t border-slate-200">
                                  <span className="font-bold">Resolution: </span>
                                  {c.resolutionNotes}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Response Time & Assignment Meta */}
                          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                            <div>
                              <span>Assigned to: </span>
                              <strong className="text-slate-800">{c.assignedTo}</strong>
                            </div>
                            <div className={`px-2 py-0.5 rounded border font-semibold ${lag.delayClass}`}>
                              {lag.text}
                            </div>
                          </div>

                          {/* Action Buttons with 1-Click Complete */}
                          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setComplaintToEdit(c);
                                  setIsNewComplaintOpen(true);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer"
                                title="Edit ticket or update details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              {currentUser.role === 'owner' && (
                                <button
                                  onClick={() => handleDeleteComplaint(c.id)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-1.5 rounded-lg cursor-pointer"
                                  title="Delete ticket"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* 1-Click Quick Complete Button */}
                              <button
                                onClick={() => handleQuickCompleteComplaint(c.id)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-all"
                                title="Mark this complaint as completed (resolves and closes ticket)"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Mark Compleated</span>
                              </button>

                              <button
                                onClick={() => setSelectedComplaintForReport(c)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1a3882] hover:bg-blue-900 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                                <span>Report</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredComplaints.length === 0 && (
                    <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                      No active maintenance complaints or service tickets found matching your search.
                    </div>
                  )}
                </div>
              </div>
          )}

          {/* ================= TAB 8: INTERNAL MESSAGING & CHAT ================= */}
          {activeTab === 'messages' && (
            <div className="max-w-7xl mx-auto h-[calc(100vh-100px)]">
              <CrmMessagesView
                currentUser={currentUser}
                staffUsers={users}
                messages={chatMessages}
                onSendMessage={handleSendChatMessage}
                onMarkMessagesAsRead={handleMarkMessagesAsRead}
              />
            </div>
          )}

          {/* ================= TAB 9: TASK WORKFLOW TEMPLATES & 2-STEP FLOWCHART ================= */}
          {activeTab === 'task-templates' && (
            <div className="max-w-7xl mx-auto">
              <TaskTemplatesView
                currentUser={currentUser}
                staffUsers={users}
                templates={taskWorkflowTemplates}
                leadWorkflows={visibleLeadWorkflows}
                onOpenAddTemplate={() => setIsAddTaskTemplateModalOpen(true)}
                onDeleteTemplate={handleDeleteWorkflowTemplate}
                onDeleteLeadWorkflow={handleDeleteLeadWorkflow}
                onUpdateLeadWorkflow={handleUpdateLeadWorkflow}
                onUpdateTemplate={handleUpdateWorkflowTemplate}
                onRecordAudit={(action, details) => recordAuditEvent(currentUser, action as any, details)}
                onSendNotification={handleCreateDirectiveNotification}
                ownerDirectives={ownerDirectives}
                userDirectives={userDirectives}
              />
            </div>
          )}
        </main>

        {/* ================= MOBILE BOTTOM NAVIGATION BAR (md:hidden) ================= */}
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white flex items-center justify-around py-2 px-1 shadow-2xl safe-area-inset-bottom"
        >
          {/* 1. Dashboard (Owner) / Tasks (Staff) */}
          {currentUser.role === 'owner' ? (
            <button
              onClick={() => {
                playActionClickSound();
                setActiveTab('dashboard');
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-semibold truncate">Dashboard</span>
            </button>
          ) : (
            <button
              onClick={() => {
                playActionClickSound();
                setActiveTab('tasks');
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg relative transition-colors cursor-pointer ${
                activeTab === 'tasks' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Activity className="w-5 h-5" />
                {visibleTasks.length > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded-full">
                    {visibleTasks.length > 99 ? '99+' : visibleTasks.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold truncate">My Tasks</span>
            </button>
          )}

          {/* 2. Tasks / Leads (for Owner) or Notifications (for Staff) */}
          {currentUser.role === 'owner' ? (
            <button
              onClick={() => {
                playActionClickSound();
                setActiveTab('tasks');
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg relative transition-colors cursor-pointer ${
                activeTab === 'tasks' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Activity className="w-5 h-5" />
                {visibleTasks.length > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded-full">
                    {visibleTasks.length > 99 ? '99+' : visibleTasks.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold truncate">Leads</span>
            </button>
          ) : (
            <button
              onClick={() => {
                playActionClickSound();
                handleOpenUserNotificationsTab();
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg relative transition-colors cursor-pointer ${
                activeTab === 'notifications' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Bell className="w-5 h-5" />
                {unreadUserDirectivesCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-600 text-white text-[9px] font-black px-1 rounded-full animate-pulse">
                    {unreadUserDirectivesCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold truncate">Alerts</span>
            </button>
          )}

          {/* 3. Complaints */}
          <button
            onClick={() => {
              playActionClickSound();
              setActiveTab('complaints');
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg relative transition-colors cursor-pointer ${
              activeTab === 'complaints' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <AlertCircle className="w-5 h-5" />
              {availableComplaints.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black px-1 rounded-full">
                  {availableComplaints.length > 99 ? '99+' : availableComplaints.length}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-semibold truncate">Complaints</span>
          </button>

          {/* 4. Chat / Messages */}
          <button
            onClick={() => {
              playActionClickSound();
              setActiveTab('messages');
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg relative transition-colors cursor-pointer ${
              activeTab === 'messages' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              {totalUnreadChatCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black px-1 rounded-full animate-pulse">
                  {totalUnreadChatCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-semibold truncate">Chat</span>
          </button>

          {/* 5. More / Menu Drawer Toggle */}
          <button
            onClick={() => {
              playActionClickSound();
              setMobileDrawerOpen(true);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer ${
              mobileDrawerOpen ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-semibold truncate">Menu</span>
          </button>
        </nav>
      </div>

      {/* ================= MODAL: ADD NEW TASK ================= */}
      {isNewTaskOpen && (
        <NewTaskModal
          isOpen={isNewTaskOpen}
          onClose={() => setIsNewTaskOpen(false)}
          staffUsers={users}
          currentUser={currentUser}
          onCreateTask={handleCreateTask}
          businesses={businesses}
          activeBusinessId={activeBusinessId}
          taskWorkflowTemplates={taskWorkflowTemplates}
        />
      )}

      {/* ================= MODALS: MULTI-BUSINESS TEMPLATES ================= */}
      {isAddBusinessOpen && (
        <AddBusinessModal
          isOpen={isAddBusinessOpen}
          onClose={() => setIsAddBusinessOpen(false)}
          onAddBusiness={handleAddBusiness}
          currentOwnerName={currentUser?.name}
        />
      )}

      {isManageBusinessOpen && activeBusiness && (
        <ManageBusinessModal
          isOpen={isManageBusinessOpen}
          onClose={() => setIsManageBusinessOpen(false)}
          business={activeBusiness}
          totalBusinessesCount={businesses.length}
          onUpdateBusiness={handleUpdateBusiness}
          onDeleteBusiness={handleDeleteBusiness}
        />
      )}

      {/* ================= MODAL: MANAGE USERS ================= */}
      {isManageUsersOpen && (
        <ManageUsersModal
          isOpen={isManageUsersOpen}
          onClose={() => setIsManageUsersOpen(false)}
          users={users}
          onAddUser={handleAddUser}
          onUpdateUserPassword={handleUpdateUserPassword}
          onToggleUserStatus={handleToggleUserStatus}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {/* ================= MODAL: REGISTER / EDIT COMPLAINT ================= */}
      {isNewComplaintOpen && currentUser && (
        <ComplaintModal
          isOpen={isNewComplaintOpen}
          onClose={() => {
            setIsNewComplaintOpen(false);
            setComplaintToEdit(null);
          }}
          staffUsers={users}
          currentUser={currentUser}
          complaintToEdit={complaintToEdit}
          userTasks={tasks}
          onSaveComplaint={handleSaveComplaint}
        />
      )}

      {/* ================= MODAL: COMPLAINT SERVICE REPORT ================= */}
      {selectedComplaintForReport && (
        <ComplaintServiceReportModal
          isOpen={!!selectedComplaintForReport}
          onClose={() => setSelectedComplaintForReport(null)}
          complaint={selectedComplaintForReport}
          currentUser={currentUser}
          onUpdateComplaint={handleUpdateComplaintStatusAndReport}
        />
      )}

      {/* ================= MODAL: WHATSAPP NOTIFICATION & TEMPLATES ================= */}
      {isWhatsAppModalOpen && taskForWhatsApp && (
        <WhatsAppTemplatesModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => {
            setIsWhatsAppModalOpen(false);
            setTaskForWhatsApp(null);
          }}
          task={taskForWhatsApp}
        />
      )}

      {/* ================= MODAL: EDIT TASK / PROJECT ================= */}
      {isEditTaskModalOpen && taskToEdit && (
        <EditTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setTaskToEdit(null);
          }}
          task={taskToEdit}
          users={users}
          currentUser={currentUser}
          onSave={handleSaveEditedTask}
        />
      )}

      {/* ================= MODAL: DELETE TASK CONFIRMATION ================= */}
      {isDeleteTaskModalOpen && taskToDelete && (
        <DeleteConfirmModal
          isOpen={isDeleteTaskModalOpen}
          onClose={() => {
            setIsDeleteTaskModalOpen(false);
            setTaskToDelete(null);
          }}
          title="Delete Task Confirmation"
          itemCode={taskToDelete.taskCode}
          itemDescription={`Are you sure you want to delete task "${taskToDelete.title || taskToDelete.customerName}"?`}
          onConfirmDelete={handleConfirmDeleteTask}
        />
      )}

      {/* ================= MODAL: SOP CHECKLIST ================= */}
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
              {selectedTemplate.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-[#1a3882] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 font-medium leading-relaxed">{step}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-right">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 bg-[#1a3882] text-white rounded-lg text-xs font-bold hover:bg-blue-900 cursor-pointer"
              >
                Close SOP Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: STATUS DOWNLOAD CHOICE (EXCEL & PDF) ================= */}
      {downloadModalStatus && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1a3882] to-[#24499d] p-5 text-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl shadow-xs">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    Download {getStatusLabel(downloadModalStatus)} Projects
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    {getTasksByStatus(downloadModalStatus).length} {getTasksByStatus(downloadModalStatus).length === 1 ? 'project' : 'projects'} available to export
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDownloadModalStatus(null)}
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-slate-700 flex items-center justify-between">
                <span className="font-semibold">Selected Status Category:</span>
                <span className="font-black uppercase text-[#1a3882] bg-white px-2.5 py-1 rounded-md border border-blue-200 shadow-2xs">
                  {getStatusLabel(downloadModalStatus)}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Choose the desired format to download your project records:
              </p>

              {/* Option 1: Excel */}
              <button
                onClick={() => {
                  playSuccessSound();
                  exportTasksToExcel(getTasksByStatus(downloadModalStatus), downloadModalStatus);
                  setDownloadModalStatus(null);
                }}
                className="w-full text-left p-3.5 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-500 transition-all cursor-pointer flex items-center gap-3.5 group shadow-xs hover:shadow-md"
              >
                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-emerald-950">
                      Download Excel (.xlsx)
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded uppercase">
                      Spreadsheet
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Formatted worksheet with Customer details, Contact, Location, Capacity (kW), Assigned Engineer, Priority & Remarks.
                  </p>
                </div>
              </button>

              {/* Option 2: PDF */}
              <button
                onClick={() => {
                  playSuccessSound();
                  exportTasksToPDF(getTasksByStatus(downloadModalStatus), downloadModalStatus);
                  setDownloadModalStatus(null);
                }}
                className="w-full text-left p-3.5 rounded-xl border-2 border-rose-200 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-500 transition-all cursor-pointer flex items-center gap-3.5 group shadow-xs hover:shadow-md"
              >
                <div className="p-3 bg-rose-600 text-white rounded-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-rose-950">
                      Download PDF Report (.pdf)
                    </span>
                    <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded uppercase">
                      Official PDF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Printable landscape document with Dilip Enterprises official letterhead, UPNEDA registration and styled tabular grid.
                  </p>
                </div>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setDownloadModalStatus(null)}
                className="text-xs text-slate-600 hover:text-slate-900 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Close Dialog
              </button>
              <button
                onClick={() => setDownloadModalStatus(null)}
                className="text-xs font-bold text-[#1a3882] hover:text-blue-950 underline cursor-pointer"
              >
                View filtered projects on screen &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CRM AUDIO & ALERT CONTROLS ================= */}
      <CrmAudioControlModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />

      {/* ================= MODAL: SOLAR QUOTATION & SUBSIDY GENERATOR ================= */}
      {isQuotationModalOpen && currentUser && (
        <SolarQuotationGeneratorModal
          isOpen={isQuotationModalOpen}
          onClose={() => setIsQuotationModalOpen(false)}
          currentUser={currentUser}
          onCreateTaskFromQuote={handleCreateTaskFromQuotation}
        />
      )}

      {/* ================= MODAL: PM SURYA GHAR WORKFLOW TRACKER ================= */}
      {taskForPmSuryaGhar && currentUser && (
        <PmSuryaGharStageModal
          isOpen={!!taskForPmSuryaGhar}
          onClose={() => setTaskForPmSuryaGhar(null)}
          task={taskForPmSuryaGhar}
          currentUser={currentUser}
          onSaveStage={handleSavePmSuryaGharStage}
        />
      )}

      {/* ================= MODAL: SITE TECHNICAL FEASIBILITY AUDIT ================= */}
      {taskForFeasibility && currentUser && (
        <SolarFeasibilityModal
          isOpen={!!taskForFeasibility}
          onClose={() => setTaskForFeasibility(null)}
          task={taskForFeasibility}
          currentUser={currentUser}
          onSaveFeasibility={handleSaveFeasibility}
        />
      )}

      {/* ================= MODAL: SOLAR EQUIPMENT BOM & SERIAL NUMBERS ================= */}
      {taskForEquipmentBom && currentUser && (
        <SolarEquipmentBomModal
          isOpen={!!taskForEquipmentBom}
          onClose={() => setTaskForEquipmentBom(null)}
          task={taskForEquipmentBom}
          currentUser={currentUser}
          onSaveBOM={handleSaveEquipmentBom}
        />
      )}

      {/* ================= MODAL: ADD TASK WORKFLOW TEMPLATE ================= */}
      {isAddTaskTemplateModalOpen && (
        <AddTaskTemplateModal
          isOpen={isAddTaskTemplateModalOpen}
          onClose={() => setIsAddTaskTemplateModalOpen(false)}
          staffUsers={users}
          onSaveTemplate={handleSaveWorkflowTemplate}
        />
      )}

      {/* ================= MODAL: REAL-TIME CLOUD SYNC & BACKUP ================= */}
      {isCloudSyncModalOpen && (
        <CloudSyncBackupModal
          isOpen={isCloudSyncModalOpen}
          onClose={() => setIsCloudSyncModalOpen(false)}
          currentUser={currentUser}
          tasks={tasks}
          complaints={complaints}
          users={users}
          chatMessages={chatMessages}
          auditLogs={auditLogs}
          directives={ownerDirectives}
          workflowTemplates={taskWorkflowTemplates}
          leadWorkflows={activeLeadWorkflows}
          businesses={businesses}
          onRestoreSnapshot={(snapshotData) => {
            if (!snapshotData || !snapshotData.data) return;
            const {
              tasks: rTasks,
              complaints: rComplaints,
              users: rUsers,
              chatMessages: rChat,
              auditLogs: rLogs,
              directives: rDirs,
              workflowTemplates: rTemplates,
              leadWorkflows: rWorkflows,
              businesses: rBiz,
            } = snapshotData.data;

            if (Array.isArray(rTasks)) {
              setTasks(rTasks);
              rTasks.forEach((t) => saveTaskToFirestore(t));
            }
            if (Array.isArray(rComplaints)) {
              const activeOnly = rComplaints.filter(
                (c: any) =>
                  c.status !== 'compleated' && c.status !== 'resolved' && c.status !== 'closed'
              );
              setComplaints(activeOnly);
              activeOnly.forEach((c: any) => saveComplaintToFirestore(c));
            }
            if (Array.isArray(rUsers)) {
              setUsers(rUsers);
              rUsers.forEach((u) => saveUserToFirestore(u));
            }
            if (Array.isArray(rChat)) {
              setChatMessages(rChat);
            }
            if (Array.isArray(rLogs)) {
              setAuditLogs(rLogs);
            }
            if (Array.isArray(rDirs)) {
              setOwnerDirectives(rDirs);
              rDirs.forEach((d) => saveDirectiveToFirestore(d));
            }
            if (Array.isArray(rTemplates)) {
              setTaskWorkflowTemplates(rTemplates);
              rTemplates.forEach((wt) => saveWorkflowTemplateToFirestore(wt));
            }
            if (Array.isArray(rWorkflows)) {
              setActiveLeadWorkflows(rWorkflows);
              rWorkflows.forEach((lw) => saveLeadWorkflowToFirestore(lw));
            }
            if (Array.isArray(rBiz)) {
              setBusinesses(rBiz);
              rBiz.forEach((b) => saveBusinessToFirestore(b));
            }
            if (currentUser) {
              recordAuditEvent(
                currentUser,
                'TASK_UPDATED',
                'Owner restored complete CRM state from a verified Cloud Backup Snapshot'
              );
            }
          }}
        />
      )}
    </div>
  );
};
