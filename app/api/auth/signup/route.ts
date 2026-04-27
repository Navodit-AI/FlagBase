import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    console.log('[SIGNUP_ROUTE] Drizzle Attempt for:', email)

    // 1. Check if user exists
    let existingUsers;
    try {
      existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1)
    } catch (dbError: any) {
      console.error('[DB_QUERY_FATAL]:', JSON.stringify(dbError, null, 2))
      // Try lowercase check just in case
      throw dbError;
    }
    
    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Create user
    const newUser = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: 'USER'
    }).returning()

    console.log('[SIGNUP_ROUTE] Success!')

    return NextResponse.json({ 
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('[SIGNUP_CATCH]:', error.message || error)
    return NextResponse.json({ error: 'Registration failed - check logs' }, { status: 500 })
  }
}
