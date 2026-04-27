import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getDbClient = () => {
  const url = process.env.DATABASE_URL?.trim()

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    if (!url) {
      console.error('[FLAGBASE_DB_INIT] CRITICAL: DATABASE_URL is EMPTY in production')
    } else {
      console.log(`[FLAGBASE_DB_INIT] Initializing Standard Prisma Engine (URL length: ${url.length})`)
      process.env.DATABASE_URL = url
    }
    // We are NOT using an adapter here. If Vercel still shows a Neon error, 
    // it means it's running a stale build.
    return new PrismaClient()
  }

  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? getDbClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
