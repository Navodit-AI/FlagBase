import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getDbClient = () => {
  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
  const url = String(rawUrl || '').trim()
  
  if (!url || url.includes('function') || url.length < 10) {
    console.warn('[DB_INIT] No valid URL found, falling back to standard client')
    return new PrismaClient()
  }

  try {
    console.log('[DB_INIT] Initializing fresh WebSocket Pool...')
    const pool = new Pool({ connectionString: url })
    const adapter = new PrismaNeon(pool as any)
    return new PrismaClient({ adapter })
  } catch (err: any) {
    console.error('[DB_INIT] Initialization failed:', err.message)
    return new PrismaClient()
  }
}

// FORCE re-initialization in production to bypass stale Vercel warm-function caches
export const prisma = (process.env.NODE_ENV === 'production') 
  ? getDbClient() 
  : (globalForPrisma.prisma ?? getDbClient())

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
