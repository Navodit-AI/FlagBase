import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db, users, sql } from "@/lib/db"
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
          const userRecords = await db.select().from(users).where(eq(users.email, credentials.email as string)).limit(1)
          const user = userRecords[0]

          if (!user || !user.password) return null

          const isPasswordCorrect = await bcrypt.compare(credentials.password as string, user.password)
          if (!isPasswordCorrect) return null

          // Fetch the user's organization ID
          const memberships = await sql`SELECT "orgId" FROM "OrgMember" WHERE "userId" = ${user.id} LIMIT 1`
          const orgId = memberships[0]?.orgId

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            orgId: orgId || 'no-org'
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
        token.id = user.id
        token.orgId = user.orgId
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).orgId = token.orgId
      }
      return session
    }
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
})
