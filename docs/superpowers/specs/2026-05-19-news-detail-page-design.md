# Design spec — Page de détail d'une actualité

**Date :** 2026-05-19  
**Périmètre :** `src/app/(frontend)/actualites/[slug]/page.tsx`

---

## Contexte

Le site mairie utilise Next.js 15 + Payload CMS (SQLite). Les archives `/actualites` existent et font des liens vers `/actualites/[slug]` qui renvoient 404. Cette spec couvre la création de cette route.

Les blocs sont déjà implémentés (`RichTextBlock`, `ImageBlock`, etc.) et `RenderBlocks` est câblé pour les pages CMS. Pour les articles, on réutilise directement `RichTextBlock` sur le champ `content` Lexical de la collection `News` — pas de champ `layout` ajouté.

---

## Route

**Fichier :** `src/app/(frontend)/actualites/[slug]/page.tsx`

- Server Component async
- `export const revalidate = 60`
- Fetch : `payload.find({ collection: 'news', where: { slug: { equals: slug } }, depth: 1, limit: 1 })`
- `notFound()` si aucun document retourné
- `generateMetadata` exportée :
  - `title` : `seo.title` → fallback `article.title`
  - `description` : `seo.description` → fallback `article.summary`

---

## Structure visuelle

```
┌─────────────────────────────────────────────────────┐
│  Image hero (si présente) — pleine largeur, h-64    │
│  next/image fill object-cover, aria-hidden          │
├─────────────────────────────────────────────────────┤
│  max-w-2xl mx-auto px-4 py-10                       │
│                                                     │
│  ← Retour aux actualités  (Link /actualites)        │
│                                                     │
│  [Badge "Actualité"]  12 mai 2026                   │
│  H1 — titre de l'article                            │
│  chapeau — summary (si présent)                     │
│                                                     │
│  ──────────────────────────────                     │
│                                                     │
│  <RichTextBlock content={article.content} />        │
└─────────────────────────────────────────────────────┘
```

- Image : optionnelle. Si absente, le contenu commence directement après `<main>`.
- Badge + style date : repris de `NewsCard` dans `ActuPanneauSection.tsx` pour cohérence visuelle.
- `RichTextBlock` : composant existant, aucune modification nécessaire.

---

## Composants impliqués

| Composant | Action |
|---|---|
| `src/app/(frontend)/actualites/[slug]/page.tsx` | Créer |
| `src/components/blocks/RichTextBlock.tsx` | Réutiliser tel quel |
| `src/lib/payload.ts` | Réutiliser tel quel |

---

## Ce qui est hors périmètre

- Navigation précédent/suivant entre articles
- Sidebar ou section "autres actualités"
- Amélioration de la page archive `/actualites`
- Pages de détail pour agenda, associations, documents
