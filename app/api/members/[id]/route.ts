import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { db, members as membersTable } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  const { role } = await req.json()
  const orgId = (session?.user as any)?.orgId

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userRole = (session.user as any).role
  if (userRole !== 'ADMIN' && userRole !== 'OWNER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const targetMembers = await db.select().from(membersTable).where(eq(membersTable.id, id)).limit(1)
    const target = targetMembers[0]

    if (target?.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot modify OWNER role' }, { status: 403 })
    }

    await db.update(membersTable)
      .set({ role })
      .where(and(eq(membersTable.id, id), eq(membersTable.orgId, orgId)))

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  const orgId = (session?.user as any)?.orgId

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userRole = (session.user as any).role
  if (userRole !== 'ADMIN' && userRole !== 'OWNER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const targetMembers = await db.select().from(membersTable).where(eq(membersTable.id, id)).limit(1)
    const target = targetMembers[0]

    if (target?.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove OWNER' }, { status: 403 })
    }

    await db.delete(membersTable)
      .where(and(eq(membersTable.id, id), eq(membersTable.orgId, orgId)))

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
