export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decodePayloadToken } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { createNews } from '@/actions/news'
import { NewsForm } from '@/components/NewsForm'
import type { News } from '@/payload-types'

export default async function NewsNewPage({
  searchParams,
}: {
  searchParams: Promise<{ wc?: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  const decoded = token ? decodePayloadToken(token) : null
  if (decoded?.role !== 'admin' && decoded?.role !== 'agent') redirect('/connexion')

  const { wc: wcId } = await searchParams

  let initialNews: News | undefined
  if (wcId && decoded!.id) {
    const payload = await getPayloadClient()
    const wcResult = await payload.find({
      collection: 'working-copies',
      where: { id: { equals: wcId }, author: { equals: decoded!.id } },
      overrideAccess: true,
      limit: 1,
    })
    const wc = wcResult.docs[0]
    if (wc?.data) initialNews = wc.data as News
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Nouvelle actualité</h1>
      <NewsForm action={createNews} news={initialNews} />
    </main>
  )
}
