import type { Metadata } from 'next'
import type { Where } from 'payload'
import type { Event } from '@/payload-types'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { EventArticle } from '@/components/events/EventArticle'
import { EditButton } from '@/components/EditButton'

export const revalidate = 60

function publishedEventWhere(slug: string): Where {
  return {
    and: [
      { slug: { equals: slug } },
      { _status: { equals: 'published' } },
    ],
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'events',
    where: publishedEventWhere(slug),
    depth: 1,
    limit: 1,
  })
  const event = result.docs[0] as Event | undefined
  if (!event) return {}
  return { title: event.title }
}

export default async function EventDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'events',
    where: publishedEventWhere(slug),
    depth: 1,
    limit: 1,
  })
  const event = result.docs[0] as Event | undefined
  if (!event) notFound()

  return (
    <>
      <EventArticle
        title={event.title}
        startDate={event.startDate}
        endDate={event.endDate}
        location={event.location}
        category={
          event.category && typeof event.category === 'object'
            ? { name: event.category.name, color: event.category.color }
            : null
        }
        organizer={event.organizer as { name?: string | null } | null | undefined}
        image={event.image as { url?: string | null; alt?: string | null } | null | undefined}
      />
      <EditButton href={`/agenda/${slug}/modifier`} label="Modifier" />
    </>
  )
}
