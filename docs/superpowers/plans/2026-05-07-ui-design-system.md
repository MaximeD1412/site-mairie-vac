# UI / Design System — Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter le design system et la homepage redesignée de La Ville-aux-Clercs selon la spec `docs/superpowers/specs/2026-05-07-ui-design-system.md`.

**Architecture:** Template fixe (Option C) — la homepage est un composant React avec structure fixe dont chaque section tire ses données depuis Payload CMS (collections + Globals). Header et Footer sont des Server Components alimentés par les Globals `MairieInfo` et la collection `Navigation`.

**Tech Stack:** Next.js 15 App Router · Payload CMS · Tailwind v4 · TypeScript · SQLite · lucide-react (icônes)

---

## Fichiers concernés

### Créés
- `src/globals/SiteSettings.ts` — Global hero image + PanneauPocket URL
- `src/globals/MairieInfo.ts` — Global adresse, téléphone, horaires
- `src/globals/HomepageSettings.ts` — Global liens rapides (6 items)
- `src/components/home/Hero.tsx` — Section hero
- `src/components/home/QuickLinksBar.tsx` — Barre de liens rapides
- `src/components/home/ActuPanneauSection.tsx` — Actualités + PanneauPocket
- `src/components/home/AgendaSection.tsx` — Liste agenda
- `src/components/home/PublicationsSection.tsx` — Grille publications

### Modifiés
- `src/app/(frontend)/globals.css` — Design tokens Tailwind v4
- `src/collections/Navigation.ts` — Ajout `kind` aux children
- `src/collections/Events.ts` — `startDate`/`endDate` avec time picker
- `src/collections/Documents.ts` — Catégories complètes
- `src/collections/Events.ts` — Champ `organizer` (relation associations)
- `src/payload.config.ts` — Enregistrement des Globals
- `src/lib/links.ts` — Mise à jour `hrefFromNavItem` pour les children
- `src/components/Header.tsx` — Redesign complet
- `src/components/Footer.tsx` — Implémentation avec données CMS
- `src/app/(frontend)/layout.tsx` — Passage MairieInfo au Footer
- `src/app/(frontend)/page.tsx` — Homepage redesignée

---

## Task 1 — Design tokens (Tailwind v4)

**Files:**
- Modify: `src/app/(frontend)/globals.css`

- [ ] **Remplacer le contenu de `globals.css`**

```css
@import 'tailwindcss';

@theme {
  --color-brand:        #1a61ab;
  --color-brand-mid:    #2a7fd4;
  --color-brand-light:  #93baf2;
  --color-brand-pale:   #eef4fd;
  --color-teal:         #0bbfa4;
  --color-teal-light:   #e6faf8;
  --color-border:       #dde4ee;
  --color-text:         #1a1a2e;
  --color-muted:        #5a6a7a;
}

html { scroll-behavior: smooth; }
body { margin: 0; background: #ffffff; color: #1a1a2e; }
a { text-decoration-thickness: .08em; text-underline-offset: .18em; }

/* RGAA : focus visible sur tous les éléments interactifs */
:focus-visible {
  outline: 3px solid #0bbfa4;
  outline-offset: 3px;
}

/* Skip link RGAA — visible uniquement au focus clavier */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: #1a61ab;
  color: #ffffff;
  padding: 8px 16px;
  font-weight: 600;
  z-index: 9999;
  text-decoration: none;
}
.skip-link:focus { top: 0; }
```

- [ ] **Vérifier que le build ne casse pas**

```bash
npm run build
```

Attendu : pas d'erreur TypeScript ni Tailwind.

- [ ] **Commit**

```bash
git add src/app/\(frontend\)/globals.css
git commit -m "feat: add design tokens for UI redesign"
```

---

## Task 2 — Corrections de schema Payload

**Files:**
- Modify: `src/collections/Navigation.ts`
- Modify: `src/collections/Events.ts`
- Modify: `src/collections/Documents.ts`

### 2a — Navigation : ajout de `kind` aux children

- [ ] **Modifier `src/collections/Navigation.ts`** — remplacer le tableau `children` fields

