import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Ensure the Neon HTTP driver is configured
const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const url = String(rawUrl || '').trim();

if (!url) {
  console.error('[DRIZZLE_INIT] No URL found!');
}

const sql = neon(url);
export const db = drizzle(sql);

// Changing to 'User' (capital U) to match Prisma's default table naming convention.
// This resolves the 42P01 'undefined_table' error we saw in the logs.
export const users = pgTable('User', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  role: text('role').default('USER'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});
