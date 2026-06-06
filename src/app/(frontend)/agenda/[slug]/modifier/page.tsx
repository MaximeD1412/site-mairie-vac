export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { decodePayloadToken } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { updateEvent, deleteEvent } from '@/actions/events'
import { EventForm } from '@/components/EventForm'
import type { Event, EventCategory, Association } from '@/payload-types'

export default async function EventModifierPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  const decoded = token ? decodePayloadToken(token) : null
  if (decoded?.role !== 'admin' && decoded?.role !== 'agent') redirect('/connexion')

  const { slug } = await params

  const payload = await getPayloadClient()
  const [eventResult, categoriesResult, associationsResult] = await Promise.all([
    payload.find({ collection: 'events', where: { slug: { equals: slug } }, depth: 1, limit: 1 }),
    payload.find({ collection: 'event-categories', limit: 100 }),
    payload.find({ collection: 'associations', limit: 100 }),
  ])

  const event = eventResult.docs[0] as Event | undefined
  if (!event) notFound()

  const boundUpdate = updateEvent.bind(null, event.id)
  const boundDelete = deleteEvent.bind(null, event.id)

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Modifier l&apos;événement</h1>
      <EventForm
        action={boundUpdate}
        event={event}
        deleteAction={boundDelete}
        categories={categoriesResult.docs as EventCategory[]}
        associations={associationsResult.docs as Association[]}
      />
    </main>
  )
}
