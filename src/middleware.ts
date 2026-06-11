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
    return NextResponse.redirect(new URL('/admin-relay?to=/actualites/new&back=/admin/collections/news', request.url))
  }

  if (pathname === '/admin/collections/events/create') {
    return NextResponse.redirect(new URL('/admin-relay?to=/agenda/new&back=/admin/collections/events', request.url))
  }

  const newsEdit = pathname.match(/^\/admin\/collections\/news\/([^/]+)$/)
  if (newsEdit) {
    try {
      const res = await fetch(new URL(`/api/news/${newsEdit[1]}?depth=0`, request.url), {
        headers: { cookie: request.headers.get('cookie') ?? '' },
      })
      const doc = await res.json()
      if (doc?.slug) {
        const relayUrl = `/admin-relay?to=${encodeURIComponent(`/actualites/${doc.slug}/modifier`)}&back=/admin/collections/news`
        return NextResponse.redirect(new URL(relayUrl, request.url))
      }
    } catch {}
  }

  const eventsEdit = pathname.match(/^\/admin\/collections\/events\/([^/]+)$/)
  if (eventsEdit) {
    try {
      const res = await fetch(new URL(`/api/events/${eventsEdit[1]}?depth=0`, request.url), {
        headers: { cookie: request.headers.get('cookie') ?? '' },
      })
      const doc = await res.json()
      if (doc?.slug) {
        const relayUrl = `/admin-relay?to=${encodeURIComponent(`/agenda/${doc.slug}/modifier`)}&back=/admin/collections/events`
        return NextResponse.redirect(new URL(relayUrl, request.url))
      }
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
  ],
}
