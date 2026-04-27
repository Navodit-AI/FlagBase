export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSession, requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    requireRole(session, 'EDITOR')

    const flag = await prisma.flag.findUnique({
      where: { orgId_key: { orgId: session.user.orgId, key } }
    })

    if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

    const body = await req.json()
    const { percentage, value, conditions } = body

    if (value === undefined || !Array.isArray(conditions) || conditions.length === 0) {
      return NextResponse.json({ error: 'Invalid or missing rule parameters' }, { status: 400 })
    }

    // Validate conditions
    for (const cond of conditions) {
      if (!cond.attribute || !cond.op || cond.value === undefined) {
        return NextResponse.json({ error: 'Each condition must have attribute, op, and value' }, { status: 400 })
      }
    }

    const count = await prisma.targetingRule.count({
      where: { flagId: flag.id }
    })

    const rule = await prisma.targetingRule.create({
      data: {
        flagId: flag.id,
        priority: count + 1,
        percentage,
        value: String(value),
        conditions: conditions
      }
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
