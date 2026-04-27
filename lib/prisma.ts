import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getPrismaClient = () => {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient()
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient()
  }
  return globalForPrisma.prisma
}

/**
 * Proxy-based Prisma singleton.
 * This prevents Prisma from initializing during static analysis at build time.
 * The actual database connection is only created during the first actual 
 * query at runtime.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient()
    return (client as any)[prop]
  }
})
