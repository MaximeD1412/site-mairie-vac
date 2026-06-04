import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { decodePayloadToken } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { updateNews, deleteNews } from '@/actions/news'
import { NewsForm } from '@/components/NewsForm'
import type { News } from '@/payload-types'

export default async function NewsModifierPage({
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
  const result = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  const article = result.docs[0] as News | undefined
  if (!article) notFound()

  const boundUpdate = updateNews.bind(null, article.id)
  const boundDelete = deleteNews.bind(null, article.id)

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Modifier l&apos;actualité</h1>
      <NewsForm action={boundUpdate} news={article} deleteAction={boundDelete} />
    </main>
  )
}
