# Block Renderer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter le renderer de blocs CMS avec cinq composants indépendants et un converter Lexical custom, remplaçant les stubs actuels de `Blocks.tsx`.

**Architecture:** Chaque bloc est un composant React isolé dans `src/components/blocks/`. `Blocks.tsx` devient un dispatcher pur qui route `blockType` vers le bon composant. `CollectionListBlock` est un async Server Component qui fait son propre `payload.find()`. Le converter Lexical dans `RichTextBlock.tsx` est une fonction récursive `renderNode()` sans dépendance externe.

**Tech Stack:** Next.js 15 App Router, React Server Components, Payload CMS v3, `@payloadcms/richtext-lexical` (UploadFeature, YouTubeFeature), `next/image`, Tailwind CSS v4.

---

## Fichiers touchés

| Action | Fichier | Rôle |
|---|---|---|
| MODIFY | `src/blocks/RichTextBlock.ts` | Ajouter `UploadFeature` + `YouTubeFeature` à l'éditeur |
| MODIFY | `src/collections/News.ts` | Idem pour le champ `content` |
| CREATE | `src/components/blocks/RichTextBlock.tsx` | Converter Lexical → JSX |
| CREATE | `src/components/blocks/ImageBlock.tsx` | next/image + légende |
| CREATE | `src/components/blocks/QuickLinksBlock.tsx` | Grille de liens |
| CREATE | `src/components/blocks/CollectionListBlock.tsx` | Fetch + mini-liste (async Server Component) |
| CREATE | `src/components/blocks/PanneauPocketBlock.tsx` | Iframe PanneauPocket |
| MODIFY | `src/components/Blocks.tsx` | Refactoring en dispatcher pur |

---

## Task 1 — Activer UploadFeature + YouTubeFeature dans les schémas Payload

**Files:**
- Modify: `src/blocks/RichTextBlock.ts`
- Modify: `src/collections/News.ts`

- [ ] **Step 1 : Modifier `src/blocks/RichTextBlock.ts`**

```ts
import type { Block } from 'payload'
import { lexicalEditor, UploadFeature, YouTubeFeature } from '@payloadcms/richtext-lexical'

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Texte riche', plural: 'Textes riches' },
  fields: [
    {
      name: 'content',
      label: 'Contenu',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          UploadFeature({ collections: { media: { fields: [] } } }),
          YouTubeFeature(),
        ],
      }),
    },
  ],
}
```

- [ ] **Step 2 : Modifier `src/collections/News.ts`**

Remplacer le champ `content` existant (`{ name: 'content', label: 'Contenu', type: 'richText' }`) par :

```ts
import { lexicalEditor, UploadFeature, YouTubeFeature } from '@payloadcms/richtext-lexical'

// Dans le tableau fields, remplacer le champ content :
{
  name: 'content',
  label: 'Contenu',
  type: 'richText',
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      UploadFeature({ collections: { media: { fields: [] } } }),
      YouTubeFeature(),
    ],
  }),
},
```

Le fichier complet résultant :

```ts
import type { CollectionConfig } from 'payload'
import { lexicalEditor, UploadFeature, YouTubeFeature } from '@payloadcms/richtext-lexical'
import { publishedOrLoggedIn, isAgentOrAdmin } from '../access'

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'Actualité', plural: 'Actualités' },
  versions: { drafts: true },
  admin: { useAsTitle: 'title', group: 'Contenus' },
  access: { read: publishedOrLoggedIn, create: isAgentOrAdmin, update: isAgentOrAdmin, delete: isAgentOrAdmin },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, unique: true },
    { name: 'summary', label: 'Résumé', type: 'textarea', required: true },
    { name: 'image', label: 'Image', type: 'upload', relationTo: 'media' },
    { name: 'publishedAt', label: 'Date de publication', type: 'date', required: true },
    { name: 'featured', label: 'Mettre en avant', type: 'checkbox', defaultValue: false },
    {
      name: 'content',
      label: 'Contenu',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          UploadFeature({ collections: { media: { fields: [] } } }),
          YouTubeFeature(),
        ],
      }),
    },
  ],
}
```

- [ ] **Step 3 : Régénérer les types Payload**

```bash
npm run generate:types
```

Résultat attendu : `src/payload-types.ts` mis à jour, aucune erreur.

- [ ] **Step 4 : Générer une migration (règle projet : toujours après un changement de schéma)**

```bash
npx payload migrate:create --name add-lexical-upload-youtube
```

> Note : `UploadFeature` et `YouTubeFeature` ne modifient pas le schéma SQL (richText est stocké en JSON). La migration générée sera vide ou minimale — c'est normal, on la commite quand même.

- [ ] **Step 5 : Vérifier que le build passe**

```bash
npm run build
```

Résultat attendu : build OK, pas d'erreur TypeScript.

- [ ] **Step 6 : Commiter**

```bash
git add src/blocks/RichTextBlock.ts src/collections/News.ts src/payload-types.ts
git add src/migrations/ 2>/dev/null || true
git commit -m "feat: enable UploadFeature and YouTubeFeature in Lexical editor config"
```

---

