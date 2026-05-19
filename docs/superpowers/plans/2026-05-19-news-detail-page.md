# News Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer la page `/actualites/[slug]` qui affiche une actualité publiée de la collection `news` avec image hero, titre, date, résumé et richtext.

**Architecture:** Un composant présentationnel `NewsArticle` est extrait du fichier de route pour être testable indépendamment. La route (`page.tsx`) est un async Server Component qui fetch les données Payload, filtre explicitement les documents publiés, gère `generateMetadata` et `notFound`, puis délègue l'affichage à `NewsArticle`. La collection `News` actuelle ne définit pas de champ `seo`; `generateMetadata` utilise donc `article.title` et `article.summary`.

**Tech Stack:** Next.js 15 (App Router, Server Components), Payload CMS, Vitest + React Testing Library, Tailwind v4.

---

## Fichiers

| Action | Fichier | Responsabilité |
|---|---|---|
| Créer | `src/components/news/NewsArticle.tsx` | Composant présentationnel pur — reçoit les données et rend l'article |
| Créer | `src/components/news/__tests__/NewsArticle.test.tsx` | Tests unitaires de `NewsArticle` |
| Créer | `src/app/(frontend)/actualites/[slug]/page.tsx` | Route Next.js — fetch Payload, `generateMetadata`, `notFound`, délègue à `NewsArticle` |
| Créer | `src/app/(frontend)/actualites/[slug]/__tests__/page.test.tsx` | Tests de la route : filtre publié, metadata, 404 |

---

## Task 1 : Composant `NewsArticle` (TDD)

**Files:**
- Create: `src/components/news/__tests__/NewsArticle.test.tsx`
- Create: `src/components/news/NewsArticle.tsx`

- [ ] **Step 1 : Écrire les tests échouants**

Créer `src/components/news/__tests__/NewsArticle.test.tsx` :

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/image', () => ({
  default: ({ fill, priority, ...props }: any) => <img {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

vi.mock('@/components/blocks/RichTextBlock', () => ({
  RichTextBlock: ({ content }: any) =>
    content?.root?.children?.length ? <div data-testid="rich-text" /> : null,
}))

import { NewsArticle } from '../NewsArticle'

const contentWithChildren = {
  root: {
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Contenu', format: 0 }],
      },
    ],
  },
}

