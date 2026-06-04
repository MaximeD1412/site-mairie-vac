import { NextRequest, NextResponse } from 'next/server'
import { resolveMiddlewareRedirect } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('payload-token')?.value
  const redirect = resolveMiddlewareRedirect(request.nextUrl.pathname, token)

  if (redirect) {
    return NextResponse.redirect(new URL(redirect, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
