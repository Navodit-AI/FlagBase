import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getBaseClient = () => {
  // On Vercel/Production, we FORCE the Neon Adapter
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    const url = process.env.DATABASE_URL?.trim()
    if (!url) {
      console.error('CRITICAL: DATABASE_URL is missing in production')
      return new PrismaClient()
    }

    // Cast as any to resolve version-mismatch type errors in Vercel build
    const pool = new Pool({ connectionString: url })
    const adapter = new PrismaNeon(pool as any)
    return new PrismaClient({ adapter })
  }

  // Locally, we use the standard Prisma behavior
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? getBaseClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
