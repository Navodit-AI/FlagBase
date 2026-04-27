import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getBaseClient = () => {
  const url = process.env.DATABASE_URL?.trim()

  if (process.env.NODE_ENV === 'production' && url) {
    // Force the environment variable into the process just in case
    // Vercel's bundler or the Prisma engine is looking for it.
    process.env.DATABASE_URL = url
    return new PrismaClient()
  }

  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? getBaseClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
