import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, uuid, timestamp, boolean, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const url = String(rawUrl || '').trim();

export const sql = neon(url);
export const db = drizzle(sql);

// Enums (Matching Prisma's generated types in Postgres)
export const flagTypeEnum = pgEnum('FlagType', ['BOOLEAN', 'STRING', 'NUMBER', 'JSON']);
export const roleEnum = pgEnum('Role', ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']);

// 1. User Schema
export const users = pgTable('User', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('passwordHash').notNull(),
  name: text('name'),
  createdAt: timestamp('createdAt').defaultNow(),
});

// 2. Flag Schema
export const flags = pgTable('Flag', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  key: text('key').notNull(),
  description: text('description'),
  type: flagTypeEnum('type').default('BOOLEAN'),
  defaultValue: text('defaultValue').notNull(),
  archived: boolean('archived').default(false),
  orgId: text('orgId').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// 3. Targeting Rule Schema
export const rules = pgTable('TargetingRule', {
  id: text('id').primaryKey(),
  priority: integer('priority').notNull(),
  percentage: integer('percentage'),
  value: text('value').notNull(),
  conditions: jsonb('conditions').notNull(),
  flagId: text('flagId').notNull(),
})

// 4. Environment Schema
export const environments = pgTable('Environment', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  orgId: text('orgId').notNull(),
})

// 5. Flag Override Schema
export const overrides = pgTable('FlagOverride', {
  id: text('id').primaryKey(),
  enabled: boolean('enabled').default(false),
  value: text('value'),
  flagId: text('flagId').notNull(),
  envId: text('envId').notNull(),
})

// 6. API Key Schema
export const apiKeys = pgTable('ApiKey', {
  id: text('id').primaryKey(),
  keyHash: text('keyHash').notNull().unique(),
  label: text('label').notNull(),
  envName: text('envName').notNull(),
  lastUsed: timestamp('lastUsed'),
  createdAt: timestamp('createdAt').defaultNow(),
  orgId: text('orgId').notNull(),
})

// 7. Organization Schema
export const organizations = pgTable('Organization', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('createdAt').defaultNow(),
})

// 8. OrgMember Schema
export const members = pgTable('OrgMember', {
  id: text('id').primaryKey(),
  role: roleEnum('role').notNull().default('VIEWER'),
  userId: text('userId').notNull(),
  orgId: text('orgId').notNull(),
})

// 9. Audit Log Schema
export const auditLogs = pgTable('AuditLog', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  actorEmail: text('actorEmail').notNull(),
  flagId: text('flagId'),
  diff: jsonb('diff'),
  createdAt: timestamp('createdAt').defaultNow(),
  orgId: text('orgId').notNull(),
})
