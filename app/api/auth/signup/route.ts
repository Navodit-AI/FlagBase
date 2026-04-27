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

    // 2. CHECK EXISTENCE
    const existing = await sql.query(`SELECT "${idCol}" as id FROM "User" WHERE "${emailCol}" = $1 LIMIT 1`, [email])
    let userId = existing[0]?.id

    if (existing.length > 0) {
      // Check if user has ANY organizations. If not, they are an "orphan" user from a failed signup.
      const userMemberships = await sql`SELECT id FROM "OrgMember" WHERE "userId" = ${userId} LIMIT 1`
      if (userMemberships.length > 0) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 })
      }
      console.log('[SIGNUP_ROUTE] Orphan user detected. Completing onboarding.')
    } else {
      userId = randomUUID()
      // Create User only if new
      await sql.query(`
        INSERT INTO "User" ("${idCol}", "${emailCol}", "${passCol}", "name")
        VALUES ($1, $2, $3, $4)
      `, [userId, email, hashedPassword, name || ''])
    }

    const orgId = randomUUID()

    // 3. Create Organization and Link
    await sql`
      INSERT INTO "Organization" ("id", "name", "slug")
      VALUES (${orgId}, ${`${name || 'Personal'}'s Workspace`}, ${`${email.split('@')[0]}-org-${Math.floor(Math.random()*1000)}`})
    `

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
