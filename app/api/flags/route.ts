import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { db, flags as flagsTable, environments as environmentsTable, overrides as overridesTable } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  const session = await auth()
  const orgId = (session?.user as any)?.orgId

  if (!orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, key, description, type, defaultValue } = await req.json()

    // 1. Create Flag
    const flagId = nanoid()
    await db.insert(flagsTable).values({
      id: flagId,
      name,
      key,
      description,
      type,
      defaultValue,
      orgId,
    })

    // 2. Setup initial overrides for all org environments
    const orgEnvs = await db.select().from(environmentsTable).where(eq(environmentsTable.orgId, orgId))
    
    // Fallback: If no envs exist, create default ones
    let targetEnvs = orgEnvs
    if (orgEnvs.length === 0) {
      const prodId = nanoid()
      const stagId = nanoid()
      const devId = nanoid()
      
      await db.insert(environmentsTable).values([
        { id: prodId, name: 'production', orgId },
        { id: stagId, name: 'staging', orgId },
        { id: devId, name: 'development', orgId },
      ])
      
      targetEnvs = [
        { id: prodId, name: 'production', orgId },
        { id: stagId, name: 'staging', orgId },
        { id: devId, name: 'development', orgId },
      ]
    }

    // Create disabled overrides for each environment
    for (const env of targetEnvs) {
      await db.insert(overridesTable).values({
        id: nanoid(),
        flagId,
        envId: env.id,
        enabled: false,
        value: defaultValue
      })
    }

    return NextResponse.json({ success: true, id: flagId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