```typescript
// dans navItemFields, remplacer l'objet `children` par :
{
  name: 'children',
  label: 'Sous-menu',
  type: 'array',
  fields: [
    { name: 'label', label: 'Libellé', type: 'text', required: true },
    {
      name: 'kind',
      label: 'Type de lien',
      type: 'select',
      required: true,
      defaultValue: 'page',
      options: [
        { label: 'Page CMS', value: 'page' },
        { label: 'URL externe', value: 'external' },
        { label: 'Actualités', value: 'newsArchive' },
        { label: 'Agenda', value: 'eventsArchive' },
        { label: 'Documents', value: 'documentsArchive' },
        { label: 'Associations', value: 'associationsArchive' },
      ],
    },
    {
      name: 'page',
      label: 'Page',
      type: 'relationship',
      relationTo: 'pages',
      admin: { condition: (_, s) => s?.kind === 'page' },
    },
    {
      name: 'url',
      label: 'URL externe',
      type: 'text',
      admin: { condition: (_, s) => s?.kind === 'external' },
    },
  ],
}
```

### 2b — Events : date + heure + organisateur

- [ ] **Modifier `src/collections/Events.ts`** — remplacer les champs `startDate`, `endDate` et ajouter `organizer`

```typescript
// Remplacer startDate et endDate :
{
  name: 'startDate',
  label: 'Date et heure de début',
  type: 'date',
  required: true,
  admin: { date: { pickerAppearance: 'dayAndTime', timeIntervals: 15 } },
},
{
  name: 'endDate',
  label: 'Date et heure de fin',
  type: 'date',
  admin: { date: { pickerAppearance: 'dayAndTime', timeIntervals: 15 } },
},
// Ajouter après `category` :
{
  name: 'organizer',
  label: 'Organisateur (association)',
  type: 'relationship',
  relationTo: 'associations',
  admin: { description: 'Laisser vide pour un événement municipal' },
},
```

Et ajouter `'Bibliothèque'` aux options de `category` :

```typescript
{ name: 'category', label: 'Catégorie', type: 'select', options: [
  'Municipal', 'Association', 'Culture', 'Sport', 'École', 'Bibliothèque', 'Autre'
]},
```

### 2c — Documents : catégories complètes

- [ ] **Modifier `src/collections/Documents.ts`** — remplacer les options de `category`

```typescript
{ name: 'category', label: 'Catégorie', type: 'select', required: true, options: [
  { label: 'Bulletin municipal', value: 'bulletin-municipal' },
  { label: 'Ptitmag', value: 'ptitmag' },
  { label: 'BEPOS', value: 'bepos' },
  { label: 'PV du conseil municipal', value: 'pv-conseil' },
  { label: 'Actes administratifs', value: 'actes-administratifs' },
  { label: 'Compte-rendu', value: 'compte-rendu' },
  { label: 'Arrêté', value: 'arrete' },
  { label: 'Formulaire', value: 'formulaire' },
  { label: 'Autre', value: 'autre' },
]},
```

- [ ] **Générer et appliquer la migration Payload**

```bash
npm run payload migrate:create -- --name schema-fixes
npm run payload migrate
```

Attendu : migration créée dans `./migrations/`, appliquée sans erreur.

- [ ] **Commit**

```bash
git add src/collections/Navigation.ts src/collections/Events.ts src/collections/Documents.ts migrations/
git commit -m "feat: fix schema — nav children kind, events datetime, docs categories"
```

---

## Task 3 — Globals Payload

**Files:**
- Create: `src/globals/SiteSettings.ts`
- Create: `src/globals/MairieInfo.ts`
- Create: `src/globals/HomepageSettings.ts`
- Modify: `src/payload.config.ts`

- [ ] **Créer `src/globals/SiteSettings.ts`**

```typescript
import type { GlobalConfig } from 'payload'
import { isAgentOrAdmin } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Paramètres du site',
  admin: { group: 'Paramètres' },
  access: { read: () => true, update: isAgentOrAdmin },
  fields: [
    {
      name: 'heroImage',
      label: 'Photo hero (page d\'accueil)',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'heroTitle',
      label: 'Titre hero',
      type: 'text',
      defaultValue: 'La Ville-aux-Clercs',
    },
    {
      name: 'heroSubtitle',
      label: 'Sous-titre hero',
      type: 'text',
      defaultValue: 'Bienvenue sur le site officiel de la mairie',
    },
    {
      name: 'panneauPocketUrl',
      label: 'URL iframe PanneauPocket',
      type: 'text',
      admin: { description: 'URL fournie par PanneauPocket pour l\'embed iframe' },
    },
  ],
}
```

- [ ] **Créer `src/globals/MairieInfo.ts`**

