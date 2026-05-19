import Image from 'next/image'

interface MediaValue {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

interface ImageBlockProps {
  image?: MediaValue | string | null
  caption?: string | null
}

export function ImageBlock({ image, caption }: ImageBlockProps) {
  const media = image && typeof image === 'object' ? image : null
  if (!media?.url) return null

  return (
    <figure className="my-8">
      <Image
        src={media.url}
        alt={media.alt ?? ''}
        width={media.width ?? 800}
        height={media.height ?? 500}
        className="rounded-xl w-full object-cover"
      />
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted">{caption}</figcaption>
      )}
    </figure>
  )
}
