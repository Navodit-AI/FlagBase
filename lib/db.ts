import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

const sql = neon(process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || '');
export const db = drizzle(sql);

// Minimal User Schema to match your existing Prisma model
export const users = pgTable('User', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  role: text('role').default('USER'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});
