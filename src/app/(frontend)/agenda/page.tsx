import { getPayloadClient } from '@/lib/payload'
import { EditButton } from '@/components/EditButton'
import { EventCard } from '@/components/events/EventCard'
import type { Event, EventCategory, Media } from '@/payload-types'
import type { Where } from 'payload'
import Link from 'next/link'

const PAGE_SIZE = 12

function buildUrl(page: number, past: boolean, category?: string | null): string {
  const params = new URLSearchParams()
  if (past) params.set('past', '1')
  if (category) params.set('category', category)
  params.set('page', String(page))
  return `/agenda?${params.toString()}`
}

function buildCategoryUrl(slug: string | null, past: boolean): string {
  const params = new URLSearchParams()
  if (past) params.set('past', '1')
  if (slug) params.set('category', slug)
  return `/agenda?${params.toString()}`
}

export default async function EventsArchive({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; past?: string; category?: string }>
}) {
  const { page: pageParam, past: pastParam, category: categoryParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const showPast = pastParam === '1'
  const activeCategory = categoryParam || null

  const payload = await getPayloadClient()

  const categoriesResult = await payload.find({
    collection: 'event-categories',
    limit: 100,
    sort: 'name',
  })
  const categories = categoriesResult.docs as EventCategory[]

  const where: Where = { _status: { equals: 'published' } }
  if (!showPast) {
    where.startDate = { greater_than_equal: new Date().toISOString() }
  }
  if (activeCategory) {
    where['category.slug'] = { equals: activeCategory }
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

      {categories.length > 0 && (
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Filtres par catégorie">
          <Link
            href={buildCategoryUrl(null, showPast)}
            aria-current={!activeCategory ? 'page' : undefined}
            className="px-3 py-1 rounded-full text-sm font-medium border transition-colors no-underline"
          >
            Tous
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildCategoryUrl(cat.slug, showPast)}
              aria-current={activeCategory === cat.slug ? 'page' : undefined}
              className="px-3 py-1 rounded-full text-sm font-medium border transition-colors no-underline"
              style={{ backgroundColor: `${cat.color}22`, color: cat.color, borderColor: `${cat.color}66` }}
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      )}

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
            <Link href={buildUrl(page - 1, showPast, activeCategory)} className="text-sm text-brand-mid hover:text-teal no-underline">
              ← Précédent
            </Link>
          ) : <span />}
          {hasNext && (
            <Link href={buildUrl(page + 1, showPast, activeCategory)} className="text-sm text-brand-mid hover:text-teal no-underline">
              Suivant →
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
