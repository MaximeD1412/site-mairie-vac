import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { decodePayloadToken } from '@/lib/auth'
import { Hero } from '@/components/home/Hero'
import { QuickLinksBar } from '@/components/home/QuickLinksBar'
import { ActuPanneauSection } from '@/components/home/ActuPanneauSection'
import { AgendaSection } from '@/components/home/AgendaSection'
import { PublicationsSection } from '@/components/home/PublicationsSection'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  const decoded = token ? decodePayloadToken(token) : null
  const role = decoded?.role
  const payload = await getPayloadClient()

  const nowISO = new Date().toISOString()

  const [newsResult, carouselEventsResult, calendarEventsResult, docsResult, siteSettings, homepageSettings] = await Promise.all([
    payload.find({
      collection: 'news',
      limit: 3,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
    }).catch(() => ({ docs: [] })),

    payload.find({
      collection: 'events',
      limit: 4,
      sort: 'startDate',
      depth: 1,
      where: {
        and: [
          { _status: { equals: 'published' } },
          { startDate: { greater_than: nowISO } },
        ],
      },
    }).catch(() => ({ docs: [] })),

    payload.find({
      collection: 'events',
      limit: 50,
      sort: 'startDate',
      depth: 1,
      where: {
        and: [
          { _status: { equals: 'published' } },
          {
            or: [
              { startDate: { greater_than_equal: nowISO } },
              { endDate: { greater_than_equal: nowISO } },
            ],
          },
        ],
      },
    }).catch(() => ({ docs: [] })),

    payload.find({
      collection: 'documents',
      limit: 4,
      sort: '-date',
      depth: 1,
    }).catch(() => ({ docs: [] })),

    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.findGlobal({ slug: 'homepage-settings' }).catch(() => null),
  ])

  return (
    <>
      <Hero settings={siteSettings as any} />
      <QuickLinksBar settings={homepageSettings as any} />
      <ActuPanneauSection news={newsResult.docs as any} settings={siteSettings as any} role={role} />
      <AgendaSection
          carouselEvents={carouselEventsResult.docs as any}
          calendarEvents={calendarEventsResult.docs as any}
          role={role}
        />
      <PublicationsSection documents={docsResult.docs as any} role={role} />
    </>
  )
}
