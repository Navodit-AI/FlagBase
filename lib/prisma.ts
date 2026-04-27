import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL
  console.log('DEBUG: connectionString type:', typeof connectionString)
  console.log('DEBUG: connectionString length:', connectionString?.length)
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing from environment')
  }
  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool as any)
  
  const client = new PrismaClient({ adapter })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }
  return client
}

/**
 * Proxy-based Prisma singleton using the Neon Driver Adapter.
 * This is the recommended way to connect to Neon in Prisma 7.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = globalForPrisma.prisma ?? getPrismaClient()
    return (client as any)[prop]
  }
})
