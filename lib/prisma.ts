import { PrismaClient } from '@prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const getDbClient = () => {
  // Use a valid-looking dummy URL for build-time safety if the real one is missing
  const url = process.env.DATABASE_URL?.trim() || "https://dummy.neon.tech/main"
  
  // Neon HTTP adapter is stateless and build-safe
  const sql = neon(url)
  const adapter = new (PrismaNeonHttp as any)(sql)

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? getDbClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
