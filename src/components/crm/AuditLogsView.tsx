import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  Monitor,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Download,
  Zap,
  Calendar,
  Activity,
  Timer,
  Info,
  ChevronRight,
  X,
  Phone,
  Mail,
  Shield,
  Layers,
  FileSpreadsheet,
  Check,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { CrmUser, UserAuditLog, UserSession } from '../../data/crmData';
import {
  buildSessionsFromAuditLogs,
  computeUsersLiveStatus,
  computeUserDirectorySummary,
  UserDirectorySummary,
  formatDuration,
  formatDateTime,
  formatRelativeTime,
} from '../../utils/sessionTracker';

interface AuditLogsViewProps {
  logs: UserAuditLog[];
  users?: CrmUser[];
  currentUser?: CrmUser | null;
  idleSeconds?: number;
  onSimulateInactivityTimeout?: () => void;
  onForceLogoutUser?: (userId: string) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs = [],
  users = [],
  currentUser = null,
  idleSeconds = 0,
  onSimulateInactivityTimeout,
  onForceLogoutUser,
}) => {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeUsers = Array.isArray(users) ? users : [];

  // Main subtab: 'directory' (Default: 1 Row Per User), 'sessions' (Chronological Sessions), 'all-logs' (Raw Events)
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'sessions' | 'all-logs'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'employee'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ONLINE' | 'OFFLINE'>('all');
  const [sessionStatusFilter, setSessionStatusFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState('all');

  // Selected User for Deep Audit History Modal (When, Why, How)
  const [selectedUserSummary, setSelectedUserSummary] = useState<UserDirectorySummary | null>(null);
  const [modalFilter, setModalFilter] = useState<'all' | 'sessions' | 'actions'>('all');

  // 1. Build structured sessions from audit logs (strictly online for currentUser only)
  const sessions = useMemo(() => {
    return buildSessionsFromAuditLogs(safeLogs, currentUser);
  }, [safeLogs, currentUser]);

  // 2. Aggregate unique user directory summary (1 Row Per User with Last Activity & Full Audit Trail)
  const userDirectory = useMemo(() => {
    return computeUserDirectorySummary(safeUsers, safeLogs, sessions, currentUser);
  }, [safeUsers, safeLogs, sessions, currentUser]);

  // Keep selected modal summary in sync if logs update
  const currentModalSummary = useMemo(() => {
    if (!selectedUserSummary) return null;
    return userDirectory.find((u) => u.user.id === selectedUserSummary.user.id) || selectedUserSummary;
  }, [userDirectory, selectedUserSummary]);

  // 3. Filtered User Directory (1 Row Per User)
  const filteredDirectory = useMemo(() => {
    return userDirectory.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        item.user.name.toLowerCase().includes(q) ||
        item.user.username.toLowerCase().includes(q) ||
        (item.user.roleTitle || '').toLowerCase().includes(q) ||
        (item.lastActivity?.details || '').toLowerCase().includes(q) ||
        (item.lastActivity?.ipAddress || '').includes(q);

      const matchesRole = roleFilter === 'all' || item.user.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'ONLINE' && item.isCurrentlyOnline) ||
        (statusFilter === 'OFFLINE' && !item.isCurrentlyOnline);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [userDirectory, searchTerm, roleFilter, statusFilter]);

  // 4. Filtered Historical Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((sess) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        sess.userName.toLowerCase().includes(q) ||
        sess.username.toLowerCase().includes(q) ||
        (sess.exitReason || '').toLowerCase().includes(q) ||
        sess.ipAddress.includes(q);

      const matchesStatus = sessionStatusFilter === 'all' || sess.status === sessionStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchTerm, sessionStatusFilter]);

  // 5. Filtered Raw Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        log.userName.toLowerCase().includes(q) ||
        log.username.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.ipAddress.includes(q);

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [logs, searchTerm, actionFilter]);

  // KPI Metrics
  const onlineUsersCount = userDirectory.filter((u) => u.isCurrentlyOnline).length;
  const offlineUsersCount = userDirectory.filter((u) => !u.isCurrentlyOnline).length;
  const autoLogoutCount = sessions.filter((s) => s.status === 'AUTO_LOGOUT_5MIN_INACTIVITY').length;
  const manualLogoutCount = sessions.filter((s) => s.status === 'MANUAL_LOGOUT').length;

  // Export CSV for User Directory
  const exportUserDirectoryCsv = () => {
    const headers = [
      'User Name',
      'Username',
      'Role',
      'Live Status',
      'Active Duration',
      'Last Activity',
      'Last Activity Time',
      'Last Activity Details',
      'Total Logins',
      'Total Manual Logouts',
      'Total 5-Min Auto-Logouts',
      'Total Project Actions',
      'Last IP Address',
    ];

    const rows = filteredDirectory.map((item) => [
      `"${item.user.name}"`,
      `"@${item.user.username}"`,
      `"${item.user.roleTitle || item.user.role}"`,
      `"${item.isCurrentlyOnline ? 'ONLINE' : 'OFFLINE'}"`,
      `"${item.activeDurationFormatted || 'N/A'}"`,
      `"${item.lastActivity?.actionLabel || 'N/A'}"`,
      `"${item.lastActivity?.formattedTime || 'N/A'}"`,
      `"${(item.lastActivity?.details || '').replace(/"/g, '""')}"`,
      item.totalLogins,
      item.totalManualLogouts,
      item.totalAutoLogouts,
      item.totalTaskActions,
      `"${item.lastActivity?.ipAddress || '122.162.148.24'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Dilip_Solar_User_Activity_Master_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export specific user's complete audit trail
  const exportSpecificUserCsv = (summary: UserDirectorySummary) => {
    const headers = [
      'Timestamp',
      'Action',
      'Why / Reason',
      'Details / How',
      'IP Address',
      'Device Info',
    ];

    const rows = summary.userLogs.map((log) => [
      `"${log.formattedTime || formatDateTime(log.timestamp)}"`,
      `"${log.action}"`,
      `"${
        log.action === 'LOGOUT'
          ? 'Manual logout performed by user'
          : log.action === 'AUTO_LOGOUT_5MIN_INACTIVITY'
          ? 'Auto-logout after 5 minutes of inactivity'
          : log.action === 'LOGIN'
          ? 'New session login'
          : 'Task / system activity'
      }"`,
      `"${log.details.replace(/"/g, '""')}"`,
      `"${log.ipAddress || '122.162.148.24'}"`,
      `"${log.deviceInfo || 'Desktop / Laptop'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Audit_History_${summary.user.username}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeStyle = (action: UserAuditLog['action']) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'LOGOUT':
        return 'bg-slate-100 text-slate-800 border-slate-300 font-semibold';
      case 'AUTO_LOGOUT_5MIN_INACTIVITY':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-black';
      case 'FORCE_LOGOUT':
        return 'bg-red-100 text-red-950 border-red-400 font-black';
      case 'STATUS_CHANGE':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
      case 'TASK_ASSIGNED':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'TASK_UPDATED':
        return 'bg-sky-100 text-sky-900 border-sky-300 font-semibold';
      case 'MESSAGE_SENT':
        return 'bg-violet-100 text-violet-900 border-violet-300 font-bold';
      case 'DIRECTIVE_DISPATCHED':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold';
      case 'COMPLAINT_REGISTERED':
        return 'bg-orange-100 text-orange-900 border-orange-300 font-bold';
      case 'COMPLAINT_RESOLVED':
        return 'bg-teal-100 text-teal-900 border-teal-300 font-bold';
      case 'LEAD_CREATED':
        return 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300 font-bold';
      case 'REMARK_ADDED':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'USER_CREATED':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* 5-Minute Inactivity, Permanent Owner Session & 2-Year Retention Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-blue-50 to-emerald-50 border-2 border-blue-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#1a3882] text-white rounded-xl shadow-xs shrink-0">
              <Timer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Dilip Solar CRM User Activity & Accurate Presence Management
                </h3>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-700" />
                  OWNER PANEL: ALWAYS OPEN (MANUAL LOGOUT ONLY)
                </span>
                <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  EMPLOYEES: 5-MIN INACTIVITY AUTO-LOGOUT
                </span>
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  2-YEAR ACTIVITY RETENTION (730 DAYS ARCHIVE)
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Staff presence reflects active authenticated sessions. User status updates to <strong>Offline</strong> immediately upon logout or session expiry. All activities (logins, logouts, status updates, internal messaging with exact timestamps) are preserved for 2 years.
              </p>
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              {currentUser.role === 'owner' ? (
                <div className="bg-amber-100/90 border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-right">
                  <div className="text-[10px] text-amber-900 font-bold uppercase">Owner Session:</div>
                  <div className="font-sans font-black text-emerald-800 text-xs flex items-center gap-1 justify-end">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Always Open</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-right">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Current Idle Time:</div>
                  <div className="font-mono font-black text-blue-900 text-xs">
                    {idleSeconds}s / 300s
                    <span className="text-[10px] font-normal text-slate-500 ml-1">
                      ({Math.max(0, 300 - idleSeconds)}s left)
                    </span>
                  </div>
                </div>
              )}

              {onSimulateInactivityTimeout && (
                <button
                  onClick={onSimulateInactivityTimeout}
                  title="Test 5-Minute Inactivity Auto-Logout immediately"
                  className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold px-3 py-2 rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Test 5-Min Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards (Accurate Real-Time CRM Stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Currently Online */}
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-800">Currently Online</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{onlineUsersCount}</div>
          <p className="text-[11px] text-emerald-900/80 mt-0.5">Active users currently signed in</p>
        </div>

        {/* Currently Offline */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500">Currently Offline</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
          </div>
          <div className="text-2xl font-black text-slate-700 mt-1">{offlineUsersCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Logged out or inactive members</p>
        </div>

        {/* 5-Min Auto-Logouts */}
        <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-700">5-Min Auto-Logouts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">{autoLogoutCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Automatic security timeout logouts</p>
        </div>

        {/* Manual Logouts */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500">Manual Logouts</span>
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-700 mt-1">{manualLogoutCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Manual user logouts</p>
        </div>
      </div>

      {/* Main View Header & Subtabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1a3882]" />
            <span>Master User Activity & Presence Hub (Owner View)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Each user is listed with their latest activity. Click any row to view complete activity and session history.
          </p>
        </div>

        {/* Subtabs Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'directory'
                ? 'bg-[#1a3882] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Users Directory (1 Row Per User) ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sessions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'sessions'
                ? 'bg-[#1a3882] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>All Historical Sessions ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('all-logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'all-logs'
                ? 'bg-[#1a3882] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Raw Event Stream ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* Filter & Action Controls Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search user, action, exit reason, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Directory Filter (Subtab 1) */}
          {activeSubTab === 'directory' && (
            <>
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
                >
                  <option value="all">All Live Statuses</option>
                  <option value="ONLINE">🟢 Active Now Only</option>
                  <option value="OFFLINE">⚪ Offline Only</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="owner">Owner Only</option>
                  <option value="employee">Staff Only</option>
                </select>
              </div>
            </>
          )}

          {/* Sessions Filter (Subtab 2) */}
          {activeSubTab === 'sessions' && (
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sessionStatusFilter}
                onChange={(e) => setSessionStatusFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="ONLINE">🟢 Active Now / Online</option>
                <option value="MANUAL_LOGOUT">⚪ Manual Logouts</option>
                <option value="AUTO_LOGOUT_5MIN_INACTIVITY">⚠️ 5-Min Inactivity Auto-Logouts</option>
              </select>
            </div>
          )}

          {/* Raw Log Filter (Subtab 3) */}
          {activeSubTab === 'all-logs' && (
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
              >
                <option value="all">All Action Types</option>
                <option value="LOGIN">Logins</option>
                <option value="LOGOUT">Manual Logouts</option>
                <option value="AUTO_LOGOUT_5MIN_INACTIVITY">5-Min Inactivity Auto-Logouts</option>
                <option value="STATUS_CHANGE">Task Status Updates</option>
                <option value="TASK_ASSIGNED">Tasks Assigned</option>
                <option value="USER_CREATED">Users Created</option>
              </select>
            </div>
          )}
        </div>

        {/* Export CSV Button */}
        <button
          onClick={exportUserDirectoryCsv}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Master CSV</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: PRIMARY UNIQUE USER DIRECTORY TABLE (HER USER KA NAAM 1 BAAR) */}
      {/* ========================================================================= */}
      {activeSubTab === 'directory' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                👥 Registered Users & Realtime Activity Master ({filteredDirectory.length})
              </span>
              <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                1 Row Per User • Click any row to inspect full history
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              💡 Click any user to view complete audit trail
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#1a3882] text-white">
                  <th className="py-3 px-3.5 font-semibold">User</th>
                  <th className="py-3 px-3.5 font-semibold">Live Status</th>
                  <th className="py-3 px-3.5 font-semibold">
                    <div className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-amber-300" />
                      <span>Last Activity</span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5 font-semibold">Audit Stats</th>
                  <th className="py-3 px-3.5 font-semibold">Last IP & Device</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDirectory.map((item, idx) => {
                  const isOnline = item.isCurrentlyOnline;
                  const isOwner = item.user.role === 'owner';
                  const lastAct = item.lastActivity;

                  return (
                    <tr
                      key={item.user.id}
                      onClick={() => setSelectedUserSummary(item)}
                      className={`cursor-pointer transition-colors ${
                        isOnline
                          ? 'bg-emerald-50/60 hover:bg-emerald-100/70'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-blue-50/60'
                          : 'bg-slate-50/70 hover:bg-blue-50/60'
                      }`}
                    >
                      {/* 1. User Profile */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                                isOwner
                                  ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300'
                                  : 'bg-[#1a3882] text-white'
                              }`}
                            >
                              {item.user.name.charAt(0)}
                            </div>
                            {/* Live status dot on avatar */}
                            <span
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            ></span>
                          </div>

                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                              <span>{item.user.name}</span>
                              {isOwner && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded">
                                  OWNER
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {item.user.roleTitle || (isOwner ? 'Master Administrator' : 'Staff')}
                            </div>
                            <div className="text-[10px] font-mono text-blue-700">
                              @{item.user.username} {item.user.phone && `• ${item.user.phone}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Live Status Badge */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {isOnline ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 border border-emerald-400 font-black px-2.5 py-0.5 rounded-full text-[11px] shadow-xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>ACTIVE NOW</span>
                            </span>
                            <div className="text-[10px] text-emerald-800 font-mono font-bold">
                              Duration: {item.activeDurationFormatted || '0s'}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-300 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>OFFLINE</span>
                            </span>
                            <div className="text-[10px] text-slate-500">
                              {item.lastLogoutFormatted
                                ? `Last logout: ${item.lastLogoutFormatted.split(',')[1] || item.lastLogoutFormatted}`
                                : 'Inactive'}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 3. Last Activity (Name k front per dikhegi) */}
                      <td className="py-3.5 px-3.5 max-w-xs sm:max-w-md">
                        {lastAct ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] border uppercase ${getActionBadgeStyle(
                                  lastAct.action
                                )}`}
                              >
                                {lastAct.action === 'AUTO_LOGOUT_5MIN_INACTIVITY'
                                  ? '⏱ 5-MIN INACTIVITY LOGOUT'
                                  : lastAct.actionLabel}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 font-semibold">
                                {lastAct.formattedTime}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({lastAct.relativeTime})
                              </span>
                            </div>

                            <div className="text-xs text-slate-800 font-medium leading-snug line-clamp-2">
                              {lastAct.details}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No activity recorded</span>
                        )}
                      </td>

                      {/* 4. Audit Summary Stats */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="font-semibold text-slate-800">
                            <span className="text-emerald-700 font-bold">{item.totalLogins}</span> Logins •{' '}
                            <span className="text-slate-600">{item.totalManualLogouts}</span> Logouts
                          </div>
                          {item.totalAutoLogouts > 0 && (
                            <div className="text-rose-700 font-bold text-[10px] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{item.totalAutoLogouts} Timeouts (5-min)</span>
                            </div>
                          )}
                          <div className="text-blue-700 text-[10px]">
                            {item.totalTaskActions} Task Actions • {item.totalSessions} Sessions
                          </div>
                        </div>
                      </td>

                      {/* 5. Last IP & Device */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-500">
                        <div className="font-mono text-slate-800 text-[11px] font-semibold">
                          {lastAct?.ipAddress || '122.162.148.24'}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                          <Monitor className="w-3 h-3 text-slate-400" />
                          <span>{lastAct?.deviceInfo || 'Desktop / Laptop'}</span>
                        </div>
                      </td>

                      {/* 6. Action Button */}
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUserSummary(item);
                            }}
                            className="inline-flex items-center gap-1 bg-[#1a3882] hover:bg-blue-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                          >
                            <span>View History</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {currentUser?.role === 'owner' && isOnline && item.user.id !== currentUser.id && onForceLogoutUser && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to force logout ${item.user.name}?`)) {
                                  onForceLogoutUser(item.user.id);
                                }
                              }}
                              title="Force Logout User"
                              className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredDirectory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      No user records found matching the search filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: ALL HISTORICAL SESSIONS TABLE (CHRONOLOGICAL) */}
      {/* ========================================================================= */}
      {activeSubTab === 'sessions' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#1a3882] text-white">
                  <th className="py-3 px-3.5 font-semibold">User (Staff / Owner)</th>
                  <th className="py-3 px-3.5 font-semibold">
                    <div className="flex items-center gap-1">
                      <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Login Time</span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5 font-semibold">
                    <div className="flex items-center gap-1">
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Logout Time</span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5 font-semibold">
                    <div className="flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5 text-amber-300" />
                      <span>Duration</span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5 font-semibold">Status & Exit Reason</th>
                  <th className="py-3 px-3.5 font-semibold">IP & Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSessions.map((sess, idx) => {
                  const isAutoLogout = sess.status === 'AUTO_LOGOUT_5MIN_INACTIVITY';
                  const isOnline = sess.status === 'ONLINE';

                  return (
                    <tr
                      key={sess.id || idx}
                      className={
                        isAutoLogout
                          ? 'bg-rose-50/70 hover:bg-rose-100/70 transition-colors'
                          : isOnline
                          ? 'bg-emerald-50/40 hover:bg-emerald-100/50 transition-colors'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-blue-50/40 transition-colors'
                          : 'bg-slate-50/60 hover:bg-blue-50/40 transition-colors'
                      }
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              sess.userRole === 'owner'
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-[#1a3882] text-white'
                            }`}
                          >
                            {sess.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{sess.userName}</span>
                              {sess.userRole === 'owner' && (
                                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.2 rounded">
                                  OWNER
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-blue-700">@{sess.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Login Time */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <LogIn className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                            {sess.loginFormatted}
                          </span>
                        </div>
                      </td>

                      {/* Logout Time */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {isOnline ? (
                          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span>ACTIVE NOW</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                            <LogOut
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isAutoLogout ? 'text-rose-600' : 'text-slate-600'
                              }`}
                            />
                            <span
                              className={`px-2 py-0.5 rounded border font-mono ${
                                isAutoLogout
                                  ? 'bg-rose-100 text-rose-950 border-rose-300 font-bold'
                                  : 'bg-slate-100 text-slate-800 border-slate-200'
                              }`}
                            >
                              {sess.logoutFormatted}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Session Duration */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {sess.durationFormatted}
                        </div>
                      </td>

                      {/* Status & Reason */}
                      <td className="py-3.5 px-3.5">
                        {isAutoLogout ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-rose-600 text-white font-black text-[10px] uppercase shadow-xs">
                              <AlertTriangle className="w-3 h-3" />
                              <span>⏱️ 5-MIN INACTIVITY AUTO-LOGOUT</span>
                            </span>
                            <div className="text-[11px] text-rose-900 font-medium leading-tight">
                              Automatically logged out due to 5 minutes of inactivity.
                            </div>
                          </div>
                        ) : isOnline ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ONLINE / ACTIVE SESSION</span>
                            </span>
                            <div className="text-[11px] text-emerald-900">
                              Currently active session in progress.
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px] uppercase border border-slate-300">
                              <LogOut className="w-3 h-3" />
                              <span>MANUAL LOGOUT</span>
                            </span>
                            <div className="text-[11px] text-slate-600">
                              Manually logged out by user.
                            </div>
                          </div>
                        )}
                      </td>

                      {/* IP & Device */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-500">
                        <div className="font-mono text-slate-800 text-[11px] font-semibold">{sess.ipAddress}</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                          <Monitor className="w-3 h-3" />
                          <span>{sess.deviceInfo}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredSessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      No user session records found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: RAW DETAILED AUDIT TRAIL LOGS */}
      {/* ========================================================================= */}
      {activeSubTab === 'all-logs' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#1a3882] text-white">
                  <th className="py-3 px-3.5 font-semibold">User (Staff / Owner)</th>
                  <th className="py-3 px-3.5 font-semibold">Action Performed</th>
                  <th className="py-3 px-3.5 font-semibold">Activity Details / Notes</th>
                  <th className="py-3 px-3.5 font-semibold">Time & Date</th>
                  <th className="py-3 px-3.5 font-semibold">IP & Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log, idx) => (
                  <tr
                    key={log.id}
                    className={
                      log.action === 'AUTO_LOGOUT_5MIN_INACTIVITY'
                        ? 'bg-rose-50/70 hover:bg-rose-100/60 transition-colors'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-blue-50/40 transition-colors'
                        : 'bg-slate-50/60 hover:bg-blue-50/40 transition-colors'
                    }
                  >
                    <td className="py-3 px-3.5 font-semibold">
                      <div className="flex items-center gap-1.5 text-slate-900">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.userName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-blue-700 block">@{log.username}</span>
                    </td>

                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] border uppercase ${getActionBadgeStyle(
                          log.action
                        )}`}
                      >
                        {log.action === 'AUTO_LOGOUT_5MIN_INACTIVITY'
                          ? '⏱ 5-MIN INACTIVITY LOGOUT'
                          : log.action}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-slate-700 max-w-xs sm:max-w-md">
                      <div className="leading-snug">{log.details}</div>
                    </td>

                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-slate-800">{log.formattedTime}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                      <div className="font-mono text-slate-700">{log.ipAddress}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Monitor className="w-3 h-3" />
                        <span>{log.deviceInfo}</span>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                      No activity logs found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEEP AUDIT INSPECTOR MODAL: "US USER PER CLICK KARENGE TO KAB KYU KAISE SAB DIKHEGA" */}
      {/* ========================================================================= */}
      {currentModalSummary && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#1a3882] text-white p-4 sm:p-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-md ${
                    currentModalSummary.user.role === 'owner'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-white text-[#1a3882]'
                  }`}
                >
                  {currentModalSummary.user.name.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold">{currentModalSummary.user.name}</h3>
                    {currentModalSummary.user.role === 'owner' ? (
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded">
                        SUPER ADMIN / OWNER
                      </span>
                    ) : (
                      <span className="bg-blue-800 text-blue-100 text-[10px] font-bold px-2 py-0.5 rounded">
                        {currentModalSummary.user.roleTitle || 'Employee'}
                      </span>
                    )}

                    {currentModalSummary.isCurrentlyOnline ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        <span>ONLINE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        <span>OFFLINE</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-blue-200 mt-1 flex-wrap font-mono">
                    <span>@{currentModalSummary.user.username}</span>
                    {currentModalSummary.user.phone && (
                      <span className="flex items-center gap-1 font-sans">
                        <Phone className="w-3 h-3 text-blue-300" />
                        {currentModalSummary.user.phone}
                      </span>
                    )}
                    {currentModalSummary.user.email && (
                      <span className="flex items-center gap-1 font-sans">
                        <Mail className="w-3 h-3 text-blue-300" />
                        {currentModalSummary.user.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportSpecificUserCsv(currentModalSummary)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  title="Export this user's logs to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUserSummary(null)}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar for this User */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-100 border-b border-slate-200 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Logins</span>
                <span className="text-base font-black text-emerald-700">
                  {currentModalSummary.totalLogins}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Manual Logouts</span>
                <span className="text-base font-black text-slate-700">
                  {currentModalSummary.totalManualLogouts}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">5-Min Auto-Logouts</span>
                <span className="text-base font-black text-rose-600">
                  {currentModalSummary.totalAutoLogouts}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Task Actions</span>
                <span className="text-base font-black text-blue-700">
                  {currentModalSummary.totalTaskActions}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Sessions</span>
                <span className="text-base font-black text-purple-700">
                  {currentModalSummary.totalSessions}
                </span>
              </div>
            </div>

            {/* Filter Tabs inside Modal */}
            <div className="px-4 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setModalFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    modalFilter === 'all'
                      ? 'bg-[#1a3882] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Activity Events ({currentModalSummary.userLogs.length})
                </button>

                <button
                  type="button"
                  onClick={() => setModalFilter('sessions')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    modalFilter === 'sessions'
                      ? 'bg-[#1a3882] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Sessions Only ({currentModalSummary.userSessions.length})
                </button>

                <button
                  type="button"
                  onClick={() => setModalFilter('actions')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    modalFilter === 'actions'
                      ? 'bg-[#1a3882] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Task Updates ({currentModalSummary.totalTaskActions})
                </button>
              </div>

              <span className="text-[11px] font-semibold text-slate-500">
                🕒 When • 🎯 Trigger / Reason • ⚙️ Details
              </span>
            </div>

            {/* Modal Body: Chronological Timeline of All Actions (Kab, Kyu, Kaise) */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50">
              {/* If SESSIONS VIEW is selected */}
              {modalFilter === 'sessions' ? (
                <div className="space-y-3">
                  {currentModalSummary.userSessions.map((sess, idx) => {
                    const isAuto = sess.status === 'AUTO_LOGOUT_5MIN_INACTIVITY';
                    const isLive = sess.status === 'ONLINE';

                    return (
                      <div
                        key={sess.id || idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isLive
                            ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-200'
                            : isAuto
                            ? 'bg-rose-50/80 border-rose-300'
                            : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              Session #{currentModalSummary.userSessions.length - idx}
                            </span>
                            {isLive ? (
                              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                                ONLINE / ACTIVE NOW
                              </span>
                            ) : isAuto ? (
                              <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                5-MIN INACTIVITY AUTO-LOGOUT
                              </span>
                            ) : (
                              <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                MANUAL LOGOUT
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                            <Timer className="w-3.5 h-3.5 text-amber-500" />
                            <span>Total Duration: {sess.durationFormatted}</span>
                          </div>
                        </div>

                        {/* Kab, Kyu, Kaise Breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 text-xs">
                          {/* 1. KAB (When) */}
                          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-blue-600" />
                              <span>Timestamp</span>
                            </span>
                            <div className="space-y-1 text-[11px]">
                              <div>
                                <span className="text-emerald-700 font-bold">Login:</span>{' '}
                                <span className="font-mono">{sess.loginFormatted}</span>
                              </div>
                              <div>
                                <span className="text-rose-700 font-bold">Logout:</span>{' '}
                                <span className="font-mono">{sess.logoutFormatted || 'Active'}</span>
                              </div>
                            </div>
                          </div>

                          {/* 2. KYU (Why / Exit Reason) */}
                          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Session Exit Reason</span>
                            </span>
                            <p className="text-[11px] font-semibold text-slate-800 leading-snug">
                              {sess.exitReason || 'Standard work session'}
                            </p>
                          </div>

                          {/* 3. KAISE (How / Device & IP) */}
                          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1 flex items-center gap-1">
                              <Monitor className="w-3 h-3 text-slate-600" />
                              <span>Device & Network</span>
                            </span>
                            <div className="space-y-0.5 text-[11px]">
                              <div className="font-mono text-slate-700">IP: {sess.ipAddress}</div>
                              <div className="text-slate-500">{sess.deviceInfo}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {currentModalSummary.userSessions.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs bg-white rounded-xl border border-slate-200">
                      No previous session records found for this user.
                    </div>
                  )}
                </div>
              ) : (
                /* ALL EVENTS OR TASK ACTIONS TIMELINE */
                <div className="space-y-2.5">
                  {(currentModalSummary.userLogs || [])
                    .filter((log) => {
                      if (modalFilter === 'actions') {
                        return (
                          log.action === 'STATUS_CHANGE' ||
                          log.action === 'TASK_ASSIGNED' ||
                          log.action === 'REMARK_ADDED'
                        );
                      }
                      return true;
                    })
                    .map((log) => {
                      const isLogout = log.action === 'LOGOUT';
                      const isAutoLogout = log.action === 'AUTO_LOGOUT_5MIN_INACTIVITY';
                      const isForceLogout = log.action === 'FORCE_LOGOUT';
                      const isLogin = log.action === 'LOGIN';
                      const isTaskChange = log.action === 'STATUS_CHANGE';
                      const isMessage = log.action === 'MESSAGE_SENT';
                      const isDirective = log.action === 'DIRECTIVE_DISPATCHED';
                      const isComplaint = log.action === 'COMPLAINT_REGISTERED' || log.action === 'COMPLAINT_RESOLVED';
                      const isLead = log.action === 'LEAD_CREATED';

                      // Determine Why (Trigger Reason)
                      let kyuExplanation = '';
                      if (isLogout) {
                        kyuExplanation = 'Manual logout performed by user from CRM portal.';
                      } else if (isAutoLogout) {
                        kyuExplanation =
                          'Security Policy: 5 minutes (300 seconds) of inactivity detected; automated session termination.';
                      } else if (isForceLogout) {
                        kyuExplanation = 'Owner administrative force logout applied from Owner Control Panel.';
                      } else if (isLogin) {
                        kyuExplanation =
                          'User entered valid credentials and started an active work session.';
                      } else if (isTaskChange) {
                        kyuExplanation =
                          'Task status updated according to solar project on-site progress.';
                      } else if (isMessage) {
                        kyuExplanation = log.targetUserName
                          ? `Internal communication dispatched directly to ${log.targetUserName}.`
                          : 'Internal CRM communication dispatched to team or owner.';
                      } else if (isDirective) {
                        kyuExplanation = 'Owner workflow directive assigned to staff member.';
                      } else if (isComplaint) {
                        kyuExplanation = 'Customer service grievance ticket handled and logged.';
                      } else if (isLead) {
                        kyuExplanation = 'New customer solar rooftop consultation lead registered.';
                      } else {
                        kyuExplanation = 'User action recorded for audit trail integrity.';
                      }

                      return (
                        <div
                          key={log.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isAutoLogout
                              ? 'bg-rose-50 border-rose-300'
                              : isLogout
                              ? 'bg-slate-100/80 border-slate-300'
                              : isLogin
                              ? 'bg-emerald-50/70 border-emerald-300'
                              : 'bg-white border-slate-200 shadow-xs'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded text-[10px] border uppercase ${getActionBadgeStyle(
                                  log.action
                                )}`}
                              >
                                {isAutoLogout ? '⏱ 5-MIN INACTIVITY AUTO-LOGOUT' : log.action}
                              </span>

                              <span className="font-mono text-slate-800 font-bold text-xs">
                                {log.formattedTime || formatDateTime(log.timestamp)}
                              </span>

                              <span className="text-[10px] text-slate-400">
                                ({formatRelativeTime(log.timestamp)})
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                              <span>IP: {log.ipAddress}</span>
                              <span>•</span>
                              <span>{log.deviceInfo}</span>
                            </div>
                          </div>

                          {/* Action Details & Reason Breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2.5 text-xs">
                            <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                                Action Details:
                              </span>
                              <p className="text-slate-900 font-medium leading-relaxed">
                                {log.details}
                              </p>
                            </div>

                            <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                                Trigger Reason:
                              </span>
                              <p className="text-slate-700 font-semibold leading-relaxed">
                                {kyuExplanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {currentModalSummary.userLogs.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs bg-white rounded-xl border border-slate-200">
                      No activity records available.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Displaying records for: <strong>{currentModalSummary.user.name}</strong> • Solar CRM System
              </div>

              <div className="flex items-center gap-2">
                {currentUser?.role === 'owner' &&
                  currentModalSummary.isCurrentlyOnline &&
                  currentModalSummary.user.id !== currentUser.id &&
                  onForceLogoutUser && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to force logout ${currentModalSummary.user.name}?`
                          )
                        ) {
                          onForceLogoutUser(currentModalSummary.user.id);
                        }
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Force Logout</span>
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() => setSelectedUserSummary(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
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