```typescript
import type { GlobalConfig } from 'payload'
import { isAgentOrAdmin } from '../access'

export const MairieInfo: GlobalConfig = {
  slug: 'mairie-info',
  label: 'Informations de la mairie',
  admin: { group: 'Paramètres' },
  access: { read: () => true, update: isAgentOrAdmin },
  fields: [
    { name: 'address', label: 'Adresse', type: 'text', defaultValue: '1 Rue de la Mairie, 41160 La Ville-aux-Clercs' },
    { name: 'phone', label: 'Téléphone', type: 'text', defaultValue: '02.54.80.62.55' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'facebookUrl', label: 'URL page Facebook', type: 'text' },
    {
      name: 'openingHours',
      label: 'Horaires d\'ouverture',
      type: 'array',
      fields: [
        { name: 'days', label: 'Jours', type: 'text' },
        { name: 'hours', label: 'Horaires', type: 'text' },
      ],
    },
  ],
}
```

- [ ] **Créer `src/globals/HomepageSettings.ts`**

Les icônes utilisent les noms de composants lucide-react (installé à la Task 4). La liste des noms valides est donnée ci-dessous dans le commentaire.

```typescript
import type { GlobalConfig } from 'payload'
import { isAgentOrAdmin } from '../access'

export const HomepageSettings: GlobalConfig = {
  slug: 'homepage-settings',
  label: 'Page d\'accueil',
  admin: { group: 'Paramètres' },
  access: { read: () => true, update: isAgentOrAdmin },
  fields: [
    {
      name: 'quickLinks',
      label: 'Liens rapides (max 6)',
      type: 'array',
      maxRows: 6,
      admin: {
        description: 'Ces liens apparaissent sous la photo d\'accueil avec une icône.',
      },
      fields: [
        { name: 'label', label: 'Libellé', type: 'text', required: true },
        {
          name: 'icon',
          label: 'Icône',
          type: 'select',
          required: true,
          options: [
            { label: 'Actualités / Journal', value: 'Newspaper' },
            { label: 'Agenda / Calendrier', value: 'CalendarDays' },
            { label: 'Démarches / Document', value: 'ClipboardList' },
            { label: 'Famille / École', value: 'School' },
            { label: 'Urbanisme / Maison', value: 'Home' },
            { label: 'Contact / Téléphone', value: 'Phone' },
            { label: 'Bibliothèque / Livre', value: 'BookOpen' },
            { label: 'Associations / Groupe', value: 'Users' },
            { label: 'Documents / Fichier', value: 'FileText' },
            { label: 'Informations / Info', value: 'Info' },
          ],
        },
        { name: 'href', label: 'Lien (URL ou chemin)', type: 'text', required: true },
      ],
    },
  ],
}
```

- [ ] **Enregistrer les Globals dans `src/payload.config.ts`**

Ajouter les imports et la clé `globals` :

```typescript
import { SiteSettings } from './globals/SiteSettings'
import { MairieInfo } from './globals/MairieInfo'
import { HomepageSettings } from './globals/HomepageSettings'

// Dans buildConfig({ ... }) :
globals: [SiteSettings, MairieInfo, HomepageSettings],
```

- [ ] **Générer les types TypeScript + migration**

```bash
npm run payload migrate:create -- --name add-globals
npm run payload migrate
npm run generate:types
```

Attendu : `src/payload-types.ts` mis à jour avec `SiteSettings`, `MairieInfo`, `HomepageSettings`.

- [ ] **Commit**

```bash
git add src/globals/ src/payload.config.ts src/payload-types.ts migrations/
git commit -m "feat: add SiteSettings, MairieInfo, HomepageSettings globals"
```

---

## Task 4 — Installer lucide-react

**Files:** `package.json`

- [ ] **Installer la dépendance**

```bash
npm install lucide-react
```

- [ ] **Vérifier l'import dans un fichier temporaire** (puis supprimer)

```typescript
// vérification rapide — coller dans n'importe quel fichier .tsx puis supprimer
import { Newspaper } from 'lucide-react'
// si pas d'erreur TypeScript → OK
```

- [ ] **Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add lucide-react for icons"
```

---

## Task 5 — Header

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/lib/links.ts`

- [ ] **Mettre à jour `src/lib/links.ts`** — la fonction doit gérer les children avec `kind`

Le fichier actuel gère déjà tous les `kind` — aucun changement nécessaire. Les children auront maintenant le même format que les items parents, donc `hrefFromNavItem` fonctionne tel quel pour les deux niveaux.

- [ ] **Remplacer `src/components/Header.tsx`**