describe('NewsArticle', () => {
  it('renders the article title as h1', () => {
    render(<NewsArticle title="Mon article" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mon article')
  })

  it('renders the date when publishedAt is provided', () => {
    render(<NewsArticle title="Titre" publishedAt="2026-05-19T00:00:00.000Z" />)
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('does not render a date when publishedAt is absent', () => {
    render(<NewsArticle title="Titre" />)
    expect(screen.queryByText(/janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre/i)).toBeNull()
  })

  it('renders the summary when provided', () => {
    render(<NewsArticle title="Titre" summary="Un résumé court" />)
    expect(screen.getByText('Un résumé court')).toBeInTheDocument()
  })

  it('does not render a summary element when summary is absent', () => {
    render(<NewsArticle title="Titre" />)
    expect(screen.queryByText(/résumé/)).toBeNull()
  })

  it('renders the hero image as decorative when image url is provided', () => {
    const { container } = render(<NewsArticle title="Titre" image={{ url: '/img.jpg' }} />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/img.jpg')
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('does not render an image element when image is absent', () => {
    render(<NewsArticle title="Titre" />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders richtext content and a separator when content has children', () => {
    const { container } = render(<NewsArticle title="Titre" content={contentWithChildren} />)
    expect(screen.getByTestId('rich-text')).toBeInTheDocument()
    expect(container.querySelector('hr')).toBeInTheDocument()
  })

  it('does not render richtext or separator when content is empty', () => {
    const { container } = render(<NewsArticle title="Titre" content={{ root: { children: [] } }} />)
    expect(screen.queryByTestId('rich-text')).toBeNull()
    expect(container.querySelector('hr')).toBeNull()
  })

  it('does not render richtext or separator when content is absent', () => {
    const { container } = render(<NewsArticle title="Titre" />)
    expect(screen.queryByTestId('rich-text')).toBeNull()
    expect(container.querySelector('hr')).toBeNull()
  })

  it('renders a link back to /actualites', () => {
    render(<NewsArticle title="Titre" />)
    expect(screen.getByRole('link', { name: /retour aux actualit/i })).toHaveAttribute('href', '/actualites')
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
npm test -- --reporter=verbose src/components/news/__tests__/NewsArticle.test.tsx
```

Résultat attendu : la suite échoue avec `Cannot find module '../NewsArticle'`.

- [ ] **Step 3 : Implémenter `NewsArticle`**

Créer `src/components/news/NewsArticle.tsx` :

```tsx
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
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
npm test -- --reporter=verbose src/components/news/__tests__/NewsArticle.test.tsx
```

Résultat attendu : 11 tests PASS.

- [ ] **Step 5 : Commit**

```bash
git add src/components/news/NewsArticle.tsx src/components/news/__tests__/NewsArticle.test.tsx
git commit -m "feat: add NewsArticle presentational component with tests"
```

---

## Task 2 : Route `/actualites/[slug]` (TDD)

**Files:**
- Create: `src/app/(frontend)/actualites/[slug]/__tests__/page.test.tsx`
- Create: `src/app/(frontend)/actualites/[slug]/page.tsx`

- [ ] **Step 1 : Écrire les tests échouants de la route**

Créer `src/app/(frontend)/actualites/[slug]/__tests__/page.test.tsx` :

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import NewsDetailPage, { generateMetadata } from '../page'

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('@/components/news/NewsArticle', () => ({
  NewsArticle: ({ title, publishedAt, summary, image, content }: any) => (
    <article data-testid="news-article">
      <h1>{title}</h1>
      <span>{publishedAt}</span>
      <p>{summary}</p>
      {image && <span data-testid="has-image" />}
      {content && <span data-testid="has-content" />}
    </article>
  ),
}))

const mockGetPayloadClient = vi.mocked(getPayloadClient)
const mockNotFound = vi.mocked(notFound)

function publishedNewsWhere(slug: string) {
  return {
    and: [
      { slug: { equals: slug } },
      { _status: { equals: 'published' } },
    ],
  }
}

function mockPayloadFind(docs: any[]) {
  const find = vi.fn().mockResolvedValue({ docs })
  mockGetPayloadClient.mockResolvedValue({ find } as any)
  return find
}

describe('NewsDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches a published article by slug and renders NewsArticle', async () => {
    const article = {
      id: 1,
      title: 'Conseil municipal',
      slug: 'conseil-municipal',
      summary: 'Compte rendu du dernier conseil.',
      publishedAt: '2026-05-19T00:00:00.000Z',
      image: { url: '/image.jpg' },
      content: { root: { children: [{ type: 'paragraph', children: [] }] } },
    }
    const find = mockPayloadFind([article])

    const element = await NewsDetailPage({
      params: Promise.resolve({ slug: 'conseil-municipal' }),
    })

    expect(find).toHaveBeenCalledWith({
      collection: 'news',
      where: publishedNewsWhere('conseil-municipal'),
      depth: 1,
      limit: 1,
    })

    render(element as React.ReactElement)
    expect(screen.getByTestId('news-article')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Conseil municipal')
    expect(screen.getByText('Compte rendu du dernier conseil.')).toBeInTheDocument()
    expect(screen.getByTestId('has-image')).toBeInTheDocument()
    expect(screen.getByTestId('has-content')).toBeInTheDocument()
  })

  it('calls notFound when no published article matches the slug', async () => {
    mockPayloadFind([])

    await expect(
      NewsDetailPage({ params: Promise.resolve({ slug: 'inexistant' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the published article title and summary', async () => {
    const find = mockPayloadFind([
      {
        id: 1,
        title: 'Titre metadata',
        slug: 'titre-metadata',
        summary: 'Résumé metadata',
        publishedAt: '2026-05-19T00:00:00.000Z',
      },
    ])

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'titre-metadata' }),
    })

    expect(find).toHaveBeenCalledWith({
      collection: 'news',
      where: publishedNewsWhere('titre-metadata'),
      limit: 1,
    })
    expect(metadata).toEqual({
      title: 'Titre metadata',
      description: 'Résumé metadata',
    })
  })

  it('returns empty metadata when no published article matches the slug', async () => {
    mockPayloadFind([])

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'inexistant' }),
    })

    expect(metadata).toEqual({})
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
npm test -- --reporter=verbose 'src/app/(frontend)/actualites/[slug]/__tests__/page.test.tsx'
```

Résultat attendu : la suite échoue avec `Cannot find module '../page'`.

- [ ] **Step 3 : Créer la route**

Créer `src/app/(frontend)/actualites/[slug]/page.tsx` :

```tsx
import type { Metadata } from 'next'
import type { Where } from 'payload'
import type { News } from '@/payload-types'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { NewsArticle } from '@/components/news/NewsArticle'

export const revalidate = 60

function publishedNewsWhere(slug: string): Where {
  return {
    and: [
      { slug: { equals: slug } },
      { _status: { equals: 'published' } },
    ],
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: publishedNewsWhere(slug),
    limit: 1,
  })
  const article = result.docs[0] as News | undefined
  if (!article) return {}
  return {
    title: article.title,
    description: article.summary || undefined,
  }
}

export default async function NewsDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: publishedNewsWhere(slug),
    depth: 1,
    limit: 1,
  })
  const article = result.docs[0] as News | undefined
  if (!article) notFound()

  return (
    <NewsArticle
      title={article.title}
      publishedAt={article.publishedAt}
      summary={article.summary}
      image={article.image}
      content={article.content}
    />
  )
}
```

- [ ] **Step 4 : Vérifier que les tests de route passent**

```bash
npm test -- --reporter=verbose 'src/app/(frontend)/actualites/[slug]/__tests__/page.test.tsx'
```

Résultat attendu : 4 tests PASS.

- [ ] **Step 5 : Lancer le serveur de dev et vérifier manuellement**

```bash
npm run dev
```

Vérifier :
1. Naviguer vers `/actualites` — les liens vers les articles existent
2. Cliquer sur un article publié → la page s'affiche (titre, date, image si présente, richtext)
3. Naviguer vers un slug inexistant (ex. `/actualites/slug-qui-nexiste-pas`) → page 404 native Next.js
4. Vérifier qu'une actualité en brouillon n'est pas accessible publiquement par son slug

- [ ] **Step 6 : Lancer la suite de tests complète**

```bash
npm test
```

Résultat attendu : tous les tests passent, aucune régression.

- [ ] **Step 7 : Commit**

```bash
git add src/app/(frontend)/actualites/[slug]/page.tsx src/app/(frontend)/actualites/[slug]/__tests__/page.test.tsx
git commit -m "feat: add news detail page route /actualites/[slug]"
```
