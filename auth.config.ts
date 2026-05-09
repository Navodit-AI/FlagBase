import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  providers: [], // We'll add Credentials in the server-only auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.orgId = (user as any).orgId
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).orgId = token.orgId as string
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isDashboard = nextUrl.pathname.startsWith('/dashboard')
      if (isDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to unauthenticated
      }
      return true
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' }
} satisfies NextAuthConfig