## Task 2 — Créer `src/components/blocks/RichTextBlock.tsx`

**Files:**
- Create: `src/components/blocks/RichTextBlock.tsx`

- [ ] **Step 1 : Créer le fichier**

```tsx
import Image from 'next/image'

// Bitmask Lexical pour les formats de texte inline
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

function renderText(node: LexicalNode): React.ReactNode {
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

function renderNode(node: LexicalNode, key: number): React.ReactNode {
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
```

- [ ] **Step 2 : Vérifier que le build passe**

```bash
npm run build
```

Résultat attendu : pas d'erreur TypeScript, build OK.

- [ ] **Step 3 : Commiter**

```bash
git add src/components/blocks/RichTextBlock.tsx
git commit -m "feat: add RichTextBlock — custom Lexical to JSX converter"
```

---

## Task 3 — Créer `src/components/blocks/ImageBlock.tsx`

**Files:**
- Create: `src/components/blocks/ImageBlock.tsx`

- [ ] **Step 1 : Créer le fichier**

```tsx
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
```

- [ ] **Step 2 : Vérifier que le build passe**

```bash
npm run build
```

- [ ] **Step 3 : Commiter**

```bash
git add src/components/blocks/ImageBlock.tsx
git commit -m "feat: add ImageBlock — next/image with optional caption"
```

---

## Task 4 — Créer `src/components/blocks/QuickLinksBlock.tsx`

**Files:**
- Create: `src/components/blocks/QuickLinksBlock.tsx`

- [ ] **Step 1 : Créer le fichier**

```tsx
import Link from 'next/link'

interface QuickLink {
  label: string
  url: string
  description?: string | null
}

export function QuickLinksBlock({ links }: { links?: QuickLink[] }) {
  if (!links?.length) return null
  return (
    <section className="my-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {links.map((link, i) => (
        <Link
          key={i}
          href={link.url}
          className="rounded-2xl bg-brand-pale border border-brand-light/40 p-5 no-underline hover:shadow-md hover:border-brand-light transition-all group"
        >
          <strong className="text-brand group-hover:text-brand-mid text-[14px] font-semibold">{link.label}</strong>
          {link.description && (
            <p className="mt-1.5 text-sm text-muted">{link.description}</p>
          )}
        </Link>
      ))}
    </section>
  )
}
```

- [ ] **Step 2 : Vérifier que le build passe**

```bash
npm run build
```

- [ ] **Step 3 : Commiter**

```bash
git add src/components/blocks/QuickLinksBlock.tsx
git commit -m "feat: add QuickLinksBlock — responsive link grid"
```

---

## Task 5 — Créer `src/components/blocks/CollectionListBlock.tsx`

**Files:**
- Create: `src/components/blocks/CollectionListBlock.tsx`

CollectionListBlock est un **async Server Component** : il fait son propre `payload.find()` selon le champ `collection` du bloc CMS.

- [ ] **Step 1 : Créer le fichier**

```tsx
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'

interface CollectionListBlockProps {
  collection: 'news' | 'events' | 'documents' | 'associations'
  limit?: number | null
  title?: string | null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function CollectionListBlock({ collection, limit, title }: CollectionListBlockProps) {
  const payload = await getPayloadClient()
  const safeLimit = limit ?? 3

  if (collection === 'news') {
    const result = await payload.find({
      collection: 'news',
      limit: safeLimit,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
    }).catch(() => ({ docs: [] }))

    return (
      <section className="my-8">
        {title && <h2 className="text-2xl font-bold text-text mb-4">{title}</h2>}
        <div className="grid gap-3">
          {(result.docs as any[]).map((item) => (
            <Link
              key={item.id}
              href={`/actualites/${item.slug}`}
              className="flex flex-col gap-1 rounded-xl bg-white border border-border p-5 no-underline hover:shadow-md transition-shadow"
            >
              {item.publishedAt && (
                <span className="text-xs text-muted">{formatDate(item.publishedAt)}</span>
              )}
              <strong className="text-text text-[15px]">{item.title}</strong>
              {item.summary && (
                <p className="text-sm text-muted mt-0.5 line-clamp-2">{item.summary}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    )
  }

  if (collection === 'events') {
    const result = await payload.find({
      collection: 'events',
      limit: safeLimit,
      sort: 'startDate',
      where: { startDate: { greater_than: new Date().toISOString() } },
    }).catch(() => ({ docs: [] }))

    return (
      <section className="my-8">
        {title && <h2 className="text-2xl font-bold text-text mb-4">{title}</h2>}
        <div className="grid gap-3">
          {(result.docs as any[]).map((item) => (
            <Link
              key={item.id}
              href={`/agenda/${item.slug}`}
              className="flex flex-col gap-1 rounded-xl bg-white border border-border p-5 no-underline hover:shadow-md transition-shadow"
            >
              {item.startDate && (
                <span className="text-xs text-muted">
                  {formatDate(item.startDate)}{item.location ? ` · ${item.location}` : ''}
                </span>
              )}
              <strong className="text-text text-[15px]">{item.title}</strong>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  if (collection === 'documents') {
    const result = await payload.find({
      collection: 'documents',
      limit: safeLimit,
      sort: '-date',
      depth: 1,
    }).catch(() => ({ docs: [] }))

    return (
      <section className="my-8">
        {title && <h2 className="text-2xl font-bold text-text mb-4">{title}</h2>}
        <div className="grid gap-3">
          {(result.docs as any[]).map((item) => {
            const fileUrl = item.file && typeof item.file === 'object' ? item.file.url : null
            return (
              <article key={item.id} className="flex flex-col gap-1 rounded-xl bg-white border border-border p-5">
                {(item.date || item.category) && (
                  <span className="text-xs text-muted">
                    {item.date ? formatDate(item.date) : ''}{item.category ? ` · ${item.category}` : ''}
                  </span>
                )}
                <strong className="text-text text-[15px]">{item.title}</strong>
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-brand underline"
                  >
                    Télécharger le document
                  </a>
                )}
              </article>
            )
          })}
        </div>
      </section>
    )
  }

  if (collection === 'associations') {
    const result = await payload.find({
      collection: 'associations',
      limit: safeLimit,
      sort: 'name',
    }).catch(() => ({ docs: [] }))

    return (
      <section className="my-8">
        {title && <h2 className="text-2xl font-bold text-text mb-4">{title}</h2>}
        <div className="grid gap-3 sm:grid-cols-2">
          {(result.docs as any[]).map((item) => (
            <article key={item.id} className="rounded-xl bg-white border border-border p-5">
              <strong className="text-text text-[15px]">{item.name}</strong>
              {item.description && (
                <p className="mt-1 text-sm text-muted line-clamp-2">{item.description}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    )
  }

  return null
}
```

