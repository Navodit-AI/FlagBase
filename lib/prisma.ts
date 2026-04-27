import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
const url = String(rawUrl || '').trim()
const dummyUrl = "postgresql://dummy:dummy@localhost:5432/dummy"

// Force the process env at the absolute module root
process.env.DATABASE_URL = (url && url.length > 10) ? url : dummyUrl

const { PrismaClient } = require('@prisma/client')
neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as { prisma: any | undefined }

const getDbClient = () => {
  const activeUrl = (url && url.length > 10) ? url : dummyUrl
  
  console.log(`[DB_FINAL] Injecting URL: ${activeUrl.substring(0, 15)}...`)

  try {
    const pool = new Pool({ connectionString: activeUrl })
    const adapter = new PrismaNeon(pool as any)
    
    // Pass the URL to EVERY possible constructor property. 
    // Prisma 7 changed these specs, so we provide all variations.
    return new PrismaClient({
      adapter,
      datasourceUrl: activeUrl,
      datasources: {
        db: { url: activeUrl }
      }
    } as any)
  } catch (err: any) {
    console.error('[DB_FINAL] Adapter crash, falling back to core:', err.message)
    return new PrismaClient({
      datasourceUrl: activeUrl
    } as any)
  }
}

export const prisma = (process.env.NODE_ENV === 'production') 
  ? getDbClient() 
  : (globalForPrisma.prisma ?? getDbClient())

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