```typescript
import Link from 'next/link'
import { Search } from 'lucide-react'
import { hrefFromNavItem } from '@/lib/links'

interface NavChild {
  label: string
  kind: string
  page?: { slug: string }
  url?: string
}

interface NavItem {
  label: string
  kind: string
  page?: { slug: string }
  url?: string
  children?: NavChild[]
}

interface HeaderProps {
  navigation?: { items?: NavItem[] }
}

export function Header({ navigation }: HeaderProps) {
  const items = navigation?.items ?? []

  return (
    <>
      {/* Skip link RGAA */}
      <a className="skip-link" href="#main-content">
        Aller au contenu principal
      </a>

      <header className="sticky top-0 z-50 bg-brand shadow-md">
        <div className="mx-auto max-w-7xl px-6 h-[68px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline shrink-0">
            <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center text-brand font-bold text-lg">
              M
            </div>
            <div className="text-white leading-tight">
              <strong className="block text-[15px] font-bold">La Ville-aux-Clercs</strong>
              <span className="text-[11px] text-white/70">Site officiel de la mairie</span>
            </div>
          </Link>

          {/* Navigation principale */}
          <nav aria-label="Navigation principale" className="hidden md:flex">
            {items.map((item, i) => (
              <div key={i} className="relative group">
                <Link
                  href={hrefFromNavItem(item)}
                  className="flex items-center h-[68px] px-5 text-white/90 hover:text-white hover:bg-white/10 text-[13.5px] font-semibold uppercase tracking-[0.4px] border-b-[3px] border-transparent hover:border-brand-light transition-all no-underline"
                >
                  {item.label}
                </Link>

                {/* Dropdown enfants */}
                {item.children && item.children.length > 0 && (
                  <div className="absolute top-full left-0 min-w-[220px] bg-white shadow-lg border border-border rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {item.children.map((child, j) => (
                      <Link
                        key={j}
                        href={hrefFromNavItem(child)}
                        className="block px-5 py-3 text-[13.5px] text-text hover:bg-brand-pale hover:text-brand border-b border-border last:border-0 no-underline transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              aria-label="Rechercher sur le site"
              className="w-9 h-9 rounded-full bg-white/12 text-white flex items-center justify-center hover:bg-white/22 transition-colors"
            >
              <Search size={16} aria-hidden="true" />
            </button>
          </div>

        </div>
      </header>
    </>
  )
}
```

- [ ] **Lancer le dev server et vérifier visuellement**

```bash
npm run dev
```

Ouvrir `http://localhost:3000` — le header doit apparaître en bleu `#1a61ab` avec le logo et les items de nav.

- [ ] **Commit**

```bash
git add src/components/Header.tsx src/lib/links.ts
git commit -m "feat: redesign header with sticky nav, skip link, dropdown"
```

---

## Task 6 — Footer

**Files:**
- Modify: `src/components/Footer.tsx`
- Modify: `src/app/(frontend)/layout.tsx`

- [ ] **Remplacer `src/components/Footer.tsx`**

```typescript
import Link from 'next/link'
import type { MairieInfo, Navigation } from '@/payload-types'

interface FooterProps {
  mairieInfo?: MairieInfo | null
  footerNav?: Navigation | null
}

export function Footer({ mairieInfo, footerNav }: FooterProps) {
  const links = footerNav?.items ?? []
  const hours = mairieInfo?.openingHours ?? []

  return (
    <footer className="bg-brand text-white/85">
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-8 grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">

        {/* Colonne 1 — identité + coordonnées */}
        <div>
          <strong className="block text-white text-[17px] mb-1">🏛 La Ville-aux-Clercs</strong>
          <span className="text-white/60 text-[11px]">Site officiel · 41160</span>
          <p className="mt-4 text-[13px] leading-7">
            {mairieInfo?.address ?? '1 Rue de la Mairie, 41160 La Ville-aux-Clercs'}<br />
            {mairieInfo?.phone && <>☎ {mairieInfo.phone}<br /></>}
            {mairieInfo?.email && <>✉ {mairieInfo.email}</>}
          </p>
        </div>

        {/* Colonne 2 — liens nav footer */}
        <div>
          <h2 className="text-brand-light text-[11px] uppercase tracking-widest font-bold mb-3">
            Navigation
          </h2>
          <ul className="space-y-2 list-none p-0 m-0">
            {links.map((item: any, i: number) => (
              <li key={i}>
                <Link href={item.url ?? '#'} className="text-white/75 hover:text-white text-[13px] no-underline transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Colonne 3 — horaires */}
        <div>
          <h2 className="text-brand-light text-[11px] uppercase tracking-widest font-bold mb-3">
            Horaires mairie
          </h2>
          <ul className="space-y-2 list-none p-0 m-0">
            {hours.length > 0
              ? hours.map((h: any, i: number) => (
                  <li key={i} className="text-[13px] text-white/75">{h.days} : {h.hours}</li>
                ))
              : (
                <>
                  <li className="text-[13px] text-white/75">Lun–Ven : 9h–12h</li>
                  <li className="text-[13px] text-white/75">Mar–Jeu : 14h–17h</li>
                </>
              )}
          </ul>
        </div>

        {/* Colonne 4 — légal */}
        <div>
          <h2 className="text-brand-light text-[11px] uppercase tracking-widest font-bold mb-3">
            Informations
          </h2>
          <ul className="space-y-2 list-none p-0 m-0">
            <li><Link href="/mentions-legales" className="text-white/75 hover:text-white text-[13px] no-underline transition-colors">Mentions légales</Link></li>
            <li><Link href="/accessibilite" className="text-white/75 hover:text-white text-[13px] no-underline transition-colors">Accessibilité</Link></li>
          </ul>
        </div>

      </div>

      <div className="border-t border-white/10 mx-auto max-w-7xl px-6 py-4 flex justify-between text-[12px] text-white/50">
        <span>© {new Date().getFullYear()} Mairie de La Ville-aux-Clercs</span>
        <span>Tous droits réservés</span>
      </div>
    </footer>
  )
}
```

