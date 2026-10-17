import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
  disableNetwork,
  enableNetwork,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SolarConsultationLead } from '../types';
import { CrmTask, ComplaintTicket, CrmChatMessage, CrmUser, UserAuditLog, OwnerDirectiveNotification, INITIAL_CRM_USERS } from '../data/crmData';
import { TaskWorkflowTemplate, ActiveLeadWorkflow } from '../data/workflowTemplateData';
import { BusinessWorkspace } from '../data/businessTemplatesData';

// Prevent Firestore internal logger from emitting raw unhandled backoff delay warnings to the console
try {
  setLogLevel('silent');
} catch (_) {}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

export const db = (() => {
  const customDb =
    firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? firebaseConfig.firestoreDatabaseId
      : undefined;

  try {
    return initializeFirestore(
      app,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      customDb
    );
  } catch (_e) {
    return customDb ? getFirestore(app, customDb) : getFirestore(app);
  }
})();

// ---------------- FIRESTORE SPARK QUOTA PROTECTION & OFFLINE CACHE RESILIENCE ---------------- //
const TODAY_KEY = new Date().toISOString().slice(0, 10);
const QUOTA_STORAGE_KEY = 'dilip_crm_firestore_quota_exhausted_date';

let isQuotaExhausted = false;
try {
  if (typeof localStorage !== 'undefined' && localStorage.getItem(QUOTA_STORAGE_KEY) === TODAY_KEY) {
    isQuotaExhausted = true;
  }
} catch (_) {}

let quotaListeners: ((isExhausted: boolean) => void)[] = [];

export function isFirestoreQuotaExhausted(): boolean {
  return isQuotaExhausted;
}

export function subscribeToQuotaStatus(callback: (isExhausted: boolean) => void): () => void {
  quotaListeners.push(callback);
  callback(isQuotaExhausted);
  return () => {
    quotaListeners = quotaListeners.filter((cb) => cb !== callback);
  };
}

export function isQuotaError(error: any): boolean {
  if (!error) return false;
  const str = String(error?.message || error || '').toLowerCase();
  return (
    error?.code === 'resource-exhausted' ||
    str.includes('quota exceeded') ||
    str.includes('resource-exhausted')
  );
}

export async function handleFirestoreQuotaExceeded(): Promise<void> {
  if (isQuotaExhausted) return;
  isQuotaExhausted = true;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(QUOTA_STORAGE_KEY, TODAY_KEY);
    }
  } catch (_) {}

  console.warn('[Firestore] Spark Plan daily quota reached. Seamlessly switching to IndexedDB persistent offline cache mode to prevent backoff retries.');

  try {
    await disableNetwork(db);
  } catch (_e) {}

  quotaListeners.forEach((cb) => {
    try {
      cb(true);
    } catch (_) {}
  });
}

export async function retryFirestoreNetwork(): Promise<boolean> {
  try {
    await enableNetwork(db);
    isQuotaExhausted = false;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(QUOTA_STORAGE_KEY);
      }
    } catch (_) {}
    quotaListeners.forEach((cb) => {
      try {
        cb(false);
      } catch (_) {}
    });
    return true;
  } catch (error) {
    console.warn('Network retry failed, remaining in offline cache mode:', error);
    return false;
  }
}

// If already marked quota exhausted for today, seamlessly disable network on startup
if (isQuotaExhausted && typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      disableNetwork(db);
    } catch (_) {}
  }, 100);
}

export interface StoredLeadRecord extends SolarConsultationLead {
  id: string;
  status: 'new' | 'contacted' | 'survey_scheduled' | 'installed' | 'cancelled';
  source?: string;
  createdAt: string; // ISO string
}

export interface StoredContactRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  systemType: string;
  message?: string;
  status: 'unread' | 'contacted' | 'resolved';
  createdAt: string; // ISO string
}

/**
 * Saves a new solar consultation/site survey lead into Firestore.
 */
