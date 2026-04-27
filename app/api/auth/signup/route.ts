import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    console.log('[SIGNUP_ROUTE] Creating account and workspace for:', email)

    // 1. Discover names (using our proven discovery method)
    const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'User'`
    const rawCols = columns.map(c => c.column_name)
    const emailCol = rawCols.find(c => c.toLowerCase() === 'email') || 'email'
    const passCol = rawCols.find(c => ['passwordhash', 'password', 'passwordHash'].includes(c)) || 'password'
    const idCol = rawCols.find(c => c.toLowerCase() === 'id') || 'id'

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = randomUUID()
    const orgId = randomUUID()

    // 2. CHECK EXISTENCE
    const existing = await sql.query(`SELECT "${idCol}" FROM "User" WHERE "${emailCol}" = $1 LIMIT 1`, [email])
    if (existing.length > 0) return NextResponse.json({ error: 'User already exists' }, { status: 400 })

    // 3. TRANSACTION-ish: Create User, Create Organization, Create OrgMember
    // Note: We use raw SQL for speed and reliability here
    
    // Create Organization
    await sql`
      INSERT INTO "Organization" ("id", "name", "slug")
      VALUES (${orgId}, ${`${name || 'Personal'}'s Workspace`}, ${`${email.split('@')[0]}-org-${Math.floor(Math.random()*1000)}`})
    `

    // Create User
    await sql.query(`
      INSERT INTO "User" ("${idCol}", "${emailCol}", "${passCol}", "name")
      VALUES ($1, $2, $3, $4)
    `, [userId, email, hashedPassword, name || ''])

    // Link user to org as OWNER
    await sql`
      INSERT INTO "OrgMember" ("id", "userId", "orgId", "role")
      VALUES (${randomUUID()}, ${userId}, ${orgId}, 'OWNER')
    `

    console.log('[SIGNUP_ROUTE] Full onboarding success!')
    return NextResponse.json({ success: true }, { status: 201 })

  } catch (err: any) {
    console.error('[SIGNUP_V5_FAIL]:', err.message)
    return NextResponse.json({ error: `Registration error: ${err.message}` }, { status: 500 })
  }
}
