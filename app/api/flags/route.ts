export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSession, requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const flags = await prisma.flag.findMany({
    where: { 
      orgId: session.user.orgId,
      archived: false 
    },
    include: {
      overrides: {
        include: { env: true }
      },
      _count: {
        select: { rules: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(flags)
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    requireRole(session, 'EDITOR')

    const body = await req.json()
    const { name, key, description, type, defaultValue } = body

    if (!name || !key || !type || !defaultValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!/^[a-z0-9_-]+$/.test(key)) {
      return NextResponse.json(
        { error: 'Key must be lowercase letters, numbers, hyphens or underscores only' }, 
        { status: 400 }
      )
    }

    const existing = await prisma.flag.findUnique({
      where: { 
        orgId_key: { orgId: session.user.orgId, key } 
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Flag key already exists in this organization' }, { status: 409 })
    }

    const environments = await prisma.environment.findMany({
      where: { orgId: session.user.orgId }
    })

    const newFlag = await prisma.$transaction(async (tx) => {
      const flag = await tx.flag.create({
        data: {
          name,
          key,
          description,
          type,
          defaultValue,
          orgId: session.user.orgId,
          overrides: {
            create: environments.map(env => ({
              envId: env.id,
              enabled: false,
              value: defaultValue
            }))
          }
        }
      })

      await tx.auditLog.create({
        data: {
          action: 'FLAG_CREATED',
          actorId: session.user.userId,
          actorEmail: session.user.email,
          flagId: flag.id
        }
      })

      return flag
    })

    return NextResponse.json(newFlag, { status: 201 })
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