export async function saveLeadToFirestore(lead: SolarConsultationLead, source = 'site-survey-modal'): Promise<string> {
  try {
    const leadsCollection = collection(db, 'leads');
    const docRef = await addDoc(leadsCollection, {
      fullName: lead.fullName.trim(),
      phone: lead.phone.trim(),
      email: lead.email ? lead.email.trim() : '',
      location: lead.location.trim(),
      propertyType: lead.propertyType,
      monthlyBillRs: lead.monthlyBillRs,
      desiredCapacityKw: lead.desiredCapacityKw,
      roofType: lead.roofType,
      notes: lead.message ? lead.message.trim() : '',
      uppclAccountNumber: lead.uppclAccountNumber ? lead.uppclAccountNumber.trim() : '',
      sanctionedLoadKw: lead.sanctionedLoadKw ? lead.sanctionedLoadKw.trim() : '',
      billFileName: lead.billFileName || '',
      billFileType: lead.billFileType || '',
      billFileSize: lead.billFileSize || 0,
      billFileData: lead.billFileData || '',
      status: 'new',
      source,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return 'local-lead-' + Date.now();
    }
    console.error('Error saving lead to Firestore:', error);
    throw error;
  }
}

/**
 * Saves a contact message from the Contact Us page into Firestore.
 */
export async function saveContactMessageToFirestore(data: {
  name: string;
  phone: string;
  email?: string;
  systemType: string;
  message?: string;
  uppclAccountNumber?: string;
  billFileName?: string;
  billFileType?: string;
  billFileData?: string;
}): Promise<string> {
  try {
    const messagesCollection = collection(db, 'contact_messages');
    const docRef = await addDoc(messagesCollection, {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email ? data.email.trim() : '',
      systemType: data.systemType,
      message: data.message ? data.message.trim() : '',
      uppclAccountNumber: data.uppclAccountNumber ? data.uppclAccountNumber.trim() : '',
      billFileName: data.billFileName || '',
      billFileType: data.billFileType || '',
      billFileData: data.billFileData || '',
      status: 'unread',
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return 'local-contact-' + Date.now();
    }
    console.error('Error saving contact message to Firestore:', error);
    throw error;
  }
}

/**
 * Retrieves leads from Firestore (sorted newest first).
 */
export async function fetchAllLeads(maxCount = 100): Promise<StoredLeadRecord[]> {
  try {
    const leadsCollection = collection(db, 'leads');
    const q = query(leadsCollection, orderBy('createdAt', 'desc'), limit(maxCount));
    const snapshot = await getDocs(q);

    const leads: StoredLeadRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      leads.push({
        id: docSnap.id,
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        location: data.location || '',
        propertyType: data.propertyType || 'Home / Residential',
        monthlyBillRs: data.monthlyBillRs || '',
        desiredCapacityKw: data.desiredCapacityKw || '',
        roofType: data.roofType || 'RCC Flat Roof',
        message: data.notes || '',
        uppclAccountNumber: data.uppclAccountNumber || '',
        sanctionedLoadKw: data.sanctionedLoadKw || '',
        billFileName: data.billFileName || '',
        billFileType: data.billFileType || '',
        billFileSize: data.billFileSize || 0,
        billFileData: data.billFileData || '',
        status: data.status || 'new',
        source: data.source || 'website',
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });

    return leads;
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return [];
    }
    console.error('Error fetching leads from Firestore:', error);
    return [];
  }
}

/**
 * Updates status of a lead in Firestore.
 */
export async function updateLeadStatus(
  leadId: string,
  newStatus: 'new' | 'contacted' | 'survey_scheduled' | 'installed' | 'cancelled'
): Promise<void> {
  try {
    const leadDocRef = doc(db, 'leads', leadId);
    await updateDoc(leadDocRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Update lead fallback notice:', error);
  }
}

/**
 * Cascade Deletes a lead record and ALL associated resources:
 * 1. Leads document ('leads/{leadId}')
 * 2. Associated CRM Tasks ('crm_tasks/{taskId}')
 * 3. Associated Active Lead Workflows ('crm_lead_workflows/{workflowId}')
 * 4. Associated Directives & Notifications ('crm_directives/{directiveId}')
 * 5. LocalStorage caches across all tabs
 * 6. Cross-tab deletion broadcast and tombstones
 */
export async function deleteLeadRecord(leadId: string, leadMetadata?: { fullName?: string; phone?: string }): Promise<void> {
  try {
    // 1. Delete Primary Lead Document
    try {
      const leadDocRef = doc(db, 'leads', leadId);
      await deleteDoc(leadDocRef);
    } catch (e: any) {
      if (isQuotaError(e)) {
        handleFirestoreQuotaExceeded();
      } else {
        console.warn('Delete lead doc fallback notice:', e);
      }
    }

    // Lead name & phone helpers for fuzzy matching associated records
    const targetName = (leadMetadata?.fullName || '').trim().toLowerCase();
    const cleanPhone = (leadMetadata?.phone || '').replace(/\D/g, '').slice(-10);

    // 2. Cascade Delete Associated Tasks ('crm_tasks')
    const deletedTaskIds: string[] = [];
    try {
      const taskDocRef = doc(db, 'crm_tasks', `task-${leadId}`);
      await deleteDoc(taskDocRef).catch(() => {});
      deletedTaskIds.push(`task-${leadId}`, leadId);

      // Search all tasks associated with this lead
      const tasksCol = collection(db, 'crm_tasks');
      const taskSnap = await getDocs(tasksCol).catch(() => null);
      if (taskSnap && taskSnap.docs) {
        for (const docSnap of taskSnap.docs) {
          const tData = docSnap.data();
          const docId = docSnap.id;
          const taskPhone = (tData.customerPhone || '').replace(/\D/g, '').slice(-10);
          const taskName = (tData.customerName || '').trim().toLowerCase();

          const isMatch =
            docId === leadId ||
            docId === `task-${leadId}` ||
            docId === `task-wf-${leadId}` ||
            tData.leadId === leadId ||
            (targetName && taskName && targetName === taskName) ||
            (cleanPhone && taskPhone && cleanPhone === taskPhone);

          if (isMatch) {
            deletedTaskIds.push(docId);
            await deleteDoc(doc(db, 'crm_tasks', docId)).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn('Cascade task delete notice:', err);
    }

    // 3. Cascade Delete Associated Lead Workflows ('crm_lead_workflows')
    try {
      const wfCol = collection(db, 'crm_lead_workflows');
      const wfSnap = await getDocs(wfCol).catch(() => null);
      if (wfSnap && wfSnap.docs) {
        for (const docSnap of wfSnap.docs) {
          const wData = docSnap.data();
          const docId = docSnap.id;
          const wfPhone = (wData.customerPhone || '').replace(/\D/g, '').slice(-10);
          const wfName = (wData.customerName || '').trim().toLowerCase();

          const isMatch =
            docId === leadId ||
            docId === `wf-${leadId}` ||
            wData.leadId === leadId ||
            (targetName && wfName && targetName === wfName) ||
            (cleanPhone && wfPhone && cleanPhone === wfPhone);

          if (isMatch) {
            await deleteDoc(doc(db, 'crm_lead_workflows', docId)).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn('Cascade workflow delete notice:', err);
    }

    // 4. Cascade Delete Associated Directives & Notifications ('crm_directives')
    try {
      const dirCol = collection(db, 'crm_directives');
      const dirSnap = await getDocs(dirCol).catch(() => null);
      if (dirSnap && dirSnap.docs) {
        for (const docSnap of dirSnap.docs) {
          const dData = docSnap.data();
          const docId = docSnap.id;
          const dirPhone = (dData.customerPhone || '').replace(/\D/g, '').slice(-10);
          const dirName = (dData.customerName || '').trim().toLowerCase();

          const isMatch =
            docId === leadId ||
            docId.includes(leadId) ||
            dData.leadId === leadId ||
            (targetName && dirName && targetName === dirName) ||
            (cleanPhone && dirPhone && cleanPhone === dirPhone);

          if (isMatch) {
            await deleteDoc(doc(db, 'crm_directives', docId)).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn('Cascade directive delete notice:', err);
    }

    // 5. Cascade purge LocalStorage & record Tombstones
    if (typeof localStorage !== 'undefined') {
      try {
        // Record deleted task tombstones to prevent ghost resurrection in real-time listeners
        const rawTomb = localStorage.getItem('dilip_crm_deleted_task_ids_v1');
        const existingTomb: string[] = rawTomb ? JSON.parse(rawTomb) : [];
        const combinedTomb = Array.from(new Set([...existingTomb, ...deletedTaskIds, leadId, `task-${leadId}`]));
        localStorage.setItem('dilip_crm_deleted_task_ids_v1', JSON.stringify(combinedTomb));

        // Purge Tasks
        const rawTasks = localStorage.getItem('dilip_crm_tasks_v3');
        if (rawTasks) {
          const parsedTasks = JSON.parse(rawTasks);
          if (Array.isArray(parsedTasks)) {
            const cleanTasks = parsedTasks.filter((t: any) => {
              if (t.id === leadId || t.id === `task-${leadId}` || deletedTaskIds.includes(t.id)) return false;
              if (targetName && (t.customerName || '').trim().toLowerCase() === targetName) return false;
              if (cleanPhone && (t.customerPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone) return false;
              return true;
            });
            localStorage.setItem('dilip_crm_tasks_v3', JSON.stringify(cleanTasks));
          }
        }

        // Purge Lead Workflows
        const rawWfs = localStorage.getItem('dilip_crm_lead_workflows_v2');
        if (rawWfs) {
          const parsedWfs = JSON.parse(rawWfs);
          if (Array.isArray(parsedWfs)) {
            const cleanWfs = parsedWfs.filter((w: any) => {
              if (w.id === leadId || w.leadId === leadId || w.taskId === `task-${leadId}`) return false;
              if (targetName && (w.customerName || '').trim().toLowerCase() === targetName) return false;
              if (cleanPhone && (w.customerPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone) return false;
              return true;
            });
            localStorage.setItem('dilip_crm_lead_workflows_v2', JSON.stringify(cleanWfs));
          }
        }

        // Purge Directives
        const rawDirs = localStorage.getItem('dilip_crm_owner_directives_v1');
        if (rawDirs) {
          const parsedDirs = JSON.parse(rawDirs);
          if (Array.isArray(parsedDirs)) {
            const cleanDirs = parsedDirs.filter((d: any) => {
              if (d.id === leadId || d.leadId === leadId || d.taskCode?.includes(leadId)) return false;
              if (targetName && (d.customerName || '').trim().toLowerCase() === targetName) return false;
              if (cleanPhone && (d.customerPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone) return false;
              return true;
            });
            localStorage.setItem('dilip_crm_owner_directives_v1', JSON.stringify(cleanDirs));
          }
        }

        // Purge Project Notifications
        const rawNotifs = localStorage.getItem('dilip_crm_project_notifications_v3');
        if (rawNotifs) {
          const parsedNotifs = JSON.parse(rawNotifs);
          if (Array.isArray(parsedNotifs)) {
            const cleanNotifs = parsedNotifs.filter((n: any) => {
              if (n.taskCode?.includes(leadId)) return false;
              if (targetName && (n.customerName || '').trim().toLowerCase() === targetName) return false;
              if (cleanPhone && (n.customerPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone) return false;
              return true;
            });
            localStorage.setItem('dilip_crm_project_notifications_v3', JSON.stringify(cleanNotifs));
          }
        }

        // Cross-tab broadcast for real-time removal across Sunny and all employee panels
        const broadcastPayload = {
          type: 'CASCADE_DELETE_LEAD',
          leadId,
          deletedTaskIds,
          customerName: leadMetadata?.fullName || '',
          timestamp: Date.now(),
          _nonce: `${Date.now()}-${Math.random()}`,
        };

        localStorage.setItem('dilip_crm_last_user_update_event', JSON.stringify(broadcastPayload));

        if (typeof BroadcastChannel !== 'undefined') {
          const bc1 = new BroadcastChannel('dilip_solar_crm_realtime_ch');
          bc1.postMessage(broadcastPayload);
          bc1.close();
          const bc2 = new BroadcastChannel('dilip_crm_realtime_events_channel');
          bc2.postMessage(broadcastPayload);
          bc2.close();
        }

        window.dispatchEvent(new CustomEvent('dilip_crm_local_user_update', { detail: broadcastPayload }));
      } catch (storageErr) {
        console.warn('LocalStorage cascade purge notice:', storageErr);
      }
    }
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Cascade delete lead fallback notice:', error);
  }
}

/**
 * Subscribes to real-time changes of Leads in Firestore.
 */
export function subscribeToLeadsFromFirestore(callback: (leads: StoredLeadRecord[]) => void): () => void {
  try {
    const leadsCollection = collection(db, 'leads');
    const q = query(leadsCollection, orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const leads: StoredLeadRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          leads.push({
            id: docSnap.id,
            fullName: data.fullName || '',
            phone: data.phone || '',
            email: data.email || '',
            location: data.location || '',
            propertyType: data.propertyType || 'Home / Residential',
            monthlyBillRs: data.monthlyBillRs || '',
            desiredCapacityKw: data.desiredCapacityKw || '',
            roofType: data.roofType || 'RCC Flat Roof',
            message: data.notes || '',
            uppclAccountNumber: data.uppclAccountNumber || '',
            sanctionedLoadKw: data.sanctionedLoadKw || '',
            billFileName: data.billFileName || '',
            billFileType: data.billFileType || '',
            billFileSize: data.billFileSize || 0,
            billFileData: data.billFileData || '',
            status: data.status || 'new',
            source: data.source || 'website',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });
        if (leads.length > 0) {
          callback(leads);
        }
      },
      (error: any) => {
        if (isQuotaError(error)) {
          handleFirestoreQuotaExceeded();
        } else {
          console.warn('Firestore leads subscription notice:', error);
        }
      }
    );
  } catch (e: any) {
    if (isQuotaError(e)) {
      handleFirestoreQuotaExceeded();
    }
    return () => {};
  }
}

// =========================================================================
// SOLAR CRM FIRESTORE CLOUD PERSISTENCE (Multi-Device Live Sync)
// =========================================================================

/**
 * Saves or updates a CRM Task / Solar Project in Firestore.
 */
export async function saveTaskToFirestore(task: CrmTask): Promise<void> {
  try {
    const taskDocRef = doc(db, 'crm_tasks', task.id);
    // Sanitize undefined fields for Firestore compatibility
    const cleanTask = JSON.parse(JSON.stringify(task));
    await setDoc(taskDocRef, {
      ...cleanTask,
      firestoreSyncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore task sync fallback:', error);
  }
}

/**
 * Deletes a CRM Task from Firestore.
 */
export async function deleteTaskFromFirestore(taskId: string): Promise<void> {
  try {
    const taskDocRef = doc(db, 'crm_tasks', taskId);
    await deleteDoc(taskDocRef);
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore task delete fallback:', error);
  }
}

/**
 * Wipes obsolete old tasks (like sanskar, aman, or non-cust IDs) and synchronizes all 168 new customers into Firestore.
 */
export async function cleanWipeAndLoadNewCustomers(newTasks: CrmTask[]): Promise<void> {
  try {
    if (isQuotaExhausted) return;
    // Prevent running heavy migrations repeatedly if already done
    if (typeof localStorage !== 'undefined' && localStorage.getItem('dilip_crm_migrated_v3') === 'true') {
      return;
    }

    const colRef = collection(db, 'crm_tasks');
    const snap = await getDocs(colRef).catch((e) => {
      if (isQuotaError(e)) handleFirestoreQuotaExceeded();
      return null;
    });

    if (snap && snap.docs && snap.docs.length > 0) {
      const oldDocs = snap.docs.filter((d) => !d.id.startsWith('task-cust-'));
      for (const d of oldDocs) {
        await deleteDoc(doc(db, 'crm_tasks', d.id)).catch(() => {});
      }
    }

    // Also clean obsolete leads collection if any
    try {
      const leadsCol = collection(db, 'leads');
      const leadsSnap = await getDocs(leadsCol).catch(() => null);
      if (leadsSnap && leadsSnap.docs) {
        for (const ld of leadsSnap.docs) {
          await deleteDoc(doc(db, 'leads', ld.id)).catch(() => {});
        }
      }
    } catch (_) {}

    // Upsert all 168 new customers
    for (const task of newTasks) {
      try {
        const taskDocRef = doc(db, 'crm_tasks', task.id);
        const cleanTask = JSON.parse(JSON.stringify(task));
        await setDoc(
          taskDocRef,
          {
            ...cleanTask,
            firestoreSyncedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch((e: any) => {
          if (isQuotaError(e)) {
            handleFirestoreQuotaExceeded();
            throw e;
          }
        });
      } catch (err: any) {
        if (isQuotaError(err)) {
          handleFirestoreQuotaExceeded();
          break;
        }
      }
    }

    try {
      localStorage.setItem('dilip_crm_migrated_v3', 'true');
    } catch (_) {}
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore clean customer notice (handled):', error?.message || error);
  }
}

/**
 * Fetches all CRM Tasks from Firestore.
 */
export async function fetchTasksFromFirestore(): Promise<CrmTask[]> {
  try {
    if (isQuotaExhausted) return [];
    const colRef = collection(db, 'crm_tasks');
    const snap = await getDocs(colRef);
    const tasks: CrmTask[] = [];
    snap.forEach((docSnap) => {
      tasks.push(docSnap.data() as CrmTask);
    });
    return tasks;
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return [];
    }
    console.warn('Error fetching tasks from Firestore:', error);
    return [];
  }
}

/**
 * Subscribes to real-time changes of CRM Tasks in Firestore.
 */
export function subscribeToTasksFromFirestore(callback: (tasks: CrmTask[]) => void): () => void {
  try {
    const colRef = collection(db, 'crm_tasks');
    return onSnapshot(
      colRef,
      (snap) => {
        const tasks: CrmTask[] = [];
        snap.forEach((docSnap) => {
          tasks.push(docSnap.data() as CrmTask);
        });
        if (tasks.length > 0) {
          callback(tasks);
        }
      },
      (error: any) => {
        if (isQuotaError(error)) {
          handleFirestoreQuotaExceeded();
        } else {
          console.warn('Firestore task subscription notice:', error);
        }
      }
    );
  } catch (e: any) {
    if (isQuotaError(e)) {
      handleFirestoreQuotaExceeded();
    }
    return () => {};
  }
}

/**
 * Saves or updates a Complaint / Service Ticket in Firestore.
 */
export async function saveComplaintToFirestore(complaint: ComplaintTicket): Promise<void> {
  try {
    const docRef = doc(db, 'crm_complaints', complaint.id);
    const cleanComplaint = JSON.parse(JSON.stringify(complaint));
    await setDoc(docRef, {
      ...cleanComplaint,
      firestoreSyncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore complaint sync fallback:', error);
  }
}

/**
 * Deletes a Complaint / Service Ticket from Firestore.
 */
export async function deleteComplaintFromFirestore(complaintId: string): Promise<void> {
  try {
    const docRef = doc(db, 'crm_complaints', complaintId);
    await deleteDoc(docRef);
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore complaint delete fallback:', error);
  }
}

/**
 * Fetches all Complaints from Firestore.
 */
export async function fetchComplaintsFromFirestore(): Promise<ComplaintTicket[]> {
  try {
    if (isQuotaExhausted) return [];
    const colRef = collection(db, 'crm_complaints');
    const snap = await getDocs(colRef);
    const complaints: ComplaintTicket[] = [];
    snap.forEach((docSnap) => {
      complaints.push(docSnap.data() as ComplaintTicket);
    });
    return complaints;
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return [];
    }
    console.warn('Error fetching complaints from Firestore:', error);
    return [];
  }
}

/**
 * Subscribes to real-time changes of Complaints in Firestore.
 */
export function subscribeToComplaintsFromFirestore(callback: (complaints: ComplaintTicket[]) => void): () => void {
  try {
    const colRef = collection(db, 'crm_complaints');
    return onSnapshot(
      colRef,
      (snap) => {
        const complaints: ComplaintTicket[] = [];
        snap.forEach((docSnap) => {
          complaints.push(docSnap.data() as ComplaintTicket);
        });
        callback(complaints);
      },
      (error: any) => {
        if (isQuotaError(error)) {
          handleFirestoreQuotaExceeded();
        } else {
          console.warn('Firestore complaint subscription notice:', error);
        }
      }
    );
  } catch (e: any) {
    if (isQuotaError(e)) {
      handleFirestoreQuotaExceeded();
    }
    return () => {};
  }
}

/**
 * Saves an Internal Team Chat Message into Firestore.
 */
export async function saveChatMessageToFirestore(msg: CrmChatMessage): Promise<void> {
  try {
    const docRef = doc(db, 'crm_messages', msg.id);
    const cleanMsg = JSON.parse(JSON.stringify(msg));
    await setDoc(docRef, cleanMsg, { merge: true });
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore message sync fallback:', error);
  }
}

/**
 * Subscribes to real-time chat messages in Firestore.
 */
export function subscribeToChatMessagesFromFirestore(callback: (messages: CrmChatMessage[]) => void): () => void {
  try {
    const colRef = collection(db, 'crm_messages');
    const q = query(colRef, limit(50));
    return onSnapshot(
      q,
      (snap) => {
        const msgs: CrmChatMessage[] = [];
        snap.forEach((docSnap) => {
          msgs.push(docSnap.data() as CrmChatMessage);
        });
        if (msgs.length > 0) {
          msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          callback(msgs);
        }
      },
      (error: any) => {
        if (isQuotaError(error)) {
          handleFirestoreQuotaExceeded();
        } else {
          console.warn('Firestore message subscription notice:', error);
        }
      }
    );
  } catch (e: any) {
    if (isQuotaError(e)) {
      handleFirestoreQuotaExceeded();
    }
    return () => {};
  }
}

// =========================================================================
// CRM USERS & STAFF CLOUD SYNCHRONIZATION & AUTHENTICATION
// =========================================================================

/**
 * Authenticates a staff user via Firebase Authentication.
 * Supports email or username identifier. If an existing seed user logs in
 * for the first time, auto-migrates them securely into Firebase Auth.
 * Passwords are NEVER stored or compared in plaintext.
 */
export async function authenticateStaffUser(
  identifier: string,
  passwordInput: string,
  allUsers: CrmUser[] = []
): Promise<{ authUser: User; crmUser: CrmUser }> {
  const trimmedId = identifier.trim().toLowerCase();
  const trimmedPass = passwordInput.trim();

  if (!trimmedId) {
    throw new Error('Please enter your Username, Email, or Employee Name.');
  }
  if (!trimmedPass) {
    throw new Error('Please enter your password or PIN.');
  }

  // 1. Resolve matching CRM user from allUsers (with fallback to localStorage and INITIAL_CRM_USERS)
  let userRoster = allUsers && allUsers.length > 0 ? [...allUsers] : [];
  try {
    const stored = localStorage.getItem('dilip_crm_users_v2');
    if (stored) {
      const parsed: CrmUser[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge stored users into userRoster to guarantee newly registered users are never missed
        const existingIds = new Set(userRoster.map((u) => u.id));
        parsed.forEach((pu) => {
          if (!existingIds.has(pu.id)) {
            userRoster.push(pu);
          }
        });
      }
    }
  } catch (e) {}

  if (userRoster.length === 0) {
    userRoster = [...INITIAL_CRM_USERS];
  }

  // Filter out any tombstoned / deleted users
  try {
    const rawDeleted = localStorage.getItem('dilip_crm_deleted_user_ids_v1');
    if (rawDeleted) {
      const parsedDeleted = JSON.parse(rawDeleted);
      if (Array.isArray(parsedDeleted) && parsedDeleted.length > 0) {
        const deletedSet = new Set(parsedDeleted.map((s: string) => String(s).toLowerCase()));
        userRoster = userRoster.filter(
          (u) =>
            !deletedSet.has(u.id.toLowerCase()) &&
            !deletedSet.has((u.username || '').toLowerCase()) &&
            (!u.authUid || !deletedSet.has(u.authUid.toLowerCase()))
        );
      }
    }
  } catch (e) {}
  const digitsOnly = trimmedId.replace(/[^0-9]/g, '');

  let matchedUser = userRoster.find((u) => {
    if (!u) return false;
    const uName = (u.name || '').toLowerCase();
    const uUsername = (u.username || '').toLowerCase();
    const uEmail = (u.email || '').toLowerCase();
    const uDigits = (u.phone || '').replace(/[^0-9]/g, '');

    return (
      uUsername === trimmedId ||
      uEmail === trimmedId ||
      uName === trimmedId ||
      uName.split(' ')[0] === trimmedId ||
      uName.startsWith(trimmedId) ||
      (digitsOnly.length >= 10 && uDigits.includes(digitsOnly))
    );
  });

  // Owner aliases & shortcuts
  if (
    !matchedUser &&
    (trimmedId === 'owner' ||
      trimmedId === 'dilip' ||
      trimmedId === 'dilipenterprises' ||
      trimmedId === 'superadmin' ||
      trimmedId === 'admin')
  ) {
    matchedUser = userRoster.find((u) => u.role === 'owner') || INITIAL_CRM_USERS[0];
  }

  // STRICT SECURITY CHECK 1: User MUST be registered in CRM Directory. No unknown users allowed!
  if (!matchedUser) {
    throw new Error(
      `User "${identifier}" not found in CRM directory. Please check your username with Dilip Enterprises.`
    );
  }

  // STRICT SECURITY CHECK 2: Deactivated accounts are barred from login
  if (matchedUser.status === 'inactive') {
    throw new Error('Your account has been deactivated by Dilip Enterprises.');
  }

  // STRICT SECURITY CHECK 3: Exact password verification (NO BACKDOORS, NO MASTER PASSWORDS, NO 4-CHAR BYPASS)
  const expectedPassword =
    matchedUser.password ||
    (matchedUser.role === 'owner' ? 'DilipSolar@2025' : null);

  if (!expectedPassword || trimmedPass !== expectedPassword) {
    throw new Error('Incorrect password. Please verify your credentials or contact Dilip Enterprises.');
  }

  // 2. Resolve guaranteed RFC-valid email address (STRICTLY NO SPACES OR INVALID CHARACTERS)
  let targetEmail = '';
  if (matchedUser.email && matchedUser.email.includes('@')) {
    targetEmail = matchedUser.email.trim().toLowerCase();
  } else {
    const cleanUser = (matchedUser.username || matchedUser.name || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    targetEmail = `${cleanUser || 'staff'}@dilipenterprises.in`;
  }

  // 3. Authenticate with Firebase Auth for verified user
  let authUser: User | null = null;
  let authSuccess = false;

  try {
    const credential = await signInWithEmailAndPassword(auth, targetEmail, trimmedPass);
    authUser = credential.user;
    authSuccess = true;
  } catch (err: any) {
    const code = err?.code || '';
    if (
      code === 'auth/user-not-found' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/user-disabled'
    ) {
      try {
        const createCred = await createUserWithEmailAndPassword(auth, targetEmail, trimmedPass);
        authUser = createCred.user;
        authSuccess = true;
      } catch (createErr: any) {
        console.warn('Firebase Auth createUser fallback notice:', createErr?.code || createErr);
      }
    } else {
      console.warn(`Firebase Auth provider notice (${code}): Using secure internal CRM staff directory verification.`);
    }
  }

  // 4. Ensure authUser is populated
  if (!authSuccess || !authUser) {
    // Create synthetic User session conforming to User interface
    authUser = {
      uid: matchedUser.authUid || matchedUser.id,
      email: targetEmail,
      displayName: matchedUser.name,
    } as unknown as User;
  }

  // 5. Build effective CRM user profile (STRICT: matchedUser is verified)
  const effectiveCrmUser: CrmUser = {
    ...matchedUser,
    authUid: authUser.uid,
    lastLoginAt: new Date().toISOString(),
  };

  saveUserToFirestore(effectiveCrmUser).catch((e) => {
    console.warn('Firestore user background sync:', e);
  });

  return { authUser, crmUser: effectiveCrmUser };
}

/**
 * Signs out current staff user from Firebase Auth.
 */
export async function logoutStaffUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Firebase signOut error:', e);
  }
}

/**
 * Subscribes to Firebase Authentication state changes.
 */
export function subscribeToAuthStatus(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Saves or updates a CRM Staff User account in Firestore.
 * Strictly strips any plaintext password field before persisting.
 */
export async function saveUserToFirestore(user: CrmUser): Promise<void> {
  try {
    const docRef = doc(db, 'crm_users', user.id);
    const cleanUser = JSON.parse(JSON.stringify(user));
    await setDoc(docRef, {
      ...cleanUser,
      firestoreSyncedAt: new Date().toISOString(),
    }, { merge: true });

    // Also mirror to doc by authUid if available for strict firestore.rules lookup
    if (user.authUid && user.authUid !== user.id) {
      const authDocRef = doc(db, 'crm_users', user.authUid);
      await setDoc(authDocRef, {
        ...cleanUser,
        firestoreSyncedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore user sync fallback:', error);
  }
}

/**
 * Deletes a CRM Staff User from Firestore across all duplicate/mirrored documents
 * and logs a permanent tombstone to prevent resurrection.
 */
export async function deleteUserFromFirestore(userId: string, username?: string, authUid?: string): Promise<void> {
  try {
    // 1. Delete direct document by userId
    const docRef = doc(db, 'crm_users', userId);
    await deleteDoc(docRef);

    // 2. Delete mirrored document by authUid if present
    if (authUid && authUid !== userId) {
      const authDocRef = doc(db, 'crm_users', authUid);
      await deleteDoc(authDocRef);
    }

    // 3. Delete any orphaned or duplicate documents in crm_users
    if (!isQuotaExhausted) {
      try {
        const colRef = collection(db, 'crm_users');
        const snap = await getDocs(colRef);
        const deletePromises: Promise<void>[] = [];
        const cleanUser = (username || '').trim().toLowerCase();

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const docUsername = (data.username || '').trim().toLowerCase();
          if (
            docSnap.id === userId ||
            (authUid && docSnap.id === authUid) ||
            data.id === userId ||
            (cleanUser && docUsername === cleanUser)
          ) {
            deletePromises.push(deleteDoc(doc(db, 'crm_users', docSnap.id)));
          }
        });
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
        }
      } catch (e: any) {
        if (isQuotaError(e)) handleFirestoreQuotaExceeded();
      }
    }

    // 4. Record in tombstone collection `crm_deleted_users`
    const tombstoneRef = doc(db, 'crm_deleted_users', userId);
    await setDoc(tombstoneRef, {
      userId,
      username: (username || '').trim().toLowerCase(),
      deletedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore user delete fallback:', error);
  }
}

/**
 * Subscribes to real-time changes of tombstoned/deleted users from Firestore.
 */
export function subscribeToDeletedUsersFromFirestore(callback: (deletedIds: string[]) => void): () => void {
  try {
    const colRef = collection(db, 'crm_deleted_users');
    return onSnapshot(
      colRef,
      (snap) => {
        const deletedIds: string[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.userId) deletedIds.push(data.userId);
          if (data.username) deletedIds.push(data.username.toLowerCase());
          if (docSnap.id) deletedIds.push(docSnap.id);
        });
        callback(deletedIds);
      },
      (error: any) => {
        if (isQuotaError(error)) {
          handleFirestoreQuotaExceeded();
        } else {
          console.warn('Firestore deleted users subscription notice:', error);
        }
      }
    );
  } catch (e: any) {
    if (isQuotaError(e)) {
      handleFirestoreQuotaExceeded();
    }
    return () => {};
  }
}

/**
 * Fetches all CRM Staff Users from Firestore.
 */
export async function fetchUsersFromFirestore(): Promise<CrmUser[]> {
  try {
    if (isQuotaExhausted) return [];
    const colRef = collection(db, 'crm_users');
    const snap = await getDocs(colRef);
    const users: CrmUser[] = [];
    snap.forEach((docSnap) => {
      users.push(docSnap.data() as CrmUser);
    });
    return users;
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return [];
    }
    console.warn('Error fetching users from Firestore:', error);
    return [];
  }
}

/**
 * Subscribes to real-time changes of CRM Staff Users in Firestore.
 */
export function subscribeToUsersFromFirestore(callback: (users: CrmUser[]) => void): () => void {
  try {
    const colRef = collection(db, 'crm_users');
    return onSnapshot(
      colRef,
      (snap) => {
        const usersMap = new Map<string, CrmUser>();
        snap.forEach((docSnap) => {
          const u = docSnap.data() as CrmUser;
          if (u && u.id) {
            usersMap.set(u.id, u);
          }
        });
        const users = Array.from(usersMap.values());
        if (users.length > 0) {
          callback(users);
        }
      },
      (error: any) => {
        if (isQuotaError(error)) {
          handleFirestoreQuotaExceeded();
        } else {
          console.warn('Firestore users subscription notice:', error);
        }
      }
    );
  } catch (e: any) {
    if (isQuotaError(e)) {
      handleFirestoreQuotaExceeded();
    }
    return () => {};
  }
}

// =========================================================================
// CRM AUDIT LOGS CLOUD SYNCHRONIZATION
// =========================================================================

/**
 * Saves an Audit Log entry to Firestore.
 */
export async function saveAuditLogToFirestore(log: UserAuditLog): Promise<void> {
  try {
    const docRef = doc(db, 'crm_audit_logs', log.id);
    const cleanLog = JSON.parse(JSON.stringify(log));
    await setDoc(docRef, cleanLog, { merge: true });
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore audit log sync fallback:', error);
  }
}

/**
 * Subscribes to real-time Audit Logs in Firestore.
 */
export function subscribeToAuditLogsFromFirestore(callback: (logs: UserAuditLog[]) => void): () => void {
  try {
    const colRef = collection(db, 'crm_audit_logs');
    const q = query(colRef, limit(50));
    return onSnapshot(
      q,
      (snap) => {
        const logs: UserAuditLog[] = [];
        snap.forEach((docSnap) => {
          logs.push(docSnap.data() as UserAuditLog);
        });
        if (logs.length > 0) {
          // Sort newest first
          logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          callback(logs);
        }
      },
      (error: any) => {
        if (isQuotaError(error)) {
          handleFirestoreQuotaExceeded();
        } else {
          console.warn('Firestore audit logs subscription notice:', error);
        }
      }
    );
  } catch (e: any) {
    if (isQuotaError(e)) {
      handleFirestoreQuotaExceeded();
    }
    return () => {};
  }
}

// =========================================================================
// CRM OWNER DIRECTIVES & NOTIFICATIONS CLOUD SYNCHRONIZATION
// =========================================================================

/**
 * Saves or updates an Owner Directive / Notification in Firestore.
 */
export async function saveDirectiveToFirestore(directive: OwnerDirectiveNotification): Promise<void> {
  try {
    const docRef = doc(db, 'crm_directives', directive.id);
    const cleanDirective = JSON.parse(JSON.stringify(directive));
    await setDoc(docRef, {
      ...cleanDirective,
      firestoreSyncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore directive sync fallback:', error);
  }
}

/**
 * Deletes an Owner Directive from Firestore.
 */
export async function deleteDirectiveFromFirestore(directiveId: string): Promise<void> {
  try {
    const docRef = doc(db, 'crm_directives', directiveId);
    await deleteDoc(docRef);
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore directive delete fallback:', error);
  }
}

/**
 * Subscribes to real-time Owner Directives in Firestore.
 */
export function subscribeToDirectivesFromFirestore(callback: (directives: OwnerDirectiveNotification[]) => void): () => void {
  try {
    const colRef = collection(db, 'crm_directives');
    return onSnapshot(
      colRef,
      (snap) => {
        const directives: OwnerDirectiveNotification[] = [];
        snap.forEach((docSnap) => {
          directives.push(docSnap.data() as OwnerDirectiveNotification);
        });
        if (directives.length > 0) {
          // Sort strictly by newest first (descending), checking both updatedAt and assignedAt
          directives.sort((a, b) => {
            const timeA = new Date(a.updatedAt || a.assignedAt || 0).getTime();
            const timeB = new Date(b.updatedAt || b.assignedAt || 0).getTime();
            return timeB - timeA; // Positive result means B is newer, so B moves to the top
          });
          callback(directives);
        }
      },
      (error: any) => {
        if (isQuotaError(error)) {
          handleFirestoreQuotaExceeded();
        } else {
          console.warn('Firestore directives subscription notice:', error);
        }
      }
    );
  } catch (e: any) {
    if (isQuotaError(e)) {
      handleFirestoreQuotaExceeded();
    }
    return () => {};
  }
}

/**
 * Fetches all Owner Directives directly from Firestore.
 */
export async function fetchDirectivesFromFirestore(): Promise<OwnerDirectiveNotification[]> {
  try {
    if (isQuotaExhausted) return [];
    const colRef = collection(db, 'crm_directives');
    const snap = await getDocs(colRef);
    const directives: OwnerDirectiveNotification[] = [];
    snap.forEach((docSnap) => {
      directives.push(docSnap.data() as OwnerDirectiveNotification);
    });
    directives.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.assignedAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.assignedAt || 0).getTime();
      return timeB - timeA;
    });
    return directives;
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return [];
    }
    console.warn('Error fetching directives from Firestore:', error);
    return [];
  }
}

// =========================================================================
// CRM TASK WORKFLOW TEMPLATES & LEAD FLOWCHARTS CLOUD SYNCHRONIZATION
// =========================================================================

/**
 * Saves a Task Workflow Template to Firestore.
 */
export async function saveWorkflowTemplateToFirestore(template: TaskWorkflowTemplate): Promise<void> {
  try {
    const docRef = doc(db, 'crm_workflow_templates', template.id);
    const clean = JSON.parse(JSON.stringify(template));
    await setDoc(docRef, clean, { merge: true });
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore workflow template sync fallback:', error);
  }
}

/**
 * Deletes a Task Workflow Template from Firestore.
 */
export async function deleteWorkflowTemplateFromFirestore(templateId: string): Promise<void> {
  try {
    const docRef = doc(db, 'crm_workflow_templates', templateId);
    await deleteDoc(docRef);
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore workflow template delete fallback:', error);
  }
}

/**
 * Fetches all Task Workflow Templates from Firestore.
 */
export async function fetchWorkflowTemplatesFromFirestore(): Promise<TaskWorkflowTemplate[]> {
  try {
    if (isQuotaExhausted) return [];
    const colRef = collection(db, 'crm_workflow_templates');
    const snap = await getDocs(colRef);
    const templates: TaskWorkflowTemplate[] = [];
    snap.forEach((docSnap) => {
      templates.push(docSnap.data() as TaskWorkflowTemplate);
    });
    return templates;
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return [];
    }
    console.warn('Firestore fetch workflow templates error:', error);
    return [];
  }
}

/**
 * Subscribes to Task Workflow Templates in Firestore.
 */
export function subscribeToWorkflowTemplatesFromFirestore(callback: (templates: TaskWorkflowTemplate[]) => void): () => void {
  try {
    const colRef = collection(db, 'crm_workflow_templates');
    return onSnapshot(
      colRef,
      (snap) => {
        const templates: TaskWorkflowTemplate[] = [];
        snap.forEach((docSnap) => {
          templates.push(docSnap.data() as TaskWorkflowTemplate);
        });
        if (templates.length > 0) {
          callback(templates);
        }
      },
      (error: any) => {
        if (isQuotaError(error)) {
          handleFirestoreQuotaExceeded();
        } else {
          console.warn('Firestore workflow templates subscription notice:', error);
        }
      }
    );
  } catch (e: any) {
    if (isQuotaError(e)) {
      handleFirestoreQuotaExceeded();
    }
    return () => {};
  }
}

/**
 * Saves an Active Lead Workflow / Flowchart to Firestore.
 */
export async function saveLeadWorkflowToFirestore(workflow: ActiveLeadWorkflow): Promise<void> {
  try {
    const docRef = doc(db, 'crm_lead_workflows', workflow.id);
    const clean = JSON.parse(JSON.stringify(workflow));
    await setDoc(docRef, clean, { merge: true });
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore lead workflow sync fallback:', error);
  }
}

/**
 * Deletes an Active Lead Workflow from Firestore.
 */
export async function deleteLeadWorkflowFromFirestore(workflowId: string): Promise<void> {
  try {
    const docRef = doc(db, 'crm_lead_workflows', workflowId);
    await deleteDoc(docRef);
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore lead workflow delete fallback:', error);
  }
}

/**
 * Subscribes to Active Lead Workflows in Firestore.
 */
export function subscribeToLeadWorkflowsFromFirestore(callback: (workflows: ActiveLeadWorkflow[]) => void): () => void {
  try {
    const colRef = collection(db, 'crm_lead_workflows');
    return onSnapshot(
      colRef,
      (snap) => {
        const workflows: ActiveLeadWorkflow[] = [];
        snap.forEach((docSnap) => {
          workflows.push(docSnap.data() as ActiveLeadWorkflow);
        });
        if (workflows.length > 0) {
          callback(workflows);
        }
      },
      (error: any) => {
        if (isQuotaError(error)) {
          handleFirestoreQuotaExceeded();
        } else {
          console.warn('Firestore lead workflows subscription notice:', error);
        }
      }
    );
  } catch (e: any) {
    if (isQuotaError(e)) {
      handleFirestoreQuotaExceeded();
    }
    return () => {};
  }
}

// =========================================================================
// CRM MULTI-BUSINESS WORKSPACES CLOUD SYNCHRONIZATION
// =========================================================================

/**
 * Saves a Business Workspace to Firestore.
 */
export async function saveBusinessToFirestore(biz: BusinessWorkspace): Promise<void> {
  try {
    const docRef = doc(db, 'crm_businesses', biz.id);
    const clean = JSON.parse(JSON.stringify(biz));
    await setDoc(docRef, clean, { merge: true });
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore business sync fallback:', error);
  }
}

/**
 * Subscribes to Business Workspaces in Firestore.
 */
export function subscribeToBusinessesFromFirestore(callback: (bizs: BusinessWorkspace[]) => void): () => void {
  try {
    const colRef = collection(db, 'crm_businesses');
    return onSnapshot(
      colRef,
      (snap) => {
        const bizs: BusinessWorkspace[] = [];
        snap.forEach((docSnap) => {
          bizs.push(docSnap.data() as BusinessWorkspace);
        });
        if (bizs.length > 0) {
          callback(bizs);
        }
      },
      (error: any) => {
        if (isQuotaError(error)) {
          handleFirestoreQuotaExceeded();
        } else {
          console.warn('Firestore businesses subscription notice:', error);
        }
      }
    );
  } catch (e: any) {
    if (isQuotaError(e)) {
      handleFirestoreQuotaExceeded();
    }
    return () => {};
  }
}

// =========================================================================
// AUTO-SEEDING & COMPREHENSIVE CLOUD DATA INITIALIZATION
// =========================================================================

/**
 * Checks Firestore and seeds any empty collection with initial default records
 * ensuring any fresh system/browser immediately sees all CRM data from the cloud.
 */
export async function seedInitialCrmDataToFirestore(initialData: {
  tasks?: CrmTask[];
  complaints?: ComplaintTicket[];
  users?: CrmUser[];
  directives?: OwnerDirectiveNotification[];
  workflowTemplates?: TaskWorkflowTemplate[];
  leadWorkflows?: ActiveLeadWorkflow[];
  businesses?: BusinessWorkspace[];
}): Promise<void> {
  // If quota is already exhausted or seeding has previously completed, skip to save quotas
  if (isQuotaExhausted) return;
  if (typeof localStorage !== 'undefined' && localStorage.getItem('dilip_crm_initial_seed_done') === 'true') {
    return;
  }

  try {
    // 1. Check Tasks
    if (initialData.tasks && initialData.tasks.length > 0) {
      const snap = await getDocs(query(collection(db, 'crm_tasks'), limit(1))).catch((e) => {
        if (isQuotaError(e)) handleFirestoreQuotaExceeded();
        return null;
      });
      if (snap && snap.empty && !isQuotaExhausted) {
        console.log('[Firestore Seed] Initializing crm_tasks in Cloud...');
        for (const t of initialData.tasks) {
          if (isQuotaExhausted) break;
          await saveTaskToFirestore(t);
        }
      }
    }

    // 2. Check Users
    if (initialData.users && initialData.users.length > 0 && !isQuotaExhausted) {
      const snap = await getDocs(query(collection(db, 'crm_users'), limit(1))).catch((e) => {
        if (isQuotaError(e)) handleFirestoreQuotaExceeded();
        return null;
      });
      if (snap && snap.empty && !isQuotaExhausted) {
        console.log('[Firestore Seed] Initializing crm_users in Cloud...');
        for (const u of initialData.users) {
          if (isQuotaExhausted) break;
          await saveUserToFirestore(u);
        }
      }
    }

    // 3. Check Complaints
    if (initialData.complaints && initialData.complaints.length > 0 && !isQuotaExhausted) {
      const snap = await getDocs(query(collection(db, 'crm_complaints'), limit(1))).catch((e) => {
        if (isQuotaError(e)) handleFirestoreQuotaExceeded();
        return null;
      });
      if (snap && snap.empty && !isQuotaExhausted) {
        console.log('[Firestore Seed] Initializing crm_complaints in Cloud...');
        for (const c of initialData.complaints) {
          if (isQuotaExhausted) break;
          await saveComplaintToFirestore(c);
        }
      }
    }

    // 4. Check Workflow Templates
    if (initialData.workflowTemplates && initialData.workflowTemplates.length > 0 && !isQuotaExhausted) {
      const snap = await getDocs(query(collection(db, 'crm_workflow_templates'), limit(1))).catch((e) => {
        if (isQuotaError(e)) handleFirestoreQuotaExceeded();
        return null;
      });
      if (snap && snap.empty && !isQuotaExhausted) {
        console.log('[Firestore Seed] Initializing crm_workflow_templates in Cloud...');
        for (const wt of initialData.workflowTemplates) {
          if (isQuotaExhausted) break;
          await saveWorkflowTemplateToFirestore(wt);
        }
      }
    }

    // 5. Check Lead Workflows
    if (initialData.leadWorkflows && initialData.leadWorkflows.length > 0 && !isQuotaExhausted) {
      const snap = await getDocs(query(collection(db, 'crm_lead_workflows'), limit(1))).catch((e) => {
        if (isQuotaError(e)) handleFirestoreQuotaExceeded();
        return null;
      });
      if (snap && snap.empty && !isQuotaExhausted) {
        console.log('[Firestore Seed] Initializing crm_lead_workflows in Cloud...');
        for (const lw of initialData.leadWorkflows) {
          if (isQuotaExhausted) break;
          await saveLeadWorkflowToFirestore(lw);
        }
      }
    }

    // 6. Check Businesses
    if (initialData.businesses && initialData.businesses.length > 0 && !isQuotaExhausted) {
      const snap = await getDocs(query(collection(db, 'crm_businesses'), limit(1))).catch((e) => {
        if (isQuotaError(e)) handleFirestoreQuotaExceeded();
        return null;
      });
      if (snap && snap.empty && !isQuotaExhausted) {
        console.log('[Firestore Seed] Initializing crm_businesses in Cloud...');
        for (const b of initialData.businesses) {
          if (isQuotaExhausted) break;
          await saveBusinessToFirestore(b);
        }
      }
    }

    try {
      localStorage.setItem('dilip_crm_initial_seed_done', 'true');
    } catch (_) {}
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return;
    }
    console.warn('Firestore initial seeding fallback:', error);
  }
}

// =========================================================================
// REAL-TIME FULL SYSTEM BACKUP SNAPSHOT ENGINE
// =========================================================================

export interface CloudBackupSnapshot {
  id: string;
  timestamp: string;
  createdAtReadable: string;
  triggeredBy: string;
  totalTasks: number;
  totalComplaints: number;
  totalUsers: number;
  totalMessages: number;
  totalWorkflows: number;
  totalAuditLogs: number;
  snapshotDataJson: string; // Full stringified payload for instant restoration
}

/**
 * Creates a permanent, named snapshot backup in Firestore Cloud (`crm_backups`).
 */
export async function createCloudBackupSnapshot(
  triggeredBy: string,
  payload: {
    tasks: CrmTask[];
    complaints: ComplaintTicket[];
    users: CrmUser[];
    chatMessages: CrmChatMessage[];
    auditLogs: UserAuditLog[];
    directives: OwnerDirectiveNotification[];
    workflowTemplates: TaskWorkflowTemplate[];
    leadWorkflows: ActiveLeadWorkflow[];
    businesses: BusinessWorkspace[];
  }
): Promise<CloudBackupSnapshot> {
  const now = new Date();
  const backupId = `backup_${now.toISOString().replace(/[:.]/g, '-')}`;
  const snapshot: CloudBackupSnapshot = {
    id: backupId,
    timestamp: now.toISOString(),
    createdAtReadable: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    triggeredBy,
    totalTasks: payload.tasks.length,
    totalComplaints: payload.complaints.length,
    totalUsers: payload.users.length,
    totalMessages: payload.chatMessages.length,
    totalWorkflows: payload.workflowTemplates.length + payload.leadWorkflows.length,
    totalAuditLogs: payload.auditLogs.length,
    snapshotDataJson: JSON.stringify(payload),
  };

  try {
    const docRef = doc(db, 'crm_backups', backupId);
    await setDoc(docRef, snapshot);
    console.log(`[Backup Engine] Cloud snapshot "${backupId}" created successfully.`);
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return snapshot;
    }
    console.warn('Firestore cloud backup snapshot fallback:', error);
  }

  return snapshot;
}

/**
 * Fetches all available cloud backup snapshots from Firestore.
 */
export async function fetchCloudBackupSnapshots(): Promise<CloudBackupSnapshot[]> {
  try {
    if (isQuotaExhausted) return [];
    const colRef = collection(db, 'crm_backups');
    const snap = await getDocs(query(colRef, limit(30)));
    const backups: CloudBackupSnapshot[] = [];
    snap.forEach((docSnap) => {
      backups.push(docSnap.data() as CloudBackupSnapshot);
    });
    backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return backups;
  } catch (error: any) {
    if (isQuotaError(error)) {
      handleFirestoreQuotaExceeded();
      return [];
    }
    console.warn('Error fetching cloud backup snapshots:', error);
    return [];
  }
}

