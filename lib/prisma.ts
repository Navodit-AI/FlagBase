import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL?.trim()
  console.log('DEBUG: connectionString prefix:', connectionString?.substring(0, 15))
  console.log('DEBUG: connectionString length:', connectionString?.length)
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing from environment')
  }

  // Passing the URL directly to the constructor as a string is the 
  // most robust way for the underlying pg driver.
  const pool = new Pool({ connectionString: connectionString })
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
