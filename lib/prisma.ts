import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// 1. SATURATE THE ENVIRONMENT IMMEDIATELY
const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
const url = String(rawUrl || '').trim()
const dummyUrl = "postgresql://dummy:dummy@localhost:5432/dummy"
process.env.DATABASE_URL = (url && url.length > 10) ? url : dummyUrl

// 2. NOW LOAD PRISMA CLIENT DYNAMICALLY
// This ensures that the generated Prisma code sees the saturated environment above
const { PrismaClient } = require('@prisma/client')

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as { prisma: any | undefined }

const getDbClient = () => {
  console.log('[DB_INIT] Constructing Prisma Client...')
  
  if (url && url.length > 10) {
    try {
      console.log('[DB_INIT] Using WebSocket Adapter with valid URL')
      const pool = new Pool({ connectionString: url })
      const adapter = new PrismaNeon(pool as any)
      return new PrismaClient({ adapter })
    } catch (err: any) {
      console.error('[DB_INIT] Adapter failure, falling back to core:', err.message)
      return new PrismaClient()
    }
  }

  console.warn('[DB_INIT] No URL found, using dummy core client')
  return new PrismaClient()
}

export const prisma = (process.env.NODE_ENV === 'production') 
  ? getDbClient() 
  : (globalForPrisma.prisma ?? getDbClient())

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
