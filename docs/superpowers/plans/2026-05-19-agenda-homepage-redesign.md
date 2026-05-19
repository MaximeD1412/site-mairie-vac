# Agenda Homepage Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre la section agenda de la page d'accueil avec un carousel d'événements (images, peek pattern, auto-advance), un mini-calendrier mensuel interactif avec indicateurs visuels, et migrer les catégories d'événements vers une collection Payload dédiée avec gestion des couleurs.

**Architecture:** Server Component (`AgendaSection`) qui fetch deux listes — 4 événements à venir pour le carousel, et jusqu'à 50 pour le calendrier — et les passe à deux Client Components indépendants : `AgendaCarousel` (slideshow vertical, 75% peek) et `MiniCalendar` (grille mensuelle, dots/bars colorés). La logique de calcul du calendrier est isolée dans `src/lib/calendar.ts` (pur, testable).

**Tech Stack:** Next.js 15 App Router, Payload CMS 3, Tailwind CSS, Vitest + Testing Library

---

## Structure des fichiers

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `src/collections/EventCategories.ts` | Créer | Collection Payload pour les catégories avec couleur |
| `src/collections/Events.ts` | Modifier | `category` select → relationship vers `event-categories` |
| `src/payload.config.ts` | Modifier | Enregistrer `EventCategories` |
| `src/payload-types.ts` | Régénérer | Types générés automatiquement |
| `src/seed.ts` | Modifier | Seed des 7 catégories + mise à jour seedEvents |
| `src/components/events/EventArticle.tsx` | Modifier | `category` prop : string → objet `{ name, color }` |
| `src/components/events/__tests__/EventArticle.test.tsx` | Modifier | Adapter les tests à la nouvelle prop category |
| `src/app/(frontend)/agenda/[slug]/page.tsx` | Modifier | Passer la catégorie résolue à EventArticle |
| `src/lib/calendar.ts` | Créer | Fonctions pures : grille, indicateurs par semaine |
| `src/lib/__tests__/calendar.test.ts` | Créer | Tests unitaires des fonctions calendrier |
| `src/components/home/AgendaCarousel.tsx` | Créer | Slideshow vertical avec peek, auto-advance |
| `src/components/home/__tests__/AgendaCarousel.test.tsx` | Créer | Tests du carousel |
| `src/components/home/MiniCalendar.tsx` | Créer | Calendrier mensuel interactif |
| `src/components/home/__tests__/MiniCalendar.test.tsx` | Créer | Tests du calendrier |
| `src/components/home/AgendaSection.tsx` | Modifier | Layout 2 colonnes, passe données aux deux îlots |
| `src/app/(frontend)/page.tsx` | Modifier | Deux requêtes events (carousel + calendrier) |

---

## Task 1 : Collection EventCategories + migration Payload

**Files:**
- Create: `src/collections/EventCategories.ts`
- Modify: `src/collections/Events.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1 : Créer `src/collections/EventCategories.ts`**

```ts
import type { CollectionConfig } from 'payload'
import { isAgentOrAdmin } from '../access'

