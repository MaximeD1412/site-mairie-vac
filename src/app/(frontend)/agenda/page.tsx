import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'

export default async function EventsArchive() {
  const payload = await getPayloadClient()
  const events = await payload.find({ collection: 'events', sort: 'startDate', limit: 50 })

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold">Agenda</h1>
      <div className="mt-8 grid gap-4">
        {events.docs.map((item: any) => (
          <Link
            key={item.id}
            href={`/agenda/${item.slug}`}
            className="block rounded-2xl bg-white p-5 shadow-sm no-underline transition-shadow hover:shadow-md"
          >
            <strong>{item.title}</strong>
            <p className="mt-2 text-slate-600">{item.location || 'Lieu à préciser'}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
