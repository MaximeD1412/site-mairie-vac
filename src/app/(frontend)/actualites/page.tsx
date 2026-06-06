import { getPayloadClient } from '@/lib/payload'
import { EditButton } from '@/components/EditButton'
import { NewsCard } from '@/components/news/NewsCard'
import Link from 'next/link'

export default async function NewsArchive({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const pageNum = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 12,
    page: pageNum,
    depth: 1,
  })

  const { docs, hasNextPage, hasPrevPage } = result

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Actualités</h1>
        <EditButton href="/actualites/new" label="Nouvelle actualité" />
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((item: any) => (
          <NewsCard key={item.id} item={item} />
        ))}
        {docs.length === 0 && (
          <p className="text-muted text-[13px] col-span-full">Aucune actualité pour le moment.</p>
        )}
      </div>
      {(hasPrevPage || hasNextPage) && (
        <nav className="mt-10 flex justify-center gap-4" aria-label="Pagination">
          {hasPrevPage && (
            <Link href={`?page=${pageNum - 1}`} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-brand-light transition-colors no-underline">
              ← Précédent
            </Link>
          )}
          {hasNextPage && (
            <Link href={`?page=${pageNum + 1}`} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-brand-light transition-colors no-underline">
              Suivant →
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
