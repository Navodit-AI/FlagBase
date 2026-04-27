export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSession, requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ key: string, envName: string }> }
) {
  try {
    const { key, envName } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    requireRole(session, 'EDITOR')

    const flag = await prisma.flag.findUnique({
      where: { orgId_key: { orgId: session.user.orgId, key } }
    })

    if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

    const env = await prisma.environment.findUnique({
      where: { 
        orgId_name: { orgId: session.user.orgId, name: envName } 
      }
    })

    if (!env) return NextResponse.json({ error: 'Environment not found' }, { status: 404 })

    const body = await req.json()
    const { enabled, value } = body

    const updated = await prisma.$transaction(async (tx) => {
      const override = await tx.flagOverride.upsert({
        where: { 
          flagId_envId: { flagId: flag.id, envId: env.id } 
        },
        create: {
          flagId: flag.id,
          envId: env.id,
          enabled: enabled ?? false,
          value: String(value ?? flag.defaultValue)
        },
        update: {
          ...(enabled !== undefined && { enabled }),
          ...(value !== undefined && { value: String(value) })
        }
      })

      await tx.auditLog.create({
        data: {
          action: 'OVERRIDE_TOGGLED',
          actorId: session.user.userId,
          actorEmail: session.user.email,
          flagId: flag.id,
          diff: { 
            environment: envName, 
            changes: body 
          }
        }
      })

      return override
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
