import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getDbClient = () => {
  // Check every possible environment name Vercel/Neon might use
  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
  
  // CRITICAL: Ensure we have a string. If Turbopack injected a function, 
  // String() will convert it to source code, so we check for 'function' specifically.
  const url = String(rawUrl || '').trim()
  
  if (!url || url.includes('function') || url.length < 10) {
    console.error('[DB_FATAL] Invalid Connection String detected:', url.substring(0, 20))
    // Fallback to standard client (no adapter) if URL is missing
    return new PrismaClient()
  }

  try {
    const pool = new Pool({ connectionString: url })
    const adapter = new PrismaNeon(pool)
    return new PrismaClient({ adapter })
  } catch (err: any) {
    console.error('[DB_RECOVERY] WebSocket Pool failed:', err.message)
    return new PrismaClient()
  }
}

export const prisma = globalForPrisma.prisma ?? getDbClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
