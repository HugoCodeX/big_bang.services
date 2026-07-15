import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(sessionCookie ? '/dashboard' : '/auth/iniciar-sesion', request.url),
    )
  }

  if (pathname.startsWith('/dashboard') && !sessionCookie) {
    const loginUrl = new URL('/auth/iniciar-sesion', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
}
