import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool as NeonPool } from '@neondatabase/serverless'
import { Pool as NativePool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getPrismaClient = () => {
  const connectionString = (process.env.DIRECT_URL || process.env.DATABASE_URL)?.trim()
  
  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_URL is missing from environment')
  }

  let adapter: any
  
  if (process.env.NODE_ENV === 'production') {
    // Production: Use Neon Serverless Adapter (for Edge compatibility)
    const pool = new NeonPool({ connectionString })
    adapter = new PrismaNeon(pool as any)
  } else {
    // Local: Use Native PG Driver (more stable on Mac/Node.js)
    const pool = new NativePool({ connectionString })
    adapter = new PrismaPg(pool as any)
  }
  
  const client = new PrismaClient({ adapter })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }
  return client
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = globalForPrisma.prisma ?? getPrismaClient()
    return (client as any)[prop]
  }
})
