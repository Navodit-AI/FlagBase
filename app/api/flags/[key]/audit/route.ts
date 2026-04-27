import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const flag = await prisma.flag.findUnique({
    where: { orgId_key: { orgId: session.user.orgId, key } }
  })

  if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { flagId: flag.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.auditLog.count({
      where: { flagId: flag.id }
    })
  ])

  return NextResponse.json({
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  })
}