export const EventCategories: CollectionConfig = {
  slug: 'event-categories',
  labels: { singular: 'Catégorie', plural: "Catégories d'événements" },
  admin: { useAsTitle: 'name', group: 'Contenus' },
  access: {
    read: () => true,
    create: isAgentOrAdmin,
    update: isAgentOrAdmin,
    delete: isAgentOrAdmin,
  },
  fields: [
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, unique: true },
    {
      name: 'color',
      label: 'Couleur',
      type: 'text',
      required: true,
      defaultValue: '#3B82F6',
      admin: { description: 'Couleur hexadécimale (ex: #3B82F6)' },
    },
  ],
}
```

- [ ] **Step 2 : Modifier le champ `category` dans `src/collections/Events.ts`**

Remplacer le bloc `category` (lignes 28–39) par :

```ts
{
  name: 'category',
  label: 'Catégorie',
  type: 'relationship',
  relationTo: 'event-categories',
},
```

- [ ] **Step 3 : Enregistrer `EventCategories` dans `src/payload.config.ts`**

Ajouter l'import en haut :
```ts
import { EventCategories } from './collections/EventCategories'
```

Dans le tableau `collections`, ajouter `EventCategories` avant `Events` :
```ts
collections: [
  Users,
  Media,
  Pages,
  Navigation,
  News,
  EventCategories,
  Events,
  Documents,
  Associations,
  ElectedOfficials,
],
```

- [ ] **Step 4 : Générer la migration Payload**

```bash
npm run payload migrate:create -- --name event-categories
```

Vérifier qu'un fichier de migration a bien été créé dans `src/migrations/`.

- [ ] **Step 5 : Appliquer la migration**

```bash
npm run payload migrate
```

Attendu : `[migrations] Applied X pending migration(s)`

- [ ] **Step 6 : Régénérer les types TypeScript**

```bash
npm run generate:types
```

Vérifier dans `src/payload-types.ts` que l'interface `EventCategory` est bien présente et que `Event.category` est de type `number | EventCategory | null`.

- [ ] **Step 7 : Commit**

```bash
git add src/collections/EventCategories.ts src/collections/Events.ts src/payload.config.ts src/migrations/ src/payload-types.ts
git commit -m "feat: add EventCategories collection and migrate Events.category to relationship"
```

---

## Task 2 : Mettre à jour EventArticle pour la catégorie relationnelle

**Files:**
- Modify: `src/components/events/EventArticle.tsx`
- Modify: `src/components/events/__tests__/EventArticle.test.tsx`
- Modify: `src/app/(frontend)/agenda/[slug]/page.tsx`

- [ ] **Step 1 : Écrire les tests mis à jour (ils doivent échouer)**

Remplacer le contenu de `src/components/events/__tests__/EventArticle.test.tsx` :

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

  it('renders the category badge with name from object', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" category={{ name: 'Culture', color: '#DB2777' }} />)
    expect(screen.getByText('Culture')).toBeInTheDocument()
  })

  it('applies category color to badge', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" category={{ name: 'Sport', color: '#059669' }} />)
    const badge = screen.getByText('Sport')
    expect(badge).toHaveStyle({ color: '#059669' })
  })

  it('does not render a badge when category is absent', () => {
    const { container } = render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(container.querySelector('.rounded-full')).toBeNull()
  })

  it('renders just the start time when endDate is absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
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
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" location="Salle des fêtes" />)
    expect(screen.getByText(/Salle des fêtes/)).toBeInTheDocument()
  })

  it('does not render a location row when location is absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.queryByTestId('event-location')).toBeNull()
  })

  it('renders the organizer name when provided', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" organizer={{ name: 'Association Lecture' }} />)
    expect(screen.getByText(/Association Lecture/)).toBeInTheDocument()
  })

  it('does not render organizer when absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.queryByTestId('event-organizer')).toBeNull()
  })

  it('does not render organizer when relation is a number (unresolved id)', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" organizer={42 as any} />)
    expect(screen.queryByTestId('event-organizer')).toBeNull()
  })

  it('renders the hero image when image url is provided', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" image={{ url: '/img.jpg' }} />)
    expect(screen.getByRole('img', { name: 'Titre' })).toBeInTheDocument()
  })

  it('does not render an image element when image is absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders richtext content when description is provided', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" description={{ root: { children: [] } }} />)
    expect(screen.getByTestId('rich-text')).toBeInTheDocument()
  })

  it('does not render richtext when description is absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.queryByTestId('rich-text')).toBeNull()
  })
})
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**

```bash
npm test -- EventArticle
```

Attendu : plusieurs tests en échec sur la prop `category`.

- [ ] **Step 3 : Mettre à jour `src/components/events/EventArticle.tsx`**

Remplacer entièrement le fichier :

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

interface EventCategory {
  name?: string | null
  color?: string | null
}

interface EventArticleProps {
  title: string
  startDate: string
  endDate?: string | null
  location?: string | null
  category?: EventCategory | null
  organizer?: EventOrganizer | number | null
  image?: EventImage | string | null
  description?: any
}

const DAY_FMT: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Paris' }
const TIME_FMT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }

const toParisDateStr = (d: Date) =>
  d.toLocaleString('sv-SE', { timeZone: 'Europe/Paris' }).slice(0, 10)

function formatEventDate(startISO: string, endISO?: string | null): string {
  const start = new Date(startISO)
  const end = endISO ? new Date(endISO) : null
  const startDay = start.toLocaleDateString('fr-FR', DAY_FMT)
  const startTime = start.toLocaleTimeString('fr-FR', TIME_FMT)
  if (!end) return `${startDay} · ${startTime}`
  if (toParisDateStr(start) === toParisDateStr(end)) {
    return `${startDay} · ${startTime} – ${end.toLocaleTimeString('fr-FR', TIME_FMT)}`
  }
  return `Du ${startDay} au ${end.toLocaleDateString('fr-FR', DAY_FMT)}`
}

const DEFAULT_COLOR = '#3B82F6'

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
  const img = image && typeof image === 'object' ? image as EventImage : null
  const org = organizer && typeof organizer === 'object' ? organizer as EventOrganizer : null
  const color = category?.color ?? DEFAULT_COLOR

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

        {category?.name && (
          <div className="mt-6">
            <span
              className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {category.name}
            </span>
          </div>
        )}

        <h1 className="mt-3 text-3xl font-extrabold text-text leading-tight">{title}</h1>

        <div className="mt-6 rounded-xl border border-border bg-white px-5 py-4 flex flex-col gap-2 text-[14px] text-text">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">📅</span>
            <span data-testid="event-date">{formatEventDate(startDate, endDate)}</span>
          </div>
          {location && (
            <div className="flex items-center gap-2">
              <span aria-hidden="true">📍</span>
              <span data-testid="event-location">{location}</span>
            </div>
          )}
          {org?.name && (
            <div className="flex items-center gap-2">
              <span aria-hidden="true">👤</span>
              <span data-testid="event-organizer">{org.name}</span>
            </div>
          )}
        </div>

        {description && <RichTextBlock content={description} />}
      </div>
    </main>
  )
}
```

- [ ] **Step 4 : Mettre à jour `src/app/(frontend)/agenda/[slug]/page.tsx`**

Ajouter `depth: 1` à la requête `payload.find` (les deux appels : generateMetadata et la page). Et adapter le passage de `category` :

```tsx
// Dans generateMetadata et EventDetailPage, remplacer payload.find par :
const result = await payload.find({
  collection: 'events',
  where: publishedEventWhere(slug),
  depth: 1,
  limit: 1,
})
```

Adapter le passage de `category` à `EventArticle` :

```tsx
category={
  event.category && typeof event.category === 'object'
    ? { name: (event.category as any).name, color: (event.category as any).color }
    : null
}
```

- [ ] **Step 5 : Lancer les tests**

```bash
npm test -- EventArticle
```

Attendu : tous les tests passent.

- [ ] **Step 6 : Commit**

```bash
git add src/components/events/EventArticle.tsx src/components/events/__tests__/EventArticle.test.tsx src/app/'(frontend)'/agenda/'[slug]'/page.tsx
git commit -m "feat: update EventArticle to accept resolved category object with color"
```

---

## Task 3 : Mettre à jour le seed

**Files:**
- Modify: `src/seed.ts`

- [ ] **Step 1 : Ajouter `seedEventCategories` dans `src/seed.ts`**

Ajouter la fonction avant `seedEvents`, et l'appeler dans le bloc `try` avant `seedEvents` :

