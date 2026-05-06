import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const [news, events] = await Promise.all([
    payload.find({ collection: 'news', limit: 3, sort: '-publishedAt' }).catch(() => ({ docs: [] })),
    payload.find({ collection: 'events', limit: 3, sort: 'startDate' }).catch(() => ({ docs: [] }))
  ])

  return (
    <main>
      <section className="bg-gradient-to-br from-teal-900 to-teal-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <p className="text-teal-100 uppercase tracking-wide text-sm">Site officiel</p>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold max-w-3xl">Bienvenue à La Ville-aux-Clercs</h1>
          <p className="mt-6 text-lg max-w-2xl text-teal-50">Un starter moderne pour une commune : actualités, agenda, démarches, documents et alertes.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/demarches" className="rounded-full bg-white text-teal-900 px-5 py-3 font-semibold no-underline">Mes démarches</Link>
            <Link href="/contact" className="rounded-full border border-white px-5 py-3 font-semibold no-underline">Contacter la mairie</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">Actualités</h2>
          <div className="mt-6 space-y-4">
            {news.docs.map((item: any) => <Link href={`/actualites/${item.slug}`} key={item.id} className="block rounded-2xl bg-white p-5 shadow-sm no-underline"><strong>{item.title}</strong><p className="mt-2 text-slate-600">{item.summary}</p></Link>)}
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold">Agenda</h2>
          <div className="mt-6 space-y-4">
            {events.docs.map((item: any) => <Link href={`/agenda/${item.slug}`} key={item.id} className="block rounded-2xl bg-white p-5 shadow-sm no-underline"><strong>{item.title}</strong><p className="mt-2 text-slate-600">{item.location || 'Lieu à préciser'}</p></Link>)}
          </div>
        </div>
      </section>
    </main>
  )
}