- [ ] **Mettre à jour `src/app/(frontend)/layout.tsx`** — passer MairieInfo et footerNav au Footer

```typescript
import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'La Ville-aux-Clercs',
  description: 'Site officiel de la commune de La Ville-aux-Clercs (41160)',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayloadClient()

  const [mainNav, footerNav, mairieInfo] = await Promise.all([
    payload.find({ collection: 'navigation', where: { location: { equals: 'main' } }, depth: 2, limit: 1 }).catch(() => null),
    payload.find({ collection: 'navigation', where: { location: { equals: 'footer' } }, depth: 1, limit: 1 }).catch(() => null),
    payload.findGlobal({ slug: 'mairie-info' }).catch(() => null),
  ])

  return (
    <html lang="fr">
      <body>
        <Header navigation={mainNav?.docs?.[0]} />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer mairieInfo={mairieInfo} footerNav={footerNav?.docs?.[0]} />
      </body>
    </html>
  )
}
```

- [ ] **Vérifier le build**

```bash
npm run build
```

Attendu : pas d'erreur TypeScript sur les types `MairieInfo` et `Navigation`.

- [ ] **Commit**

```bash
git add src/components/Footer.tsx src/app/\(frontend\)/layout.tsx
git commit -m "feat: implement footer with CMS data (MairieInfo + footerNav)"
```

---

## Task 7 — Composants homepage

**Files:**
- Create: `src/components/home/Hero.tsx`
- Create: `src/components/home/QuickLinksBar.tsx`
- Create: `src/components/home/ActuPanneauSection.tsx`
- Create: `src/components/home/AgendaSection.tsx`
- Create: `src/components/home/PublicationsSection.tsx`

### 7a — Hero

- [ ] **Créer `src/components/home/Hero.tsx`**

```typescript
import Image from 'next/image'
import type { SiteSettings } from '@/payload-types'

interface HeroProps {
  settings?: SiteSettings | null
}

export function Hero({ settings }: HeroProps) {
  const title = settings?.heroTitle ?? 'La Ville-aux-Clercs'
  const subtitle = settings?.heroSubtitle ?? 'Bienvenue sur le site officiel de la mairie'
  const image = settings?.heroImage

  return (
    <div className="relative h-[380px] bg-gradient-to-br from-[#0d2a52] via-brand to-teal overflow-hidden flex items-center justify-center">

      {/* Photo du village */}
      {image && typeof image === 'object' && image.url && (
        <Image
          src={image.url}
          alt=""
          aria-hidden="true"
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Overlay sombre pour contraste texte */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" aria-hidden="true" />

      {/* Contenu */}
      <div className="relative text-center text-white px-6">
        <div className="inline-block mb-4 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest">
          Commune de Loir-et-Cher · 41160
        </div>
        <h1 className="text-[46px] font-extrabold leading-tight mb-3 drop-shadow-md">
          {title}
        </h1>
        <p className="text-[17px] text-white/85">{subtitle}</p>
      </div>

    </div>
  )
}
```

