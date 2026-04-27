import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getPrismaClient = async () => {
  const connectionString = (process.env.DIRECT_URL || process.env.DATABASE_URL)?.trim()
  
  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_URL is missing from environment')
  }

  let adapter: any
  
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    // Production: Use Neon Serverless Adapter (Safe for Vercel Edge/Serverless)
    const { Pool: NeonPool } = await import('@neondatabase/serverless')
    const { PrismaNeon } = await import('@prisma/adapter-neon')
    
    const pool = new NeonPool({ 
      connectionString,
      ssl: true,
      max: 1 
    })
    adapter = new PrismaNeon(pool as any)
  } else {
    // Local: Use Native PG Driver (Dynamic import to avoid Edge crashes)
    const { Pool: NativePool } = await import('pg')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    
    const pool = new NativePool({ connectionString })
    adapter = new PrismaPg(pool as any)
  }
  
  const client = new PrismaClient({ adapter })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }
  return client
}

/**
 * Proxy-based Prisma singleton with Dynamic Driver Loading.
 * This is the ultimate "Bulletproof" strategy for Next.js + Prisma 7.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    // The Proxy handles the async nature of the dynamic import
    const getClient = async () => {
      const client = globalForPrisma.prisma ?? await getPrismaClient()
      return (client as any)[prop]
    }

    // Special handling for then/catch/finally to make it look like a regular object
    if (prop === 'then') return undefined

    return (...args: any[]) => {
      return getClient().then(fn => {
        if (typeof fn === 'function') {
          return fn.apply(globalForPrisma.prisma, args)
        }
        return fn
      })
    }
  }
})
