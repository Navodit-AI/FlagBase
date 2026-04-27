import { PrismaClient } from '@prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getBaseClient = () => {
  const url = process.env.DATABASE_URL?.trim()
  
  if ((process.env.NODE_ENV === 'production' || process.env.VERCEL) && url) {
    // Switch to Neon HTTP Driver (Bulletproof on Vercel Serverless/Edge)
    const sql = neon(url)
    const adapter = new PrismaNeonHttp(sql)
    return new PrismaClient({ adapter })
  }

  // Local fallback
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? getBaseClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
