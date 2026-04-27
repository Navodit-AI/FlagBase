export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireRole } from '@/lib/session'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const keys = await prisma.apiKey.findMany({
    where: { orgId: session.user.orgId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      label: true,
      envName: true,
      lastUsed: true,
      createdAt: true
      // never select keyHash
    }
  })
  return NextResponse.json(keys)
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    requireRole(session, 'ADMIN')

    const body = await req.json()
    const { label, envName } = body
    
    if (!label || !envName) {
      return NextResponse.json({ error: 'label and envName are required' }, { status: 400 })
    }

    // Generate a random key — shown to user ONCE, never stored
    const rawKey = `fb_${randomUUID().replace(/-/g, '')}`
    const keyHash = await bcrypt.hash(rawKey, 12)

    await prisma.apiKey.create({
      data: {
        label,
        envName,
        keyHash,
        orgId: session.user.orgId
      }
    })

    // Return the raw key ONCE — it cannot be retrieved again
    return NextResponse.json({ key: rawKey }, { status: 201 })
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
