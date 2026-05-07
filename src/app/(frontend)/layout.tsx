import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'La Ville-aux-Clercs',
  description: 'Site officiel de la commune'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayloadClient()
  const nav = await payload.find({ collection: 'navigation', where: { location: { equals: 'main' } }, depth: 2, limit: 1 }).catch(() => null)
  return (
    <html lang="fr">
      <body>
        <Header navigation={nav?.docs?.[0]} />
        {children}
        <Footer />
      </body>
    </html>
  )
}
