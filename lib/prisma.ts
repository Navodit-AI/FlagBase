import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getDbClient = () => {
  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
  const url = String(rawUrl || '').trim()
  
  // Create a persistent dummy to satisfy the internal Prisma validator
  const dummyUrl = "postgresql://dummy:dummy@localhost:5432/dummy"
  
  // Even if we use an adapter, Prisma Client constructor still checks 
  // the env for a valid-looking string or it defaults to localhost and crashes.
  process.env.DATABASE_URL = (url && url.length > 10) ? url : dummyUrl

  try {
    if (url && url.length > 10) {
      console.log('[DB_INIT] Using WebSocket Adapter with valid URL')
      const pool = new Pool({ connectionString: url })
      const adapter = new PrismaNeon(pool as any)
      return new PrismaClient({ adapter })
    }
    
    console.warn('[DB_INIT] No URL found, returning dummy-safe client')
    return new PrismaClient()
  } catch (err: any) {
    console.error('[DB_INIT] Adapter failed, falling back to dummy-safe core:', err.message)
    return new PrismaClient()
  }
}

// Keep the cash-buster logic to ensure fresh evaluation
export const prisma = (process.env.NODE_ENV === 'production') 
  ? getDbClient() 
  : (globalForPrisma.prisma ?? getDbClient())

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
