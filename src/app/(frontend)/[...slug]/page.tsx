import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { RenderBlocks } from '@/components/Blocks'

export const revalidate = 60

export default async function CMSPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const path = slug.join('/')
  const result = await payload.find({ collection: 'pages', where: { slug: { equals: path } }, depth: 2, limit: 1 })
  const page = result.docs[0]
  if (!page) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold">{page.title}</h1>
      {page.summary && <p className="mt-4 text-xl text-slate-600">{page.summary}</p>}
      <RenderBlocks blocks={(page as any).layout} />
    </div>
  )
}
