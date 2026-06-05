# Glossaire du domaine

## Rôles utilisateurs

**Admin**
Utilisateur avec accès complet à `/admin` Payload. Gère la structure du site : Pages, Navigation, EventCategories, ElectedOfficials, Associations, SiteSettings, MairieInfo, HomepageSettings, Users. Il n'y a qu'un seul admin (ou très peu).

**Agent communal**
Agent municipal désigné, non-formé techniquement. Gère uniquement le contenu éditorial (News, Events, Documents) via l'**Espace agents** — jamais via `/admin` Payload. Authentifié via le même système Payload (rôle `agent`), mais bloqué de `/admin`.

---

## Interfaces

**Espace agents**
Interface Next.js custom (routes sous `/espace-agents`) destinée aux agents communaux. Contient des formulaires simplifiés pour créer et modifier News, Events, Documents. Utilise les Server Actions Next.js avec le Local API Payload. Inclut un éditeur Tiptap avec médiathèque et insertion de documents.

**Panel admin**
L'interface `/admin` de Payload CMS, réservée à l'admin. Personnalisée avec le branding de la commune (couleurs, logo) et un dashboard d'accueil sur mesure.

---

## Collections éditoriales (Espace agents)

**News** (Actualités)
Créées et modifiées par les agents via l'Espace agents. Le champ `layout` (type `json`) stocke les blocs composables (voir **BlockEditor**).

**Events** (Agenda)
Créés et modifiés par les agents via l'Espace agents. Le champ `layout` (type `json`) stocke les blocs composables (voir **BlockEditor**).

**Documents**
Uploadés et gérés par les agents via l'Espace agents.

---

## Collections structurelles (Panel admin)

**Pages**, **Navigation**, **EventCategories**, **ElectedOfficials**, **Associations**, **SiteSettings**, **MairieInfo**, **HomepageSettings**, **Users** — accessibles uniquement via le Panel admin par l'Admin.

---

## Éditeur agent

Éditeur Tiptap intégré dans l'Espace agents. Fonctionnalités : gras, italique, titres, listes, upload image, sélecteur médiathèque Payload, insertion de documents, tableaux, alignement de texte, couleur de texte, avec les comportements d'insertion de fichiers suivants :

| Type de fichier | Comportement dans l'éditeur |
|---|---|
| PDF | Lien texte custom OU viewer PDF inline |
| Vidéo (MP4, etc.) | Lecteur vidéo HTML5 inline |
| Autres | Lien texte custom (téléchargement) |

## BlockEditor

Composant React client (`src/components/BlockEditor.tsx`) partagé entre `NewsForm` et `EventForm`. Permet aux agents de composer du contenu par blocs avec drag & drop (`@dnd-kit/core`).

**Types de blocs :**

| Type | Contenu |
|---|---|
| `richText` | Éditeur Tiptap (HTML) — gras, italique, titres, listes, liens, images inline, documents |
| `image` | Image standalone depuis la médiathèque Payload, avec légende optionnelle |
| `video` | Vidéo MP4 depuis la médiathèque Payload OU embed YouTube |
| `columns` | Conteneur de N colonnes dynamiques (2+ colonnes), chaque colonne contient des blocs feuilles uniquement (pas de `columns` imbriqué) |

**Structure JSON (`layout`) :**
```
Root: RichTextBlock | ImageBlock | VideoBlock | ColumnsBlock
ColumnsBlock.columns[]: { width: "1/3"|"1/2"|"2/3"|..., blocks: (RichTextBlock | ImageBlock | VideoBlock)[] }
```
Plusieurs `ColumnsBlock` en séquence à la racine sont possibles. Pas de `ColumnsBlock` à l'intérieur d'une colonne.

**Colonnes :**
- Nombre dynamique (ajout/suppression). Suppression d'une colonne non-vide : confirmation requise.
- Redimensionnement par poignée entre colonnes, snap à des paliers prédéfinis (25/75, 33/67, 50/50, 67/33, 75/25).
- Sur mobile : `flex-wrap`, les colonnes trop étroites passent en dessous.

**Rendu frontend :**
`RenderBlocks` (déjà utilisé pour les Pages) est étendu pour supporter `ColumnsBlock`. Les composants `RichTextBlock.tsx`, `ImageBlock.tsx` de `src/components/blocks/` sont réutilisés sans modification.
