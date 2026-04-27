import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export const proxy = auth((req) => {
  const isAuthed = !!req.auth
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  
  if (isDashboard && !isAuthed) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return NextResponse.next()
})

export default proxy

export const config = {
  matcher: ['/dashboard/:path*']
}
