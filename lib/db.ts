import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const url = String(rawUrl || '').trim();

// 1. Raw SQL Executor (for our greedy signup)
export const sql = neon(url);

// 2. Drizzle Client (for NextAuth and structured queries)
export const db = drizzle(sql);

// 3. User Schema (matching your discovered DB casing)
export const users = pgTable('User', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('passwordHash').notNull(), // Matching the discovered column name
  name: text('name'),
  role: text('role').default('USER'),
  createdAt: timestamp('createdAt').defaultNow(),
});
