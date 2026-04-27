import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    console.log('[SIGNUP_ROUTE] Raw SQL Attempt for:', email)

    // 1. Hash password first to save time
    const hashedPassword = await bcrypt.hash(password, 10)

    // 2. Try the most likely queries in order of probability
    try {
      // Check if user exists using the most common casing
      const existing = await sql`SELECT id FROM "User" WHERE email = ${email} LIMIT 1`
      if (existing.length > 0) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 })
      }

      // 3. Perform a 'greedy' insert that handles various potential ID/Role defaults
      // We only insert Email, Password, and Name - the core pillars.
      const result = await sql`
        INSERT INTO "User" (email, password, name)
        VALUES (${email}, ${hashedPassword}, ${name})
        RETURNING id, email, name
      `

      console.log('[SIGNUP_ROUTE] SUCCESS (Raw SQL)!')
      return NextResponse.json({ 
        user: result[0]
      }, { status: 201 })

    } catch (sqlError: any) {
      console.error('[SIGNUP_RAW_FAIL]:', sqlError.message)
      // Final desperation move: try lowercase table name
      const resultLower = await sql`
        INSERT INTO "user" (email, password, name)
        VALUES (${email}, ${hashedPassword}, ${name})
        RETURNING id, email, name
      `
      return NextResponse.json({ user: resultLower[0] }, { status: 201 })
    }

  } catch (err: any) {
    console.error('[SIGNUP_TOTAL_FAIL]:', err.message)
    return NextResponse.json({ error: 'Database mismatch - check logs' }, { status: 500 })
  }
}