### 7b — Barre de liens rapides

- [ ] **Créer `src/components/home/QuickLinksBar.tsx`**

```typescript
import Link from 'next/link'
import {
  Newspaper, CalendarDays, ClipboardList, School,
  Home, Phone, BookOpen, Users, FileText, Info,
} from 'lucide-react'
import type { HomepageSettings } from '@/payload-types'

const ICON_MAP: Record<string, React.FC<{ size: number; 'aria-hidden': 'true' }>> = {
  Newspaper, CalendarDays, ClipboardList, School,
  Home, Phone, BookOpen, Users, FileText, Info,
}

interface QuickLinksBarProps {
  settings?: HomepageSettings | null
}

export function QuickLinksBar({ settings }: QuickLinksBarProps) {
  const links = settings?.quickLinks ?? []
  if (links.length === 0) return null

  return (
    <div className="bg-white shadow-[0_4px_20px_rgba(26,97,171,0.12)] relative z-10">
      <div className="mx-auto max-w-7xl px-6 flex justify-center flex-wrap">
        {links.map((link: any, i: number) => {
          const Icon = ICON_MAP[link.icon]
          return (
            <Link
              key={i}
              href={link.href}
              className="flex flex-col items-center gap-2 px-7 py-5 text-text hover:text-brand hover:bg-brand-pale border-b-[3px] border-transparent hover:border-teal min-w-[110px] no-underline transition-all"
            >
              <span className="w-[46px] h-[46px] rounded-xl bg-brand-pale flex items-center justify-center text-brand">
                {Icon && <Icon size={20} aria-hidden="true" />}
              </span>
              <span className="text-[11.5px] font-semibold text-center leading-tight">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
```

### 7c — Section Actualités + PanneauPocket

- [ ] **Créer `src/components/home/ActuPanneauSection.tsx`**

```typescript
import Link from 'next/link'
import Image from 'next/image'
import type { News, Media, SiteSettings } from '@/payload-types'

interface ActuPanneauSectionProps {
  news: News[]
  settings?: SiteSettings | null
}

function NewsCard({ item, featured }: { item: News; featured?: boolean }) {
  const image = typeof item.image === 'object' ? item.image as Media : null

  return (
    <Link
      href={`/actualites/${item.slug}`}
      className={`flex no-underline rounded-xl overflow-hidden border border-border bg-white hover:-translate-y-0.5 hover:shadow-lg transition-all ${featured ? 'flex-col' : 'flex-row'}`}
      aria-label={`Lire l'actualité : ${item.title}`}
    >
      <div className={`bg-gradient-to-br from-brand-light to-brand-mid relative ${featured ? 'h-[200px]' : 'w-[130px] shrink-0'}`}>
        {image?.url && (
          <Image src={image.url} alt="" aria-hidden="true" fill className="object-cover" />
        )}
      </div>
      <div className="p-5 flex flex-col gap-2">
        <span className="inline-block bg-teal-light text-teal rounded px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide w-fit">
          {featured ? 'À la une' : 'Mairie'}
        </span>
        <strong className="text-[15px] font-bold text-text leading-snug">{item.title}</strong>
        {item.summary && <p className="text-[13px] text-muted line-clamp-2">{item.summary}</p>}
        <span className="text-[11.5px] text-muted">
          {item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
            : ''}
        </span>
      </div>
    </Link>
  )
}

