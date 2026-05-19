# Block Renderer — Design Spec

**Date:** 2026-05-19
**Scope:** Implémenter le renderer de blocs CMS (`src/components/blocks/`) avec un converter Lexical custom et cinq composants de blocs indépendants.

---

## Contexte

`src/components/Blocks.tsx` est actuellement un stub : le bloc `richText` affiche du JSON brut, `collectionList` affiche un placeholder texte, et les autres blocs ne sont que partiellement fonctionnels. Les pages CMS dynamiques (`/[...slug]`) sont branchées mais ne rendent rien correctement.

---

## Structure des fichiers

```
src/components/blocks/
  RichTextBlock.tsx         ← converter Lexical → JSX
  ImageBlock.tsx            ← next/image + légende
  QuickLinksBlock.tsx       ← grille de liens
  CollectionListBlock.tsx   ← fetch + mini-liste (news ou events)
  PanneauPocketBlock.tsx    ← iframe widget PanneauPocket
```

`src/components/Blocks.tsx` devient un dispatcher minimal : reçoit un tableau de blocs, route chaque `blockType` vers le composant correspondant. Aucune logique de rendu dedans.

---

## Bloc 1 — RichTextBlock

### Approche

Converter Lexical → JSX custom (pas de `@payloadcms/richtext-lexical/react`). Fonction récursive `renderNode(node, index)` qui retourne du JSX selon le type de nœud. Server Component pur, zéro dépendance extra.

### Nodes supportés

| Node type | Rendu HTML | Notes |
|---|---|---|
| `paragraph` | `<p>` | enfants récursifs |
| `heading` (tag: h1–h6) | `<h1>`–`<h6>` | enfants récursifs |
| `text` | inline | format bitmask : 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code |
| `list` (bullet) | `<ul>` | enfants récursifs |
| `list` (number) | `<ol>` | enfants récursifs |
| `listitem` | `<li>` | enfants récursifs |
| `link` / `autolink` | `<a>` | href depuis `fields.url` ou `url`, `target` si nouvelle fenêtre |
| `quote` | `<blockquote>` | enfants récursifs |
| `horizontalrule` | `<hr>` | |
| `linebreak` | `<br>` | |
| `upload` (image) | `<Image>` next/image | alt depuis `value.alt`, width/height depuis `value` |
| `upload` (vidéo mp4/webm) | `<video controls>` | détecté via `value.mimeType` |
| `youtube` | `<iframe>` | videoID depuis le node, embed URL YouTube nocookie |

Les formats texte sont combinables (ex. bold + italic = `<strong><em>`).

Les classes Tailwind sont définies directement dans le composant — pas de plugin `@tailwindcss/typography` — pour rester cohérent avec le design system existant.

### Config Payload à modifier

Ajouter `UploadFeature` et `YouTubeFeature` dans la config Lexical des collections qui utilisent un champ rich text (`Pages`, `News`). Ces features permettent à l'éditeur d'insérer des médias et des embeds YouTube.

```ts
// Dans le champ richText de Pages.ts et News.ts
editor: lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    UploadFeature({ collections: { media: { fields: [] } } }),
    YouTubeFeature(),
  ],
})
```

Après modification des schémas : générer une migration Payload (`payload migrate:create`).

---

## Bloc 2 — ImageBlock

- Wrapper `<figure>`
- `<Image>` next/image avec `url`, `width`, `height`, `alt` depuis le champ `image` (relation Media)
- `<figcaption>` optionnel si le champ `caption` est renseigné
- Pas de lightbox pour l'instant

---

## Bloc 3 — QuickLinksBlock

- Grille responsive (1 col mobile, 3 col desktop)
- Chaque lien : carte avec `label`, `description` optionnelle, `url`
- Design aligné avec les tokens du projet (couleurs `brand`, `teal`, etc.)
- Refactoring du stub existant dans `Blocks.tsx`

---

## Bloc 4 — CollectionListBlock

- Server Component (fetch dans le composant)
- Champ `collection` dans le bloc Payload : valeur `news` ou `events`
- Champ `limit` optionnel (défaut : 3)
- Champ `title` optionnel pour le titre de section
- Rendu news : titre + date de publication + résumé
- Rendu events : titre + date de début + lieu
- Liens vers les pages de détail correspondantes (`/actualites/[slug]`, `/agenda/[slug]`)

> Note : les pages de détail (`/actualites/[slug]`, `/agenda/[slug]`) ne font pas partie de ce spec — elles seront dans un spec séparé sur les pages internes. Les liens du `CollectionListBlock` seront présents mais pointeront vers des pages 404 jusqu'à ce que les pages détail soient implémentées.

---

## Bloc 5 — PanneauPocketBlock

- Stub existant fonctionnel, à nettoyer
- `widgetUrl` depuis le champ Payload ou fallback `NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL`
- Iframe responsive `w-full min-h-[520px]`
- Message de fallback si URL manquante
- Titre de section optionnel

---

## Dispatcher (`Blocks.tsx`)

```ts
// Structure cible
switch (block.blockType) {
  case 'richText':    return <RichTextBlock {...} />
  case 'image':       return <ImageBlock {...} />
  case 'quickLinks':  return <QuickLinksBlock {...} />
  case 'collectionList': return <CollectionListBlock {...} />
  case 'panneauPocket':  return <PanneauPocketBlock {...} />
  default:            return null
}
```

---

## Ce qui est hors scope

- Pages de listing (`/actualites`, `/agenda`, `/documents`, `/associations`) — spec séparé
- Pages de détail (`/actualites/[slug]`, `/agenda/[slug]`) — spec séparé
- Nav mobile (hamburger → drawer) — spec séparé
- Embeds Vimeo — non supporté dans cette version (YouTube uniquement)
- Lightbox sur les images
- Bloc `gallery` (dans PROJECT.md mais pas encore de schéma Payload)
- Bloc `contact` / formulaire

---

## Ordre d'implémentation suggéré

1. Modifier config Lexical dans `Pages.ts` et `News.ts` + générer la migration
2. `RichTextBlock.tsx` (le plus complexe)
3. `ImageBlock.tsx`
4. `QuickLinksBlock.tsx`
5. `CollectionListBlock.tsx`
6. `PanneauPocketBlock.tsx`
7. Refactoring de `Blocks.tsx` en dispatcher pur
