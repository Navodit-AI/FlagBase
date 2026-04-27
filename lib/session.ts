import { auth } from '@/auth'

export async function getSession() {
  const session = await auth()
  if (!session?.user) {
    throw new Response('Unauthorized', { status: 401 })
  }
  return session
}

const roleOrder: Record<string, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
  OWNER: 3
}

export function requireRole(
  session: Awaited<ReturnType<typeof getSession>>,
  minRole: 'VIEWER' | 'EDITOR' | 'ADMIN' | 'OWNER'
) {
  if (roleOrder[session.user.role] < roleOrder[minRole]) {
    throw new Response('Forbidden', { status: 403 })
  }
}