```ts
async function seedEventCategories(payload: Awaited<ReturnType<typeof getPayload>>) {
  const items = [
    { name: 'Municipal',     slug: 'municipal',    color: '#1D4ED8' },
    { name: 'Association',   slug: 'association',  color: '#7C3AED' },
    { name: 'Culture',       slug: 'culture',      color: '#DB2777' },
    { name: 'Sport',         slug: 'sport',        color: '#059669' },
    { name: 'École',         slug: 'ecole',        color: '#D97706' },
    { name: 'Bibliothèque',  slug: 'bibliotheque', color: '#0891B2' },
    { name: 'Autre',         slug: 'autre',        color: '#6B7280' },
  ]
  await seedCollection(payload, 'event-categories', items, 'slug')
}
```

Dans le bloc `try` de `src/seed.ts`, ajouter l'appel avant `seedEvents` :

```ts
await seedEventCategories(payload)
await seedEvents(payload)
```

- [ ] **Step 2 : Mettre à jour `seedEvents` pour utiliser les IDs de catégories**

Remplacer la fonction `seedEvents` par :

```ts
async function seedEvents(payload: Awaited<ReturnType<typeof getPayload>>) {
  const assocResult = await payload.find({
    collection: 'associations',
    overrideAccess: true,
    limit: 10,
  })
  const assocByName: Record<string, number> = {}
  for (const a of assocResult.docs) {
    assocByName[a.name] = a.id
  }

  const catResult = await payload.find({
    collection: 'event-categories',
    overrideAccess: true,
    limit: 20,
  })
  const catBySlug: Record<string, number> = {}
  for (const c of catResult.docs) {
    catBySlug[c.slug] = c.id
  }

  const items = [
    {
      title: 'Conseil municipal de juin 2026',
      slug: 'conseil-municipal-juin-2026',
      startDate: '2026-06-10T19:00:00.000Z',
      endDate: '2026-06-10T21:00:00.000Z',
      location: 'Salle du conseil municipal — Mairie de Vacqueyras',
      category: catBySlug['municipal'],
      _status: 'published',
    },
    {
      title: 'Vide-grenier du FC Vacqueyras',
      slug: 'vide-grenier-fc-vacqueyras',
      startDate: '2026-05-31T08:00:00.000Z',
      endDate: '2026-05-31T17:00:00.000Z',
      location: 'Parking de la salle polyvalente',
      category: catBySlug['association'],
      organizer: assocByName['FC Vacqueyras'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Exposition : 100 ans de Vacqueyras',
      slug: 'exposition-patrimoine',
      startDate: '2026-06-06T10:00:00.000Z',
      endDate: '2026-06-29T18:00:00.000Z',
      location: 'Salle polyvalente de Vacqueyras',
      category: catBySlug['culture'],
      organizer: assocByName['Amis du Patrimoine'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Tournoi de foot inter-villages',
      slug: 'tournoi-foot-juillet',
      startDate: '2026-07-05T09:00:00.000Z',
      endDate: '2026-07-05T18:00:00.000Z',
      location: 'Stade municipal',
      category: catBySlug['sport'],
      organizer: assocByName['FC Vacqueyras'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Permanence du maire',
      slug: 'permanence-maire-juin',
      startDate: '2026-06-20T09:00:00.000Z',
      endDate: '2026-06-20T11:00:00.000Z',
      location: 'Mairie de Vacqueyras — bureau du maire',
      category: catBySlug['municipal'],
      _status: 'published',
    },
    {
      title: 'Atelier jardinage partagé',
      slug: 'atelier-jardinage-mai',
      startDate: '2026-05-23T10:00:00.000Z',
      endDate: '2026-05-23T12:00:00.000Z',
      location: 'Jardin partagé — chemin de la Garenne',
      category: catBySlug['autre'],
      _status: 'published',
    },
    {
      title: 'Fête de la Musique 2026',
      slug: 'fete-musique-2026',
      startDate: '2026-06-21T18:00:00.000Z',
      endDate: '2026-06-21T23:30:00.000Z',
      location: 'Place de la Mairie',
      category: catBySlug['culture'],
      _status: 'published',
    },
    {
      title: 'Marché de Noël 2026',
      slug: 'marche-noel-2026',
      startDate: '2026-12-13T10:00:00.000Z',
      endDate: '2026-12-13T19:00:00.000Z',
      location: 'Place du village',
      category: catBySlug['culture'],
      _status: 'published',
    },
  ]
  await seedCollection(payload, 'events', items, 'slug')
}
```

- [ ] **Step 3 : Commit**

```bash
git add src/seed.ts
git commit -m "feat: seed EventCategories and update seedEvents to use category IDs"
```

---

## Task 4 : Utilitaire calendrier (fonctions pures + tests)

**Files:**
- Create: `src/lib/calendar.ts`
- Create: `src/lib/__tests__/calendar.test.ts`

- [ ] **Step 1 : Écrire les tests (ils doivent échouer)**

