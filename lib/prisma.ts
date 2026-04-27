import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const getDbClient = () => {
  const url = (process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim()
  
  if (!url || url.length < 10) {
    console.error('[DB_FINAL] FATAL: No database URL found in environment!')
    return new PrismaClient()
  }

  // Force capture the URL into the env for Prisma's internal validator
  process.env.DATABASE_URL = url

  try {
    console.log('[DB_FINAL] Attempting WebSocket Adapter Init...')
    const pool = new Pool({ connectionString: url })
    const adapter = new PrismaNeon(pool as any)
    
    // In Prisma 7, the 'adapter' property is the PRIMARY way to connect.
    // We remove all other datasource overrides to avoid the 'Unknown property' crash.
    return new PrismaClient({ adapter })
  } catch (err: any) {
    console.warn('[DB_FINAL] Adapter Init failed, trying native bridge:', err.message)
    // Fallback to the most basic native client
    return new PrismaClient()
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const prisma = globalForPrisma.prisma ?? getDbClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
