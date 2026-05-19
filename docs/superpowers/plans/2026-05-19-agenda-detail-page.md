# Agenda Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer la page `/agenda/[slug]` qui affiche un événement de la collection `events` avec image hero, titre, bloc info compact (date, lieu, organisateur), badge catégorie et description richtext, et rendre l'archive `/agenda` navigable vers les pages de détail.

**Architecture:** Un composant présentationnel `EventArticle` extrait du fichier de route pour être testable indépendamment. La route de détail (`agenda/[slug]/page.tsx`) est un async Server Component qui fetch les données Payload et délègue l'affichage à `EventArticle`. L'archive `/agenda` reste simple mais transforme chaque événement en lien vers son détail. `RichTextBlock` est réutilisé tel quel. Le formatage des dates et le mapping des catégories vivent dans le fichier du composant — un seul appelant, pas d'extraction prématurée.

**Tech Stack:** Next.js 15 (App Router, Server Components), Payload CMS, Vitest + React Testing Library, Tailwind v4.

---

## Fichiers

| Action | Fichier | Responsabilité |
|---|---|---|
| Créer | `src/components/events/EventArticle.tsx` | Composant présentationnel pur — reçoit les données et rend l'événement |
| Créer | `src/components/events/__tests__/EventArticle.test.tsx` | Tests unitaires de `EventArticle` |
| Créer | `src/app/(frontend)/agenda/[slug]/page.tsx` | Route Next.js — fetch Payload, `generateMetadata`, `notFound`, délègue à `EventArticle` |
| Modifier | `src/app/(frontend)/agenda/page.tsx` | Archive agenda — rend chaque événement cliquable vers `/agenda/[slug]` |

---

## Task 1 : Composant `EventArticle` (TDD)

**Files:**
- Create: `src/components/events/__tests__/EventArticle.test.tsx`
- Create: `src/components/events/EventArticle.tsx`

- [ ] **Step 1 : Écrire les tests échouants**

Créer `src/components/events/__tests__/EventArticle.test.tsx` :

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/image', () => ({ default: (props: Record<string, unknown>) => <img {...props as any} /> }))
vi.mock('next/link', () => ({ default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a> }))
vi.mock('@/components/blocks/RichTextBlock', () => ({
  RichTextBlock: ({ content }: any) => content ? <div data-testid="rich-text" /> : null,
}))

import { EventArticle } from '../EventArticle'

