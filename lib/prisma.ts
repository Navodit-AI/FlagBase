import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Required for Neon Pool in some Node environments
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getBaseClient = () => {
  const url = process.env.DATABASE_URL
  
  // Debug log (masked for security)
  if (process.env.NODE_ENV === 'production') {
    const status = url ? `PRESENT (length: ${url.length}, prefix: ${url.substring(0, 10)}...)` : 'MISSING'
    console.log(`[PRISMA_INIT] Database URL status: ${status}`)
  }

  if ((process.env.NODE_ENV === 'production' || process.env.VERCEL) && url) {
    // Force the use of the serverless adapter
    const pool = new Pool({ connectionString: url })
    const adapter = new PrismaNeon(pool as any)
    return new PrismaClient({ adapter })
  }

  // Fallback to standard Prisma (local or if env missing)
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? getBaseClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
