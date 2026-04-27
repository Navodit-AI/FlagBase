import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// This function initializes the client based on the environment
const createPrismaClient = () => {
  const connectionString = (process.env.DIRECT_URL || process.env.DATABASE_URL)?.trim()
  
  if (!connectionString) {
    // We don't throw here to prevent build-time crashes (Vercel build sometimes lacks envs)
    console.warn('Warning: DATABASE_URL is missing')
    return new PrismaClient()
  }

  // We use a property to check if we're in a Node.js environment vs Edge
  const isNode = typeof process !== 'undefined' && process.versions && process.versions.node

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    // Production / Vercel
    try {
      // We use a "lazy-require" pattern to avoid Edge runtime pollution
      const { Pool: NeonPool } = require('@neondatabase/serverless')
      const { PrismaNeon } = require('@prisma/adapter-neon')
      
      const pool = new NeonPool({ 
        connectionString,
        ssl: true,
        max: 1 
      })
      const adapter = new PrismaNeon(pool)
      return new PrismaClient({ adapter })
    } catch (e) {
      // Fallback for environments where Neon driver fails to load
      return new PrismaClient()
    }
  } else {
    // Local / Development
    const { Pool: NativePool } = require('pg')
    const { PrismaPg } = require('@prisma/adapter-pg')
    
    const pool = new NativePool({ connectionString })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  }
}

// Ensure we have a singleton in development to prevent too many connections
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
