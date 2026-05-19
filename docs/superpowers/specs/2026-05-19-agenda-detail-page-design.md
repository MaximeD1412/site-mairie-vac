# Design spec — Page de détail d'un événement

**Date :** 2026-05-19
**Périmètre :** `src/app/(frontend)/agenda/[slug]/page.tsx`

---

## Contexte

Le site mairie utilise Next.js 15 + Payload CMS (SQLite). L'archive `/agenda` existe et `AgendaSection` sur la home fait des liens vers `/agenda/[slug]` qui renvoient 404. Cette spec couvre la création de cette route.

Les blocs sont déjà implémentés (`RichTextBlock`, etc.). Pour les événements, on réutilise directement `RichTextBlock` sur le champ `description` Lexical de la collection `Events` — pas de champ `layout` ajouté.

Le pattern visuel suit la page de détail d'actualité ([2026-05-19-news-detail-page-design.md](2026-05-19-news-detail-page-design.md)) pour la cohérence.

---

## Route

**Fichier :** `src/app/(frontend)/agenda/[slug]/page.tsx`

- Server Component async
- `export const revalidate = 60`
- Fetch : `payload.find({ collection: 'events', where: { slug: { equals: slug } }, depth: 1, limit: 1 })`
  - `depth: 1` résout les relations `organizer` (association) et `image` (media)
- `notFound()` si aucun document retourné
- `generateMetadata` exportée :
  - `title` : `event.title`
  - `description` : non renseigné (la collection `Events` n'a pas de champ `summary` ni `seo`, et extraire du texte plat depuis Lexical n'est pas dans le périmètre)

---

## Structure visuelle

```
┌─────────────────────────────────────────────────────┐
│  Image hero (si présente) — pleine largeur, h-64    │
│  next/image fill object-cover, aria-hidden          │
├─────────────────────────────────────────────────────┤
│  max-w-2xl mx-auto px-4 py-10                       │
│                                                     │
│  ← Retour à l'agenda  (Link /agenda)                │
│                                                     │
│  [Badge catégorie]                                  │
│  H1 — Titre de l'événement                          │
│                                                     │
│  ┌──────────────────────────────────────────┐       │
│  │ 📅 Ven. 20 juin · 14h00 – 18h00          │       │
│  │ 📍 Salle des fêtes                       │       │
│  │ 👤 Association Nom (si présent)          │       │
│  └──────────────────────────────────────────┘       │
│                                                     │
│  <RichTextBlock content={event.description} />      │
└─────────────────────────────────────────────────────┘
```

- **Image** : optionnelle. Si absente, le contenu commence directement après `<main>`.
- **Badge catégorie** : style repris de `AgendaSection` — `bg-brand-pale text-brand px-3 py-1 rounded-full text-[11px] font-semibold`. Label humain via mapping (`municipal` → `Municipal`, etc.). Absent si pas de catégorie.
- **Bloc info** : `rounded-xl border border-border bg-white px-5 py-4`, lignes séparées par `gap-2`. Cohérent avec les cartes agenda de la home.
- **Description** : `RichTextBlock` réutilisé tel quel. Si `description` absent ou vide, la section est omise.

### Format de date

- **Jour identique** (`startDate` et `endDate` même jour, ou `endDate` absent) :
  `Ven. 20 juin · 14h00 – 18h00` (si `endDate`) ou `Ven. 20 juin · 14h00` (sinon)
- **Plage multi-jours** (`endDate` un autre jour) :
  `Du ven. 20 juin au dim. 22 juin`
- Locale `fr-FR`, format court de jour. Heures via `toLocaleTimeString` avec `{ hour: '2-digit', minute: '2-digit' }`.

### Organisateur

- Affiché uniquement si `organizer` résolu et possède un `name`.
- Texte simple, pas de lien (pas de page détail association à ce jour).

---

## Composants impliqués

| Composant | Action |
|---|---|
| `src/app/(frontend)/agenda/[slug]/page.tsx` | Créer |
| `src/components/blocks/RichTextBlock.tsx` | Réutiliser tel quel |
| `src/lib/payload.ts` | Réutiliser tel quel |

Helper de formatage de date : fonction locale dans le fichier de page (pas d'extraction prématurée — un seul appelant).

---

## Catégories — mapping label

Repris de la définition `Events.ts` :

| value | label |
|---|---|
| `municipal` | Municipal |
| `association` | Association |
| `culture` | Culture |
| `sport` | Sport |
| `ecole` | École |
| `bibliotheque` | Bibliothèque |
| `autre` | Autre |

Fallback : afficher le `value` brut si non mappé.

---

## Ce qui est hors périmètre

- Navigation précédent/suivant entre événements
- Sidebar ou section "autres événements"
- Refonte de la page archive `/agenda`
- Filtrage par catégorie sur l'archive
- Page détail association (`organizer` affiché en texte seul)
- Bouton "Ajouter à mon calendrier" (.ics)
