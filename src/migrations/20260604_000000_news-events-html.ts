import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// ─── Lexical JSON → HTML converter ───────────────────────────────────────────

const BOLD          = 1
const ITALIC        = 2
const STRIKETHROUGH = 4
const UNDERLINE     = 8
const CODE          = 16
const SUBSCRIPT     = 32
const SUPERSCRIPT   = 64

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderText(node: any): string {
  const text = node.text ?? ''
  const fmt = node.format ?? 0
  if (fmt === 0) return esc(text)
  let result = esc(text)
  if (fmt & CODE)          result = `<code>${result}</code>`
  if (fmt & BOLD)          result = `<strong>${result}</strong>`
  if (fmt & ITALIC)        result = `<em>${result}</em>`
  if (fmt & UNDERLINE)     result = `<u>${result}</u>`
  if (fmt & STRIKETHROUGH) result = `<s>${result}</s>`
  if (fmt & SUBSCRIPT)     result = `<sub>${result}</sub>`
  if (fmt & SUPERSCRIPT)   result = `<sup>${result}</sup>`
  return result
}

function renderChildren(node: any): string {
  if (!node.children) return ''
  return node.children.map(renderNode).join('')
}

function renderNode(node: any): string {
  switch (node.type) {
    case 'text':
      return renderText(node)

    case 'linebreak':
      return '<br>'

    case 'paragraph':
      return `<p>${renderChildren(node)}</p>`

    case 'heading': {
      const tag = /^h[1-6]$/.test(node.tag ?? '') ? node.tag : 'h2'
      return `<${tag}>${renderChildren(node)}</${tag}>`
    }

    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${renderChildren(node)}</${tag}>`
    }

    case 'listitem':
      return `<li>${renderChildren(node)}</li>`

    case 'link':
    case 'autolink': {
      const href = esc(node.fields?.url ?? node.url ?? '#')
      const target = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${href}"${target}>${renderChildren(node)}</a>`
    }

    case 'quote':
      return `<blockquote>${renderChildren(node)}</blockquote>`

    case 'horizontalrule':
      return '<hr>'

    case 'upload': {
      const media = node.value
      if (!media?.url) return ''
      if (media.mimeType?.startsWith('video/')) {
        return `<video controls><source src="${esc(media.url)}" type="${esc(media.mimeType)}"></video>`
      }
      const alt = esc(media.alt ?? '')
      const w = media.width ?? 800
      const h = media.height ?? 600
      return `<figure><img src="${esc(media.url)}" alt="${alt}" width="${w}" height="${h}"></figure>`
    }

    case 'youtube': {
      if (!node.videoID || !/^[a-zA-Z0-9_-]{11}$/.test(node.videoID)) return ''
      return `<div class="youtube-embed"><iframe src="https://www.youtube-nocookie.com/embed/${node.videoID}" title="Vidéo YouTube" allowfullscreen></iframe></div>`
    }

    default:
      return renderChildren(node)
  }
}

function lexicalToHtml(lexical: any): string {
  if (!lexical?.root?.children) return ''
  return lexical.root.children.map(renderNode).join('')
}

// ─── Migration ───────────────────────────────────────────────────────────────

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Add temporary HTML text columns
  await db.execute(sql`
    ALTER TABLE "news"     ADD COLUMN "content_html" text;
    ALTER TABLE "_news_v"  ADD COLUMN "version_content_html" text;
    ALTER TABLE "events"   ADD COLUMN "description_html" text;
    ALTER TABLE "_events_v" ADD COLUMN "version_description_html" text;
  `)

  // 2. Convert news.content (JSONB → HTML)
  const newsRows = await db.execute<{ id: number; content: any }>(
    sql`SELECT id, content FROM news WHERE content IS NOT NULL`
  )
  for (const row of (newsRows as any).rows ?? []) {
    const html = lexicalToHtml(row.content)
    await db.execute(sql`UPDATE news SET content_html = ${html} WHERE id = ${row.id}`)
  }

  // 3. Convert _news_v.version_content (JSONB → HTML)
  const newsVRows = await db.execute<{ id: number; version_content: any }>(
    sql`SELECT id, version_content FROM _news_v WHERE version_content IS NOT NULL`
  )
  for (const row of (newsVRows as any).rows ?? []) {
    const html = lexicalToHtml(row.version_content)
    await db.execute(sql`UPDATE _news_v SET version_content_html = ${html} WHERE id = ${row.id}`)
  }

  // 4. Convert events.description (JSONB → HTML)
  const eventsRows = await db.execute<{ id: number; description: any }>(
    sql`SELECT id, description FROM events WHERE description IS NOT NULL`
  )
  for (const row of (eventsRows as any).rows ?? []) {
    const html = lexicalToHtml(row.description)
    await db.execute(sql`UPDATE events SET description_html = ${html} WHERE id = ${row.id}`)
  }

  // 5. Convert _events_v.version_description (JSONB → HTML)
  const eventsVRows = await db.execute<{ id: number; version_description: any }>(
    sql`SELECT id, version_description FROM _events_v WHERE version_description IS NOT NULL`
  )
  for (const row of (eventsVRows as any).rows ?? []) {
    const html = lexicalToHtml(row.version_description)
    await db.execute(sql`UPDATE _events_v SET version_description_html = ${html} WHERE id = ${row.id}`)
  }

  // 6. Drop old JSONB columns, rename new text columns
  await db.execute(sql`
    ALTER TABLE "news"     DROP COLUMN "content";
    ALTER TABLE "news"     RENAME COLUMN "content_html" TO "content";
    ALTER TABLE "_news_v"  DROP COLUMN "version_content";
    ALTER TABLE "_news_v"  RENAME COLUMN "version_content_html" TO "version_content";
    ALTER TABLE "events"   DROP COLUMN "description";
    ALTER TABLE "events"   RENAME COLUMN "description_html" TO "description";
    ALTER TABLE "_events_v" DROP COLUMN "version_description";
    ALTER TABLE "_events_v" RENAME COLUMN "version_description_html" TO "version_description";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reverse: text → jsonb (data is lost — HTML cannot be converted back to Lexical)
  await db.execute(sql`
    ALTER TABLE "news"     ADD COLUMN "content_jsonb" jsonb;
    ALTER TABLE "_news_v"  ADD COLUMN "version_content_jsonb" jsonb;
    ALTER TABLE "events"   ADD COLUMN "description_jsonb" jsonb;
    ALTER TABLE "_events_v" ADD COLUMN "version_description_jsonb" jsonb;
    ALTER TABLE "news"     DROP COLUMN "content";
    ALTER TABLE "news"     RENAME COLUMN "content_jsonb" TO "content";
    ALTER TABLE "_news_v"  DROP COLUMN "version_content";
    ALTER TABLE "_news_v"  RENAME COLUMN "version_content_jsonb" TO "version_content";
    ALTER TABLE "events"   DROP COLUMN "description";
    ALTER TABLE "events"   RENAME COLUMN "description_jsonb" TO "description";
    ALTER TABLE "_events_v" DROP COLUMN "version_description";
    ALTER TABLE "_events_v" RENAME COLUMN "version_description_jsonb" TO "version_description";
  `)
}
