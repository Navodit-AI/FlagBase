import { neon } from '@neondatabase/serverless';

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const url = String(rawUrl || '').trim();

// Export the raw SQL executor for total control
export const sql = neon(url);
