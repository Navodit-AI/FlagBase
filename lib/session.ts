import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function getSession() {
  const session = await auth()
  return session
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

export function hasRole(session: any, role: 'VIEWER' | 'EDITOR' | 'ADMIN' | 'OWNER') {
  const roles = ['VIEWER', 'EDITOR', 'ADMIN', 'OWNER']
  const userRole = session?.user?.role || 'VIEWER'
  return roles.indexOf(userRole) >= roles.indexOf(role)
}

export function requireRole(session: any, role: 'VIEWER' | 'EDITOR' | 'ADMIN' | 'OWNER') {
  if (!hasRole(session, role)) {
    throw new Error('Unauthorized: Insufficient permissions')
  }
}
