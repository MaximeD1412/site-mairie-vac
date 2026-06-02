'use client'

import { useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const Lightbox = dynamic(() => import('yet-another-react-lightbox'), { ssr: false })

interface MediaValue {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

interface GalleryItem {
  image?: MediaValue | string | null
}

interface GalleryBlockProps {
  images?: GalleryItem[] | null
}

export function GalleryBlock({ images }: GalleryBlockProps) {
  const [index, setIndex] = useState(-1)

  const mediaItems = (images ?? [])
    .map((item) => (item?.image && typeof item.image === 'object' ? item.image : null))
    .filter((img): img is MediaValue => img !== null && !!img.url)

  if (!mediaItems.length) return null

  const slides = mediaItems.map((img) => ({
    src: img.url!,
    alt: img.alt ?? '',
    width: img.width ?? undefined,
    height: img.height ?? undefined,
  }))

  return (
    <section className="my-8">
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 list-none p-0 m-0">
        {mediaItems.map((img, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="w-full aspect-square overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label={img.alt || `Image ${i + 1}`}
            >
              <Image
                src={img.url!}
                alt={img.alt ?? ''}
                width={img.width ?? 400}
                height={img.height ?? 400}
                className="w-full h-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox open={index >= 0} close={() => setIndex(-1)} slides={slides} index={index} />
    </section>
  )
}
