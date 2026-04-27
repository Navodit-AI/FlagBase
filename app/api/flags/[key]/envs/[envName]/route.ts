import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { db, flags as flagsTable, environments as environmentsTable, overrides as overridesTable } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ key: string; envName: string }> }
) {
  const { key, envName } = await params
  const session = await auth()
  const orgId = (session?.user as any)?.orgId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { enabled, value } = await req.json()

    // 1. Find the Flag
    const flags = await db.select().from(flagsTable).where(
      and(eq(flagsTable.orgId, orgId), eq(flagsTable.key, key))
    ).limit(1)
    const flag = flags[0]
    if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

    // 2. Find the Environment
    const envs = await db.select().from(environmentsTable).where(
      and(eq(environmentsTable.orgId, orgId), eq(environmentsTable.name, envName))
    ).limit(1)
    const env = envs[0]
    if (!env) return NextResponse.json({ error: 'Environment not found' }, { status: 404 })

    // 3. Upsert Override
    const existing = await db.select().from(overridesTable).where(
      and(eq(overridesTable.flagId, flag.id), eq(overridesTable.envId, env.id))
    ).limit(1)

    if (existing[0]) {
      await db.update(overridesTable)
        .set({ 
          ...(enabled !== undefined && { enabled }), 
          ...(value !== undefined && { value: String(value) }) 
        })
        .where(eq(overridesTable.id, existing[0].id))
    } else {
      await db.insert(overridesTable).values({
        id: nanoid(),
        flagId: flag.id,
        envId: env.id,
        enabled: enabled ?? false,
        value: value !== undefined ? String(value) : flag.defaultValue
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