describe('EventArticle', () => {
  it('renders the title as h1', () => {
    render(<EventArticle title="Concert d'été" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Concert d'été")
  })

  it('renders a link back to /agenda', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.getByRole('link', { name: /retour à l'agenda/i })).toHaveAttribute('href', '/agenda')
  })

  it('renders the category badge with mapped label', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" category="culture" />)
    expect(screen.getByText('Culture')).toBeInTheDocument()
  })

  it('renders raw category value when not mapped', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" category="custom-tag" />)
    expect(screen.getByText('custom-tag')).toBeInTheDocument()
  })

  it('does not render a badge when category is absent', () => {
    const { container } = render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    // category badge has the rounded-full class — assert no element has it
    expect(container.querySelector('.rounded-full')).toBeNull()
  })

  it('renders just the start time when endDate is absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    // single-time format uses "·" separator and no en-dash time range
    const dateText = screen.getByTestId('event-date').textContent ?? ''
    expect(dateText).toContain('·')
    expect(dateText).not.toContain('–')
    expect(dateText).not.toMatch(/^Du /)
  })

  it('renders a time range when endDate is the same day', () => {
    render(
      <EventArticle
        title="Titre"
        startDate="2026-06-20T12:00:00.000Z"
        endDate="2026-06-20T16:00:00.000Z"
      />
    )
    const dateText = screen.getByTestId('event-date').textContent ?? ''
    expect(dateText).toContain('·')
    expect(dateText).toContain('–')
    expect(dateText).not.toMatch(/^Du /)
  })

  it('renders a multi-day range when endDate is a different day', () => {
    render(
      <EventArticle
        title="Titre"
        startDate="2026-06-20T12:00:00.000Z"
        endDate="2026-06-22T12:00:00.000Z"
      />
    )
    const dateText = screen.getByTestId('event-date').textContent ?? ''
    expect(dateText).toMatch(/^Du /)
    expect(dateText).toContain(' au ')
  })

  it('renders the location when provided', () => {
    render(
      <EventArticle
        title="Titre"
        startDate="2026-06-20T12:00:00.000Z"
        location="Salle des fêtes"
      />
    )
    expect(screen.getByText(/Salle des fêtes/)).toBeInTheDocument()
  })

  it('does not render a location row when location is absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.queryByTestId('event-location')).toBeNull()
  })

  it('renders the organizer name when provided', () => {
    render(
      <EventArticle
        title="Titre"
        startDate="2026-06-20T12:00:00.000Z"
        organizer={{ name: 'Association Lecture' }}
      />
    )
    expect(screen.getByText(/Association Lecture/)).toBeInTheDocument()
  })

  it('does not render organizer when absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.queryByTestId('event-organizer')).toBeNull()
  })

  it('does not render organizer when relation is a string (unresolved id)', () => {
    render(
      <EventArticle
        title="Titre"
        startDate="2026-06-20T12:00:00.000Z"
        organizer={'asso-id-123' as any}
      />
    )
    expect(screen.queryByTestId('event-organizer')).toBeNull()
  })

  it('renders the hero image when image url is provided', () => {
    render(
      <EventArticle
        title="Titre"
        startDate="2026-06-20T12:00:00.000Z"
        image={{ url: '/img.jpg' }}
      />
    )
    expect(screen.getByRole('img', { name: 'Titre' })).toBeInTheDocument()
  })

  it('does not render an image element when image is absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders richtext content when description is provided', () => {
    render(
      <EventArticle
        title="Titre"
        startDate="2026-06-20T12:00:00.000Z"
        description={{ root: { children: [] } }}
      />
    )
    expect(screen.getByTestId('rich-text')).toBeInTheDocument()
  })

  it('does not render richtext when description is absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.queryByTestId('rich-text')).toBeNull()
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
npm test -- --reporter=verbose src/components/events/__tests__/EventArticle.test.tsx
```

Résultat attendu : la suite échoue au chargement avec `Cannot find module '../EventArticle'`.

- [ ] **Step 3 : Implémenter `EventArticle`**

Créer `src/components/events/EventArticle.tsx` :

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { RichTextBlock } from '@/components/blocks/RichTextBlock'

interface EventImage {
  url?: string | null
  alt?: string | null
}

interface EventOrganizer {
  name?: string | null
}

interface EventArticleProps {
  title: string
  startDate: string
  endDate?: string | null
  location?: string | null
  category?: string | null
  organizer?: EventOrganizer | string | null
  image?: EventImage | string | null
  description?: any
}

const CATEGORY_LABELS: Record<string, string> = {
  municipal: 'Municipal',
  association: 'Association',
  culture: 'Culture',
  sport: 'Sport',
  ecole: 'École',
  bibliotheque: 'Bibliothèque',
  autre: 'Autre',
}

const DAY_FMT: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
const TIME_FMT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }

function formatEventDate(startISO: string, endISO?: string | null): string {
  const start = new Date(startISO)
  const end = endISO ? new Date(endISO) : null

  const startDay = start.toLocaleDateString('fr-FR', DAY_FMT)
  const startTime = start.toLocaleTimeString('fr-FR', TIME_FMT)

  if (!end) return `${startDay} · ${startTime}`

  if (start.toDateString() === end.toDateString()) {
    const endTime = end.toLocaleTimeString('fr-FR', TIME_FMT)
    return `${startDay} · ${startTime} – ${endTime}`
  }

  const endDay = end.toLocaleDateString('fr-FR', DAY_FMT)
  return `Du ${startDay} au ${endDay}`
}

export function EventArticle({
  title,
  startDate,
  endDate,
  location,
  category,
  organizer,
  image,
  description,
}: EventArticleProps) {
  const img = image && typeof image === 'object' ? image : null
  const org = organizer && typeof organizer === 'object' ? organizer : null
  const categoryLabel = category ? (CATEGORY_LABELS[category] ?? category) : null

  return (
    <main>
      {img?.url && (
        <div className="relative h-64 w-full overflow-hidden bg-brand">
          <Image src={img.url} alt={img.alt ?? title} fill className="object-cover" />
        </div>
      )}
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/agenda" className="text-sm text-brand-mid hover:text-teal no-underline">
          ← Retour à l'agenda
        </Link>

        {categoryLabel && (
          <div className="mt-6">
            <span className="inline-block bg-brand-pale text-brand px-3 py-1 rounded-full text-[11px] font-semibold">
              {categoryLabel}
            </span>
          </div>
        )}

        <h1 className="mt-3 text-3xl font-extrabold text-text leading-tight">{title}</h1>

        <div className="mt-6 rounded-xl border border-border bg-white px-5 py-4 flex flex-col gap-2 text-[14px] text-text">
          <div data-testid="event-date">
            <span aria-hidden="true">📅</span> {formatEventDate(startDate, endDate)}
          </div>
          {location && (
            <div data-testid="event-location">
              <span aria-hidden="true">📍</span> {location}
            </div>
          )}
          {org?.name && (
            <div data-testid="event-organizer">
              <span aria-hidden="true">👤</span> {org.name}
            </div>
          )}
        </div>

        <RichTextBlock content={description} />
      </div>
    </main>
  )
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
npm test -- --reporter=verbose src/components/events/__tests__/EventArticle.test.tsx
```

Résultat attendu : 17 tests PASS.

- [ ] **Step 5 : Commit**

```bash
git add src/components/events/EventArticle.tsx src/components/events/__tests__/EventArticle.test.tsx
git commit -m "feat: add EventArticle presentational component with tests"
```

---

## Task 2 : Route `/agenda/[slug]` et archive cliquable

**Files:**
- Create: `src/app/(frontend)/agenda/[slug]/page.tsx`
- Modify: `src/app/(frontend)/agenda/page.tsx`

- [ ] **Step 1 : Créer la route**

Créer `src/app/(frontend)/agenda/[slug]/page.tsx` :

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { EventArticle } from '@/components/events/EventArticle'

export const revalidate = 60

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const event = result.docs[0] as any
  if (!event) return {}
  return { title: event.title }
}

