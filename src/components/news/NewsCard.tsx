import Link from 'next/link'
import Image from 'next/image'

interface NewsImage {
  url?: string | null
}

export interface NewsItem {
  id: string
  slug?: string | null
  title: string
  summary?: string | null
  publishedAt?: string | null
  image?: NewsImage | string | null
}

export function NewsCard({ item, featured }: { item: NewsItem; featured?: boolean }) {
  const image = item.image && typeof item.image === 'object' ? item.image : null

  return (
    <Link
      href={`/actualites/${item.slug ?? item.id}`}
      className={`flex no-underline rounded-xl overflow-hidden border border-border bg-white hover:-translate-y-0.5 hover:shadow-lg transition-all ${featured ? 'flex-col' : 'flex-row'}`}
      aria-label={`Lire l'actualité : ${item.title}`}
    >
      <div className={`bg-gradient-to-br from-brand-light to-brand-mid relative ${featured ? 'h-[200px]' : 'w-[130px] shrink-0'}`}>
        {image?.url && (
          <Image
            src={image.url}
            alt=""
            aria-hidden="true"
            fill
            sizes={featured ? '(max-width: 768px) 100vw, calc(min(1280px, 100vw) - 460px)' : '130px'}
            className="object-cover"
          />
        )}
      </div>
      <div className="p-5 flex flex-col gap-2">
        <span className="inline-block bg-teal-light text-teal-dark rounded px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide w-fit">
          {featured ? 'À la une' : 'Actualité'}
        </span>
        <strong className="text-[15px] font-bold text-text leading-snug">{item.title}</strong>
        {item.summary && <p className="text-[13px] text-muted line-clamp-2">{item.summary}</p>}
        <span className="text-[11.5px] text-muted">
          {item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
            : ''}
        </span>
      </div>
    </Link>
  )
}
