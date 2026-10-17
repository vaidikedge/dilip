import { CrmUser, UserAuditLog, UserSession } from '../data/crmData';

const SESSIONS_STORAGE_KEY = 'dilip_crm_user_sessions_v3';

export function formatDuration(seconds: number): string {
  if (seconds < 0) seconds = 0;
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  const mins = Math.floor(seconds / 60);
  const remSecs = seconds % 60;
  if (mins < 60) {
    return remSecs > 0 ? `${mins}m ${remSecs}s` : `${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return isoString;
  }
}

/**
 * Format relative time (e.g., '2 mins ago', 'Just now')
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const diffSecs = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
    if (diffSecs < 45) return 'Just now';
    if (diffSecs < 60) return `${diffSecs} sec ago`;
    const mins = Math.floor(diffSecs / 60);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day(s) ago`;
  } catch (e) {
    return isoString;
  }
}

/**
 * Parses audit logs to reconstruct all user login/logout sessions chronologically.
 * Strictly guarantees that ONLY the currently active authenticated user can have status 'ONLINE'.
 * Any user who is not currently logged in is NEVER marked as ONLINE.
 */
export function buildSessionsFromAuditLogs(
  logs: UserAuditLog[] = [],
  currentUser: CrmUser | null
): UserSession[] {
  const safeLogs = Array.isArray(logs) ? logs : [];
  // Sort logs oldest first to pair logins with logouts
  const sorted = [...safeLogs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const sessions: UserSession[] = [];
  const openSessions: Record<string, UserSession> = {};

  for (const log of sorted) {
    if (log.action === 'LOGIN') {
      // If there was an open session for this user that was never logged out, close it
      if (openSessions[log.userId]) {
        const prev = openSessions[log.userId];
        const logoutDate = new Date(log.timestamp);
        const loginDate = new Date(prev.loginTime);
        const durSecs = Math.max(0, Math.floor((logoutDate.getTime() - loginDate.getTime()) / 1000));
        prev.logoutTime = log.timestamp;
        prev.logoutFormatted = formatDateTime(log.timestamp);
        prev.durationSeconds = durSecs;
        prev.durationFormatted = formatDuration(durSecs);
        prev.status = durSecs > 300 ? 'AUTO_LOGOUT_5MIN_INACTIVITY' : 'MANUAL_LOGOUT';
        prev.exitReason =
          prev.status === 'AUTO_LOGOUT_5MIN_INACTIVITY'
            ? '5-Min Inactivity Auto-Logout'
            : 'Manual Logout / Re-login';
        sessions.push(prev);
        delete openSessions[log.userId];
      }

      // Start new session
      openSessions[log.userId] = {
        id: `sess-${log.id}`,
        userId: log.userId,
        username: log.username,
        userName: log.userName,
        userRole: log.userRole,
        loginTime: log.timestamp,
        loginFormatted: log.formattedTime || formatDateTime(log.timestamp),
        status: 'ONLINE',
        ipAddress: log.ipAddress || '122.162.148.24',
        deviceInfo: log.deviceInfo || 'Desktop / Laptop',
      };
    } else if (
      log.action === 'LOGOUT' ||
      log.action === 'AUTO_LOGOUT_5MIN_INACTIVITY'
    ) {
      if (openSessions[log.userId]) {
        const sess = openSessions[log.userId];
        const logoutDate = new Date(log.timestamp);
        const loginDate = new Date(sess.loginTime);
        const durSecs = Math.max(0, Math.floor((logoutDate.getTime() - loginDate.getTime()) / 1000));
        sess.logoutTime = log.timestamp;
        sess.logoutFormatted = log.formattedTime || formatDateTime(log.timestamp);
        sess.durationSeconds = durSecs;
        sess.durationFormatted = formatDuration(durSecs);
        sess.status =
          log.action === 'AUTO_LOGOUT_5MIN_INACTIVITY'
            ? 'AUTO_LOGOUT_5MIN_INACTIVITY'
            : 'MANUAL_LOGOUT';
        sess.exitReason =
          log.action === 'AUTO_LOGOUT_5MIN_INACTIVITY'
            ? '5-Min Inactivity Auto-Logout'
            : 'Manual Logout by User';
        sessions.push(sess);
        delete openSessions[log.userId];
      } else {
        // Standalone logout recorded
        const logoutDate = new Date(log.timestamp);
        const estLogin = new Date(logoutDate.getTime() - 15 * 60 * 1000);
        sessions.push({
          id: `sess-solo-${log.id}`,
          userId: log.userId,
          username: log.username,
          userName: log.userName,
          userRole: log.userRole,
          loginTime: estLogin.toISOString(),
          loginFormatted: formatDateTime(estLogin.toISOString()),
          logoutTime: log.timestamp,
          logoutFormatted: log.formattedTime || formatDateTime(log.timestamp),
          durationSeconds: 15 * 60,
          durationFormatted: '15 min',
          status:
            log.action === 'AUTO_LOGOUT_5MIN_INACTIVITY'
              ? 'AUTO_LOGOUT_5MIN_INACTIVITY'
              : 'MANUAL_LOGOUT',
          exitReason:
            log.action === 'AUTO_LOGOUT_5MIN_INACTIVITY'
              ? '5-Min Inactivity Auto-Logout'
              : 'Manual Logout by User',
          ipAddress: log.ipAddress || '122.162.148.24',
          deviceInfo: log.deviceInfo || 'Desktop / Laptop',
        });
      }
    }
  }

  // Handle any still-open sessions
  for (const userId of Object.keys(openSessions)) {
    const sess = openSessions[userId];
    const isCurrentActive = currentUser?.id === userId;
    const now = Date.now();
    const loginTimeMs = new Date(sess.loginTime).getTime();
    const durSecs = Math.max(0, Math.floor((now - loginTimeMs) / 1000));

    if (isCurrentActive) {
      sess.status = 'ONLINE';
      sess.durationSeconds = durSecs;
      sess.durationFormatted = `${formatDuration(durSecs)} (Active Now)`;
      sess.exitReason = 'Currently Online & Active';
      sessions.push(sess);
    } else {
      // User is NOT currently logged in! CANNOT BE MARKED ONLINE!
      // Close session with manual logout or auto-logout
      const closeSecs = Math.min(durSecs, 300);
      const closeTime = new Date(loginTimeMs + closeSecs * 1000).toISOString();
      sess.logoutTime = closeTime;
      sess.logoutFormatted = formatDateTime(closeTime);
      sess.durationSeconds = closeSecs;
      sess.durationFormatted = formatDuration(closeSecs);
      sess.status = closeSecs >= 300 ? 'AUTO_LOGOUT_5MIN_INACTIVITY' : 'MANUAL_LOGOUT';
      sess.exitReason =
        sess.status === 'AUTO_LOGOUT_5MIN_INACTIVITY'
          ? '5-Min Inactivity Auto-Logout'
          : 'Manual Logout by User';
      sessions.push(sess);
    }
  }

  // Return newest sessions first
  return sessions.sort(
    (a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime()
  );
}

/**
 * User Live Status representation
 */
export interface UserLiveStatus {
  user: CrmUser;
  status: 'ONLINE' | 'MANUAL_LOGOUT' | 'AUTO_LOGOUT_5MIN_INACTIVITY' | 'NEVER_LOGGED_IN';
  lastLoginTime?: string;
  lastLoginFormatted?: string;
  lastLogoutTime?: string;
  lastLogoutFormatted?: string;
  lastDurationFormatted?: string;
  exitReason?: string;
  isCurrentlyOnline: boolean;
  activeDurationSecs?: number;
}

export function computeUsersLiveStatus(
  users: CrmUser[] = [],
  sessions: UserSession[] = [],
  currentUser: CrmUser | null
): UserLiveStatus[] {
  const safeUsers = Array.isArray(users) ? users : [];
  const safeSessions = Array.isArray(sessions) ? sessions : [];

  return safeUsers.map((user) => {
    const userSessions = safeSessions.filter((s) => s.userId === user.id);
    const latestSession = userSessions[0];
    const isOnline = currentUser?.id === user.id && (!latestSession || latestSession.status === 'ONLINE');

    if (isOnline) {
      const loginTime = latestSession ? latestSession.loginTime : user.lastLoginAt || new Date().toISOString();
      const loginMs = new Date(loginTime).getTime();
      const durSecs = Math.max(0, Math.floor((Date.now() - loginMs) / 1000));
      return {
        user,
        status: 'ONLINE',
        lastLoginTime: loginTime,
        lastLoginFormatted: formatDateTime(loginTime),
        isCurrentlyOnline: true,
        activeDurationSecs: durSecs,
        lastDurationFormatted: formatDuration(durSecs),
        exitReason: 'Session Active Now',
      };
    }

    if (!latestSession) {
      return {
        user,
        status: 'NEVER_LOGGED_IN',
        isCurrentlyOnline: false,
        lastLoginFormatted: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'No recent login',
        exitReason: 'No activity recorded today',
      };
    }

    return {
      user,
      status: latestSession.status,
      lastLoginTime: latestSession.loginTime,
      lastLoginFormatted: latestSession.loginFormatted,
      lastLogoutTime: latestSession.logoutTime,
      lastLogoutFormatted: latestSession.logoutFormatted,
      lastDurationFormatted: latestSession.durationFormatted,
      exitReason: latestSession.exitReason,
      isCurrentlyOnline: false,
    };
  });
}

/**
 * User Summary Activity for Single-Row Unique User Directory & Deep Audit
 */
export interface UserDirectorySummary {
  user: CrmUser;
  isCurrentlyOnline: boolean;
  currentStatusBadge: 'ONLINE' | 'OFFLINE' | 'NEVER_LOGGED_IN';
  activeDurationFormatted?: string;
  activeDurationSecs?: number;

  // Last Activity (Name k front per dikhegi)
  lastActivity: {
    action: UserAuditLog['action'];
    actionLabel: string;
    timestamp: string;
    formattedTime: string;
    relativeTime: string;
    details: string;
    exitReason?: string;
    ipAddress?: string;
    deviceInfo?: string;
  } | null;

  // Aggregate Counters
  totalLogins: number;
  totalManualLogouts: number;
  totalAutoLogouts: number;
  totalTaskActions: number;
  totalStatusUpdates: number;
  totalMessagesSent: number;
  totalSessions: number;

  // Last known exit
  lastLogoutTime?: string;
  lastLogoutFormatted?: string;
  lastExitReason?: string;

  // Full history of all events and sessions for this specific user
  userLogs: UserAuditLog[];
  userSessions: UserSession[];
}

/**
 * Computes a unique, aggregated summary row for EVERY user in the system.
 * Guarantees that each user appears EXACTLY ONCE in the primary directory table.
 */
export function computeUserDirectorySummary(
  users: CrmUser[] = [],
  logs: UserAuditLog[] = [],
  sessions: UserSession[] = [],
  currentUser: CrmUser | null
): UserDirectorySummary[] {
  const safeUsers = Array.isArray(users) ? users : [];
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeSessions = Array.isArray(sessions) ? sessions : [];

  return safeUsers.map((user) => {
    // All logs for this specific user, sorted newest first
    const userLogs = safeLogs
      .filter((l) => l.userId === user.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // All sessions for this specific user, sorted newest first
    const userSessions = safeSessions
      .filter((s) => s.userId === user.id)
      .sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());

    const latestLog = userLogs[0] || null;
    const latestSession = userSessions[0] || null;

    // Strict Online check: User is ONLY online if they are current authenticated user AND latest event wasn't LOGOUT
    const isOnline =
      currentUser?.id === user.id &&
      (!latestLog || (latestLog.action !== 'LOGOUT' && latestLog.action !== 'AUTO_LOGOUT_5MIN_INACTIVITY'));

    let activeDurationFormatted = undefined;
    let activeDurationSecs = undefined;
    if (isOnline) {
      const loginTime = latestSession ? latestSession.loginTime : user.lastLoginAt || new Date().toISOString();
      const loginMs = new Date(loginTime).getTime();
      activeDurationSecs = Math.max(0, Math.floor((Date.now() - loginMs) / 1000));
      activeDurationFormatted = formatDuration(activeDurationSecs);
    }

    // Determine Action Label for Last Activity
    let actionLabel = 'General Activity';
    if (latestLog) {
      switch (latestLog.action) {
        case 'LOGIN':
          actionLabel = 'Login Successful';
          break;
        case 'LOGOUT':
          actionLabel = 'Manual Logout';
          break;
        case 'AUTO_LOGOUT_5MIN_INACTIVITY':
          actionLabel = '5-Min Inactivity Timeout';
          break;
        case 'FORCE_LOGOUT':
          actionLabel = 'Force Logout by Owner';
          break;
        case 'STATUS_CHANGE':
          actionLabel = 'Project Status Update';
          break;
        case 'MESSAGE_SENT':
          actionLabel = latestLog.targetUserName
            ? `Message to ${latestLog.targetUserName}`
            : 'Message Sent';
          break;
        case 'DIRECTIVE_DISPATCHED':
          actionLabel = latestLog.targetUserName
            ? `Flowchart Directive to ${latestLog.targetUserName}`
            : 'Directive Dispatched';
          break;
        case 'TASK_ASSIGNED':
          actionLabel = 'Task Assigned';
          break;
        case 'LEAD_CREATED':
          actionLabel = 'New Lead Created';
          break;
        case 'REMARK_ADDED':
          actionLabel = 'Site Remark Added';
          break;
        case 'COMPLAINT_REGISTERED':
          actionLabel = 'Complaint Logged';
          break;
        case 'COMPLAINT_RESOLVED':
          actionLabel = 'Complaint Resolved';
          break;
        case 'USER_CREATED':
          actionLabel = 'User Account Created';
          break;
        case 'USER_EDITED':
          actionLabel = 'User Account Edited';
          break;
        default:
          actionLabel = latestLog.action;
      }
    }

    // Aggregate counters
    const totalLogins = userLogs.filter((l) => l.action === 'LOGIN').length;
    const totalManualLogouts = userLogs.filter((l) => l.action === 'LOGOUT').length;
    const totalAutoLogouts = userLogs.filter((l) => l.action === 'AUTO_LOGOUT_5MIN_INACTIVITY').length;
    const totalStatusUpdates = userLogs.filter((l) => l.action === 'STATUS_CHANGE').length;
    const totalMessagesSent = userLogs.filter(
      (l) => l.action === 'MESSAGE_SENT' || l.action === 'DIRECTIVE_DISPATCHED'
    ).length;
    const totalTaskActions = userLogs.filter(
      (l) =>
        l.action === 'STATUS_CHANGE' ||
        l.action === 'TASK_ASSIGNED' ||
        l.action === 'REMARK_ADDED' ||
        l.action === 'LEAD_CREATED' ||
        l.action === 'DIRECTIVE_DISPATCHED'
    ).length;

    const lastActivity = latestLog
      ? {
          action: latestLog.action,
          actionLabel,
          timestamp: latestLog.timestamp,
          formattedTime: latestLog.formattedTime || formatDateTime(latestLog.timestamp),
          relativeTime: formatRelativeTime(latestLog.timestamp),
          details: latestLog.details,
          exitReason:
            latestLog.action === 'LOGOUT'
              ? 'Manual logout performed by user'
              : latestLog.action === 'AUTO_LOGOUT_5MIN_INACTIVITY'
              ? 'Auto-logout after 5 minutes of inactivity'
              : undefined,
          ipAddress: latestLog.ipAddress || '122.162.148.24',
          deviceInfo: latestLog.deviceInfo || 'Desktop / Laptop',
        }
      : null;

    return {
      user,
      isCurrentlyOnline: isOnline,
      currentStatusBadge: isOnline ? 'ONLINE' : userLogs.length > 0 ? 'OFFLINE' : 'NEVER_LOGGED_IN',
      activeDurationFormatted,
      activeDurationSecs,
      lastActivity,
      totalLogins,
      totalManualLogouts,
      totalAutoLogouts,
      totalStatusUpdates,
      totalMessagesSent,
      totalTaskActions,
      totalSessions: userSessions.length,
      lastLogoutTime: latestSession?.logoutTime,
      lastLogoutFormatted: latestSession?.logoutFormatted,
      lastExitReason: latestSession?.exitReason,
      userLogs,
      userSessions,
    };
  });
}

