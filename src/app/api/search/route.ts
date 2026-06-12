import { type NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''
  if (q.length < 2) return NextResponse.json([])

  const payload = await getPayloadClient()
  const where = { title: { like: q }, _status: { equals: 'published' } }

  const [newsResult, eventsResult, pagesResult] = await Promise.all([
    payload.find({ collection: 'news', where, limit: 4 }),
    payload.find({ collection: 'events', where, limit: 4 }),
    payload.find({ collection: 'pages', where, limit: 4 }),
  ])

  const results = [
    ...newsResult.docs.map((doc: any) => ({
      title: doc.title,
      type: 'Actualité',
      date: doc.publishedAt ?? null,
      url: `/actualites/${doc.slug}`,
    })),
    ...eventsResult.docs.map((doc: any) => ({
      title: doc.title,
      type: 'Événement',
      date: doc.startDate ?? null,
      url: `/agenda/${doc.slug}`,
    })),
    ...pagesResult.docs.map((doc: any) => ({
      title: doc.title,
      type: 'Page',
      date: null,
      url: `/${doc.slug}`,
    })),
  ]

  return NextResponse.json(results)
}
