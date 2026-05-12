import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'La Ville-aux-Clercs',
  description: 'Site officiel de la commune de La Ville-aux-Clercs (41160)',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayloadClient()

  const [mainNavResult, footerNavResult, mairieInfo] = await Promise.all([
    payload.find({ collection: 'navigation', where: { location: { equals: 'main' } }, depth: 2, limit: 1 }).catch(() => null),
    payload.find({ collection: 'navigation', where: { location: { equals: 'footer' } }, depth: 1, limit: 1 }).catch(() => null),
    payload.findGlobal({ slug: 'mairie-info' }).catch(() => null),
  ])

  return (
    <html lang="fr">
      <body>
        <Header navigation={mainNavResult?.docs?.[0] as any} />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer mairieInfo={mairieInfo as any} footerNav={footerNavResult?.docs?.[0] as any} />
      </body>
    </html>
  )
}
