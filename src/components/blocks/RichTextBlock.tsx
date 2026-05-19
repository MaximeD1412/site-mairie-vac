import Image from 'next/image'

const BOLD          = 1
const ITALIC        = 2
const STRIKETHROUGH = 4
const UNDERLINE     = 8
const CODE          = 16
const SUBSCRIPT     = 32
const SUPERSCRIPT   = 64

interface LexicalNode {
  type: string
  children?: LexicalNode[]
  text?: string
  format?: number
  tag?: string
  listType?: string
  url?: string
  fields?: { url?: string; newTab?: boolean }
  value?: {
    url?: string | null
    alt?: string | null
    width?: number | null
    height?: number | null
    mimeType?: string | null
  }
  videoID?: string
}

const HEADING_CLASS: Record<string, string> = {
  h1: 'text-3xl font-bold text-text mt-8 mb-4',
  h2: 'text-2xl font-bold text-text mt-7 mb-3',
  h3: 'text-xl font-semibold text-text mt-6 mb-2',
  h4: 'text-lg font-semibold text-text mt-5 mb-2',
  h5: 'text-base font-semibold text-text mt-4 mb-1',
  h6: 'text-sm font-semibold text-text mt-4 mb-1',
}

// exported for testing only
export function renderText(node: LexicalNode): React.ReactNode {
  const text = node.text ?? ''
  const fmt = node.format ?? 0
  if (fmt === 0) return text

  let el: React.ReactNode = text
  if (fmt & CODE)          el = <code className="bg-brand-pale px-1.5 py-0.5 rounded font-mono text-sm text-brand">{el}</code>
  if (fmt & BOLD)          el = <strong>{el}</strong>
  if (fmt & ITALIC)        el = <em>{el}</em>
  if (fmt & UNDERLINE)     el = <u>{el}</u>
  if (fmt & STRIKETHROUGH) el = <s>{el}</s>
  if (fmt & SUBSCRIPT)     el = <sub>{el}</sub>
  if (fmt & SUPERSCRIPT)   el = <sup>{el}</sup>
  return el
}

// exported for testing only
export function renderNode(node: LexicalNode, key: number): React.ReactNode {
  const ch = () => node.children?.map((child, i) => renderNode(child, i)) ?? []

  switch (node.type) {
    case 'text':
      return <span key={key}>{renderText(node)}</span>

    case 'linebreak':
      return <br key={key} />

    case 'paragraph':
      return <p key={key} className="mb-4 leading-relaxed">{ch()}</p>

    case 'heading': {
      const tag = (node.tag ?? 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      const Tag = tag
      return <Tag key={key} className={HEADING_CLASS[tag]}>{ch()}</Tag>
    }

    case 'list':
      return node.listType === 'number'
        ? <ol key={key} className="list-decimal pl-6 mb-4 space-y-1">{ch()}</ol>
        : <ul key={key} className="list-disc pl-6 mb-4 space-y-1">{ch()}</ul>

    case 'listitem':
      return <li key={key} className="text-text">{ch()}</li>

    case 'link':
    case 'autolink': {
      const href = node.fields?.url ?? node.url ?? '#'
      const newTab = node.fields?.newTab
      return (
        <a
          key={key}
          href={href}
          {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="text-brand underline decoration-brand/40 hover:decoration-brand transition-colors"
        >
          {ch()}
        </a>
      )
    }

    case 'quote':
      return (
        <blockquote key={key} className="border-l-4 border-brand-light pl-4 my-5 text-muted italic">
          {ch()}
        </blockquote>
      )

    case 'horizontalrule':
      return <hr key={key} className="border-border my-6" />

    case 'upload': {
      const media = node.value
      if (!media?.url) return null
      if (media.mimeType?.startsWith('video/')) {
        return (
          <video key={key} controls className="w-full rounded-xl my-6 bg-black">
            <source src={media.url} type={media.mimeType} />
          </video>
        )
      }
      return (
        <figure key={key} className="my-6">
          <Image
            src={media.url}
            alt={media.alt ?? ''}
            width={media.width ?? 800}
            height={media.height ?? 600}
            className="rounded-xl w-full object-cover"
          />
        </figure>
      )
    }

    case 'youtube': {
      if (!node.videoID) return null
      return (
        <div key={key} className="my-6 aspect-video w-full overflow-hidden rounded-xl">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${node.videoID}`}
            title="Vidéo YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )
    }

    default:
      return null
  }
}

export function RichTextBlock({ content }: { content?: { root?: { children?: LexicalNode[] } } }) {
  const nodes = content?.root?.children
  if (!nodes?.length) return null
  return (
    <section className="my-8 text-text text-[15px]">
      {nodes.map((node, i) => renderNode(node, i))}
    </section>
  )
}
