import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db, users as usersTable, organizations as organizationsTable, members as orgMembersTable, environments as environmentsTable } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    console.log('[SIGNUP_ROUTE] Creating account for:', email)

    // 1. Check if user already exists
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1)
    
    let userId = existingUser?.id

    if (existingUser) {
      console.log(`[SIGNUP_ROUTE] Existing user found: ${email} (ID: ${userId})`)
      // Check for orphan user (no org memberships)
      const [membership] = await db.select().from(orgMembersTable).where(eq(orgMembersTable.userId, existingUser.id)).limit(1)
      
      if (membership) {
        console.log(`[SIGNUP_ROUTE] User already has membership in org: ${membership.orgId}`)
        return NextResponse.json({ error: 'User already exists' }, { status: 400 })
      }
      console.log('[SIGNUP_ROUTE] Orphan user detected (no memberships found). Continuing onboarding.')
    } else {
      userId = nanoid()
      const hashedPassword = await bcrypt.hash(password, 10)
      await db.insert(usersTable).values({
        id: userId,
        email,
        name: name || '',
        password: hashedPassword,
        createdAt: new Date()
      })
    }

    // 2. Create Organization
    const orgId = nanoid()
    await db.insert(organizationsTable).values({
      id: orgId,
      name: `${name || 'Personal'}'s Workspace`,
      slug: `${email.split('@')[0]}-org-${nanoid(4)}`,
      createdAt: new Date()
    })

    // 3. Create OrgMember
    await db.insert(orgMembersTable).values({
      id: nanoid(),
      userId: userId!,
      orgId,
      role: 'OWNER'
    })

    // 4. Create Default Environments
    const envNames = ['production', 'staging', 'development']
    for (const envName of envNames) {
      await db.insert(environmentsTable).values({
        id: nanoid(),
        name: envName,
        orgId: orgId
      })
    }

    console.log('[SIGNUP_ROUTE] Onboarding success for:', email)
    return NextResponse.json({ success: true }, { status: 201 })

  } catch (err: any) {
    console.error('[SIGNUP_FAIL]:', err.message)
    return NextResponse.json({ error: `Registration error: ${err.message}` }, { status: 500 })
  }
}
