import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    console.log('[SIGNUP_ROUTE] Finalizing for:', email)

    // 1. Get EXACT columns
    const columns = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'User' OR table_name = 'user'
    `
    const rawCols = columns.map(c => c.column_name)
    
    // 2. Identify correct names
    const emailCol = rawCols.find(c => c.toLowerCase() === 'email') || 'email'
    const passCol = rawCols.find(c => ['passwordhash', 'password', 'passwordHash'].includes(c)) || 'password'
    const nameCol = rawCols.find(c => c.toLowerCase() === 'name') || 'name'
    const idCol = rawCols.find(c => c.toLowerCase() === 'id') || 'id'

    const hashedPassword = await bcrypt.hash(password, 10)
    const newId = randomUUID()

    // 3. Try to check existence
    const existing = await sql.query(`SELECT "${idCol}" FROM "User" WHERE "${emailCol}" = $1 LIMIT 1`, [email])
    if (existing.length > 0) return NextResponse.json({ error: 'User already exists' }, { status: 400 })

    // 4. Manual ID insertion
    const insertQuery = `
      INSERT INTO "User" ("${idCol}", "${emailCol}", "${passCol}", "${nameCol}")
      VALUES ($1, $2, $3, $4)
      RETURNING "${idCol}" as id, "${emailCol}" as email
    `
    const result = await sql.query(insertQuery, [newId, email, hashedPassword, name || ''])

    console.log('[SIGNUP_ROUTE] REGISTRATION SUCCESS!')
    return NextResponse.json({ user: result[0] }, { status: 201 })

  } catch (err: any) {
    console.error('[SIGNUP_FINAL_FAIL]:', err.message)
    return NextResponse.json({ error: `Registration error: ${err.message}` }, { status: 500 })
  }
}
