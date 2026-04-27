import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { db, flags as flagsTable, rules as rulesTable } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const session = await auth()
  const orgId = (session?.user as any)?.orgId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { ruleIds } = await req.json()

    const flags = await db.select().from(flagsTable).where(
      and(eq(flagsTable.orgId, orgId), eq(flagsTable.key, key))
    ).limit(1)
    if (!flags[0]) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

    for (let i = 0; i < ruleIds.length; i++) {
      await db.update(rulesTable)
        .set({ priority: (i + 1).toString() })
        .where(and(eq(rulesTable.id, ruleIds[i]), eq(rulesTable.flagId, flags[0].id)))
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
