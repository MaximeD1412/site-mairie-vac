import Image from 'next/image'
import Link from 'next/link'
import { RenderBlocks } from '@/components/Blocks'

interface NewsImage {
  url?: string | null
  alt?: string | null
}

interface NewsArticleProps {
  title: string
  publishedAt?: string | null
  summary?: string | null
  image?: NewsImage | number | string | null
  layout?: any[]
}

export function NewsArticle({ title, publishedAt, summary, image, layout }: NewsArticleProps) {
  const img = image && typeof image === 'object' ? image as NewsImage : null
  const hasLayout = layout && layout.length > 0

  return (
    <article>
      {img?.url && (
        <div className="relative h-64 w-full overflow-hidden bg-brand">
          <Image src={img.url} alt="" aria-hidden="true" fill className="object-cover" />
        </div>
      )}
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href="/actualites"
          className="text-sm text-brand-mid hover:text-teal no-underline"
        >
          ← Retour aux actualités
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <span className="inline-block bg-teal-light text-teal-dark rounded px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide">
            Actualité
          </span>
          {publishedAt && (
            <span className="text-sm text-muted">
              {new Date(publishedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-text leading-tight">{title}</h1>
        {summary && <p className="mt-3 text-lg text-muted">{summary}</p>}
        {hasLayout && (
          <>
            <hr className="my-6 border-border" />
            <RenderBlocks blocks={layout} />
          </>
        )}
      </div>
    </article>
  )
}
