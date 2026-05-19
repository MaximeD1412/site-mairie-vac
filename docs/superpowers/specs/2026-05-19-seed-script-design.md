---
title: Seed script — données fictives de développement
date: 2026-05-19
status: approved
---

# Seed script — données fictives de développement

## Objectif

Peupler la base de données PostgreSQL avec des données fictives réalistes pour permettre de tester toutes les pages du site en environnement de développement. Le script est idempotent (skip si un document existe déjà) et strictement interdit en production.

## Architecture

### Fichier

`src/seed.ts` — script autonome exécuté via la commande :

```bash
npm run seed
# qui appelle : npx payload run src/seed.ts
```

Ajout dans `package.json` :

```json
"seed": "payload run src/seed.ts"
```

### Fonctionnement

1. Guard `NODE_ENV` : le script s'arrête avec une erreur explicite si `NODE_ENV !== 'development'`
2. Initialisation de Payload via `getPayload({ config })` (API locale, accès direct à la DB)
3. Insertion des données dans l'ordre de dépendances
4. Pour chaque document : vérification d'existence via `slug` ou champ unique → skip si déjà présent
5. Remplissage des globals si non encore définis
6. Destruction propre de l'instance Payload en fin de script

### Idempotence

Chaque entrée est identifiée par son `slug` (collections avec slug) ou son `name` (associations, elected-officials). Avant chaque insertion, une requête `find({ where: { slug: { equals: ... } } })` vérifie l'existence. Si le résultat est non vide, on skip sans erreur.

Pour les globals, on lit d'abord la valeur courante et on ne `update` que si le champ clé (ex. `communeName`) est vide.

---

## Données fictives

### Ordre d'insertion

```
associations → elected-officials → news → events → documents → pages → globals
```

Media : les champs `image` / `logo` sont laissés à `null` dans toutes les entrées — pas d'upload de fichiers dans le seed.

---

### `associations` (3 entrées)

| name | category | email |
|---|---|---|
| FC Vacqueyras | Sport | fc@vacqueyras-fictif.fr |
| Amis du Patrimoine | Culture | patrimoine@vacqueyras-fictif.fr |
| Entraide Locale | Solidarité | entraide@vacqueyras-fictif.fr |

---

### `elected-officials` (5 entrées)

| name | role |
|---|---|
| Jean-Pierre Faure | Maire |
| Marie Lefebvre | 1ère adjointe — Urbanisme |
| Thomas Girard | 2ème adjoint — Finances |
| Isabelle Moreau | 3ème adjointe — Culture |
| Luc Bonnet | 4ème adjoint — Sports |

---

### `news` (8 entrées)

Statut `published`, `publishedAt` étalé sur les 6 derniers mois, 2 entrées avec `featured: true`.

| slug | title | featured |
|---|---|---|
| inauguration-salle-polyvalente | Inauguration de la nouvelle salle polyvalente | true |
| travaux-route-departementale | Travaux sur la RD7 : perturbations à prévoir | false |
| conseil-municipal-mars-2026 | Compte-rendu du conseil municipal de mars | false |
| fete-du-village-2026 | La fête du village revient le 14 juillet | true |
| nouveau-service-dechetterie | Nouvelles horaires de la déchetterie | false |
| plantation-arbres-parc | Plantation de 30 arbres dans le parc communal | false |
| resultats-elections-locales | Résultats des élections locales | false |
| budget-communal-2026 | Présentation du budget communal 2026 | false |

Chaque entrée a un `summary` d'une phrase et un `content` richText avec un seul nœud paragraphe.

---

### `events` (8 entrées)

Dates couvrant passé, présent et futur (dans les 3 mois avant/après la date de seed).

| slug | title | category | organizer |
|---|---|---|---|
| conseil-municipal-juin-2026 | Conseil municipal de juin | municipal | — |
| vide-grenier-fc-vacqueyras | Vide-grenier du FC Vacqueyras | association | FC Vacqueyras |
| exposition-patrimoine | Exposition : 100 ans de Vacqueyras | culture | Amis du Patrimoine |
| tournoi-foot-juillet | Tournoi de foot inter-villages | sport | FC Vacqueyras |
| permanence-maire | Permanence du maire | municipal | — |
| atelier-jardinage | Atelier jardinage partagé | autre | — |
| fete-musique-2026 | Fête de la Musique 2026 | culture | — |
| marche-noel-2026 | Marché de Noël | culture | — |

---

### `documents` (4 entrées)

Pas de vrai fichier attaché (champ `file` laissé à `null`).

| slug | title | category |
|---|---|---|
| cr-conseil-mars-2026 | Compte-rendu conseil municipal mars 2026 | Compte-rendu |
| arrete-circulation-rd7 | Arrêté de circulation RD7 | Arrêté |
| bulletin-municipal-2026 | Bulletin municipal 2026 | Bulletin |
| plu-reglement | Règlement du PLU | Urbanisme |

---

### `pages` (2 entrées)

Pages avec un seul bloc `richText` de contenu minimal.

| slug | title |
|---|---|
| notre-commune | Notre commune |
| contact | Contact |

---

### Globals

Remplis uniquement si le champ clé est vide/null.

**`MairieInfo`** : `communeName = "Vacqueyras"`, `address = "Place de la Mairie, 84190 Vacqueyras"`, `phone = "04 90 00 00 00"`, `email = "mairie@vacqueyras-fictif.fr"`

**`SiteSettings`** : `siteName = "Mairie de Vacqueyras"`

**`HomepageSettings`** : `heroTitle = "Bienvenue à Vacqueyras"`, `heroSubtitle = "Commune du Vaucluse"`

---

## Logs

Le script affiche une ligne par collection :

```
[seed] associations: 3 inserted, 0 skipped
[seed] elected-officials: 5 inserted, 0 skipped
[seed] news: 8 inserted, 0 skipped
...
[seed] Done.
```

En cas de re-run complet :

```
[seed] associations: 0 inserted, 3 skipped
...
```

## Contraintes

- Ne jamais uploader de vrais fichiers media — les champs `image`/`logo`/`file` restent `null`
- Le script ne modifie pas les données existantes (pas de `update` sur les collections, seulement `create`)
- Testé uniquement avec `NODE_ENV=development`
