import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db, users, sql } from "@/lib/db"
import { eq } from "drizzle-orm"

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const userRecords = await db.select().from(users).where(eq(users.email, credentials.email as string)).limit(1)
          const user = userRecords[0]

          if (!user || !user.password) return null

          const isPasswordCorrect = await bcrypt.compare(credentials.password as string, user.password)
          if (!isPasswordCorrect) return null

          // Fetch the user's organization ID using Drizzle instead of raw SQL for consistency
          const [membership] = await db.select()
            .from(members)
            .where(eq(members.userId, user.id))
            .limit(1)
            
          const orgId = membership?.orgId

          if (!orgId) {
            console.error('[AUTH] No organization found for user:', user.email)
            return null // Don't allow login without an org
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            orgId: orgId
          }
        } catch (error) {
          console.error('[AUTH_V5_FAIL]:', error)
          return null
        }
      }
    })
  ]
})
