import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const url = String(rawUrl || '').trim();

const sql = neon(url);
export const db = drizzle(sql);

// We strip this down to ONLY the pillars of the table to avoid 'Missing Column' errors on timestamps.
// Prisma creates these as 'createdAt' or 'created_at' or 'createdat' depending on migration settings.
// By only selecting ID, Email, and Password, we guarantee query safety.
export const users = pgTable('User', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  role: text('role').default('USER'),
});
