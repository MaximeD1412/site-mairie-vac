# 🏛️ Refonte du site d'une commune — Next.js + Payload CMS

---

# 🎯 Objectif du projet

Créer un site web moderne pour une commune avec :

* un frontend performant et responsive
* un back-office simple pour les agents municipaux
* une gestion de contenu flexible (CMS)
* une intégration PanneauPocket
* une migration partielle depuis Joomla
* un coût d'hébergement minimal (~5–15€/mois)

---

# 🧱 Stack technique

## Frontend

* Next.js (App Router)
* React + TypeScript
* Tailwind CSS

## Backend / CMS

* Payload CMS (intégré dans Next.js)

## Base de données

* PostgreSQL

## Stockage fichiers

* OVH Object Storage (S3 compatible)
* utilisé pour médias (images, PDF) et backups

## Hébergement

* OVH Cloud VPS

## Infrastructure

* Docker Compose — Caddy + Next.js + PostgreSQL + service backup

---

# 🏗️ Architecture globale

```txt
OVH Cloud VPS
└── Docker Compose
    ├── caddy          (reverse proxy HTTPS)
    ├── app            (Next.js + Payload)
    ├── postgres       (base de données)
    └── backup         (pg_dump → OVH Object Storage toutes les 6h)
```

```txt
Next.js + Payload (monorepo)
│
├── /app (frontend + routes)
├── /collections (Payload)
├── /blocks (blocs CMS)
├── /components (UI)
├── /lib (utils)
│
└── PostgreSQL (runtime local + volume Docker)
```

---

# 💾 Backups

```txt
Service Docker dédié :
pg_dump → OVH Object Storage toutes les 6h
```

---

# 📦 Collections Payload

## Pages

```txt
title
slug
parentPage
menuLabel
showInMenu
contentBlocks
seo
status
```

---

## Actualités

```txt
title
slug
summary
content
image
publishedAt
```

---

## Événements

```txt
title
startDate
endDate
location
description
```

---

## Documents

```txt
title
file
category
date
```

---

## Associations

```txt
name
description
contact
```

---

## Élus

```txt
name
role
photo
```

---

## Navigation

Menus administrables :

```txt
label
type (page | external)
children
```

---

# 🧩 Blocs CMS

```txt
Text
Image
Gallery
Button
Documents list
News list
Events list
Map
Contact
Accordion
PanneauPocket
QuickLinks
```

---

# 🌐 Routing

```txt
/
/actualites
/actualites/[slug]
/agenda
/agenda/[slug]
/documents
/associations
/contact
/[...slug]
```

---

# 🎨 UI / Design System

## Objectif

UI moderne inspirée du site actuel mais simplifiée.

## Éléments

```txt
Header + mega menu
Hero
QuickLinks
News section
Events section
Footer
Cards
```

---

# 📱 Responsive

* mobile-first
* breakpoints Tailwind
* menu mobile
* grilles flexibles

---

# ♿ Accessibilité RGAA

Conformité partielle A + AA :

```txt
HTML sémantique
navigation clavier
focus visible
contraste couleurs
alt images
labels formulaires
structure titres
déclaration d'accessibilité sous /accessibilite
```

Tests :

* Lighthouse
* axe DevTools

---

# 👥 Rôles utilisateurs

```txt
Admin         — accès complet (tout + users + globals)
Agent mairie  — contenu éditorial (News, Events, Documents, Associations, Pages)
```

---

# 🔔 PanneauPocket

Intégration via :

* iframe ou script
* bloc CMS

---

# 🔄 Migration Joomla

## Objectif

Récupérer :

```txt
PDF
bulletins
documents
images
```

## Script de migration

### Étapes

```txt
1. crawler site Joomla
2. détecter fichiers
3. télécharger localement
4. générer JSON manifest
5. importer dans Payload
```

---

## Output

```txt
documents-manifest.json
documents.csv
```

---

## Principe

```txt
Ne pas migrer tout
→ trier
→ nettoyer
→ reconstruire
```

Note : le site Joomla disparaîtra entièrement (même domaine) — les redirections d'URLs ne sont pas possibles. Réécriture manuelle des pages dans Payload avant basculement de domaine.

---

# 💰 Coût estimé

```txt
OVH Cloud VPS       ~5–10€/mois
OVH Object Storage  ~0.01€/Go/mois (négligeable)
```

---

# 🚀 Déploiement

```txt
OVH Cloud VPS (Ubuntu)
→ docker compose up --build
→ Caddy gère le HTTPS automatiquement
```

Scripts :

```bash
./prod.sh up    # démarrer (build inclus)
./prod.sh down  # arrêter
```

---

# 📋 Roadmap

## Phase 1 ✅

* setup projet
* collections CMS

## Phase 2 ✅

* UI
* navigation (mega menu)
* blocs CMS

## Phase 3 ✅

* seed démo + seed init production
* accessibilité RGAA A + AA
* infrastructure Docker + PostgreSQL + OVH VPS
* PanneauPocket

## Phase 4 — en cours

* migration contenu Joomla
* mise en production

---

# 🧠 Philosophie

```txt
CMS simple
code maîtrisé
coût minimal
évolutif
```

---

# ✅ Résultat attendu

```txt
site moderne
CMS simple
agents autonomes
coût faible (~5–10€/mois)
maintenance simple
```