- [ ] **Step 2 : Vérifier que le build passe**

```bash
npm run build
```

- [ ] **Step 3 : Commiter**

```bash
git add src/components/blocks/CollectionListBlock.tsx
git commit -m "feat: add CollectionListBlock — async Server Component with payload.find()"
```

---

## Task 6 — Créer `src/components/blocks/PanneauPocketBlock.tsx`

**Files:**
- Create: `src/components/blocks/PanneauPocketBlock.tsx`

- [ ] **Step 1 : Créer le fichier**

```tsx
interface PanneauPocketBlockProps {
  title?: string | null
  widgetUrl?: string | null
}

export function PanneauPocketBlock({ title, widgetUrl }: PanneauPocketBlockProps) {
  const url = widgetUrl || process.env.NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL

  return (
    <section className="my-8">
      {title && <h2 className="text-2xl font-bold text-text mb-4">{title}</h2>}
      {url ? (
        <iframe
          src={url}
          title="PanneauPocket — informations et alertes locales"
          className="w-full min-h-[520px] rounded-2xl border border-border bg-white"
        />
      ) : (
        <p className="text-sm text-muted italic">Widget PanneauPocket non configuré.</p>
      )}
    </section>
  )
}
```

- [ ] **Step 2 : Vérifier que le build passe**

```bash
npm run build
```

- [ ] **Step 3 : Commiter**

```bash
git add src/components/blocks/PanneauPocketBlock.tsx
git commit -m "feat: add PanneauPocketBlock — iframe widget with fallback"
```

---

## Task 7 — Refactorer `src/components/Blocks.tsx` en dispatcher pur

**Files:**
- Modify: `src/components/Blocks.tsx`

- [ ] **Step 1 : Remplacer le contenu de `src/components/Blocks.tsx`**

```tsx
import { RichTextBlock } from './blocks/RichTextBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { QuickLinksBlock } from './blocks/QuickLinksBlock'
import { CollectionListBlock } from './blocks/CollectionListBlock'
import { PanneauPocketBlock } from './blocks/PanneauPocketBlock'

export function RenderBlocks({ blocks }: { blocks?: any[] }) {
  if (!blocks?.length) return null
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'richText':
            return <RichTextBlock key={index} content={block.content} />
          case 'image':
            return <ImageBlock key={index} image={block.image} caption={block.caption} />
          case 'quickLinks':
            return <QuickLinksBlock key={index} links={block.links} />
          case 'collectionList':
            return (
              <CollectionListBlock
                key={index}
                collection={block.collection}
                limit={block.limit}
                title={block.title}
              />
            )
          case 'panneauPocket':
            return <PanneauPocketBlock key={index} title={block.title} widgetUrl={block.widgetUrl} />
          default:
            return null
        }
      })}
    </>
  )
}
```

- [ ] **Step 2 : Vérifier que le build passe**

```bash
npm run build
```

Résultat attendu : build OK, pas de régression TypeScript, pas d'import manquant.

- [ ] **Step 3 : Vérifier visuellement en dev**

```bash
npm run dev
```

Naviguer vers une page CMS dans l'admin Payload (`/admin`), créer ou éditer une page avec un bloc `richText` contenant du texte, des titres, une liste, un lien. Aller sur la page frontend correspondante et vérifier que le contenu s'affiche correctement (pas de JSON brut).

- [ ] **Step 4 : Commiter**

```bash
git add src/components/Blocks.tsx
git commit -m "feat: refactor Blocks.tsx into pure dispatcher — wire all block renderers"
```
