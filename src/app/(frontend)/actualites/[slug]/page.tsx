import type { Metadata } from 'next'
import type { Where } from 'payload'
import type { News } from '@/payload-types'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { NewsArticle } from '@/components/news/NewsArticle'

export const revalidate = 60

function publishedNewsWhere(slug: string): Where {
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
    collection: 'news',
    where: publishedNewsWhere(slug),
    limit: 1,
  })
  const article = result.docs[0] as News | undefined
  if (!article) return {}
  return {
    title: article.title,
    description: article.summary || undefined,
  }
}

export default async function NewsDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: publishedNewsWhere(slug),
    depth: 1,
    limit: 1,
  })
  const article = result.docs[0] as News | undefined
  if (!article) notFound()

  return (
    <NewsArticle
      title={article.title}
      publishedAt={article.publishedAt}
      summary={article.summary}
      image={article.image}
      content={article.content}
    />
  )
}
