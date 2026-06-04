import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decodePayloadToken } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { createEvent } from '@/actions/events'
import { EventForm } from '@/components/EventForm'
import type { EventCategory, Association } from '@/payload-types'

export default async function EventNewPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  const decoded = token ? decodePayloadToken(token) : null
  if (decoded?.role !== 'admin' && decoded?.role !== 'agent') redirect('/connexion')

  const payload = await getPayloadClient()
  const [categoriesResult, associationsResult] = await Promise.all([
    payload.find({ collection: 'event-categories', limit: 100 }),
    payload.find({ collection: 'associations', limit: 100 }),
  ])

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Nouvel événement</h1>
      <EventForm
        action={createEvent}
        categories={categoriesResult.docs as EventCategory[]}
        associations={associationsResult.docs as Association[]}
      />
    </main>
  )
}
