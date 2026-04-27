import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      userId: string
      orgId: string
      role: string
      email: string
      name?: string | null
    }
  }

  interface User {
    userId?: string
    orgId?: string
    role?: string
  }
}
