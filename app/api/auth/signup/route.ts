import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// Create a one-off client for this route to bypass any global cache issues
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

export async function POST(req: Request) {
  console.log('[SIGNUP_ROUTE] Starting fresh signup attempt')
  try {
    const body = await req.json()
    const { name, email, password, orgName } = body

    if (!name || !email || !password || !orgName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const slug = orgName.toLowerCase().trim().replace(/\s+/g, '-')

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash }
      })

      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug,
          environments: {
            create: [
              { name: 'production' },
              { name: 'staging' },
              { name: 'development' }
            ]
          },
          members: {
            create: {
              userId: user.id,
              role: 'OWNER'
            }
          }
        }
      })

      return { user, org }
    })

    return NextResponse.json({ message: 'Account created' }, { status: 201 })
  } catch (error: any) {
    console.error('[SIGNUP_ERROR]:', error.message)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
