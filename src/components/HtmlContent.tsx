import sanitizeHtml from 'sanitize-html'

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'em', 'u', 's', 'code', 'sub', 'sup',
  'ul', 'ol', 'li',
  'a', 'blockquote',
  'figure', 'img',
  'video', 'source',
  'div', 'iframe',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

const ALLOWED_ATTRS: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height', 'class'],
  source: ['src', 'type'],
  video: ['controls', 'class'],
  iframe: ['src', 'title', 'allow', 'allowfullscreen', 'class'],
  div: ['class'],
  figure: ['class'],
  '*': ['class'],
}

function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
  })
}

interface HtmlContentProps {
  html: string | null | undefined
  className?: string
}

export function HtmlContent({ html, className }: HtmlContentProps) {
  if (!html) return null
  const clean = sanitize(html)
  if (!clean.trim()) return null
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
