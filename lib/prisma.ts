import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const connectionString = process.env.DATABASE_URL?.trim()

if (!connectionString) {
  throw new Error('DATABASE_URL is missing from environment')
}

// Low-level check
console.log('DEBUG: Final connectionString check:', connectionString.substring(0, 15))

const pool = new Pool({ connectionString: connectionString })
const adapter = new PrismaNeon(pool as any)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
