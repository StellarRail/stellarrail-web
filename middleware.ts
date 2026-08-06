import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC = ['/login', '/mfa', '/', '/_next', '/favicon.ico']

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl
  if (
    PUBLIC.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith('/_next')
    )
  ) {
    return NextResponse.next()
  }
  // Client-side session is in localStorage; middleware is defense-in-depth via cookie presence.
  // If no session cookie, redirect to login (server enforces real auth).
  const hasSession = req.cookies.has('stellarrail_session') || req.cookies.has('__session')
  if (
    !hasSession &&
    (pathname.startsWith('/payments') ||
      pathname.startsWith('/approvals') ||
      pathname.startsWith('/admin'))
  ) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] }