Créer `src/lib/__tests__/calendar.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import {
  buildCalendarGrid,
  getWeekIndicators,
  toCalendarDateStr,
  type CalendarEventInput,
  type DotIndicator,
  type BarIndicator,
} from '../calendar'

// Semaine du 25 au 31 mai 2026 (Lu-Di)
const WEEK_MAY_25: Date[] = Array.from({ length: 7 }, (_, i) =>
  new Date(Date.UTC(2026, 4, 25 + i, 12, 0, 0)),
)

describe('toCalendarDateStr', () => {
  it('returns YYYY-MM-DD string for a UTC noon date', () => {
    const d = new Date(Date.UTC(2026, 4, 25, 12, 0, 0))
    expect(toCalendarDateStr(d)).toBe('2026-05-25')
  })
})

describe('buildCalendarGrid', () => {
  it('returns 6 weeks of 7 days', () => {
    const grid = buildCalendarGrid(2026, 4) // Mai 2026
    expect(grid).toHaveLength(6)
    grid.forEach(week => expect(week).toHaveLength(7))
  })

  it('starts on the Monday on or before the 1st of the month', () => {
    // 1er mai 2026 = vendredi → grille commence lundi 27 avril
    const grid = buildCalendarGrid(2026, 4)
    expect(toCalendarDateStr(grid[0][0])).toBe('2026-04-27')
  })

  it('week rows run Monday to Sunday', () => {
    const grid = buildCalendarGrid(2026, 4)
    // Lundi = getUTCDay() === 1
    expect(grid[0][0].getUTCDay()).toBe(1)
    // Dimanche = getUTCDay() === 0
    expect(grid[0][6].getUTCDay()).toBe(0)
  })

  it('covers all days of the month', () => {
    const grid = buildCalendarGrid(2026, 4)
    const allDates = grid.flat().map(toCalendarDateStr)
    for (let d = 1; d <= 31; d++) {
      expect(allDates).toContain(`2026-05-${String(d).padStart(2, '0')}`)
    }
  })
})

describe('getWeekIndicators', () => {
  it('returns a dot for a single-day event', () => {
    const events: CalendarEventInput[] = [
      { id: '1', slug: 'e1', title: 'Test', startDate: '2026-05-25T10:00:00.000Z' },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect(indicators).toHaveLength(1)
    expect(indicators[0].type).toBe('dot')
    expect((indicators[0] as DotIndicator).col).toBe(0) // Lundi = col 0
  })

  it('returns a bar for a multi-day event within the week', () => {
    const events: CalendarEventInput[] = [
      {
        id: '1',
        slug: 'e1',
        title: 'Expo',
        startDate: '2026-05-25T10:00:00.000Z',
        endDate: '2026-05-27T17:00:00.000Z',
      },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect(indicators[0].type).toBe('bar')
    expect((indicators[0] as BarIndicator).startCol).toBe(0) // Lundi
    expect((indicators[0] as BarIndicator).endCol).toBe(2) // Mercredi
  })

  it('clips a bar that starts before the week', () => {
    const events: CalendarEventInput[] = [
      {
        id: '1',
        slug: 'e1',
        title: 'Long event',
        startDate: '2026-05-20T10:00:00.000Z', // Mercredi sem. précédente
        endDate: '2026-05-26T17:00:00.000Z',   // Mardi de cette semaine
      },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect((indicators[0] as BarIndicator).startCol).toBe(0) // Clippé au Lundi
    expect((indicators[0] as BarIndicator).endCol).toBe(1)   // Mardi
  })

  it('clips a bar that ends after the week', () => {
    const events: CalendarEventInput[] = [
      {
        id: '1',
        slug: 'e1',
        title: 'Long event',
        startDate: '2026-05-28T10:00:00.000Z', // Jeudi
        endDate: '2026-06-02T17:00:00.000Z',   // Après la semaine
      },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect((indicators[0] as BarIndicator).startCol).toBe(3) // Jeudi
    expect((indicators[0] as BarIndicator).endCol).toBe(6)   // Clippé au Dimanche
  })

  it('skips events entirely outside the week', () => {
    const events: CalendarEventInput[] = [
      { id: '1', slug: 'e1', title: 'Ailleurs', startDate: '2026-06-10T10:00:00.000Z' },
    ]
    expect(getWeekIndicators(WEEK_MAY_25, events)).toHaveLength(0)
  })

  it('assigns different tracks to events on the same day', () => {
    const events: CalendarEventInput[] = [
      { id: '1', slug: 'e1', title: 'A', startDate: '2026-05-25T10:00:00.000Z' },
      { id: '2', slug: 'e2', title: 'B', startDate: '2026-05-25T14:00:00.000Z' },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect(indicators[0].track).toBe(0)
    expect(indicators[1].track).toBe(1)
  })

  it('uses category color when provided', () => {
    const events: CalendarEventInput[] = [
      {
        id: '1',
        slug: 'e1',
        title: 'Test',
        startDate: '2026-05-25T10:00:00.000Z',
        category: { color: '#DB2777' },
      },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect(indicators[0].color).toBe('#DB2777')
  })

  it('falls back to default color when category has no color', () => {
    const events: CalendarEventInput[] = [
      { id: '1', slug: 'e1', title: 'Test', startDate: '2026-05-25T10:00:00.000Z' },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect(indicators[0].color).toBe('#3B82F6')
  })
})
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**

```bash
npm test -- calendar
```

Attendu : erreur `Cannot find module '../calendar'`

- [ ] **Step 3 : Créer `src/lib/calendar.ts`**

```ts
export interface CalendarEventInput {
  id: string
  slug?: string | null
  title: string
  startDate: string
  endDate?: string | null
  category?: { color?: string | null } | null
}

export interface DotIndicator {
  type: 'dot'
  eventId: string
  slug: string | null
  title: string
  color: string
  col: number
  track: number
}

export interface BarIndicator {
  type: 'bar'
  eventId: string
  slug: string | null
  title: string
  color: string
  startCol: number
  endCol: number
  track: number
}

export type WeekIndicator = DotIndicator | BarIndicator

const DEFAULT_COLOR = '#3B82F6'

// Returns YYYY-MM-DD for a Date (using UTC date components, safe for noon-UTC dates)
export function toCalendarDateStr(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Returns YYYY-MM-DD for an ISO string interpreted in Europe/Paris timezone
function toParisDateStr(iso: string): string {
  return new Date(iso).toLocaleString('sv-SE', { timeZone: 'Europe/Paris' }).slice(0, 10)
}

// 0 = Monday, 6 = Sunday
function utcDayOfWeekMon0(d: Date): number {
  return (d.getUTCDay() + 6) % 7
}

/**
 * Builds a 6-week calendar grid (Mon–Sun) for the given year and month (0-indexed).
 * Each Date is set to noon UTC to avoid DST edge cases.
 */
export function buildCalendarGrid(year: number, month: number): Date[][] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1, 12, 0, 0))
  const startOffset = utcDayOfWeekMon0(firstOfMonth)
  const gridStart = new Date(Date.UTC(year, month, 1 - startOffset, 12, 0, 0))

  const weeks: Date[][] = []
  const cursor = new Date(gridStart)
  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor))
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