export function ActuPanneauSection({ news, settings }: ActuPanneauSectionProps) {
  const [featured, ...rest] = news
  const panneauUrl = settings?.panneauPocketUrl

  return (
    <section className="py-14 px-6">
      <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-[1fr_380px]">

        {/* Colonne gauche — Actualités */}
        <div>
          <div className="flex items-baseline justify-between mb-7">
            <h2 className="text-[25px] font-extrabold text-brand">
              Actualités
              <span className="block w-10 h-1 bg-teal rounded mt-2" aria-hidden="true" />
            </h2>
            <Link href="/actualites" className="text-brand-mid text-[13px] font-semibold no-underline hover:text-teal">
              Toutes les actualités →
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {featured && <NewsCard item={featured} featured />}
            {rest.map((item) => <NewsCard key={item.id} item={item} />)}
          </div>
        </div>

        {/* Colonne droite — PanneauPocket */}
        <div>
          <div className="flex items-baseline justify-between mb-7">
            <h2 className="text-[25px] font-extrabold text-brand">
              Infos locales
              <span className="block w-10 h-1 bg-teal rounded mt-2" aria-hidden="true" />
            </h2>
          </div>
          <div className="rounded-xl overflow-hidden border border-border flex flex-col min-h-[480px]">
            <div className="bg-brand flex items-center gap-3 px-5 py-3.5 shrink-0">
              <div className="w-8 h-8 rounded-md bg-teal flex items-center justify-center text-white text-base" aria-hidden="true">📢</div>
              <div>
                <strong className="block text-white text-[14px]">PanneauPocket</strong>
                <span className="text-white/70 text-[11px]">La Ville-aux-Clercs</span>
              </div>
            </div>
            {panneauUrl ? (
              <iframe
                src={panneauUrl}
                title="Informations locales — PanneauPocket La Ville-aux-Clercs"
                className="flex-1 w-full border-0 min-h-[440px]"
                loading="lazy"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted text-[13px] p-6 text-center bg-[#f8faff]">
                URL PanneauPocket non configurée.<br />
                Renseigner dans <em>Paramètres du site</em> dans l'administration.
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
```

### 7d — Section Agenda

- [ ] **Créer `src/components/home/AgendaSection.tsx`**

```typescript
import Link from 'next/link'
import type { Event } from '@/payload-types'

interface AgendaSectionProps {
  events: Event[]
}

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export function AgendaSection({ events }: AgendaSectionProps) {
  return (
    <section className="bg-brand-pale py-14 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="text-[25px] font-extrabold text-brand">
            Agenda
            <span className="block w-10 h-1 bg-teal rounded mt-2" aria-hidden="true" />
          </h2>
          <Link href="/agenda" className="text-brand-mid text-[13px] font-semibold no-underline hover:text-teal">
            Tous les événements →
          </Link>
        </div>

        <ul className="flex flex-col gap-3 list-none p-0 m-0">
          {events.map((event) => {
            const date = event.startDate ? new Date(event.startDate) : null
            return (
              <li key={event.id}>
                <Link
                  href={`/agenda/${event.slug}`}
                  className="flex items-center gap-5 bg-white rounded-xl px-5 py-4 border-l-4 border-teal no-underline hover:shadow-md transition-shadow"
                  aria-label={`Voir l'événement : ${event.title}`}
                >
                  {date && (
                    <div className="min-w-[54px] text-center bg-brand text-white rounded-lg py-2 px-1.5 shrink-0" aria-hidden="true">
                      <div className="text-[21px] font-extrabold leading-none">{date.getDate()}</div>
                      <div className="text-[10.5px] uppercase tracking-wide opacity-85 mt-0.5">{MONTHS_FR[date.getMonth()]}</div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <strong className="block text-[14.5px] font-bold text-text truncate">{event.title}</strong>
                    {event.location && (
                      <span className="text-[12px] text-muted">📍 {event.location}</span>
                    )}
                  </div>
                  {event.category && (
                    <span className="shrink-0 bg-brand-pale text-brand px-3 py-1 rounded-full text-[11px] font-semibold">
                      {event.category}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
```

### 7e — Section Publications

- [ ] **Créer `src/components/home/PublicationsSection.tsx`**

```typescript
import Link from 'next/link'
import { FileText } from 'lucide-react'
import type { Document } from '@/payload-types'

interface PublicationsSectionProps {
  documents: Document[]
}

const CATEGORY_LABELS: Record<string, string> = {
  'bulletin-municipal': 'Bulletin municipal',
  'ptitmag': 'Ptitmag',
  'bepos': 'BEPOS',
  'pv-conseil': 'PV du conseil',
  'actes-administratifs': 'Actes admin.',
  'compte-rendu': 'Compte-rendu',
  'arrete': 'Arrêté',
  'formulaire': 'Formulaire',
  'autre': 'Autre',
}

export function PublicationsSection({ documents }: PublicationsSectionProps) {
  return (
    <section className="py-14 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="text-[25px] font-extrabold text-brand">
            Publications
            <span className="block w-10 h-1 bg-teal rounded mt-2" aria-hidden="true" />
          </h2>
          <Link href="/documents" className="text-brand-mid text-[13px] font-semibold no-underline hover:text-teal">
            Toutes les publications →
          </Link>
        </div>

        <ul className="grid grid-cols-2 md:grid-cols-4 gap-5 list-none p-0 m-0">
          {documents.map((doc) => {
            const file = typeof doc.file === 'object' ? doc.file : null
            const fileUrl = file?.url ?? '#'
            return (
              <li key={doc.id}>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col rounded-xl overflow-hidden border border-border bg-white hover:border-brand-light hover:shadow-md transition-all no-underline"
                  aria-label={`Télécharger : ${doc.title}`}
                >
                  <div className="h-[100px] bg-gradient-to-br from-[#1a3a6b] to-brand-mid flex items-center justify-center text-white" aria-hidden="true">
                    <FileText size={32} aria-hidden="true" />
                  </div>
                  <div className="p-3.5">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-teal mb-1">
                      {CATEGORY_LABELS[doc.category] ?? doc.category}
                    </div>
                    <strong className="block text-[12.5px] font-semibold text-text leading-snug">{doc.title}</strong>
                    {doc.date && (
                      <span className="block text-[11px] text-muted mt-1.5">
                        {new Date(doc.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Commit**

```bash
git add src/components/home/
git commit -m "feat: add homepage section components (Hero, QuickLinks, Actu, Agenda, Publications)"
```

---

## Task 8 — Assembler la homepage

**Files:**
- Modify: `src/app/(frontend)/page.tsx`

- [ ] **Remplacer `src/app/(frontend)/page.tsx`**

```typescript
import { getPayloadClient } from '@/lib/payload'
import { Hero } from '@/components/home/Hero'
import { QuickLinksBar } from '@/components/home/QuickLinksBar'
import { ActuPanneauSection } from '@/components/home/ActuPanneauSection'
import { AgendaSection } from '@/components/home/AgendaSection'
import { PublicationsSection } from '@/components/home/PublicationsSection'

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [newsResult, eventsResult, docsResult, siteSettings, homepageSettings] = await Promise.all([
    payload.find({
      collection: 'news',
      limit: 3,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
    }).catch(() => ({ docs: [] })),

    payload.find({
      collection: 'events',
      limit: 4,
      sort: 'startDate',
      where: { startDate: { greater_than: new Date().toISOString() } },
    }).catch(() => ({ docs: [] })),

    payload.find({
      collection: 'documents',
      limit: 4,
      sort: '-date',
    }).catch(() => ({ docs: [] })),

    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.findGlobal({ slug: 'homepage-settings' }).catch(() => null),
  ])

  return (
    <>
      <Hero settings={siteSettings} />
      <QuickLinksBar settings={homepageSettings} />
      <ActuPanneauSection news={newsResult.docs as any} settings={siteSettings} />
      <AgendaSection events={eventsResult.docs as any} />
      <PublicationsSection documents={docsResult.docs as any} />
    </>
  )
}
```

- [ ] **Lancer le dev server et vérifier visuellement**

```bash
npm run dev
```

Vérifier sur `http://localhost:3000` :
- Hero bleu avec titre
- Barre de liens rapides (vide si HomepageSettings non configuré)
- Section Actualités + PanneauPocket (iframe vide si URL non configurée — message explicatif attendu)
- Section Agenda (vide si pas d'événements en base)
- Section Publications (vide si pas de documents)
- Footer bleu avec coordonnées par défaut

- [ ] **Build final de vérification**

```bash
npm run build
```

Attendu : build réussi sans erreur TypeScript.

- [ ] **Commit**

```bash
git add src/app/\(frontend\)/page.tsx
git commit -m "feat: implement homepage with all sections wired to CMS"
```

---

## Self-review

**Couverture spec :**
- ✅ Design tokens (`@theme` Tailwind v4)
- ✅ Globals SiteSettings, MairieInfo, HomepageSettings
- ✅ Navigation CMS-driven (collection Navigation)
- ✅ Header sticky + skip link RGAA + dropdown
- ✅ Hero avec photo depuis CMS + overlay contraste
- ✅ Quick links 6 items configurables
- ✅ Actualités 2 col + PanneauPocket iframe
- ✅ Agenda avec blocs date
- ✅ Publications grille 4 colonnes
- ✅ Footer 4 colonnes + MairieInfo
- ✅ RGAA : skip link, aria-label, aria-hidden, iframe title, focus-visible

**Schema fixes (noter dans les issues) :**
- ✅ Navigation children `kind`
- ✅ Events datetime + organizer
- ✅ Documents catégories complètes

**Placeholders :** aucun — tous les steps ont du code complet.

**Types :** `MairieInfo`, `SiteSettings`, `HomepageSettings`, `Event`, `News`, `Document` tous issus de `payload-types.ts` généré à la Task 3. Les `as any` dans `page.tsx` sont temporaires — ils disparaissent quand les types générés sont stables et qu'on a ajouté les champs manquants.
