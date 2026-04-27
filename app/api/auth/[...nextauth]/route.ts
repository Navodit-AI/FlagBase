import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
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
          // Selecting based on the now-correct schema (no 'role')
          const userRecords = await db.select().from(users).where(eq(users.email, credentials.email as string)).limit(1)
          const user = userRecords[0]

          if (!user || !user.password) return null

          const isPasswordCorrect = await bcrypt.compare(credentials.password as string, user.password)
          if (!isPasswordCorrect) return null

          console.log('[AUTH] Success for:', user.email)
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            // Hardcoding a default role since the column is missing in DB
            role: 'USER' 
          }
        } catch (error) {
          console.error('[AUTH_V5_FAIL]:', error)
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
        session.user.role = token.role as string
        session.user.id = token.id as string
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
