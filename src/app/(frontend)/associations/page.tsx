import { getPayloadClient } from '@/lib/payload'

export default async function AssociationsArchive() {
  const payload = await getPayloadClient()
  const associations = await payload.find({ collection: 'associations', sort: 'name', limit: 100 })
  return <main className="mx-auto max-w-5xl px-4 py-12"><h1 className="text-4xl font-bold">Associations</h1><div className="mt-8 grid gap-4 md:grid-cols-2">{associations.docs.map((item: any) => <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm"><strong>{item.name}</strong><p className="mt-2 text-slate-600">{item.category || 'Association'}</p></article>)}</div></main>
}
