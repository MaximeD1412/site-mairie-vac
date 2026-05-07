# 🏛️ Refonte du site d’une commune — Next.js + Payload CMS

---

# 🎯 Objectif du projet

Créer un site web moderne pour une commune avec :

* un frontend performant et responsive
* un back-office simple pour les agents municipaux
* une gestion de contenu flexible (CMS)
* une intégration PanneauPocket
* une migration partielle depuis Joomla
* un coût d’hébergement minimal (~5–15€/mois)
* une architecture évolutive (SQLite → PostgreSQL)

---

# 🧱 Stack technique

## Frontend

* Next.js (App Router)
* React + TypeScript
* Tailwind CSS ou SCSS Modules

## Backend / CMS

* Payload CMS (intégré dans Next.js)

## Base de données

* SQLite (démarrage)
* PostgreSQL (évolution)

## Stockage fichiers

* Cellar (S3 compatible)
* utilisé pour PDF, images, documents

## Hébergement

* Clever Cloud (Node.js)

---

# 🏗️ Architecture globale

```txt
Next.js + Payload (monorepo)
│
├── /app (frontend + routes)
├── /collections (Payload)
├── /blocks (blocs CMS)
├── /components (UI)
├── /lib (utils)
│
├── SQLite (runtime local)
└── Cellar (backups + fichiers)
```

---

# 🧠 Architecture SQLite sécurisée

## Problème

Le filesystem Clever Cloud est **éphémère**.

## Solution

```txt
SQLite (runtime)
+ backup automatique vers Cellar
+ restore automatique au démarrage
```

---

## 🔁 Flow complet

### 1. Démarrage app

```txt
Si data.db existe → OK
Sinon → télécharger backups/latest.db depuis Cellar
```

---

### 2. Runtime

```txt
Payload utilise SQLite normalement
```

---

### 3. Backup automatique

```txt
Toutes les 6h :
→ copier data.db
→ upload vers Cellar
→ maj latest.db
```

---

### 4. Rotation

```txt
7 backups journaliers
4 hebdomadaires
2 mensuels
```

---

## 💰 Coût

```txt
< 0.10€/mois (négligeable)
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

À implémenter dès le départ :

```txt
HTML sémantique
navigation clavier
focus visible
contraste couleurs
alt images
labels formulaires
structure titres
```

Tests :

* Lighthouse
* axe DevTools

---

# 👥 Rôles utilisateurs

```txt
Admin
Agent mairie
Lecteur (optionnel)
```

---

# 🔔 PanneauPocket

Intégration via :

* iframe ou script
* bloc CMS

Usage :

```txt
alertes / infos rapides
```

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

---

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

---

# 💰 Optimisation coût

## Version économique

```txt
Node nano
SQLite
Cellar
```

≈ 5€/mois

---

## Version évoluée

```txt
Node +
PostgreSQL
Cellar
```

≈ 10–20€/mois

---

# 🚀 Déploiement

```txt
git push → Clever Cloud
env configurées
build Next
Payload lancé automatiquement
```

---

# 📋 Roadmap

## Phase 1

* setup projet
* collections CMS

## Phase 2

* UI
* navigation
* blocs

## Phase 3

* migration contenu
* PanneauPocket

## Phase 4

* accessibilité
* optimisation
* prod

---

# 🧠 Philosophie

```txt
CMS simple
code maîtrisé
coût minimal
évolutif
```

---

# 🤖 Prompt agent IA

Créer un projet Next.js + Payload CMS avec :

* pages CMS dynamiques
* actualités
* agenda
* documents
* associations
* navigation admin
* blocs CMS
* SQLite sécurisé avec backup Cellar
* intégration PanneauPocket
* UI moderne commune
* RGAA de base

Ne pas coder un CMS custom.

---

# ✅ Résultat attendu

```txt
site moderne
CMS simple
agents autonomes
coût faible
maintenance simple
évolutif PostgreSQL
```
