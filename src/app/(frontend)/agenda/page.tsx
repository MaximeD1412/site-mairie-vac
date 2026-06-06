import { getPayloadClient } from '@/lib/payload'
import { EditButton } from '@/components/EditButton'
import { EventCard } from '@/components/events/EventCard'
import type { Event, EventCategory, Media } from '@/payload-types'
import Link from 'next/link'

const PAGE_SIZE = 12

function buildUrl(page: number, past: boolean): string {
  const params = new URLSearchParams()
  if (past) params.set('past', '1')
  params.set('page', String(page))
  return `/agenda?${params.toString()}`
}

export default async function EventsArchive({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; past?: string }>
}) {
  const { page: pageParam, past: pastParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const showPast = pastParam === '1'

  const payload = await getPayloadClient()

  const where: Record<string, unknown> = { _status: { equals: 'published' } }
  if (!showPast) {
    where.startDate = { greater_than_equal: new Date().toISOString() }
  }

  const result = await payload.find({
    collection: 'events',
    where,
    sort: 'startDate',
    limit: PAGE_SIZE,
    page,
  })

  const totalPages = Math.ceil(result.totalDocs / PAGE_SIZE)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Agenda</h1>
        <EditButton href="/agenda/new" label="Nouvel événement" />
      </div>

      <div className="mt-8 grid gap-4">
        {result.docs.map((item: Event) => {
          const cat = item.category && typeof item.category === 'object'
            ? item.category as EventCategory
            : null
          const img = item.image && typeof item.image === 'object'
            ? item.image as Media
            : null
          return (
            <EventCard
              key={item.id}
              slug={item.slug}
              title={item.title}
              startDate={item.startDate}
              endDate={item.endDate}
              location={item.location}
              category={cat ? { name: cat.name, color: cat.color } : null}
              image={img ? { url: (img as any).url, alt: (img as any).alt } : null}
            />
          )
        })}
      </div>

      {(hasPrev || hasNext) && (
        <div className="mt-10 flex justify-between">
          {hasPrev ? (
            <Link href={buildUrl(page - 1, showPast)} className="text-sm text-brand-mid hover:text-teal no-underline">
              ← Précédent
            </Link>
          ) : <span />}
          {hasNext && (
            <Link href={buildUrl(page + 1, showPast)} className="text-sm text-brand-mid hover:text-teal no-underline">
              Suivant →
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
