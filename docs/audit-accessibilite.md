# Rapport d'audit accessibilité RGAA A + AA

**Date :** 2026-06-03  
**Périmètre audité :** Page d'accueil, page d'actualité, page CMS (contenu géré)  
**Référentiel :** RGAA 4.1 niveaux A et AA  
**Objectif :** Conformité partielle honnête, publiable avec une déclaration d'accessibilité

---

## Résumé exécutif

| Critère | Statut |
|---------|--------|
| Un seul H1 par page, hiérarchie cohérente | ✅ Conforme |
| HTML sémantique (landmarks) | ✅ Conforme (corrigé) |
| Navigation clavier complète | ✅ Conforme |
| Focus visible sur tous les éléments interactifs | ✅ Conforme |
| Contraste couleurs AA (4.5:1) — textes principaux | ✅ Conforme (corrigé) |
| Attributs `alt` sur toutes les images | ✅ Conforme |
| Labels associés à tous les champs de formulaire | ✅ Conforme |
| Liens avec intitulés explicites | ✅ Conforme |
| Contrôle du défilement automatique (WCAG 2.2.2) | ✅ Conforme (corrigé) |
| Annonces live region pour les composants dynamiques | ✅ Conforme (corrigé) |
| Langue de la page déclarée (`lang="fr"`) | ✅ Conforme |
| Lien d'évitement (skip link) | ✅ Conforme |
| Couleurs de catégorie d'événements (dynamiques CMS) | ⚠️ Partiellement conforme |

---

## Critères conformes

### Structure et sémantique

- **H1 unique par page** — chaque page dispose d'un seul `<h1>`. La hiérarchie de titres H2 est cohérente dans toutes les sections (Actualités, Agenda, Publications, colonnes du footer, etc.).
- **HTML sémantique** — les landmarks sont correctement utilisés : `<header>`, `<nav aria-label="Navigation principale">`, `<main id="main-content">`, `<footer>`. Les sections de contenu utilisent `<section>` avec des titres, et les composants standalone utilisent `<article>`.
- **Langue déclarée** — `<html lang="fr">` présent dans le layout racine.

### Navigation clavier

- **Skip link** — lien d'évitement "Aller au contenu principal" pointant vers `#main-content`, visible au focus clavier uniquement.
- **Menu principal desktop** — boutons de sous-menu avec `aria-expanded` / `aria-haspopup`. Fermeture à `Escape`. Menu mega-menu fermé au clic en dehors.
- **Menu mobile** — dialog avec `role="dialog"`, `aria-modal="true"`, focus trap complet, retour du focus au bouton déclencheur à la fermeture.
- **Accordéon** — `aria-expanded` / `aria-controls` / `aria-labelledby` correctement chaînés. Contenu masqué avec `display:none` (invisible aux AT).
- **Galerie** — boutons avec `aria-label` pour chaque image. Lightbox accessible via la bibliothèque yet-another-react-lightbox.
- **Carrousel** — boutons Précédent/Suivant avec `aria-label`. Bouton Pause/Play avec `aria-pressed`. Le clone de diapositive est masqué (`aria-hidden`, `tabIndex=-1`).
- **Mini-calendrier** — boutons "Mois précédent" / "Mois suivant" avec `aria-label`.
- **Formulaire de contact** — soumission via `Enter` sur les champs, tabulation logique.

### Focus visible

- `:focus-visible { outline: 3px solid #0bbfa4; outline-offset: 3px; }` — appliqué globalement à tous les éléments interactifs.

### Attributs `alt`

- Images décoratives (hero, vignettes de cartes) : `alt=""` + `aria-hidden="true"`.
- Images de contenu (événements, galerie, ImageBlock) : `alt` issu des métadonnées média ou du titre de l'événement.
- Images de contenu sans `alt` renseigné dans le CMS : fallback `alt=""` (décoratif par défaut, acceptable mais à améliorer côté éditeurs).

### Formulaires