export default async function EventDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  const event = result.docs[0] as any
  if (!event) notFound()

  return (
    <EventArticle
      title={event.title}
      startDate={event.startDate}
      endDate={event.endDate}
      location={event.location}
      category={event.category}
      organizer={event.organizer}
      image={event.image}
      description={event.description}
    />
  )
}
```

- [ ] **Step 2 : Rendre l'archive `/agenda` cliquable**

Modifier `src/app/(frontend)/agenda/page.tsx` :

```tsx
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'

export default async function EventsArchive() {
  const payload = await getPayloadClient()
  const events = await payload.find({ collection: 'events', sort: 'startDate', limit: 50 })

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold">Agenda</h1>
      <div className="mt-8 grid gap-4">
        {events.docs.map((item: any) => (
          <Link
            key={item.id}
            href={`/agenda/${item.slug}`}
            className="block rounded-2xl bg-white p-5 shadow-sm no-underline transition-shadow hover:shadow-md"
          >
            <strong>{item.title}</strong>
            <p className="mt-2 text-slate-600">{item.location || 'Lieu à préciser'}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 3 : Lancer le serveur de dev et vérifier manuellement**

```bash
npm run dev
```

Vérifier :
1. Naviguer vers `/` (la home) — la section `Agenda` liste des événements
2. Cliquer sur un événement → la page de détail s'affiche (titre, badge catégorie si présent, bloc info date/lieu/organisateur, image si présente, description richtext si présente)
3. Naviguer vers `/agenda` — chaque événement est un lien vers `/agenda/[slug]`
4. Cliquer sur `← Retour à l'agenda` depuis une page de détail — retour à l'archive `/agenda`
5. Naviguer vers un slug inexistant (ex. `/agenda/slug-qui-nexiste-pas`) → page 404 native Next.js
6. Si un événement n'a pas d'image, le contenu commence directement (pas de bandeau vide)
7. Si un événement n'a ni catégorie ni lieu ni organisateur ni description, seuls la date et le titre s'affichent — pas de blocs vides

- [ ] **Step 4 : Lancer la suite de tests complète**

```bash
npm test
```

Résultat attendu : tous les tests passent, aucune régression.

- [ ] **Step 5 : Commit**

```bash
git add src/app/(frontend)/agenda/[slug]/page.tsx src/app/(frontend)/agenda/page.tsx
git commit -m "feat: add agenda detail page route"
```
