import { JSDOM } from 'jsdom'

export type FileType = 'pdf' | 'image' | 'doc'
export type PageType = 'accueil' | 'contact' | 'page'

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'])
const DOC_EXTS = new Set(['.doc', '.docx', '.xls', '.xlsx', '.odt', '.ods', '.ppt', '.pptx'])

function ext(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const dot = pathname.lastIndexOf('.')
    return dot === -1 ? '' : pathname.slice(dot).toLowerCase()
  } catch {
    return ''
  }
}

function classifyFileType(url: string): FileType | null {
  const e = ext(url)
  if (e === '.pdf') return 'pdf'
  if (IMAGE_EXTS.has(e)) return 'image'
  if (DOC_EXTS.has(e)) return 'doc'
  return null
}

// ─── extractLinks ─────────────────────────────────────────────────────────────

export function extractLinks(html: string, baseUrl: string): string[] {
  const dom = new JSDOM(html, { url: baseUrl })
  const base = new URL(baseUrl)
  const seen = new Set<string>()
  const links: string[] = []

  dom.window.document.querySelectorAll('a[href]').forEach((el) => {
    const a = el as HTMLAnchorElement
    try {
      const url = new URL(a.href)
      if (url.origin !== base.origin) return
      if (!url.protocol.startsWith('http')) return
      url.hash = ''
      const normalized = url.toString()
      if (!seen.has(normalized) && classifyFileType(normalized) === null) {
        seen.add(normalized)
        links.push(normalized)
      }
    } catch {
      // invalid URL
    }
  })

  return links
}

// ─── extractFiles ─────────────────────────────────────────────────────────────

export function extractFiles(html: string, baseUrl: string): Array<{ url: string; type: FileType }> {
  const dom = new JSDOM(html, { url: baseUrl })
  const base = new URL(baseUrl)
  const seen = new Set<string>()
  const files: Array<{ url: string; type: FileType }> = []

  function add(rawHref: string) {
    try {
      const url = new URL(rawHref, baseUrl)
      if (url.origin !== base.origin) return
      const type = classifyFileType(url.toString())
      if (!type) return
      url.hash = ''
      const normalized = url.toString()
      if (!seen.has(normalized)) {
        seen.add(normalized)
        files.push({ url: normalized, type })
      }
    } catch {
      // invalid URL
    }
  }

  dom.window.document.querySelectorAll('a[href], img[src]').forEach((el) => {
    const raw = el.tagName === 'IMG'
      ? (el as HTMLImageElement).src
      : (el as HTMLAnchorElement).href
    add(raw)
  })

  return files
}

// ─── extractTitle ─────────────────────────────────────────────────────────────

export function extractTitle(html: string): string {
  const dom = new JSDOM(html)
  const title = dom.window.document.querySelector('title')
  if (title?.textContent) return title.textContent.trim()
  const h1 = dom.window.document.querySelector('h1')
  if (h1?.textContent) return h1.textContent.trim()
  return ''
}

// ─── classifyPage ─────────────────────────────────────────────────────────────

export function classifyPage(url: string, _html: string): PageType {
  try {
    const pathname = new URL(url).pathname.replace(/\/$/, '')
    if (pathname === '') return 'accueil'
    if (/contact/i.test(pathname)) return 'contact'
  } catch {
    // invalid URL
  }
  return 'page'
}

// ─── shouldSkip ───────────────────────────────────────────────────────────────

export function shouldSkip(url: string, baseUrl: string, visited: Set<string>): boolean {
  if (visited.has(url)) return true
  try {
    const parsed = new URL(url)
    if (!parsed.protocol.startsWith('http')) return true
    return parsed.origin !== new URL(baseUrl).origin
  } catch {
    return true
  }
}

// ─── toCsvLine ────────────────────────────────────────────────────────────────

export function toCsvLine(entry: { url: string; title: string; type: string }): string {
  const escaped = entry.title.replace(/"/g, '""')
  return `${entry.url},"${escaped}",${entry.type}`
}
