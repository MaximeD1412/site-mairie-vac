import type { Metadata } from 'next'
import type { Event } from '@/payload-types'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { decodePayloadToken } from '@/lib/auth'
import { EventArticle } from '@/components/events/EventArticle'
import { EditButton } from '@/components/EditButton'
import { Pencil } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function isAgentOrAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  const decoded = token ? decodePayloadToken(token) : null
  return decoded?.role === 'admin' || decoded?.role === 'agent'
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const privileged = await isAgentOrAdmin()
  const result = await payload.find({
    collection: 'events',
    where: privileged
      ? { slug: { equals: slug } }
      : { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    overrideAccess: privileged,
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
  const privileged = await isAgentOrAdmin()
  const result = await payload.find({
    collection: 'events',
    where: privileged
      ? { slug: { equals: slug } }
      : { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    overrideAccess: privileged,
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
        layout={Array.isArray(event.layout) ? event.layout : undefined}
      />
      <EditButton href={`/agenda/${slug}/modifier`} label="Modifier" icon={<Pencil size={16} />} fab />
    </>
  )
}
