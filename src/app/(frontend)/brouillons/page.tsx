export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { decodePayloadToken } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import type { WorkingCopy, Event, News } from '@/payload-types'

export default async function BrouillonsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  const decoded = token ? decodePayloadToken(token) : null
  if (decoded?.role !== 'admin' && decoded?.role !== 'agent') redirect('/connexion')

  const userId = decoded!.id!
  const payload = await getPayloadClient()

  const [workingCopiesResult, draftEventsResult, draftNewsResult] = await Promise.all([
    payload.find({
      collection: 'working-copies',
      where: { author: { equals: userId } },
      overrideAccess: true,
      sort: '-updatedAt',
      limit: 100,
    }),
    payload.find({
      collection: 'events',
      where: { _status: { equals: 'draft' } },
      overrideAccess: true,
      sort: '-updatedAt',
      limit: 100,
      depth: 0,
    }),
    payload.find({
      collection: 'news',
      where: { _status: { equals: 'draft' } },
      overrideAccess: true,
      sort: '-updatedAt',
      limit: 100,
      depth: 0,
    }),
  ])

  const workingCopies = workingCopiesResult.docs as WorkingCopy[]
  const draftEvents = draftEventsResult.docs as Event[]
  const draftNews = draftNewsResult.docs as News[]

  const eventRelatedIds = workingCopies
    .filter(wc => wc.collection === 'events' && wc.relatedId)
    .map(wc => wc.relatedId!)
  const newsRelatedIds = workingCopies
    .filter(wc => wc.collection === 'news' && wc.relatedId)
    .map(wc => wc.relatedId!)

  const [eventSlugMap, newsSlugMap] = await Promise.all([
    eventRelatedIds.length > 0
      ? payload
          .find({ collection: 'events', where: { id: { in: eventRelatedIds } }, overrideAccess: true, limit: 100, depth: 0 })
          .then(r => Object.fromEntries((r.docs as Event[]).map(e => [String(e.id), e.slug])))
      : Promise.resolve({} as Record<string, string>),
    newsRelatedIds.length > 0
      ? payload
          .find({ collection: 'news', where: { id: { in: newsRelatedIds } }, overrideAccess: true, limit: 100, depth: 0 })
          .then(r => Object.fromEntries((r.docs as News[]).map(n => [String(n.id), n.slug])))
      : Promise.resolve({} as Record<string, string>),
  ])

  function wcLink(wc: WorkingCopy): string {
    if (wc.relatedId) {
      const slugMap = wc.collection === 'events' ? eventSlugMap : newsSlugMap
      const slug = slugMap[wc.relatedId]
      if (slug) return wc.collection === 'events' ? `/agenda/${slug}/modifier` : `/actualites/${slug}/modifier`
    }
    return wc.collection === 'events' ? `/agenda/new?wc=${wc.id}` : `/actualites/new?wc=${wc.id}`
  }

  function wcTitle(wc: WorkingCopy): string {
    return (wc.data as Record<string, unknown>)?.title as string || '(Sans titre)'
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Brouillons</h1>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">Mes brouillons personnels</h2>
        {workingCopies.length === 0 ? (
          <p className="text-sm text-muted">Aucun brouillon personnel.</p>
        ) : (
          <ul className="divide-y divide-border">
            {workingCopies.map(wc => (
              <li key={wc.id}>
                <Link
                  href={wcLink(wc)}
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-brand-pale transition-colors no-underline"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-text truncate">{wcTitle(wc)}</span>
                    <span className="shrink-0 text-xs bg-brand-pale text-brand px-2 py-0.5 rounded-full">
                      {wc.collection === 'events' ? 'Événement' : 'Actualité'}
                    </span>
                  </div>
                  <span className="text-xs text-muted shrink-0 ml-4">{formatDate(wc.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">Brouillons partagés</h2>
        {draftEvents.length === 0 && draftNews.length === 0 ? (
          <p className="text-sm text-muted">Aucun brouillon partagé.</p>
        ) : (
          <ul className="divide-y divide-border">
            {draftEvents.map(ev => (
              <li key={`event-${ev.id}`}>
                <Link
                  href={`/agenda/${ev.slug}/modifier`}
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-brand-pale transition-colors no-underline"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-text truncate">{ev.title}</span>
                    <span className="shrink-0 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Événement</span>
                  </div>
                  <span className="text-xs text-muted shrink-0 ml-4">{formatDate(ev.updatedAt)}</span>
                </Link>
              </li>
            ))}
            {draftNews.map(n => (
              <li key={`news-${n.id}`}>
                <Link
                  href={`/actualites/${n.slug}/modifier`}
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-brand-pale transition-colors no-underline"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-text truncate">{n.title}</span>
                    <span className="shrink-0 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Actualité</span>
                  </div>
                  <span className="text-xs text-muted shrink-0 ml-4">{formatDate(n.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
