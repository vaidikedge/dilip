import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('employee'),
  roleTitle: text('role_title'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  taskCode: text('task_code').notNull(),
  title: text('title').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  customerAddress: text('customer_address'),
  capacityKw: integer('capacity_kw'),
  systemType: text('system_type'),
  status: text('status').default('not started'),
  assignedToUserId: text('assigned_to_user_id'),
  assignedToUserName: text('assigned_to_user_name'),
  dealValueRs: text('deal_value_rs'),
  ownerInstructions: text('owner_instructions'),
  dataJson: text('data_json'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const complaints = pgTable('complaints', {
  id: text('id').primaryKey(),
  ticketNo: text('ticket_no').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  customerAddress: text('customer_address'),
  issueType: text('issue_type'),
  description: text('description'),
  priority: text('priority').default('Normal'),
  status: text('status').default('Open'),
  assignedTo: text('assigned_to'),
  dataJson: text('data_json'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const businesses = pgTable('businesses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  tagline: text('tagline'),
  industry: text('industry'),
  category: text('category'),
  currency: text('currency').default('₹'),
  ownerName: text('owner_name'),
  contactPhone: text('contact_phone'),
  email: text('email'),
  dataJson: text('data_json'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  userName: text('user_name'),
  userRole: text('user_role'),
  action: text('action').notNull(),
  details: text('details'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const cloudBackups = pgTable('cloud_backups', {
  id: text('id').primaryKey(),
  createdBy: text('created_by').notNull(),
  payloadJson: text('payload_json').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