/**
 * Computes event indicators for a single week row (7 days, Mon–Sun).
 * Multi-day events are clipped to the week boundaries.
 * Overlapping indicators receive different track values (vertical stacking).
 */
export function getWeekIndicators(weekDays: Date[], events: CalendarEventInput[]): WeekIndicator[] {
  const weekStart = toCalendarDateStr(weekDays[0])
  const weekEnd = toCalendarDateStr(weekDays[6])

  const indicators: WeekIndicator[] = []
  // tracks[i] = last endCol used on track i
  const tracks: number[] = []

  for (const event of events) {
    const eventStart = toParisDateStr(event.startDate)
    const eventEnd = event.endDate ? toParisDateStr(event.endDate) : eventStart

    // Skip if no overlap with this week
    if (eventEnd < weekStart || eventStart > weekEnd) continue

    // Clip to week boundaries
    const clampedStart = eventStart < weekStart ? weekStart : eventStart
    const clampedEnd = eventEnd > weekEnd ? weekEnd : eventEnd

    // Find the grid date matching clampedStart/clampedEnd
    const startColDate = weekDays.find(d => toCalendarDateStr(d) === clampedStart)
    const endColDate = weekDays.find(d => toCalendarDateStr(d) === clampedEnd)
    if (!startColDate || !endColDate) continue

    const startCol = utcDayOfWeekMon0(startColDate)
    const endCol = utcDayOfWeekMon0(endColDate)
    const color = event.category?.color ?? DEFAULT_COLOR

    // Greedy track allocation: find first track where lastEndCol < startCol
    let track = tracks.findIndex(lastEnd => lastEnd < startCol)
    if (track === -1) {
      track = tracks.length
    }
    tracks[track] = endCol

    if (startCol === endCol) {
      indicators.push({
        type: 'dot',
        eventId: event.id,
        slug: event.slug ?? null,
        title: event.title,
        color,
        col: startCol,
        track,
      })
    } else {
      indicators.push({
        type: 'bar',
        eventId: event.id,
        slug: event.slug ?? null,
        title: event.title,
        color,
        startCol,
        endCol,
        track,
      })
    }
  }

  return indicators
}
```

- [ ] **Step 4 : Lancer les tests**

```bash
npm test -- calendar
```

Attendu : tous les tests passent.

- [ ] **Step 5 : Commit**

```bash
git add src/lib/calendar.ts src/lib/__tests__/calendar.test.ts
git commit -m "feat: add calendar utility with grid builder and week indicator calculator"
```

---

## Task 5 : Composant AgendaCarousel

**Files:**
- Create: `src/components/home/AgendaCarousel.tsx`
- Create: `src/components/home/__tests__/AgendaCarousel.test.tsx`

- [ ] **Step 1 : Écrire les tests (ils doivent échouer)**

Créer `src/components/home/__tests__/AgendaCarousel.test.tsx` :

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }))
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

import { AgendaCarousel, type CarouselEvent } from '../AgendaCarousel'

const makeEvent = (i: number, overrides: Partial<CarouselEvent> = {}): CarouselEvent => ({
  id: `${i}`,
  slug: `event-${i}`,
  title: `Événement ${i}`,
  startDate: '2026-06-10T19:00:00.000Z',
  ...overrides,
})

describe('AgendaCarousel', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders nothing when events is empty', () => {
    const { container } = render(<AgendaCarousel events={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the first event title', () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2)]} />)
    expect(screen.getByText('Événement 1')).toBeInTheDocument()
  })

  it('renders a link to the event slug', () => {
    render(<AgendaCarousel events={[makeEvent(1)]} />)
    expect(screen.getByRole('link', { name: /Événement 1/i })).toHaveAttribute('href', '/agenda/event-1')
  })

  it('advances to next event after 5 seconds', async () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2)]} />)
    await act(async () => { vi.advanceTimersByTime(5000) })
    expect(screen.getByText('Événement 2')).toBeInTheDocument()
  })

  it('wraps around from last to first', async () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2)]} />)
    await act(async () => { vi.advanceTimersByTime(10000) })
    expect(screen.getByText('Événement 1')).toBeInTheDocument()
  })

  it('navigates down on next button click', () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2), makeEvent(3)]} />)
    fireEvent.click(screen.getByRole('button', { name: /suivant/i }))
    expect(screen.getByText('Événement 2')).toBeInTheDocument()
  })

  it('navigates up on prev button click', () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2), makeEvent(3)]} />)
    fireEvent.click(screen.getByRole('button', { name: /suivant/i }))
    fireEvent.click(screen.getByRole('button', { name: /précédent/i }))
    expect(screen.getByText('Événement 1')).toBeInTheDocument()
  })

  it('renders image when event has one', () => {
    const events = [makeEvent(1, { image: { url: '/img.jpg', alt: 'Photo' } })]
    render(<AgendaCarousel events={events} />)
    expect(screen.getByRole('img', { name: 'Photo' })).toBeInTheDocument()
  })

  it('renders category badge with name and color', () => {
    const events = [makeEvent(1, { category: { name: 'Culture', color: '#DB2777' } })]
    render(<AgendaCarousel events={events} />)
    const badge = screen.getByText('Culture')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ color: '#DB2777' })
  })

  it('renders dot indicators equal to event count', () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2), makeEvent(3)]} />)
    const dots = screen.getAllByTestId('carousel-dot')
    expect(dots).toHaveLength(3)
  })

  it('does not render arrows when only one event', () => {
    render(<AgendaCarousel events={[makeEvent(1)]} />)
    expect(screen.queryByRole('button', { name: /suivant/i })).toBeNull()
  })
})
```

