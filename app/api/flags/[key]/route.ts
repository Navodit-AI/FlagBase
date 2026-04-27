export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSession, requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const flag = await prisma.flag.findUnique({
    where: { 
      orgId_key: { orgId: session.user.orgId, key } 
    },
    include: {
      rules: { orderBy: { priority: 'asc' } },
      overrides: { include: { env: true } }
    }
  })

  if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

  return NextResponse.json(flag)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    requireRole(session, 'EDITOR')

    const existing = await prisma.flag.findUnique({
      where: { orgId_key: { orgId: session.user.orgId, key } }
    })

    if (!existing) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

    const body = await req.json()
    const { name, description, defaultValue, archived } = body

    const before = { 
      name: existing.name,
      description: existing.description, 
      defaultValue: existing.defaultValue, 
      archived: existing.archived 
    }

    const updated = await prisma.$transaction(async (tx) => {
      const flag = await tx.flag.update({
        where: { id: existing.id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(defaultValue !== undefined && { defaultValue }),
          ...(archived !== undefined && { archived })
        }
      })

      const after = { 
        name: flag.name,
        description: flag.description, 
        defaultValue: flag.defaultValue, 
        archived: flag.archived 
      }

      await tx.auditLog.create({
        data: {
          action: 'FLAG_UPDATED',
          actorId: session.user.userId,
          actorEmail: session.user.email,
          flagId: flag.id,
          diff: { before, after }
        }
      })

      return flag
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    requireRole(session, 'ADMIN')

    const existing = await prisma.flag.findUnique({
      where: { orgId_key: { orgId: session.user.orgId, key } }
    })

    if (!existing) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

    await prisma.flag.delete({
      where: { id: existing.id }
    })

    return NextResponse.json({ message: 'Flag deleted' })
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
