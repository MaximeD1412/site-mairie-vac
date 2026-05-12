# UI / Design System — La Ville-aux-Clercs

**Date :** 2026-05-07
**Statut :** Validé

---

## Objectif

Définir l'architecture UI, la palette de couleurs, la structure de la homepage et les composants principaux du site de la commune de La Ville-aux-Clercs. Le site remplace un Joomla existant en gardant la continuité visuelle (couleurs du logo) tout en modernisant l'expérience.

Référence principale : [stgervais41.fr](https://stgervais41.fr/)

---

## Architecture générale — Option C (template fixe + données CMS)

La homepage a une **structure fixe** codée en React, mais chaque section tire ses données depuis Payload CMS :

- Les agents contrôlent le **contenu**, pas la structure
- Personne ne peut accidentellement casser la mise en page depuis le back-office
- La navigation est entièrement administrable via la collection `Navigation`

Les pages internes (hors homepage) utilisent le système de blocs Payload existant.

---

## Design tokens

### Palette de couleurs

Dérivée des couleurs du logo et du site Joomla actuel.

```css
--blue-dark:  #1a61ab;   /* primaire — nav, headings, boutons */
--blue-mid:   #2a7fd4;   /* liens, hover */
--blue-light: #93baf2;   /* accents, footer col headers */
--blue-pale:  #eef4fd;   /* fonds de section, hover items */
--teal:       #0bbfa4;   /* accent actif — soulignements, bordures */
--teal-light: #e6faf8;   /* fond tags teal */
--text:       #1a1a2e;   /* texte principal */
--text-muted: #5a6a7a;   /* texte secondaire, dates */
--white:      #ffffff;
--border:     #dde4ee;   /* bordures légères */
```

### Typographie

- Famille : `'Segoe UI', system-ui, sans-serif` (pas de font externe — performance + RGAA)
- Titre section : 25–26px, weight 800, `var(--blue-dark)`
- Corps : 14–15px, weight 400
- Labels nav : 13.5px, weight 600, uppercase, letter-spacing 0.4px

### Espacements

Tailwind standard : sections `py-14` (56px), intérieur cards `p-5` (20px), grilles `gap-6` (24px).

---

## Structure de la homepage

```
┌─────────────────────────────────────────────────────┐
│  HEADER sticky                                       │
│  Logo · Nav (4 items) · Icônes (recherche, FB)      │
├─────────────────────────────────────────────────────┤
│  HERO (photo du village, full-width, ~380px)         │
│  Badge commune + titre + sous-titre                  │
├─────────────────────────────────────────────────────┤
│  LIENS RAPIDES (6 boutons icône, config. CMS)        │
├──────────────────────────┬──────────────────────────┤
│  ACTUALITÉS              │  INFOS LOCALES            │
│  (1 featured + 2 petites)│  (PanneauPocket iframe)  │
├─────────────────────────────────────────────────────┤
│  AGENDA (fond bleu pale)                             │
│  Liste d'événements avec blocs date                  │
├─────────────────────────────────────────────────────┤
│  PUBLICATIONS                                        │
│  Grille 4 colonnes (Bulletin, Ptitmag, BEPOS, PV)   │
├─────────────────────────────────────────────────────┤
│  FOOTER                                              │
│  4 colonnes : adresse · liens mairie · vie locale · horaires │
└─────────────────────────────────────────────────────┘
```

---

## Composants détaillés

### Header (sticky)

- `position: sticky; top: 0; z-index: 100`
- Fond `--blue-dark`, hauteur 68px
- **Logo** : icône SVG de la mairie + nom commune + "Site officiel"
- **Nav** : 4 items uppercase, soulignement `--teal` sur item actif (`aria-current="page"`), `--blue-light` au hover
- **Actions** : bouton recherche (🔍 → SVG), icône Facebook
- **Skip link** : `<a href="#main-content">Aller au contenu</a>` visible uniquement au focus clavier (RGAA)

### Hero

- Photo du village (image uploadée dans Payload Global `SiteSettings`)
- Dégradé overlay sombre pour garantir le contraste du texte
- Badge "Commune de Loir-et-Cher · 41160", titre H1, sous-titre
- Hauteur fixe ~380px desktop, réduite sur mobile

### Liens rapides

- Données : Global Payload `QuickLinks` (6 items max, configurables via back-office)
- Chaque item : icône SVG + label court
- Hover : fond `--blue-pale` + bordure basse `--teal`
- Sur mobile : défilement horizontal

### Section Actualités + PanneauPocket

Layout 2 colonnes : `grid-template-columns: 1fr 380px`

**Colonne gauche — Actualités**
- 1 carte "featured" (pleine largeur de la colonne, avec image en haut)
- 2 cartes normales (image latérale + texte)
- Données : collection `News`, triées par `publishedAt` desc, limite 3
- Tag catégorie, titre, date
- Lien "Toutes les actualités →"

**Colonne droite — PanneauPocket**
- Header de widget : fond `--blue-dark`, logo PanneauPocket + nom commune
- Corps : `<iframe>` PanneauPocket avec `title="Informations locales PanneauPocket"` (RGAA)
- Hauteur : s'étire pour correspondre à la colonne gauche (min 480px)
- Sur mobile : passe en dessous des actualités (colonne unique)

### Section Agenda

- Fond `--blue-pale` pour différencier visuellement
- Liste d'événements (max 4 à venir)
- Chaque ligne : bloc date bleu marine (jour + mois), titre, lieu, badge catégorie
- Bordure gauche `--teal` sur chaque ligne
- Données : collection `Events`, filtrées `startDate >= today`, triées par date, limite 4
- Lien "Tous les événements →"

### Section Publications

- Grille 4 colonnes desktop, 2 tablette, 1 mobile
- Chaque carte : vignette colorée + catégorie (teal) + titre + date
- Données : collection `Documents`, triées par `date` desc, limite 4 (une par catégorie principale)
- Lien "Toutes les publications →"

### Footer

- Fond `--blue-dark`
- 4 colonnes : coordonnées mairie · liens "Ma Mairie" · liens "Vie Locale" · horaires d'ouverture
- Données coordonnées : Global Payload `MairieInfo` (adresse, tel, email, horaires)
- Navigation footer : collection `Navigation` (location: `footer`)
- Barre de bas de page : copyright + liens mentions légales / accessibilité

---

## Navigation

Entièrement gérée via la collection `Navigation` (location: `main` et `footer`).

Le header frontend lit le menu `main` depuis Payload et le rend dynamiquement. Aucune structure de menu n'est hardcodée dans le code.

**Fix prévu avant implémentation** (cf. schema issues) :
- Ajouter `kind` aux items enfants de la navigation pour permettre les liens vers les archives (news, events, etc.)

---

## Globals Payload à créer

Deux Globals Payload sont nécessaires pour alimenter le template fixe de la homepage :

| Global | Champs |
|--------|--------|
| `SiteSettings` | `heroImage`, `heroTitle`, `heroSubtitle`, `siteName`, `commune` |
| `MairieInfo` | `address`, `phone`, `email`, `openingHours` (array jour/plage), `facebookUrl` |

Les liens rapides seront gérés via un Global `HomepageSettings` (champ `quickLinks` array : label + icône + url). Le `QuickLinksBlock` existant reste disponible pour les pages internes.

---

## RGAA — Points d'attention à l'implémentation

| Point | Exigence |
|-------|----------|
| Skip link | `<a href="#main-content">` visible au focus, caché sinon |
| Icônes | SVG avec `aria-hidden="true"` + label texte visible ou `aria-label` |
| Nav active | `aria-current="page"` sur l'item courant |
| iframe PanneauPocket | `title="Informations locales — PanneauPocket"` obligatoire |
| Images | `alt` descriptif sur toutes les images de contenu, `alt=""` sur les décoratives |
| Contraste | `--text-muted` (#5a6a7a sur blanc) : ratio ~4.6:1 — valide RGAA AA |
| Focus clavier | Tous les éléments interactifs doivent avoir un `focus-visible` visible |
| Titres | Hiérarchie H1 → H2 → H3 respectée (1 seul H1 par page = nom de la commune sur la homepage) |
| Liens "Lire la suite" | Doivent avoir un contexte accessible (ex: `aria-label="Lire la suite : {titre}"`) |

Tests prévus : Lighthouse, axe DevTools, navigation clavier manuelle.

---

## Ce qui est hors scope de ce design

- Pages internes (utilisent les blocs CMS existants)
- Formulaire de contact (page statique CMS)
- Migration du contenu Joomla (spec séparée)
- Corrections de schema Payload (doc séparé dans les notes de projet)
- Menu mobile (implémentation standard — hamburger → drawer)
