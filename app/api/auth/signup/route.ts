import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    console.log('[SIGNUP_ROUTE] Discovery Mode for:', email)

    // 1. DISCOVER THE ACTUAL SCHEMA ON THE FLY
    // WE MUST NOT LOWERCASE HERE - WE NEED THE EXACT CASING
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' OR table_name = 'user'
    `
    const rawColumnNames = columns.map(c => c.column_name)
    console.log('[SIGNUP_ROUTE] Found EXACT columns:', rawColumnNames.join(', '))

    // 2. Map based on EXACT names found
    const emailCol = rawColumnNames.find(c => c.toLowerCase() === 'email') || 'email'
    const passCol = rawColumnNames.find(c => ['password', 'passwordhash', 'pass', 'hashedpassword'].includes(c.toLowerCase())) || 'password'
    const nameCol = rawColumnNames.find(c => c.toLowerCase() === 'name') || 'name'

    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Try to check existence - quoting the column names for safety
    const existing = await sql.query(`SELECT id FROM "User" WHERE "${emailCol}" = $1 LIMIT 1`, [email])
    if (existing.length > 0) return NextResponse.json({ error: 'User already exists' }, { status: 400 })

    // 4. Perform the adaptive insert - quoting EVERY identifier
    const insertQuery = `
      INSERT INTO "User" ("${emailCol}", "${passCol}", "${nameCol}")
      VALUES ($1, $2, $3)
      RETURNING id, "${emailCol}" as email
    `
    const result = await sql.query(insertQuery, [email, hashedPassword, name || ''])

    console.log('[SIGNUP_ROUTE] SUCCESS (Adaptive)!')
    return NextResponse.json({ user: result[0] }, { status: 201 })

  } catch (err: any) {
    console.error('[SIGNUP_ADAPTIVE_FAIL]:', err.message)
    return NextResponse.json({ error: `Column mismatch: ${err.message}` }, { status: 500 })
  }
}
