import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getPrismaClient = () => {
  // Use DIRECT_URL if available (better for local/migrations), otherwise DATABASE_URL
  const connectionString = (process.env.DIRECT_URL || process.env.DATABASE_URL)?.trim()
  
  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_URL is missing from environment')
  }

  console.log('DEBUG: Connecting with string length:', connectionString.length)

  // Use the object-style constructor again, but with an explicit connectionString
  // and SSL enabled to satisfy the Neon driver.
  const pool = new Pool({ 
    connectionString: connectionString,
    ssl: true 
  })
  
  const adapter = new PrismaNeon(pool as any)
  const client = new PrismaClient({ adapter })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }
  return client
}

/**
 * Proxy-based Prisma singleton.
 * This solves two problems:
 * 1. Build-time stability (Module Evaluation crash).
 * 2. Runtime direct connection to Neon.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = globalForPrisma.prisma ?? getPrismaClient()
    return (client as any)[prop]
  }
})
