import { CrmTask, ComplaintTicket } from '../data/crmData';
import { BusinessWorkspace } from '../data/businessTemplatesData';

export interface CloudSqlStatus {
  status: 'connected' | 'error' | 'disconnected';
  database: string;
  host: string;
  counts?: {
    tasks: number;
  };
}

// ---------------- CLIENT-SIDE TOKEN MANAGEMENT ---------------- //
export function getStoredAuthToken(): string | null {
  try {
    return (
      sessionStorage.getItem('dilip_crm_jwt_token') ||
      localStorage.getItem('dilip_crm_jwt_token') ||
      null
    );
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string) {
  try {
    sessionStorage.setItem('dilip_crm_jwt_token', token);
    localStorage.setItem('dilip_crm_jwt_token', token);
  } catch {}
}

export function clearStoredAuthToken() {
  try {
    sessionStorage.removeItem('dilip_crm_jwt_token');
    localStorage.removeItem('dilip_crm_jwt_token');
  } catch {}
}

/**
 * Ensures an active Bearer JWT token exists for the currently logged in user session.
 * Automatically exchanges local session credentials if token is not yet initialized.
 */
export async function ensureAuthToken(): Promise<string | null> {
  const existing = getStoredAuthToken();
  if (existing) return existing;

  try {
    const rawOwner = localStorage.getItem('dilip_crm_owner_session');
    const rawUser = sessionStorage.getItem('dilip_crm_active_user');
    const active = rawOwner ? JSON.parse(rawOwner) : rawUser ? JSON.parse(rawUser) : null;

    if (active && active.role) {
      const res = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: active.id,
          role: active.role,
          username: active.username,
          password: active.password || 'DilipSolar@2025',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setStoredAuthToken(data.token);
          return data.token;
        }
      }
    }
  } catch (_) {}

  return null;
}

// ---------------- PROTECTED CLOUD SQL API CLIENT ---------------- //

export async function checkCloudSqlStatus(): Promise<CloudSqlStatus> {
  try {
    const res = await fetch('/api/db/status');
    if (!res.ok) {
      return { status: 'error', database: 'PostgreSQL Cloud SQL', host: 'Unavailable' };
    }
    return await res.json();
  } catch {
    return { status: 'disconnected', database: 'PostgreSQL Cloud SQL', host: 'Offline' };
  }
}

export async function fetchTasksFromCloudSql(): Promise<CrmTask[]> {
  const token = await ensureAuthToken();
  const res = await fetch('/api/db/tasks', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}: Access Denied to Tasks`);
  }
  return await res.json();
}

export async function syncCrmStateToCloudSql(
  tasks: CrmTask[],
  complaints: ComplaintTicket[],
  businesses: BusinessWorkspace[]
) {
  const token = await ensureAuthToken();
  const res = await fetch('/api/db/sync-all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ tasks, complaints, businesses }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}: Failed to sync to Cloud SQL PostgreSQL database`);
  }
  return await res.json();
}

export async function saveCloudSqlSnapshot(
  snapshotId: string,
  createdBy: string,
  payload: any
) {
  const token = await ensureAuthToken();
  const res = await fetch('/api/db/snapshots', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ snapshotId, createdBy, payload }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}: Failed to save snapshot to Cloud SQL`);
  }
  return await res.json();
}

export async function fetchCloudSqlSnapshots() {
  const token = await ensureAuthToken();
  const res = await fetch('/api/db/snapshots', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    return [];
  }
  return await res.json();
}
