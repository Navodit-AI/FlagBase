export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { evaluateFlag } from '@/lib/engine/evaluate'
import { parseValue } from '@/lib/engine/parse'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    // 1. Read API key from header
    const rawKey = req.headers.get('x-api-key')
    if (!rawKey) {
      return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401 })
    }

    // 2. Find matching API key by comparing against all org keys
    //    (bcrypt compare — never store plaintext)
    const allKeys = await prisma.apiKey.findMany()
    let matchedKey = null
    for (const k of allKeys) {
      const match = await bcrypt.compare(rawKey, k.keyHash)
      if (match) { matchedKey = k; break }
    }
    if (!matchedKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // 3. Update lastUsed timestamp
    await prisma.apiKey.update({
      where: { id: matchedKey.id },
      data: { lastUsed: new Date() }
    })

    // 4. Parse request body
    const body = await req.json()
    const { keys, context } = body as {
      keys: string[]
      context: Record<string, unknown>
    }

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: 'keys must be a non-empty array' }, { status: 400 })
    }
    if (!context || typeof context.userId !== 'string') {
      return NextResponse.json({ error: 'context.userId is required' }, { status: 400 })
    }

    // 5. Fetch all requested flags in ONE query — no N+1
    const flags = await prisma.flag.findMany({
      where: {
        orgId: matchedKey.orgId,
        key: { in: keys },
        archived: false
      },
      include: {
        rules: { orderBy: { priority: 'asc' } },
        overrides: {
          where: {
            env: { name: matchedKey.envName }
          },
          include: { env: true }
        }
      }
    })

    // 6. Evaluate each flag and build response
    const result: Record<string, unknown> = {}

    for (const flag of flags) {
      const override = flag.overrides[0] ?? null
      const rawValue = evaluateFlag(flag, override, context)
      result[flag.key] = parseValue(rawValue, flag.type)
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
