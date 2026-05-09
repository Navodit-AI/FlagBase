export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db, flags as flagsTable, rules as rulesTable, overrides as overridesTable, environments as environmentsTable, apiKeys as keysTable } from '@/lib/db'
import { eq, inArray, and } from 'drizzle-orm'
import { evaluateFlag } from '@/lib/engine/evaluate'
import { parseValue } from '@/lib/engine/parse'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    // 1. Read API key from header
    const rawKey = req.headers.get('x-api-key')
    if (!rawKey) {
      return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401 })
    }

    // 2. Hash and find matching API key directly (Optimized)
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
    const [matchedKey] = await db.select().from(keysTable).where(eq(keysTable.keyHash, keyHash)).limit(1)

    if (!matchedKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // 3. Update lastUsed timestamp (Async, don't block response)
    db.update(keysTable)
      .set({ lastUsed: new Date() })
      .where(eq(keysTable.id, matchedKey.id))
      .execute()
      .catch(err => console.error('Failed to update lastUsed:', err))

    // 4. Parse request body
    const body = await req.json()
    const { keys, context = {} } = body as {
      keys: string[]
      context: Record<string, unknown>
    }

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: 'keys must be a non-empty array' }, { status: 400 })
    }

    // Note: userId is optional for simple boolean flags but required for rollouts
    // We handle this inside evaluateFlag if needed

    // 5. Fetch all requested flags, their rules, and the relevant environment override
    // Fetch flags
    const requestedFlags = await db.select()
      .from(flagsTable)
      .where(and(
        eq(flagsTable.orgId, matchedKey.orgId),
        inArray(flagsTable.key, keys),
        eq(flagsTable.archived, false)
      ))

    if (requestedFlags.length === 0) {
      const emptyResult: Record<string, null> = {}
      keys.forEach(k => emptyResult[k] = null)
      return NextResponse.json(emptyResult)
    }

    const flagIds = requestedFlags.map(f => f.id)

    // Fetch rules for these flags
    const allRules = await db.select()
      .from(rulesTable)
      .where(inArray(rulesTable.flagId, flagIds))
      .orderBy(rulesTable.priority)

    // Fetch environment ID for the matched key's environment
    const [env] = await db.select()
      .from(environmentsTable)
      .where(and(
        eq(environmentsTable.orgId, matchedKey.orgId),
        eq(environmentsTable.name, matchedKey.envName)
      ))
      .limit(1)

    // Fetch overrides for these flags in this environment
    const allOverrides = env 
      ? await db.select()
          .from(overridesTable)
          .where(and(
            inArray(overridesTable.flagId, flagIds),
            eq(overridesTable.envId, env.id)
          ))
      : []

    // 6. Evaluate each flag and build response
    const result: Record<string, unknown> = {}

    for (const flag of requestedFlags) {
      const flagRules = allRules.filter(r => r.flagId === flag.id).map(r => ({
        ...r,
        conditions: r.conditions
      }))
      
      const override = allOverrides.find(o => o.flagId === flag.id) || null
      
      const evaluationFlag = {
        key: flag.key,
        defaultValue: flag.defaultValue,
        rules: flagRules
      }

      const rawValue = evaluateFlag(evaluationFlag as any, override as any, context)
      result[flag.key] = parseValue(rawValue, flag.type as any)
    }

    // 7. For requested keys with no matching flag, return null
    for (const key of keys) {
      if (!(key in result)) {
        result[key] = null
      }
    }

    return NextResponse.json(result, { status: 200 })

  } catch (err) {
    console.error('Evaluate error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
