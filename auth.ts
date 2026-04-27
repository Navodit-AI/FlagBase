import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (!user) return null
        
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        
        if (!valid) return null
        
        const member = await prisma.orgMember.findFirst({
          where: { userId: user.id }
        })
        
        if (!member) return null
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userId: user.id,
          orgId: member.orgId,
          role: member.role
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.orgId = (user as any).orgId
        token.role  = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.userId = token.userId as string
        session.user.orgId  = token.orgId  as string
        session.user.role   = token.role   as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' }
})
