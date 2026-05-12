# Design — Intégration shadcn/ui + refonte README

Date : 2026-05-12

## Contexte

Site commune La Ville-aux-Clercs — Next.js 15 + Payload CMS + PostgreSQL. La homepage est implémentée (Header, Footer, Hero, QuickLinksBar, ActuPanneauSection, AgendaSection, PublicationsSection). Le README documente encore l'ancienne stack SQLite/Cellar/Clever Cloud.

Deux travaux à réaliser en parallèle :

1. Intégrer shadcn/ui sur toute la codebase (migration complète immédiate)
2. Réécrire le README pour refléter la stack réelle

---

## Partie 1 — Intégration shadcn/ui

### Approche retenue

Migration complète immédiate (Approche B). Le nombre de composants existants est faible (8 fichiers), le risque de régression est limité, et l'objectif est d'avoir un système cohérent partout dès maintenant. Le visuel ne change pas — on remplace les primitives maison par les primitives shadcn.

### Installation

```bash
npx shadcn@latest init
```

Le CLI détecte Tailwind v4 automatiquement. Il génère `components.json` et restructure `globals.css`. Ensuite, installation du kit de composants :

```bash
npx shadcn@latest add button badge separator card input label textarea sheet navigation-menu accordion dialog
```

### Theming — mapping des couleurs brand

shadcn/ui Tailwind v4 utilise des CSS vars sémantiques dans `:root`. On les override pour coller au brand existant.

Les tokens custom existants (`--color-brand-pale`, `--color-brand-mid`, `--color-brand-light`, `--color-teal-light`) sont **conservés** dans le bloc `@theme` — ils sont utilisés intensément dans les composants existants et n'ont pas d'équivalent sémantique direct dans shadcn. Les deux systèmes coexistent : shadcn génère `bg-primary`, `text-accent` etc. via `@theme inline` ; les tokens brand génèrent `bg-brand-pale`, `text-brand-mid` etc. via `@theme`. Seuls `--color-border`, `--color-text` et `--color-muted` deviennent redondants et peuvent être retirés progressivement.

| Token shadcn | Valeur | Rôle |
|---|---|---|
| `--primary` | `#1a61ab` | Bleu brand principal |
| `--primary-foreground` | `#ffffff` | Texte sur fond primary |
| `--accent` | `#0bbfa4` | Teal accent |
| `--accent-foreground` | `#ffffff` | Texte sur fond accent |
| `--ring` | `#0bbfa4` | Focus visible RGAA (déjà en teal) |
| `--muted-foreground` | `#5a6a7a` | Texte secondaire |
| `--border` | `#dde4ee` | Couleur de bordure |
| `--background` | `#ffffff` | Fond de page |
| `--foreground` | `#1a1a2e` | Texte principal |

Pas de dark mode.

### globals.css après migration

Structure cible :

```css
@import "tailwindcss";
@import "shadcn/tailwind.css";

@theme inline {
  /* mapping Tailwind utilities → CSS vars shadcn */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);
  /* autres tokens shadcn générés par @import "shadcn/tailwind.css" */
}

:root {
  /* overrides brand */
  --primary: #1a61ab;
  --primary-foreground: #ffffff;
  --accent: #0bbfa4;
  --accent-foreground: #ffffff;
  --ring: #0bbfa4;
  --muted-foreground: #5a6a7a;
  --border: #dde4ee;
  --background: #ffffff;
  --foreground: #1a1a2e;
  /* valeurs shadcn par défaut pour le reste */
}

/* RGAA — focus visible */
:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 3px;
}

/* Skip link RGAA — inchangé */
.skip-link { position: absolute; top: -100%; ... }
```

### components.json

Configuration pour Tailwind v4 + src dir + lucide (déjà installé) :

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "hooks": "@/hooks",
    "lib": "@/lib"
  }
}
```

### Migration des composants existants

| Fichier | Primitives shadcn utilisées | Notes |
|---|---|---|
| `Header.tsx` | `navigation-menu` + `sheet` + `button` | `sheet` résout le gap mobile nav identifié |
| `Footer.tsx` | `separator` | Entre colonnes |
| `home/Hero.tsx` | `button` | Remplacement des CTA maison |
| `home/ActuPanneauSection.tsx` | `card` + `badge` | Cartes actu + label catégorie |
| `home/AgendaSection.tsx` | `card` + `badge` | Cartes événement |
| `home/PublicationsSection.tsx` | `card` | Cartes document |
| `home/QuickLinksBar.tsx` | `button` (variant ghost ou outline) | Liens rapides |
| `Blocks.tsx` | `accordion` + `card` | Bloc Accordéon, blocs encadrés |

Règle de migration : le visuel reste identique. On remplace les `<button className="...">` maison et les `<div className="rounded border...">` par les composants shadcn, et on supprime les classes Tailwind redondantes. Les classes de layout, spacing, et couleurs spécifiques au design de la commune restent si shadcn ne les couvre pas.

### Composants shadcn à installer

```
button      → CTA, liens d'action, nav mobile triggers
badge       → catégories, statuts sur les cartes
separator   → séparateurs visuels footer / sections
card        → cartes actu, événements, documents
input       → formulaires (contact, recherche)
label       → labels de formulaires
textarea    → champ message formulaire contact
sheet       → drawer nav mobile (gap connu résolu)
navigation-menu → dropdown nav desktop header
accordion   → bloc CMS Accordéon
dialog      → modals futures
```

---

## Partie 2 — Refonte README

### Approche

Réécriture complète. Le README documente la stack telle qu'elle est aujourd'hui, pas l'état initial du starter.

### Ce qui entre

- Stack actuelle : Next.js 15 + Payload CMS + PostgreSQL 18 + OVH Object Storage + shadcn/ui + Tailwind v4
- Architecture Docker Compose : 4 services (app, postgres, caddy, backup)
- Variables d'environnement réelles (alignées sur `.env.example`)
- Stratégie backup : `pg_dump` vers OVH Object Storage (bucket séparé)
- Installation locale (dev sans Docker) + démarrage Docker (prod)
- Structure fonctionnelle des routes
- Collections Payload
- Notes RGAA

### Ce qui sort

- Toute la section SQLite sécurisé + backups Cellar
- Scripts `sqlite:backup`, `sqlite:restore`, `sqlite:restore:force`
- Références Clever Cloud / Node nano
- La contrainte "une seule instance Node"
- Les références à `DATABASE_URI=file:./payload.db`
- La doc `docs/sqlite-backup-cellar.md` dans les liens (fichier à archiver ou supprimer)

### Structure cible du README

```
# Site communal — Next.js + Payload CMS

## Stack
## Architecture Docker
## Routes
## Collections Payload
## Installation locale (dev)
## Variables d'environnement
## Déploiement Docker
## Backups PostgreSQL
## Médias — OVH Object Storage
## PanneauPocket
## Notes RGAA
## À compléter avant production
```
