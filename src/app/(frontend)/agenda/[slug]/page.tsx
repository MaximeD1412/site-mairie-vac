import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { EventArticle } from '@/components/events/EventArticle'

export const revalidate = 60

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const event = result.docs[0] as any
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
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  const event = result.docs[0] as any
  if (!event) notFound()

  return (
    <EventArticle
      title={event.title}
      startDate={event.startDate}
      endDate={event.endDate}
      location={event.location}
      category={event.category}
      organizer={event.organizer}
      image={event.image}
      description={event.description}
    />
  )
}
