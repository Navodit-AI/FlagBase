import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { db, flags as flagsTable, auditLogs as logsTable } from '@/lib/db'
import { eq, and, desc } from 'drizzle-orm'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const session = await auth()
  const orgId = (session?.user as any)?.orgId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit

  try {
    const flags = await db.select().from(flagsTable).where(
      and(eq(flagsTable.orgId, orgId), eq(flagsTable.key, key))
    ).limit(1)
    const flag = flags[0]
    if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

    const logs = await db.select()
      .from(logsTable)
      .where(and(eq(logsTable.flagId, flag.id), eq(logsTable.orgId, orgId)))
      .orderBy(desc(logsTable.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      logs: logs.map(l => ({
        ...l,
        diff: l.diff ? JSON.parse(l.diff) : null
      }))
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
