import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const url = String(rawUrl || '').trim();

// 1. Raw SQL Executor
export const sql = neon(url);

// 2. Drizzle Client
export const db = drizzle(sql);

// 3. User Schema (Stripped down to the EXACT 5 columns found in your DB)
// Found columns: createdAt, id, email, name, passwordHash
export const users = pgTable('User', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('passwordHash').notNull(),
  name: text('name'),
  createdAt: timestamp('createdAt').defaultNow(),
});
