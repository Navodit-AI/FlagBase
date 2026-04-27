import { PrismaClient } from '@prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getDbClient = () => {
  const envUrl = process.env.DATABASE_URL
  
  // Debug: Log the type of the environment variable
  console.log(`[DB_CHECK] DATABASE_URL type: ${typeof envUrl}`)
  
  // Force it to a string and ensure it's not the string 'undefined' or a function source
  let url = (typeof envUrl === 'string' ? envUrl : '').trim()
  
  if (!url || url.length < 10) {
    console.warn('[DB_CHECK] URL is invalid or missing, using dummy fallback')
    url = "https://dummy.neon.tech/main"
  } else {
    // Mask the URL for security but confirm its start
    console.log(`[DB_CHECK] URL starts with: ${url.substring(0, 15)}...`)
  }

  try {
    const sql = neon(url)
    const adapter = new (PrismaNeonHttp as any)(sql)
    return new PrismaClient({ adapter })
  } catch (err: any) {
    console.error('[DB_ERROR] Failed to init Prisma:', err.message)
    // Absolute fallback to non-adapter client if the adapter init fails
    return new PrismaClient()
  }
}

export const prisma = globalForPrisma.prisma ?? getDbClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
