# Agenda Homepage Redesign

**Date:** 2026-05-19
**Branch:** feat/agenda-detail-page (ou nouvelle branche dédiée)
**Statut:** Approuvé

## Contexte

La section agenda de la page d'accueil est actuellement une simple liste de 4 événements. L'objectif est de la transformer en un bloc plus riche avec un carousel d'événements et un mini-calendrier mensuel, tout en ajoutant la gestion des couleurs par catégorie.

## Ce qui existe déjà

- Collection `Events` avec `startDate`, `endDate`, `location`, `category` (select), `image`, `description`
- `AgendaSection` : liste statique, server component
- `EventArticle` : page détail, supporte déjà `endDate` et `image`
- Le schéma a déjà `endDate` et `image` — **aucune migration pour ces champs**

## Changements de schéma

### Nouvelle collection `EventCategories`

| Champ | Type | Notes |
|-------|------|-------|
| `name` | text | Nom affiché (ex: "Municipal") |
| `slug` | text (unique) | Identifiant machine (ex: "municipal") |
| `color` | text | Couleur hex, avec color picker dans l'admin |

### Modifications collection `Events`

- Le champ `category` passe de `select` à `relationship` vers `eventCategories`
- **Migration Payload requise** (`payload migrate:create`)
- Seed de base : créer les 7 catégories existantes (municipal, association, culture, sport, ecole, bibliotheque, autre) avec des couleurs par défaut

## Architecture — Option A : deux îlots clients indépendants

```
page.tsx (Server Component)
  └── AgendaSection (Server Component)
        ├── AgendaCarousel (Client Component)  ← slideshow
        └── MiniCalendar (Client Component)    ← calendrier
```

Le Server Component récupère les événements et les passe en props aux deux îlots. Les îlots ne partagent pas d'état entre eux.

## Requête homepage

```ts
payload.find({
  collection: 'events',
  limit: 4,
  sort: 'startDate',
  depth: 2, // résout image + category (avec sa couleur)
  where: {
    and: [
      { _status: { equals: 'published' } },
      { startDate: { greater_than: new Date().toISOString() } },
    ],
  },
})
```

## Composant `AgendaSection` (Server Component)

Layout deux colonnes : carousel à gauche (~60%), mini-calendrier à droite (~40%).
Sur mobile (`< md`) : empilés verticalement, calendrier en dessous.

## Composant `AgendaCarousel` (Client Component)

### Structure visuelle

- Conteneur à hauteur fixe (ex: `h-[480px]`), `overflow: hidden`
- Chaque slide occupe **75% de la hauteur** du conteneur
- Le bord supérieur du slide suivant est visible (~25% restants) — pattern "peek"
- Flèches ▲ ▼ positionnées sur le bord droit du bloc

### Layout d'un slide

**Avec image :**
```
┌─────────────────────────────────────────┐
│  [Image 40%]  │  Titre                  │
│               │  📅 Dates               │
│               │  📍 Lieu                │
│               │  [Badge catégorie]      │
└─────────────────────────────────────────┘
```

**Sans image :**
```
┌─────────────────────────────────────────┐
│  Titre                                  │
│  📅 Dates                               │
│  📍 Lieu                                │
│  [Badge catégorie]                      │
└─────────────────────────────────────────┘
```

Le badge catégorie utilise la couleur définie dans `EventCategories`.

### Comportement

- **Auto-advance** : toutes les 5 secondes
- **Pause** : au hover du bloc entier
- **Reset du timer** : à chaque navigation manuelle (flèche)
- **Transition** : glissement vertical fluide (`transform translateY + transition`)
- **Indicateurs** : petits points ou tirets en bas du bloc indiquant la position courante
- Le slide est un lien cliquable vers `/agenda/[slug]`

## Composant `MiniCalendar` (Client Component)

### En-tête

```
◀  Mai 2026  ▶
Lu Ma Me Je Ve Sa Di
```

Navigation mois par mois. Mois initial : mois en cours.

### Grille des jours

- 7 colonnes × 5-6 lignes selon le mois
- Les jours hors du mois affiché sont grisés/transparents
- Le jour actuel est mis en évidence (contour ou fond léger)

### Représentation visuelle des événements

**Événement sur un seul jour** : petit cercle coloré sous le numéro du jour, dans la couleur de la catégorie.

**Événement multi-jours** : barre arrondie (pill) qui s'étale horizontalement sur la plage de jours, dans la couleur de la catégorie.

**Plusieurs événements** : les indicateurs s'empilent verticalement sous le numéro du jour.

**Changement de semaine** : une barre multi-jours qui franchit une fin de ligne est coupée en deux barres (fin de ligne semaine N, début de ligne semaine N+1) — comportement standard.

### Implémentation des barres multi-jours

Chaque ligne de semaine dispose d'une couche d'événements positionnée en `absolute` sous les chiffres. La position (`left`) et la largeur (`width`) sont calculées en pourcentage selon la position du jour de début et de fin dans la semaine (0–6).

### Interactions

| Situation | Hover | Clic |
|-----------|-------|------|
| 1 événement | Tooltip : titre de l'événement | Lien → `/agenda/[slug]` |
| N événements | Tooltip : liste des titres | Lien → `/agenda` |
| Aucun événement | — | — |

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/collections/EventCategories.ts` | Créer |
| `src/collections/Events.ts` | Modifier (`category` → relationship) |
| `src/payload.config.ts` | Ajouter `EventCategories` |
| Migration Payload | Générer avec `migrate:create` |
| `src/seed/eventCategories.ts` | Créer (seed 7 catégories) |
| `src/components/home/AgendaSection.tsx` | Modifier (layout 2 colonnes) |
| `src/components/home/AgendaCarousel.tsx` | Créer |
| `src/components/home/MiniCalendar.tsx` | Créer |
| `src/app/(frontend)/page.tsx` | Modifier (requête events) |

## Hors scope

- Synchronisation entre carousel et calendrier (intentionnellement découplés)
- Filtrage des événements par catégorie sur la homepage
- Page agenda liste (`/agenda`) — non modifiée dans cette itération
