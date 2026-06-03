import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'

export default async function NewsArchive() {
  const payload = await getPayloadClient()
  const news = await payload.find({ collection: 'news', sort: '-publishedAt', limit: 30 })
  return <div className="mx-auto max-w-5xl px-4 py-12"><h1 className="text-4xl font-bold">Actualités</h1><div className="mt-8 grid gap-4">{news.docs.map((item: any) => <Link key={item.id} href={`/actualites/${item.slug}`} className="rounded-2xl bg-white p-5 shadow-sm no-underline"><strong>{item.title}</strong><p className="mt-2 text-slate-600">{item.summary}</p></Link>)}</div></div>
}
