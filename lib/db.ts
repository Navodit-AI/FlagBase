import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, uuid, timestamp, boolean } from 'drizzle-orm/pg-core';

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const url = String(rawUrl || '').trim();

export const sql = neon(url);
export const db = drizzle(sql);

// 1. User Schema
export const users = pgTable('User', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('passwordHash').notNull(),
  name: text('name'),
  createdAt: timestamp('createdAt').defaultNow(),
});

// 2. Flag Schema (Mapped to your Prisma structure)
export const flags = pgTable('Flag', {
  id: text('id').primaryKey(), // Prisma cuid() is text
  name: text('name').notNull(),
  key: text('key').notNull(),
  description: text('description'),
  type: text('type').default('BOOLEAN'),
  defaultValue: text('defaultValue').notNull(),
  archived: boolean('archived').default(false),
  orgId: text('orgId').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});
