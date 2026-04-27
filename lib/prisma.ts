import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Move the constructor satisfaction to the absolute module root
// to prevent any race conditions from other imports (like Auth.js)
const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
const url = String(rawUrl || '').trim()
const dummyUrl = "postgresql://dummy:dummy@localhost:5432/dummy"

// Block the localhost fallback at the process level immediately
process.env.DATABASE_URL = (url && url.length > 10) ? url : dummyUrl

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getDbClient = () => {
  console.log('[DB_TRACE] Initializing client...')
  
  if (url && url.length > 10) {
    try {
      console.log('[DB_TRACE] Active connection found, using WebSocket adapter')
      const pool = new Pool({ connectionString: url })
      const adapter = new PrismaNeon(pool as any)
      return new PrismaClient({ adapter })
    } catch (err: any) {
      console.error('[DB_TRACE] Adapter init failed, using binary fallback:', err.message)
      return new PrismaClient()
    }
  }

  console.warn('[DB_TRACE] No valid URL provided, using dummy-satisfied binary client')
  return new PrismaClient()
}

// In production, we MUST bypass the cache carefully
export const prisma = (process.env.NODE_ENV === 'production') 
  ? getDbClient() 
  : (globalForPrisma.prisma ?? getDbClient())

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
