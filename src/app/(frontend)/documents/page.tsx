import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { EditButton } from '@/components/EditButton'
import { getAvailableTabs, getCategoryLabel } from '@/lib/documents'

export default async function DocumentsArchive({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>
}) {
  const { categorie } = await searchParams
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'documents', sort: '-date', limit: 100, depth: 2 })

  const tabs = getAvailableTabs(docs as { category?: string | null }[])
  const filtered = categorie ? docs.filter((d: any) => d.category === categorie) : docs
  const activeTab = categorie ?? 'tous'

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Documents</h1>
        <EditButton href="/documents/new" label="+ Nouveau document" />
      </div>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Filtrer par catégorie">
        <Link
          href="/documents"
          aria-current={activeTab === 'tous' ? 'page' : undefined}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors no-underline ${
            activeTab === 'tous'
              ? 'bg-brand text-white'
              : 'bg-white text-slate-700 shadow-sm hover:bg-brand-pale'
          }`}
        >
          Tous
        </Link>
        {tabs.map(tab => (
          <Link
            key={tab.value}
            href={`/documents?categorie=${tab.value}`}
            aria-current={activeTab === tab.value ? 'page' : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors no-underline ${
              activeTab === tab.value
                ? 'bg-brand text-white'
                : 'bg-white text-slate-700 shadow-sm hover:bg-brand-pale'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 grid gap-4">
        {filtered.map((item: any) => (
          <a
            key={item.id}
            href={item.file?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between rounded-2xl bg-white p-5 shadow-sm no-underline transition-shadow hover:shadow-md"
          >
            <div>
              <strong className="text-slate-900">{item.title}</strong>
              {item.date && (
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(item.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
              {!categorie && item.category && (
                <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">
                  {getCategoryLabel(item.category)}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}
