import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'

interface CollectionListBlockProps {
  collection: 'news' | 'events' | 'documents' | 'associations'
  limit?: number | null
  title?: string | null
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function CollectionListBlock({ collection, limit, title }: CollectionListBlockProps) {
  const payload = await getPayloadClient()
  const safeLimit = limit ?? 3

  if (collection === 'news') {
    const result = await payload.find({
      collection: 'news',
      limit: safeLimit,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
    }).catch(() => ({ docs: [] }))

    return (
      <section className="my-8">
        {title && <h2 className="text-2xl font-bold text-text mb-4">{title}</h2>}
        <div className="grid gap-3">
          {(result.docs as any[]).map((item) => (
            <Link
              key={item.id}
              href={`/actualites/${item.slug}`}
              className="flex flex-col gap-1 rounded-xl bg-white border border-border p-5 no-underline hover:shadow-md transition-shadow"
            >
              {item.publishedAt && (
                <span className="text-xs text-muted">{formatDate(item.publishedAt)}</span>
              )}
              <strong className="text-text text-[15px]">{item.title}</strong>
              {item.summary && (
                <p className="text-sm text-muted mt-0.5 line-clamp-2">{item.summary}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    )
  }

  if (collection === 'events') {
    const result = await payload.find({
      collection: 'events',
      limit: safeLimit,
      sort: 'startDate',
      where: { startDate: { greater_than: new Date().toISOString() } },
    }).catch(() => ({ docs: [] }))

    return (
      <section className="my-8">
        {title && <h2 className="text-2xl font-bold text-text mb-4">{title}</h2>}
        <div className="grid gap-3">
          {(result.docs as any[]).map((item) => (
            <Link
              key={item.id}
              href={`/agenda/${item.slug}`}
              className="flex flex-col gap-1 rounded-xl bg-white border border-border p-5 no-underline hover:shadow-md transition-shadow"
            >
              {item.startDate && (
                <span className="text-xs text-muted">
                  {formatDate(item.startDate)}{item.location ? ` · ${item.location}` : ''}
                </span>
              )}
              <strong className="text-text text-[15px]">{item.title}</strong>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  if (collection === 'documents') {
    const result = await payload.find({
      collection: 'documents',
      limit: safeLimit,
      sort: '-date',
      depth: 1,
    }).catch(() => ({ docs: [] }))

    return (
      <section className="my-8">
        {title && <h2 className="text-2xl font-bold text-text mb-4">{title}</h2>}
        <div className="grid gap-3">
          {(result.docs as any[]).map((item) => {
            const fileUrl = item.file && typeof item.file === 'object' ? item.file.url : null
            return (
              <article key={item.id} className="flex flex-col gap-1 rounded-xl bg-white border border-border p-5">
                {(item.date || item.category) && (
                  <span className="text-xs text-muted">
                    {item.date ? formatDate(item.date) : ''}{item.category ? ` · ${item.category}` : ''}
                  </span>
                )}
                <strong className="text-text text-[15px]">{item.title}</strong>
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-brand underline"
                  >
                    Télécharger le document
                  </a>
                )}
              </article>
            )
          })}
        </div>
      </section>
    )
  }

  if (collection === 'associations') {
    const result = await payload.find({
      collection: 'associations',
      limit: safeLimit,
      sort: 'name',
    }).catch(() => ({ docs: [] }))

    return (
      <section className="my-8">
        {title && <h2 className="text-2xl font-bold text-text mb-4">{title}</h2>}
        <div className="grid gap-3 sm:grid-cols-2">
          {(result.docs as any[]).map((item) => (
            <article key={item.id} className="rounded-xl bg-white border border-border p-5">
              <strong className="text-text text-[15px]">{item.name}</strong>
              {item.description && (
                <p className="mt-1 text-sm text-muted line-clamp-2">{item.description}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    )
  }

  return null
}
