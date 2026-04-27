import { neon, neonConfig } from '@neondatabase/serverless';
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

// We use lowercase 'user' because Postgres/Prisma often defaults to it 
// unless explicitly quoted. This matches the most common migration output.
export const users = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  role: text('role').default('USER'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});
