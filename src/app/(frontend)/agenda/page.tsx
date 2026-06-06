import { getPayloadClient } from '@/lib/payload'
import { EditButton } from '@/components/EditButton'
import { EventCard } from '@/components/events/EventCard'
import { MiniCalendar } from '@/components/home/MiniCalendar'
import type { Event, EventCategory, Media } from '@/payload-types'
import type { CalendarEventInput } from '@/lib/calendar'
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

  const [result, calendarResult] = await Promise.all([
    payload.find({
      collection: 'events',
      where,
      sort: 'startDate',
      limit: PAGE_SIZE,
      page,
    }),
    payload.find({
      collection: 'events',
      where: { _status: { equals: 'published' } },
      sort: 'startDate',
      limit: 200,
      depth: 1,
    }),
  ])

  const totalPages = Math.ceil(result.totalDocs / PAGE_SIZE)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const calendarEvents: CalendarEventInput[] = calendarResult.docs.map((item: Event) => {
    const cat = item.category && typeof item.category === 'object'
      ? item.category as EventCategory
      : null
    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      startDate: item.startDate,
      endDate: item.endDate ?? null,
      category: cat ? { color: cat.color } : null,
    }
  })

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Agenda</h1>
        <EditButton href="/agenda/new" label="Nouvel événement" />
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Event list — 65% */}
        <div className="w-full lg:w-[65%]">
          <div className="grid gap-4">
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
        </div>

        {/* MiniCalendar sidebar — 35% */}
        <div className="w-full lg:w-[35%]">
          <MiniCalendar events={calendarEvents} />
        </div>
      </div>
    </main>
  )
}
