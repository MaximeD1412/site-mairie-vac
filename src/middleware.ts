import { NextRequest, NextResponse } from 'next/server'
import { resolveMiddlewareRedirect } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('payload-token')?.value

  const authRedirect = resolveMiddlewareRedirect(pathname, token)
  if (authRedirect) {
    return NextResponse.redirect(new URL(authRedirect, request.url))
  }

  if (pathname === '/admin/collections/news/create') {
    return NextResponse.redirect(new URL('/actualites/new', request.url))
  }

  if (pathname === '/admin/collections/events/create') {
    return NextResponse.redirect(new URL('/agenda/new', request.url))
  }

  const newsEdit = pathname.match(/^\/admin\/collections\/news\/([^/]+)$/)
  if (newsEdit) {
    try {
      const res = await fetch(new URL(`/api/news/${newsEdit[1]}?depth=0`, request.url), {
        headers: { cookie: request.headers.get('cookie') ?? '' },
      })
      const doc = await res.json()
      if (doc?.slug) return NextResponse.redirect(new URL(`/actualites/${doc.slug}/modifier`, request.url))
    } catch {}
  }

  const eventsEdit = pathname.match(/^\/admin\/collections\/events\/([^/]+)$/)
  if (eventsEdit) {
    try {
      const res = await fetch(new URL(`/api/events/${eventsEdit[1]}?depth=0`, request.url), {
        headers: { cookie: request.headers.get('cookie') ?? '' },
      })
      const doc = await res.json()
      if (doc?.slug) return NextResponse.redirect(new URL(`/agenda/${doc.slug}/modifier`, request.url))
    } catch {}
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/documents/new',
    '/documents/:id/modifier',
    '/actualites/new',
    '/actualites/:slug/modifier',
    '/agenda/new',
    '/agenda/:slug/modifier',
    '/brouillons',
  ],
}
