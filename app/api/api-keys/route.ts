import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { db, apiKeys as keysTable } from '@/lib/db'
import { nanoid } from 'nanoid'
import crypto from 'crypto'

export async function POST(req: Request) {
  const session = await auth()
  const orgId = (session?.user as any)?.orgId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { label, envName } = await req.json()

    // 1. Generate secure random key
    const rawKey = `fb_${envName.slice(0, 4)}_${nanoid(32)}`
    
    // 2. Hash it for storage
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

    // 3. Save
    await db.insert(keysTable).values({
      id: nanoid(),
      keyHash,
      label,
      envName,
      orgId,
    })

    // 4. Return RAW key (only this once)
    return NextResponse.json({ apiKey: rawKey })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
