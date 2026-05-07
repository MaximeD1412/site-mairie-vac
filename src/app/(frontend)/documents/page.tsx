import { getPayloadClient } from '@/lib/payload'

export default async function DocumentsArchive() {
  const payload = await getPayloadClient()
  const documents = await payload.find({ collection: 'documents', sort: '-date', limit: 100, depth: 2 })
  return <main className="mx-auto max-w-5xl px-4 py-12"><h1 className="text-4xl font-bold">Documents</h1><div className="mt-8 grid gap-4">{documents.docs.map((item: any) => <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm"><strong>{item.title}</strong><p className="mt-2 text-slate-600">{item.category}</p></article>)}</div></main>
}
