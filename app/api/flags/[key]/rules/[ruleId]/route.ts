export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSession, requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ key: string, ruleId: string }> }
) {
  try {
    const { key, ruleId } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    requireRole(session, 'EDITOR')

    const flag = await prisma.flag.findUnique({
      where: { orgId_key: { orgId: session.user.orgId, key } }
    })

    if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

    const rule = await prisma.targetingRule.findFirst({
      where: { id: ruleId, flagId: flag.id }
    })

    if (!rule) return NextResponse.json({ error: 'Rule not found' }, { status: 404 })

    const body = await req.json()
    const { priority, percentage, value, conditions } = body

    const updated = await prisma.targetingRule.update({
      where: { id: rule.id },
      data: {
        ...(priority !== undefined && { priority }),
        ...(percentage !== undefined && { percentage }),
        ...(value !== undefined && { value: String(value) }),
        ...(conditions !== undefined && { conditions })
      }
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
  { params }: { params: Promise<{ key: string, ruleId: string }> }
) {
  try {
    const { key, ruleId } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    requireRole(session, 'EDITOR')

    const flag = await prisma.flag.findUnique({
      where: { orgId_key: { orgId: session.user.orgId, key } }
    })

    if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

    const rule = await prisma.targetingRule.findFirst({
      where: { id: ruleId, flagId: flag.id }
    })

    if (!rule) return NextResponse.json({ error: 'Rule not found' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      await tx.targetingRule.delete({
        where: { id: rule.id }
      })

      const remaining = await tx.targetingRule.findMany({
        where: { flagId: flag.id },
        orderBy: { priority: 'asc' }
      })

      await Promise.all(
        remaining.map((r, i) =>
          tx.targetingRule.update({
            where: { id: r.id },
            data: { priority: i + 1 }
          })
        )
      )
    })

    return NextResponse.json({ message: 'Rule deleted' })
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
