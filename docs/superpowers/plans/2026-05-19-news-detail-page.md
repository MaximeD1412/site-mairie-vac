# News Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer la page `/actualites/[slug]` qui affiche un article de la collection `news` avec image hero, titre, date, résumé et richtext.

**Architecture:** Un composant présentationnel `NewsArticle` extrait du fichier de route pour être testable indépendamment. La route (`page.tsx`) est un async Server Component qui fetch les données Payload et délègue l'affichage à `NewsArticle`. `RichTextBlock` est réutilisé tel quel.

**Tech Stack:** Next.js 15 (App Router, Server Components), Payload CMS, Vitest + React Testing Library, Tailwind v4.

---

## Fichiers

| Action | Fichier | Responsabilité |
|---|---|---|
| Créer | `src/components/news/NewsArticle.tsx` | Composant présentationnel pur — reçoit les données et rend l'article |
| Créer | `src/components/news/__tests__/NewsArticle.test.tsx` | Tests unitaires de `NewsArticle` |
| Créer | `src/app/(frontend)/actualites/[slug]/page.tsx` | Route Next.js — fetch Payload, `generateMetadata`, `notFound`, délègue à `NewsArticle` |

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

vi.mock('next/image', () => ({ default: (props: Record<string, unknown>) => <img {...props as any} /> }))
vi.mock('next/link', () => ({ default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a> }))
vi.mock('@/components/blocks/RichTextBlock', () => ({
  RichTextBlock: ({ content }: any) => content ? <div data-testid="rich-text" /> : null,
}))

import { NewsArticle } from '../NewsArticle'

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
    // No date text should appear — only the badge "Actualité" and the title
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

  it('renders the hero image when image url is provided', () => {
    render(<NewsArticle title="Titre" image={{ url: '/img.jpg' }} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('does not render an image element when image is absent', () => {
    render(<NewsArticle title="Titre" />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders richtext content when content is provided', () => {
    render(<NewsArticle title="Titre" content={{ root: { children: [] } }} />)
    expect(screen.getByTestId('rich-text')).toBeInTheDocument()
  })

  it('does not render richtext when content is absent', () => {
    render(<NewsArticle title="Titre" />)
    expect(screen.queryByTestId('rich-text')).toBeNull()
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

Résultat attendu : toutes les assertions échouent avec `Cannot find module '../NewsArticle'`.

- [ ] **Step 3 : Implémenter `NewsArticle`**

Créer `src/components/news/NewsArticle.tsx` :

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { RichTextBlock } from '@/components/blocks/RichTextBlock'

interface NewsImage {
  url?: string | null
  alt?: string | null
}

interface NewsArticleProps {
  title: string
  publishedAt?: string | null
  summary?: string | null
  image?: NewsImage | string | null
  content?: any
}

export function NewsArticle({ title, publishedAt, summary, image, content }: NewsArticleProps) {
  const img = image && typeof image === 'object' ? image : null

  return (
    <main>
      {img?.url && (
        <div className="relative h-64 w-full overflow-hidden bg-brand">
          <Image src={img.url} alt="" aria-hidden fill className="object-cover" />
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
        {content && <hr className="my-6 border-border" />}
        <RichTextBlock content={content} />
      </div>
    </main>
  )
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
npm test -- --reporter=verbose src/components/news/__tests__/NewsArticle.test.tsx
```

Résultat attendu : 10 tests PASS.

- [ ] **Step 5 : Commit**

```bash
git add src/components/news/NewsArticle.tsx src/components/news/__tests__/NewsArticle.test.tsx
git commit -m "feat: add NewsArticle presentational component with tests"
```

---

## Task 2 : Route `/actualites/[slug]`

**Files:**
- Create: `src/app/(frontend)/actualites/[slug]/page.tsx`

- [ ] **Step 1 : Créer la route**

Créer `src/app/(frontend)/actualites/[slug]/page.tsx` :

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { NewsArticle } from '@/components/news/NewsArticle'

export const revalidate = 60

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const article = result.docs[0] as any
  if (!article) return {}
  return {
    title: article.title,
    description: article.summary ?? undefined,
  }
}

export default async function NewsDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  const article = result.docs[0] as any
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

- [ ] **Step 2 : Lancer le serveur de dev et vérifier manuellement**

```bash
npm run dev
```

Vérifier :
1. Naviguer vers `/actualites` — les liens vers les articles existent
2. Cliquer sur un article → la page s'affiche (titre, date, image si présente, richtext)
3. Naviguer vers un slug inexistant (ex. `/actualites/slug-qui-nexiste-pas`) → page 404 native Next.js

- [ ] **Step 3 : Lancer la suite de tests complète**

```bash
npm test
```

Résultat attendu : tous les tests passent, aucune régression.

- [ ] **Step 4 : Commit**

```bash
git add src/app/(frontend)/actualites/[slug]/page.tsx
git commit -m "feat: add news detail page route /actualites/[slug]"
```
