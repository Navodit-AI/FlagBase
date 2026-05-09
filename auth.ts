import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { db, users, sql } from '@/lib/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        try {
          const userRecords = await db.select().from(users).where(eq(users.email, credentials.email as string)).limit(1)
          const user = userRecords[0]
          
          if (!user || !user.password) return null
          
          const valid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )
          
          if (!valid) return null
          
          // Fetch the user's organization ID using Drizzle instead of raw SQL for consistency
          const [membership] = await db.select()
            .from(members)
            .where(eq(members.userId, user.id))
            .limit(1)
            
          const orgId = membership?.orgId
          
          if (!orgId) return null
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            orgId: orgId
          }
        } catch (error: any) {
          console.error('[AUTH_ROOT_CRITICAL_FAIL]:', error.message, error.stack)
          return null
        }
      }
    })
  ]
})
