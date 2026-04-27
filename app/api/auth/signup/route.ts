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
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' OR table_name = 'user'
    `
    const columnNames = columns.map(c => c.column_name.toLowerCase())
    console.log('[SIGNUP_ROUTE] Found columns:', columnNames.join(', '))

    // 2. Map the data to existing columns based on DISCOVERY
    const emailCol = columnNames.find(c => c === 'email') || 'email'
    // Added 'passwordhash' to the search to match your specific DB schema
    const passCol = columnNames.find(c => ['passwordhash', 'password', 'pass', 'hashedpassword', 'hashed_password'].includes(c)) || 'password'
    const nameCol = columnNames.find(c => c === 'name') || 'name'

    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Try to check existence
    const existing = await sql.query(`SELECT id FROM "User" WHERE ${emailCol} = $1 LIMIT 1`, [email])
    if (existing.length > 0) return NextResponse.json({ error: 'User already exists' }, { status: 400 })

    // 4. Perform the adaptive insert - using the found passCol ('passwordhash')
    const insertQuery = `
      INSERT INTO "User" (${emailCol}, ${passCol}, ${nameCol})
      VALUES ($1, $2, $3)
      RETURNING id, ${emailCol} as email
    `
    const result = await sql.query(insertQuery, [email, hashedPassword, name || ''])

    console.log('[SIGNUP_ROUTE] SUCCESS (Discovery)!')
    return NextResponse.json({ user: result[0] }, { status: 201 })

  } catch (err: any) {
    console.error('[SIGNUP_ADAPTIVE_FAIL]:', err.message)
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 })
  }
}
