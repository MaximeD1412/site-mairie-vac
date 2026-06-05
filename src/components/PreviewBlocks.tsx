'use client'

import { HtmlContent } from './HtmlContent'

export function PreviewBlocks({ blocks }: { blocks?: any[] }) {
  if (!blocks?.length) return null
  return (
    <>
      {blocks.map((block, i) => {
        const t = block.blockType ?? block.type
        switch (t) {
          case 'richText':
            if ('html' in block)
              return <HtmlContent key={i} html={block.html} className="rich-content my-8 text-text text-[15px]" />
            return null
          case 'image': {
            const url = typeof block.url === 'string' ? block.url : block.image?.url
            const alt = block.alt ?? block.image?.alt ?? ''
            return (
              <figure key={i} className="my-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {url && <img src={url} alt={alt} className="w-full rounded-xl" />}
                {block.caption && (
                  <figcaption className="mt-2 text-center text-sm text-muted">{block.caption}</figcaption>
                )}
              </figure>
            )
          }
          case 'video':
            if (block.isEmbed)
              return (
                <div key={i} className="my-6 aspect-video w-full overflow-hidden rounded-xl">
                  <iframe src={block.src} title="Vidéo" allowFullScreen className="w-full h-full" />
                </div>
              )
            return (
              <video key={i} controls className="my-6 w-full rounded-xl bg-black">
                <source src={block.src} />
              </video>
            )
          case 'columns':
            return (
              <div
                key={i}
                className="my-8 grid gap-4"
                style={{ gridTemplateColumns: block.columns?.map((c: any) => `${c.widthPct}fr`).join(' ') }}
              >
                {(block.columns ?? []).map((col: any, ci: number) => (
                  <div key={col.id ?? ci} role="region" aria-label={`Colonne ${ci + 1}`}>
                    <PreviewBlocks blocks={col.blocks} />
                  </div>
                ))}
              </div>
            )
          default:
            return null
        }
      })}
    </>
  )
}
