import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (!user || !user.passwordHash) return null
        
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
  ]
})
