import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Required for the WebSocket driver to work in Node.js/Vercel environments
neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getDbClient = () => {
  const envUrl = process.env.DATABASE_URL
  const url = (typeof envUrl === 'string' ? envUrl : '').trim()
  
  if (!url || url.length < 10) {
    console.warn('[DB_CHECK] Using dummy fallback URL')
    return new PrismaClient()
  }

  try {
    console.log(`[DB_INIT] Using WebSocket Pool for ${url.substring(0, 20)}...`)
    
    // Create a WebSocket pool instead of the flaky HTTP neon() function
    const pool = new Pool({ connectionString: url })
    const adapter = new PrismaNeon(pool)
    
    return new PrismaClient({ adapter })
  } catch (err: any) {
    console.error('[DB_ERROR] WebSocket Pool failed, falling back:', err.message)
    return new PrismaClient()
  }
}

export const prisma = globalForPrisma.prisma ?? getDbClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