- [ ] **Step 2 : Vérifier l'échec**

```bash
npm test -- AgendaCarousel
```

Attendu : `Cannot find module '../AgendaCarousel'`

- [ ] **Step 3 : Créer `src/components/home/AgendaCarousel.tsx`**

```tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface CarouselCategory {
  name?: string | null
  color?: string | null
}

export interface CarouselImage {
  url?: string | null
  alt?: string | null
}

export interface CarouselEvent {
  id: string
  slug?: string | null
  title: string
  startDate: string
  endDate?: string | null
  location?: string | null
  category?: CarouselCategory | null
  image?: CarouselImage | null
}

const CONTAINER_H = 480
const SLIDE_H = Math.round(CONTAINER_H * 0.75) // 360px
const AUTO_MS = 5000
const DEFAULT_COLOR = '#3B82F6'

const DAY_FMT: Intl.DateTimeFormatOptions = {
  weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Paris',
}
const TIME_FMT: Intl.DateTimeFormatOptions = {
  hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris',
}

function toParisDateStr(d: Date): string {
  return d.toLocaleString('sv-SE', { timeZone: 'Europe/Paris' }).slice(0, 10)
}

function formatDate(startISO: string, endISO?: string | null): string {
  const start = new Date(startISO)
  const end = endISO ? new Date(endISO) : null
  const startDay = start.toLocaleDateString('fr-FR', DAY_FMT)
  const startTime = start.toLocaleTimeString('fr-FR', TIME_FMT)
  if (!end) return `${startDay} · ${startTime}`
  if (toParisDateStr(start) === toParisDateStr(end)) {
    return `${startDay} · ${startTime} – ${end.toLocaleTimeString('fr-FR', TIME_FMT)}`
  }
  return `Du ${startDay} au ${end.toLocaleDateString('fr-FR', DAY_FMT)}`
}

export function AgendaCarousel({ events }: { events: CarouselEvent[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const count = events.length

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const scheduleNext = useCallback(() => {
    clearTimer()
    timerRef.current = setTimeout(() => {
      setCurrent(prev => (prev + 1) % count)
    }, AUTO_MS)
  }, [count, clearTimer])

  useEffect(() => {
    if (!paused && count > 1) scheduleNext()
    return clearTimer
  }, [paused, current, scheduleNext, clearTimer, count])

  const navigate = (dir: 'prev' | 'next') => {
    setCurrent(prev =>
      dir === 'prev' ? (prev - 1 + count) % count : (prev + 1) % count,
    )
  }

  if (count === 0) return null

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white shadow-sm"
      style={{ height: CONTAINER_H }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides track */}
      <div
        className="transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(${-current * SLIDE_H}px)` }}
      >
        {events.map((event) => {
          const img = event.image && typeof event.image === 'object' ? event.image : null
          const color = event.category?.color ?? DEFAULT_COLOR
          return (
            <Link
              key={event.id}
              href={`/agenda/${event.slug ?? event.id}`}
              className="flex no-underline border-b border-border last:border-0"
              style={{ height: SLIDE_H }}
              aria-label={event.title}
            >
              {img?.url && (
                <div className="relative w-[40%] shrink-0 overflow-hidden">
                  <Image
                    src={img.url}
                    alt={img.alt ?? event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col justify-center gap-2 px-5 py-4 flex-1 min-w-0">
                {event.category?.name && (
                  <span
                    className="self-start px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ backgroundColor: `${color}22`, color }}
                  >
                    {event.category.name}
                  </span>
                )}
                <strong className="text-[15px] font-bold text-text leading-snug line-clamp-2">
                  {event.title}
                </strong>
                <p className="text-[12px] text-muted">
                  📅 {formatDate(event.startDate, event.endDate)}
                </p>
                {event.location && (
                  <p className="text-[12px] text-muted truncate">📍 {event.location}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Navigation arrows */}
      {count > 1 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
          <button
            onClick={() => navigate('prev')}
            aria-label="Précédent"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/90 shadow text-brand text-xs hover:bg-white transition-colors"
          >
            ▲
          </button>
          <button
            onClick={() => navigate('next')}
            aria-label="Suivant"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/90 shadow text-brand text-xs hover:bg-white transition-colors"
          >
            ▼
          </button>
        </div>
      )}

      {/* Position indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {events.map((_, i) => (
          <span
            key={i}
            data-testid="carousel-dot"
            className={`h-1.5 rounded-full transition-all ${
              i === current ? 'w-4 bg-brand' : 'w-1.5 bg-brand/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4 : Lancer les tests**

```bash
npm test -- AgendaCarousel
```

Attendu : tous les tests passent.

- [ ] **Step 5 : Commit**

```bash
git add src/components/home/AgendaCarousel.tsx src/components/home/__tests__/AgendaCarousel.test.tsx
git commit -m "feat: add AgendaCarousel with peek pattern, auto-advance, and category colors"
```

---

## Task 6 : Composant MiniCalendar

**Files:**
- Create: `src/components/home/MiniCalendar.tsx`
- Create: `src/components/home/__tests__/MiniCalendar.test.tsx`

- [ ] **Step 1 : Écrire les tests (ils doivent échouer)**

Créer `src/components/home/__tests__/MiniCalendar.test.tsx` :

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

import { MiniCalendar } from '../MiniCalendar'

const MAY_2026 = new Date(2026, 4, 1) // mai 2026

describe('MiniCalendar', () => {
  it('displays the current month name', () => {
    render(<MiniCalendar events={[]} initialDate={MAY_2026} />)
    expect(screen.getByText(/mai 2026/i)).toBeInTheDocument()
  })

  it('navigates to next month on click', () => {
    render(<MiniCalendar events={[]} initialDate={MAY_2026} />)
    fireEvent.click(screen.getByRole('button', { name: /mois suivant/i }))
    expect(screen.getByText(/juin 2026/i)).toBeInTheDocument()
  })

  it('navigates to previous month on click', () => {
    render(<MiniCalendar events={[]} initialDate={MAY_2026} />)
    fireEvent.click(screen.getByRole('button', { name: /mois précédent/i }))
    expect(screen.getByText(/avril 2026/i)).toBeInTheDocument()
  })

  it('renders day-of-week headers', () => {
    render(<MiniCalendar events={[]} initialDate={MAY_2026} />)
    expect(screen.getByText('Lu')).toBeInTheDocument()
    expect(screen.getByText('Di')).toBeInTheDocument()
  })

  it('renders day number 1 for the month', () => {
    render(<MiniCalendar events={[]} initialDate={MAY_2026} />)
    // Il y a plusieurs "1" possibles (1er du mois + 1er d'un autre mois)
    const cells = screen.getAllByText('1')
    expect(cells.length).toBeGreaterThanOrEqual(1)
  })

  it('renders a dot indicator for a single-day event in the displayed month', () => {
    const events = [{ id: '1', slug: 'e1', title: 'Test', startDate: '2026-05-15T10:00:00.000Z' }]
    render(<MiniCalendar events={events} initialDate={MAY_2026} />)
    expect(screen.getByTestId('indicator-dot-1')).toBeInTheDocument()
  })

  it('renders a bar indicator for a multi-day event', () => {
    const events = [{
      id: '1',
      slug: 'e1',
      title: 'Expo',
      startDate: '2026-05-25T10:00:00.000Z',
      endDate: '2026-05-27T17:00:00.000Z',
    }]
    render(<MiniCalendar events={events} initialDate={MAY_2026} />)
    expect(screen.getByTestId('indicator-bar-1')).toBeInTheDocument()
  })

  it('renders a link to the event on dot click', () => {
    const events = [{ id: '1', slug: 'evt-slug', title: 'Test', startDate: '2026-05-15T10:00:00.000Z' }]
    render(<MiniCalendar events={events} initialDate={MAY_2026} />)
    const dot = screen.getByTestId('indicator-dot-1')
    expect(dot.closest('a')).toHaveAttribute('href', '/agenda/evt-slug')
  })

  it('links to /agenda when multiple events share a dot day', () => {
    const events = [
      { id: '1', slug: 'e1', title: 'A', startDate: '2026-05-15T10:00:00.000Z' },
      { id: '2', slug: 'e2', title: 'B', startDate: '2026-05-15T14:00:00.000Z' },
    ]
    render(<MiniCalendar events={events} initialDate={MAY_2026} />)
    // Both dots on May 15 — the day cell link should point to /agenda
    const dot1 = screen.getByTestId('indicator-dot-1')
    expect(dot1.closest('a')).toHaveAttribute('href', '/agenda')
  })
})
```

- [ ] **Step 2 : Vérifier l'échec**

```bash
npm test -- MiniCalendar
```

Attendu : `Cannot find module '../MiniCalendar'`

- [ ] **Step 3 : Créer `src/components/home/MiniCalendar.tsx`**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  buildCalendarGrid,
  getWeekIndicators,
  toCalendarDateStr,
  type CalendarEventInput,
  type DotIndicator,
  type BarIndicator,
  type WeekIndicator,
} from '@/lib/calendar'

interface MiniCalendarProps {
  events: CalendarEventInput[]
  initialDate?: Date
}

const DAYS_FR = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]
const INDICATOR_H = 8  // px, hauteur d'un indicateur
const INDICATOR_GAP = 2 // px, espace entre indicateurs
const INDICATORS_ROW_H = 3 * (INDICATOR_H + INDICATOR_GAP) // 3 tracks max

export function MiniCalendar({ events, initialDate }: MiniCalendarProps) {
  const now = initialDate ?? new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const todayStr = toCalendarDateStr(
    new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), 12, 0, 0)),
  )

  const grid = buildCalendarGrid(year, month)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          aria-label="Mois précédent"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-pale text-brand transition-colors text-sm"
        >
          ◀
        </button>
        <span className="text-[13px] font-bold text-text capitalize">
          {MONTHS_FR[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          aria-label="Mois suivant"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-pale text-brand transition-colors text-sm"
        >
          ▶
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_FR.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {grid.map((weekDays, wi) => {
        const indicators = getWeekIndicators(weekDays, events)
        const maxTrack = indicators.reduce((m, ind) => Math.max(m, ind.track), -1)
        const indicatorRowH = maxTrack >= 0 ? (maxTrack + 1) * (INDICATOR_H + INDICATOR_GAP) : 0

        return (
          <div key={wi}>
            {/* Day number cells */}
            <div className="grid grid-cols-7">
              {weekDays.map((day) => {
                const dateStr = toCalendarDateStr(day)
                const isCurrentMonth = day.getUTCMonth() === month
                const isToday = dateStr === todayStr
                return (
                  <div
                    key={dateStr}
                    className={`text-center text-[12px] py-1 ${
                      isCurrentMonth ? 'text-text' : 'text-muted/40'
                    } ${isToday ? 'font-bold' : ''}`}
                  >
                    {isToday ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white text-[11px]">
                        {day.getUTCDate()}
                      </span>
                    ) : (
                      day.getUTCDate()
                    )}
                  </div>
                )
              })}
            </div>

            {/* Indicators layer */}
            {indicatorRowH > 0 && (
              <div className="relative" style={{ height: indicatorRowH }}>
                {(() => {
                  const colCounts: Record<number, number> = {}
                  for (const ind of indicators) {
                    if (ind.type === 'dot') colCounts[(ind as DotIndicator).col] = (colCounts[(ind as DotIndicator).col] ?? 0) + 1
                  }
                  return indicators.map((ind) => (
                    <IndicatorEl
                      key={`${ind.eventId}-${wi}`}
                      indicator={ind}
                      isMultiEvent={ind.type === 'dot' && (colCounts[(ind as DotIndicator).col] ?? 0) > 1}
                    />
                  ))
                })()}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function IndicatorEl({
  indicator,
  isMultiEvent,
}: {
  indicator: WeekIndicator
  isMultiEvent: boolean
}) {
  const top = indicator.track * (INDICATOR_H + INDICATOR_GAP)
  const colW = 100 / 7

  if (indicator.type === 'dot') {
    const dot = indicator as DotIndicator
    const href = isMultiEvent ? '/agenda' : (dot.slug ? `/agenda/${dot.slug}` : '/agenda')
    return (
      <Link href={href}>
        <span
          data-testid={`indicator-dot-${dot.eventId}`}
          title={dot.title}
          className="absolute rounded-full"
          style={{
            left: `${dot.col * colW + colW / 2 - INDICATOR_H / 2}%`,
            top,
            width: INDICATOR_H,
            height: INDICATOR_H,
            backgroundColor: dot.color,
          }}
        />
      </Link>
    )
  }

  const bar = indicator as BarIndicator
  const href = bar.slug ? `/agenda/${bar.slug}` : '/agenda'

  return (
    <Link href={href}>
      <span
        data-testid={`indicator-bar-${bar.eventId}`}
        title={bar.title}
        className="absolute rounded-full"
        style={{
          left: `${bar.startCol * colW}%`,
          top,
          width: `${(bar.endCol - bar.startCol + 1) * colW}%`,
          height: INDICATOR_H,
          backgroundColor: bar.color,
        }}
      />
    </Link>
  )
}

- [ ] **Step 4 : Lancer les tests**

```bash
npm test -- MiniCalendar
```

Attendu : tous les tests passent.

- [ ] **Step 5 : Commit**

```bash
git add src/components/home/MiniCalendar.tsx src/components/home/__tests__/MiniCalendar.test.tsx
git commit -m "feat: add MiniCalendar with month navigation and dot/bar event indicators"
```

---

## Task 7 : AgendaSection layout + requête homepage

**Files:**
- Modify: `src/components/home/AgendaSection.tsx`
- Modify: `src/app/(frontend)/page.tsx`

- [ ] **Step 1 : Mettre à jour la requête events dans `src/app/(frontend)/page.tsx`**

Remplacer la requête events unique par deux requêtes distinctes :

```ts
// Carousel : 4 événements à venir, avec image et catégorie résolues
payload.find({
  collection: 'events',
  limit: 4,
  sort: 'startDate',
  depth: 1,
  where: {
    and: [
      { _status: { equals: 'published' } },
      { startDate: { greater_than: new Date().toISOString() } },
    ],
  },
}).catch(() => ({ docs: [] })),

// Calendrier : jusqu'à 50 événements à venir (catégorie résolue, pas besoin d'image)
payload.find({
  collection: 'events',
  limit: 50,
  sort: 'startDate',
  depth: 1,
  where: {
    and: [
      { _status: { equals: 'published' } },
      { startDate: { greater_than: new Date().toISOString() } },
    ],
  },
}).catch(() => ({ docs: [] })),
```

Mettre à jour le destructuring de `Promise.all` :

```ts
const [newsResult, carouselEventsResult, calendarEventsResult, docsResult, siteSettings, homepageSettings] = await Promise.all([
  // news...
  // carousel events (limit 4, depth 1)...
  // calendar events (limit 50, depth 1)...
  // docs...
  // siteSettings...
  // homepageSettings...
])
```

Passer les deux listes à `AgendaSection` :

```tsx
<AgendaSection
  carouselEvents={carouselEventsResult.docs as any}
  calendarEvents={calendarEventsResult.docs as any}
/>
```

- [ ] **Step 2 : Réécrire `src/components/home/AgendaSection.tsx`**

```tsx
import Link from 'next/link'
import { AgendaCarousel, type CarouselEvent } from './AgendaCarousel'
import { MiniCalendar } from './MiniCalendar'
import type { CalendarEventInput } from '@/lib/calendar'

interface AgendaSectionProps {
  carouselEvents: CarouselEvent[]
  calendarEvents: CalendarEventInput[]
}

export function AgendaSection({ carouselEvents, calendarEvents }: AgendaSectionProps) {
  return (
    <section className="bg-brand-pale py-14 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="text-[25px] font-extrabold text-brand">
            Agenda
            <span className="block w-10 h-1 bg-teal rounded mt-2" aria-hidden="true" />
          </h2>
          <Link
            href="/agenda"
            className="text-brand-mid text-[13px] font-semibold no-underline hover:text-teal"
          >
            Tous les événements →
          </Link>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Carousel — 60% */}
          <div className="w-full md:w-[60%]">
            {carouselEvents.length === 0 ? (
              <p className="text-muted text-[13px]">Aucun événement à venir.</p>
            ) : (
              <AgendaCarousel events={carouselEvents} />
            )}
          </div>

          {/* Mini-calendrier — 40% */}
          <div className="w-full md:w-[40%]">
            <MiniCalendar events={calendarEvents} />
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3 : Lancer tous les tests**

```bash
npm test
```

Attendu : tous les tests passent (EventArticle, AgendaCarousel, MiniCalendar, calendar utils).

- [ ] **Step 4 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit
```

Corriger les éventuelles erreurs de types avant de committer.

- [ ] **Step 5 : Commit final**

```bash
git add src/components/home/AgendaSection.tsx src/app/'(frontend)'/page.tsx
git commit -m "feat: refactor AgendaSection with carousel and mini-calendar layout"
```
