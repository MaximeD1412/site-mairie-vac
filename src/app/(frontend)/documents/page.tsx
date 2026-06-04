import { getPayloadClient } from '@/lib/payload'
import { EditButton } from '@/components/EditButton'

export default async function DocumentsArchive() {
  const payload = await getPayloadClient()
  const documents = await payload.find({ collection: 'documents', sort: '-date', limit: 100, depth: 2 })
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Documents</h1>
        <EditButton href="/documents/new" label="Nouveau document" />
      </div>
      <div className="mt-8 grid gap-4">
        {documents.docs.map((item: any) => (
          <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <strong>{item.title}</strong>
            <p className="mt-2 text-slate-600">{item.category}</p>
          </article>
        ))}
      </div>
    </main>
  )
}
