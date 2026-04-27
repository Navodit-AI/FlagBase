import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        console.log('[AUTH] Authorizing via Drizzle Bypass:', credentials.email)

        try {
          // 1. Find user via Drizzle (our working driver)
          const userRecords = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1)
          const user = userRecords[0]

          if (!user || !user.password) {
            console.warn('[AUTH] User not found')
            return null
          }

          // 2. Check password
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordCorrect) {
            console.warn('[AUTH] Invalid password')
            return null
          }

          console.log('[AUTH] Login Success!')
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
          }
        } catch (error: any) {
          console.error('[AUTH_BYPASS_FATAL]:', error.message)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
