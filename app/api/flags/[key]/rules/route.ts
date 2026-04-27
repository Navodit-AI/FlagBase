import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { db, flags as flagsTable, rules as rulesTable } from '@/lib/db'
import { eq, and, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const session = await auth()
  const orgId = (session?.user as any)?.orgId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { conditions, percentage, value } = await req.json()

    const flags = await db.select().from(flagsTable).where(
      and(eq(flagsTable.orgId, orgId), eq(flagsTable.key, key))
    ).limit(1)
    const flag = flags[0]
    if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

    const maxPriorityRes = await db.select({ max: sql<number>`MAX(CAST(${rulesTable.priority} AS INTEGER))` })
      .from(rulesTable)
      .where(eq(rulesTable.flagId, flag.id))
    
    const nextPriority = (maxPriorityRes[0]?.max || 0) + 1

    await db.insert(rulesTable).values({
      id: nanoid(),
      flagId: flag.id,
      priority: nextPriority.toString(),
      percentage: percentage?.toString() || null,
      value: String(value),
      conditions: JSON.stringify(conditions),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
