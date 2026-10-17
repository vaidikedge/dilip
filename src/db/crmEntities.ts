import { db } from './index.ts';
import { tasks, complaints, businesses, auditLogs, cloudBackups } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

// ---------------- Tasks ---------------- //
export async function getDbTasks() {
  try {
    return await db.select().from(tasks).orderBy(desc(tasks.updatedAt));
  } catch (error) {
    console.error('Failed to get tasks from DB:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function upsertDbTask(taskData: typeof tasks.$inferInsert) {
  try {
    return await db.insert(tasks)
      .values(taskData)
      .onConflictDoUpdate({
        target: tasks.id,
        set: {
          taskCode: taskData.taskCode,
          title: taskData.title,
          customerName: taskData.customerName,
          customerPhone: taskData.customerPhone,
          customerAddress: taskData.customerAddress,
          capacityKw: taskData.capacityKw,
          systemType: taskData.systemType,
          status: taskData.status,
          assignedToUserId: taskData.assignedToUserId,
          assignedToUserName: taskData.assignedToUserName,
          dealValueRs: taskData.dealValueRs,
          ownerInstructions: taskData.ownerInstructions,
          dataJson: taskData.dataJson,
          updatedAt: new Date(),
        },
      })
      .returning();
  } catch (error) {
    console.error('Failed to upsert task in DB:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// ---------------- Complaints ---------------- //
export async function getDbComplaints() {
  try {
    return await db.select().from(complaints).orderBy(desc(complaints.createdAt));
  } catch (error) {
    console.error('Failed to get complaints from DB:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function upsertDbComplaint(compData: typeof complaints.$inferInsert) {
  try {
    return await db.insert(complaints)
      .values(compData)
      .onConflictDoUpdate({
        target: complaints.id,
        set: {
          ticketNo: compData.ticketNo,
          customerName: compData.customerName,
          customerPhone: compData.customerPhone,
          customerAddress: compData.customerAddress,
          issueType: compData.issueType,
          description: compData.description,
          priority: compData.priority,
          status: compData.status,
          assignedTo: compData.assignedTo,
          dataJson: compData.dataJson,
        },
      })
      .returning();
  } catch (error) {
    console.error('Failed to upsert complaint in DB:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// ---------------- Businesses ---------------- //
export async function getDbBusinesses() {
  try {
    return await db.select().from(businesses).orderBy(desc(businesses.createdAt));
  } catch (error) {
    console.error('Failed to get businesses from DB:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function upsertDbBusiness(bizData: typeof businesses.$inferInsert) {
  try {
    return await db.insert(businesses)
      .values(bizData)
      .onConflictDoUpdate({
        target: businesses.id,
        set: {
          name: bizData.name,
          tagline: bizData.tagline,
          industry: bizData.industry,
          category: bizData.category,
          currency: bizData.currency,
          ownerName: bizData.ownerName,
          contactPhone: bizData.contactPhone,
          email: bizData.email,
          dataJson: bizData.dataJson,
        },
      })
      .returning();
  } catch (error) {
    console.error('Failed to upsert business in DB:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// ---------------- Audit Logs ---------------- //
export async function getDbAuditLogs() {
  try {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp));
  } catch (error) {
    console.error('Failed to get audit logs from DB:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function insertDbAuditLog(logData: typeof auditLogs.$inferInsert) {
  try {
    return await db.insert(auditLogs).values(logData).returning();
  } catch (error) {
    console.error('Failed to insert audit log in DB:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// ---------------- Backups ---------------- //
export async function saveDbBackupSnapshot(snapshotId: string, createdBy: string, payload: any) {
  try {
    return await db.insert(cloudBackups)
      .values({
        id: snapshotId,
        createdBy,
        payloadJson: JSON.stringify(payload),
      })
      .returning();
  } catch (error) {
    console.error('Failed to save DB backup snapshot:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getDbBackupSnapshots() {
  try {
    return await db.select().from(cloudBackups).orderBy(desc(cloudBackups.createdAt));
  } catch (error) {
    console.error('Failed to get DB backup snapshots:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
