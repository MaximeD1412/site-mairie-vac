import { getPayloadClient } from '@/lib/payload'
import { Hero } from '@/components/home/Hero'
import { QuickLinksBar } from '@/components/home/QuickLinksBar'
import { ActuPanneauSection } from '@/components/home/ActuPanneauSection'
import { AgendaSection } from '@/components/home/AgendaSection'
import { PublicationsSection } from '@/components/home/PublicationsSection'

export const revalidate = 60

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [newsResult, eventsResult, docsResult, siteSettings, homepageSettings] = await Promise.all([
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
      where: { startDate: { greater_than: new Date().toISOString() } },
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
      <ActuPanneauSection news={newsResult.docs as any} settings={siteSettings as any} />
      <AgendaSection events={eventsResult.docs as any} />
      <PublicationsSection documents={docsResult.docs as any} />
    </>
  )
}
