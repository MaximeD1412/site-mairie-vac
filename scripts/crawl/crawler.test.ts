import { describe, it, expect } from 'vitest'
import { extractLinks, extractFiles, extractTitle, classifyPage, shouldSkip, toCsvLine } from './crawler'

// ─── extractLinks ─────────────────────────────────────────────────────────────

describe('extractLinks', () => {
  it('returns only internal URLs, normalised and deduplicated', () => {
    const html = `
      <a href="/page-1">Page 1</a>
      <a href="https://example.com/page-2">Page 2</a>
      <a href="https://external.com/other">External</a>
      <a href="/page-1#section">Duplicate with hash</a>
      <a href="mailto:contact@example.com">Email</a>
      <a href="tel:0123456789">Phone</a>
    `
    const links = extractLinks(html, 'https://example.com')
    expect(links).toEqual([
      'https://example.com/page-1',
      'https://example.com/page-2',
    ])
  })

  it('handles relative URLs', () => {
    const html = `<a href="about">About</a>`
    const links = extractLinks(html, 'https://example.com/section/')
    expect(links).toContain('https://example.com/section/about')
  })

  it('returns empty array when no links', () => {
    expect(extractLinks('<p>No links</p>', 'https://example.com')).toEqual([])
  })
})

// ─── extractFiles ─────────────────────────────────────────────────────────────

describe('extractFiles', () => {
  it('classifies PDFs, images, and documents', () => {
    const html = `
      <a href="/docs/rapport.pdf">Rapport</a>
      <img src="/images/logo.png" />
      <a href="/docs/compte-rendu.docx">Compte-rendu</a>
      <a href="/page-normale">Page normale</a>
    `
    const files = extractFiles(html, 'https://example.com')
    expect(files).toEqual([
      { url: 'https://example.com/docs/rapport.pdf', type: 'pdf' },
      { url: 'https://example.com/images/logo.png', type: 'image' },
      { url: 'https://example.com/docs/compte-rendu.docx', type: 'doc' },
    ])
  })

  it('ignores external file URLs', () => {
    const html = `<a href="https://cdn.external.com/file.pdf">PDF externe</a>`
    const files = extractFiles(html, 'https://example.com')
    expect(files).toEqual([])
  })

  it('deduplicates the same file referenced twice', () => {
    const html = `
      <a href="/file.pdf">Lien 1</a>
      <a href="/file.pdf">Lien 2</a>
    `
    const files = extractFiles(html, 'https://example.com')
    expect(files).toHaveLength(1)
  })
})

// ─── extractTitle ─────────────────────────────────────────────────────────────

describe('extractTitle', () => {
  it('returns the <title> text', () => {
    const html = `<html><head><title>Ma Commune</title></head><body></body></html>`
    expect(extractTitle(html)).toBe('Ma Commune')
  })

  it('falls back to first <h1> when no <title>', () => {
    const html = `<html><body><h1>Titre principal</h1></body></html>`
    expect(extractTitle(html)).toBe('Titre principal')
  })

  it('returns empty string when no title or h1', () => {
    expect(extractTitle('<p>Contenu</p>')).toBe('')
  })
})

// ─── classifyPage ─────────────────────────────────────────────────────────────

describe('classifyPage', () => {
  it('classifies root as accueil', () => {
    expect(classifyPage('https://example.com/', '')).toBe('accueil')
    expect(classifyPage('https://example.com', '')).toBe('accueil')
  })

  it('classifies contact page', () => {
    expect(classifyPage('https://example.com/contact', '')).toBe('contact')
    expect(classifyPage('https://example.com/nous-contacter', '')).toBe('contact')
  })

  it('defaults to page for unknown URLs', () => {
    expect(classifyPage('https://example.com/some-article-title', '')).toBe('page')
  })
})

// ─── shouldSkip ───────────────────────────────────────────────────────────────

describe('shouldSkip', () => {
  it('skips already-visited URLs', () => {
    const visited = new Set(['https://example.com/page-1'])
    expect(shouldSkip('https://example.com/page-1', 'https://example.com', visited)).toBe(true)
  })

  it('skips external URLs', () => {
    expect(shouldSkip('https://external.com/page', 'https://example.com', new Set())).toBe(true)
  })

  it('skips non-HTTP schemes', () => {
    expect(shouldSkip('mailto:a@b.com', 'https://example.com', new Set())).toBe(true)
    expect(shouldSkip('tel:0102030405', 'https://example.com', new Set())).toBe(true)
  })

  it('does not skip a new internal URL', () => {
    expect(shouldSkip('https://example.com/page-2', 'https://example.com', new Set())).toBe(false)
  })
})

// ─── toCsvLine ────────────────────────────────────────────────────────────────

describe('toCsvLine', () => {
  it('formats a row with URL, title, type', () => {
    const line = toCsvLine({ url: 'https://example.com/page', title: 'Ma Page', type: 'page' })
    expect(line).toBe('https://example.com/page,"Ma Page",page')
  })

  it('wraps title containing a comma in quotes', () => {
    const line = toCsvLine({ url: 'https://example.com/', title: 'Ville, Commune', type: 'accueil' })
    expect(line).toBe('https://example.com/,"Ville, Commune",accueil')
  })

  it('escapes double quotes inside title', () => {
    const line = toCsvLine({ url: 'https://example.com/', title: 'L\'arrêté "officiel"', type: 'page' })
    expect(line).toBe('https://example.com/,"L\'arrêté ""officiel""",page')
  })
})
