# ADR 0003 — BlockEditor composable pour News et Events plutôt que Tiptap monolithique

**Statut** : Accepté (2026-06-05)

## Contexte

Les agents communaux éditent les actualités (News) et événements (Events) via l'Espace agents. Le champ de contenu était un éditeur Tiptap unique produisant du HTML brut. Les agents avaient besoin de composer du contenu avec une mise en page plus riche (texte + image côte à côte, vidéos standalone) — un besoin initialement décrit comme "WYSIWYG à la Joomla".

## Décision

Remplacer le champ HTML unique par un système de blocs composables dans l'Espace agents :

- `News.content` (HTML) → `News.layout` (JSON)
- `Events.description` (HTML) → `Events.layout` (JSON)
- Nouveau composant `BlockEditor` partagé entre `NewsForm` et `EventForm`
- Drag & drop via `@dnd-kit/core`
- Rendu frontend via `RenderBlocks` étendu (réutilisation des composants Pages)

## Alternatives considérées

**Colonnes dans Tiptap** (extension custom ou Tiptap Pro) : écarté — Tiptap Pro est payant, les extensions communautaires de colonnes sont peu maintenues, et stocker la mise en page dans du HTML brut rend le rendu mobile imprévisible.

**Nouvelle lib d'édition** (BlockNote, Plate.js, Yoopta) : écarté — BlockNote Pro payant pour les colonnes, Plate.js trop complexe, Yoopta trop jeune pour une mairie.

**Blocs form-based sans visuel** : écarté — les agents doivent voir une approximation du rendu pendant l'édition.

**Colonnes libres free-form** : écarté — un agent communal non-formé peut produire des mises en page illisibles. Les colonnes snappent à des paliers prédéfinis (25/75, 33/67, 50/50, 67/33, 75/25).

## Raisons du choix

- Les agents avaient besoin de la mise en page "image à gauche + texte à droite" (et l'inverse) — cas non couvrable par un éditeur de texte seul.
- Le modèle JSON `layout` aligne News et Events sur le pattern Pages (déjà en blocs), cohérence codebase.
- `RenderBlocks` est étendu plutôt que dupliqué — les renderers `RichTextBlock`, `ImageBlock` existants sont réutilisés.
- ADR 0001 est maintenu : les agents n'accèdent pas à `/admin`. Le `BlockEditor` est un composant Next.js custom dans l'Espace agents.
- L'édition de Pages avec blocs reste réservée à l'admin via le Panel admin Payload.

## Contraintes du BlockEditor

- Blocs racine : `richText`, `image`, `video`, `columns`
- `columns` : N colonnes dynamiques, redimensionnables par poignée (snap), suppression avec confirmation si non-vide
- Pas de `columns` imbriqué dans une colonne — structure à 2 niveaux max
- Plusieurs `ColumnsBlock` en séquence à la racine : autorisé
- Mobile : `flex-wrap`, colonnes trop étroites passent en dessous