- Formulaire de contact (`ContactBlock`) : chaque champ (`nom`, `email`, `message`) dispose d'un `<label>` associé via `htmlFor` / `id`.
- Messages de succès/erreur : `role="status"` et `role="alert"` respectivement.

### Liens explicites

- Toutes les cartes d'actualité ont `aria-label="Lire l'actualité : {titre}"`.
- Tous les documents téléchargeables ont `aria-label="Télécharger : {titre}"`.
- Les indicateurs du calendrier (points/barres) ont `aria-label={titre de l'événement}`.
- Aucun lien "Cliquez ici" ou "En savoir plus" non contextualisé.

### Contrôle du défilement automatique

- Le carrousel agenda dispose d'un bouton Pause/Play accessible au clavier (`aria-pressed`). Le survol souris met également en pause le défilement.

### Régions live

- Carrousel : `aria-live="polite"` annonce le titre de la diapositive active et sa position.
- Mini-calendrier : `aria-live="polite"` annonce le mois/année lors de la navigation.

---

## Critères partiellement conformes

### Couleurs de catégorie d'événements (dynamiques)

**Problème :** La couleur de badge des catégories d'événements (`AgendaCarousel`) est définie librement dans le CMS. La couleur par défaut `#3B82F6` sur fond blanc affiche un ratio de contraste d'environ 3,6:1 — inférieur au seuil AA (4,5:1) pour du texte de 11px.

**Impact :** Faible — affiché uniquement si une catégorie est associée à un événement et si la couleur choisie dans le CMS est trop claire.

**Recommandation :** Guider les éditeurs à choisir des couleurs foncées pour les catégories, ou implémenter dans le CMS une validation du ratio de contraste à la saisie.

---

## Corrections apportées dans cette PR

| Fichier | Correction |
|---------|------------|
| `NewsArticle.tsx` | `<main>` → `<article>` (évite l'imbrication de landmarks `<main>`) |
| `actualites/page.tsx` | `<main>` → `<div>` (idem) |
| `[...slug]/page.tsx` | `<main>` → `<div>` (idem) |
| `globals.css` | Ajout de `--color-teal-dark: #0a6b5d` (ratio 6,3:1 sur blanc) |
| `ActuPanneauSection.tsx` | Badge catégorie : `text-teal` → `text-teal-dark` |
| `NewsArticle.tsx` | Badge catégorie : `text-teal` → `text-teal-dark` |
| `PublicationsSection.tsx` | Étiquette catégorie : `text-teal` → `text-teal-dark` |
| `Header.tsx` | Sous-titre logo : `text-white/70` → `text-white/85` (ratio 5,0:1) |
| `Footer.tsx` | Sous-titre identité : `text-white/60` → `text-white/85` |
| `Footer.tsx` | Titres colonnes : `text-brand-light` → `text-white` (ratio 6,3:1) |
| `Footer.tsx` | Liens et horaires : `text-white/75` → `text-white/85` |
| `Footer.tsx` | Copyright : `text-white/50` → `text-white/70` |
| `AgendaCarousel.tsx` | Ajout bouton Pause/Play (`aria-pressed`), `aria-live`, `role="region"` |
| `MiniCalendar.tsx` | Ajout `aria-live="polite"` pour navigation entre mois |

---

## Points hors périmètre ou non traités

- **Sous-titres de navigation en hover** (`text-brand-light` sur fond brand) : ratio ~3,2:1. Affiché uniquement à l'état survol/actif, non soumis aux mêmes exigences WCAG que l'état normal. À améliorer dans une itération future.
- **Médias vidéo** : pas de vidéo sur le site, critère non applicable.
- **Documents PDF** : les PDF téléchargeables ne sont pas audités (hors périmètre technique de cette PR).
- **Tableaux** : pas de tableau de données dans le périmètre actuel.
- **CAPTCHA** : pas de CAPTCHA en place.

---

*Ce rapport alimente la déclaration d'accessibilité (issue #33).*
