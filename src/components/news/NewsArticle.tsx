import type { ComponentProps } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { RichTextBlock } from '@/components/blocks/RichTextBlock'

interface NewsImage {
  url?: string | null
  alt?: string | null
}

type RichTextContent = ComponentProps<typeof RichTextBlock>['content']

interface NewsArticleProps {
  title: string
  publishedAt?: string | null
  summary?: string | null
  image?: NewsImage | number | string | null
  content?: RichTextContent | null
}

export function NewsArticle({ title, publishedAt, summary, image, content }: NewsArticleProps) {
  const img = image && typeof image === 'object' ? image : null
  const hasRichTextContent = Boolean(content?.root?.children?.length)

  return (
    <main>
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
          <span className="inline-block bg-teal-light text-teal rounded px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide">
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
        {hasRichTextContent && (
          <>
            <hr className="my-6 border-border" />
            <RichTextBlock content={content ?? undefined} />
          </>
        )}
      </div>
    </main>
  )
}
