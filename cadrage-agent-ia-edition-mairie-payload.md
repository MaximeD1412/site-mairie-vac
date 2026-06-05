# Cadrage pour agent IA — Édition de contenu mairie avec Payload + Next.js

## 1. Contexte

Le projet concerne un site de mairie développé avec **Next.js** et utilisant déjà **Payload CMS** comme système de gestion de contenu.

L'objectif est de permettre à un agent de mairie, ou à un agent IA assistant l'équipe municipale, de modifier le contenu du site de manière fiable, sans casser le design, la structure, l'accessibilité ou la cohérence éditoriale du site.

La question initiale portait sur l'usage possible d'un éditeur WYSIWYG pour permettre à un agent de modifier du contenu, voire une page entière, avec rendu en temps réel.

La recommandation finale n'est pas d'utiliser un WYSIWYG libre, mais plutôt une approche **Payload-native** basée sur :

- des pages composées de blocs éditoriaux ;
- un éditeur de texte riche encadré ;
- un système de brouillons ;
- une prévisualisation live ;
- des permissions par rôle ;
- un rendu côté Next.js via des composants React contrôlés.

---

## 2. Principe général recommandé

Ne pas permettre à l'utilisateur d'éditer directement du HTML libre ou de manipuler entièrement le layout comme dans un constructeur visuel très permissif.

À la place, utiliser un système de **page builder contrôlé par blocs**.

Une page est structurée comme une liste ordonnée de blocs :

```txt
Page
  title
  slug
  seo
  status: draft | published
  layout: [
    HeroBlock,
    RichTextBlock,
    ImageTextBlock,
    CardGridBlock,
    AlertBlock,
    FAQBlock,
    DocumentsListBlock,
    NewsListBlock,
    EventsListBlock,
    ContactBlock
  ]
```

L'agent peut :

- ajouter un bloc ;
- supprimer un bloc ;
- modifier le contenu d'un bloc ;
- changer l'ordre des blocs ;
- choisir certaines variantes prédéfinies ;
- prévisualiser le résultat avant publication.

L'agent ne doit pas pouvoir :

- écrire du CSS libre ;
- injecter du HTML non contrôlé ;
- choisir n'importe quelle couleur ;
- modifier les marges au pixel près ;
- créer des layouts arbitraires ;
- casser la hiérarchie des titres ;
- contourner la charte graphique.

Le but est d'offrir une liberté éditoriale, pas une liberté graphique totale.

---

## 3. Pourquoi éviter un WYSIWYG libre

Un WYSIWYG libre peut sembler séduisant parce qu'il donne l'impression que l'utilisateur peut modifier la page “comme dans Word”.

Mais pour un site de mairie, cela pose plusieurs problèmes :

1. **Cohérence graphique**  
   Les pages risquent de devenir visuellement incohérentes si chaque agent peut changer les tailles, couleurs, espacements ou alignements.

2. **Accessibilité**  
   Une mairie doit avoir un site accessible. Un éditeur trop libre augmente le risque de mauvaise structure HTML, mauvais contraste, mauvais ordre de titres ou composants non accessibles.

3. **Responsive design**  
   Ce qui paraît correct dans l'éditeur peut être cassé sur mobile ou tablette si le layout est trop libre.

4. **Maintenance**  
   Du contenu HTML libre est difficile à migrer, nettoyer, auditer ou faire évoluer.

5. **Sécurité**  
   Autoriser du HTML brut ou des scripts peut introduire des risques techniques.

6. **Qualité éditoriale**  
   Une mairie a besoin de pages homogènes, compréhensibles, sobres et fiables.

Conclusion : utiliser un éditeur riche pour les textes, mais pas comme outil principal de construction de page.

---

## 4. Architecture recommandée

### Vue globale

```txt
Payload CMS
  Collections
    Pages
    News
    Events
    Documents
    Media
    Users

  Globals
    Header
    Footer
    SiteSettings
    EmergencyBanner

Next.js
  App Router
  Route dynamique /[...slug]
  Rendu des pages par blocs React
  Draft Mode pour prévisualisation
  Live Preview intégré à Payload
```

### Rôle de Payload

Payload sert à :

- gérer les contenus ;
- gérer les médias ;
- gérer les utilisateurs ;
- définir les blocs de page ;
- gérer les brouillons ;
- gérer les versions ;
- fournir l'interface d'administration ;
- permettre la prévisualisation live.

### Rôle de Next.js

Next.js sert à :

- afficher le site public ;
- récupérer les pages depuis Payload ;
- rendre chaque bloc avec un composant React dédié ;
- gérer la preview des brouillons ;
- optimiser les performances, le SEO et le rendu.

---

## 5. Modèle de collection `Pages`

La collection principale à mettre en place est `pages`.

Exemple conceptuel :

```ts
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: 'title',
    livePreview: {
      url: ({ data }) => {
        return `${process.env.NEXT_PUBLIC_SITE_URL}/preview/${data.slug}`
      },
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      required: true,
      blocks: [
        HeroBlock,
        RichTextBlock,
        ImageTextBlock,
        CardGridBlock,
        AlertBlock,
        FAQBlock,
        NewsListBlock,
        EventsListBlock,
        DocumentsListBlock,
        ContactBlock,
      ],
    },
  ],
}
```

Le champ important est `layout`, de type `blocks`.

Il permet de composer une page avec des blocs autorisés.

---

## 6. Séparation entre contenu riche et layout

Il faut distinguer deux niveaux :

### 6.1. Contenu riche

Le contenu riche correspond au texte éditorial :

- paragraphes ;
- titres ;
- listes ;
- liens ;
- gras ;
- italique ;
- tableaux simples si nécessaire.

Pour cela, utiliser le champ `richText` de Payload, basé sur Lexical.

Exemple :

```ts
export const RichTextBlock = {
  slug: 'richText',
  labels: {
    singular: 'Texte riche',
    plural: 'Textes riches',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}
```

### 6.2. Layout de page

Le layout ne doit pas être défini par du texte riche.

Il doit être défini par des blocs spécialisés :

- bloc Hero ;
- bloc Image + texte ;
- bloc Grille de cartes ;
- bloc Alerte ;
- bloc FAQ ;
- bloc Documents ;
- bloc Actualités ;
- bloc Événements ;
- bloc Contact.

Chaque bloc correspond à un composant React maîtrisé côté Next.js.

---

## 7. Exemple de blocs recommandés pour une mairie

### 7.1. HeroBlock

Utilisé en haut d'une page.

Champs possibles :

- titre ;
- sous-titre ;
- image optionnelle ;
- bouton optionnel ;
- variante visuelle.

Exemples de variantes :

- standard ;
- centré ;
- image à droite ;
- sobre.

---

### 7.2. RichTextBlock

Utilisé pour du contenu éditorial simple.

Champs possibles :

- contenu riche ;
- largeur d'affichage ;
- variante de fond éventuelle.

---

### 7.3. ImageTextBlock

Utilisé pour associer une image et un texte.

Exemple :

```ts
export const ImageTextBlock = {
  slug: 'imageText',
  labels: {
    singular: 'Image + texte',
    plural: 'Images + textes',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Image à gauche', value: 'left' },
        { label: 'Image à droite', value: 'right' },
      ],
    },
  ],
}
```

---

### 7.4. CardGridBlock

Utilisé pour afficher une grille de cartes.

Cas d'usage :

- démarches administratives ;
- services municipaux ;
- liens rapides ;
- rubriques principales.

Champs possibles :

- titre du bloc ;
- description ;
- liste de cartes ;
- nombre de colonnes prédéfini ;
- variante visuelle.

Chaque carte peut contenir :

- titre ;
- description ;
- icône optionnelle ;
- lien ;
- image optionnelle.

---

### 7.5. AlertBlock

Très utile pour une mairie.

Cas d'usage :

- fermeture exceptionnelle ;
- travaux ;
- coupure d'eau ;
- alerte météo ;
- changement d'horaires ;
- information urgente.

Champs possibles :

- niveau : info, warning, danger, success ;
- titre ;
- message ;
- lien optionnel ;
- date de début ;
- date de fin.

---

### 7.6. FAQBlock

Utilisé pour afficher des questions fréquentes.

Champs possibles :

- titre ;
- liste de questions/réponses.

Chaque item contient :

- question ;
- réponse en texte riche.

---

### 7.7. DocumentsListBlock

Utilisé pour afficher des documents à télécharger.

Cas d'usage :

- formulaires administratifs ;
- comptes-rendus ;
- arrêtés ;
- brochures ;
- documents publics.

Champs possibles :

- titre ;
- description ;
- documents sélectionnés manuellement ;
- ou filtre par catégorie.

Les documents doivent idéalement être dans une collection séparée `documents`.

---

### 7.8. NewsListBlock

Utilisé pour afficher une liste d'actualités.

Il ne doit pas contenir les actualités directement.

Il doit plutôt contenir des paramètres :

```ts
{
  name: 'limit',
  type: 'number',
  defaultValue: 3,
},
{
  name: 'category',
  type: 'relationship',
  relationTo: 'newsCategories',
}
```

Next.js récupère ensuite les actualités correspondantes.

---

### 7.9. EventsListBlock

Utilisé pour afficher des événements municipaux.

Cas d'usage :

- agenda ;
- événements culturels ;
- conseils municipaux ;
- réunions publiques ;
- animations.

Champs possibles :

- titre ;
- nombre d'événements ;
- catégorie ;
- affichage uniquement des événements à venir.

---

### 7.10. ContactBlock

Utilisé pour afficher des informations pratiques.

Champs possibles :

- nom du service ;
- adresse ;
- téléphone ;
- email ;
- horaires ;
- lien vers formulaire ;
- carte optionnelle.

---

## 8. Rendu côté Next.js

Le site Next.js doit rendre chaque bloc avec un composant React dédié.

Exemple :

```tsx
import { Hero } from '@/blocks/Hero'
import { RichText } from '@/blocks/RichText'
import { ImageText } from '@/blocks/ImageText'
import { CardGrid } from '@/blocks/CardGrid'
import { Alert } from '@/blocks/Alert'
import { FAQ } from '@/blocks/FAQ'

const blockComponents = {
  hero: Hero,
  richText: RichText,
  imageText: ImageText,
  cardGrid: CardGrid,
  alert: Alert,
  faq: FAQ,
}

export function RenderBlocks({ blocks }) {
  return (
    <>
      {blocks?.map((block) => {
        const Component = blockComponents[block.blockType]

        if (!Component) return null

        return <Component key={block.id} {...block} />
      })}
    </>
  )
}
```

La page dynamique peut ensuite récupérer la page depuis Payload :

```tsx
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RenderBlocks } from '@/components/RenderBlocks'

export default async function Page({ params }) {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  const slug = params.slug?.join('/') || 'accueil'

  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      },
    },
    draft,
    limit: 1,
  })

  const page = result.docs[0]

  if (!page) {
    return null
  }

  return <RenderBlocks blocks={page.layout} />
}
```

---

## 9. Prévisualisation en temps réel

L'agent doit pouvoir voir le rendu de la page avant publication.

Avec Payload, utiliser :

- `admin.livePreview` ;
- `versions.drafts` ;
- le Draft Mode de Next.js.

Flux souhaité :

```txt
1. L'agent ouvre une page dans Payload.
2. Il modifie un champ ou un bloc.
3. Une prévisualisation s'affiche dans une iframe.
4. Le rendu correspond à la version brouillon.
5. L'agent peut corriger avant de publier.
```

La prévisualisation doit utiliser le vrai frontend Next.js, pas une approximation dans l'admin.

C'est important parce que l'agent doit voir :

- le rendu réel ;
- la hiérarchie visuelle ;
- les images ;
- les espacements ;
- les variantes ;
- les blocs dynamiques ;
- le comportement responsive si possible.

---

## 10. Brouillons, publication et versions

Pour une mairie, il est important de ne pas publier immédiatement chaque modification.

Activer les drafts :

```ts
versions: {
  drafts: true,
}
```

Fonctionnalités attendues :

- créer une page en brouillon ;
- modifier une page publiée sans affecter immédiatement le site public ;
- prévisualiser les changements ;
- publier quand la page est validée ;
- revenir à une version précédente en cas d'erreur ;
- tracer les modifications.

Workflow recommandé :

```txt
Contributeur
  crée ou modifie un brouillon
  ne peut pas publier

Éditeur / responsable communication
  relit
  corrige
  publie

Administrateur
  gère les droits, les structures et les réglages globaux
```

---

## 11. Permissions et rôles

Il faut éviter que tous les agents aient les mêmes droits.

Rôles recommandés :

```txt
admin
  accès complet
  peut gérer la structure, les utilisateurs et les réglages

editor
  peut créer, modifier et publier des contenus

contributor
  peut créer et modifier des brouillons
  ne peut pas publier

viewer
  lecture seule
```

Exemple simplifié dans Payload :

```ts
const isAdmin = ({ req }) => req.user?.role === 'admin'
const isEditor = ({ req }) =>
  ['admin', 'editor'].includes(req.user?.role)

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isAdmin,
  },
  fields: [
    // ...
  ],
}
```

Pour une mairie, un modèle encore plus concret serait :

```txt
Agent mairie
  peut éditer les brouillons de certaines pages

Responsable communication
  peut publier

Administrateur technique
  peut modifier la configuration et les blocs
```

---

## 12. Ce qui doit être éditable

L'agent doit pouvoir modifier :

- le titre d'une page ;
- le contenu texte ;
- les images ;
- les documents associés ;
- les liens ;
- l'ordre des blocs ;
- l'ajout ou suppression de blocs autorisés ;
- certaines variantes prédéfinies ;
- les métadonnées SEO simples ;
- les informations pratiques ;
- les actualités et événements.

---

## 13. Ce qui ne doit pas être éditable librement

L'agent ne doit pas pouvoir modifier librement :

- les couleurs exactes ;
- les polices ;
- les tailles de texte arbitraires ;
- les marges au pixel près ;
- les breakpoints responsive ;
- le CSS ;
- le HTML brut ;
- les scripts ;
- la structure globale du header/footer sans validation ;
- le design system.

À la place, proposer des variantes contrôlées.

Exemple :

```ts
{
  name: 'variant',
  type: 'select',
  defaultValue: 'default',
  options: [
    { label: 'Standard', value: 'default' },
    { label: 'Mise en avant', value: 'highlight' },
    { label: 'Sobre', value: 'muted' },
  ],
}
```

Cela permet une souplesse éditoriale sans perdre le contrôle graphique.

---

## 14. Collections recommandées

Structure recommandée :

```txt
collections/
  Pages
  News
  Events
  Documents
  Media
  Users
  NewsCategories
  EventCategories
  DocumentCategories

globals/
  Header
  Footer
  SiteSettings
  EmergencyBanner

blocks/
  Hero
  RichText
  ImageText
  CardGrid
  Alert
  FAQ
  NewsList
  EventsList
  DocumentsList
  Contact
  OpeningHours
  Map
  CTA
```

### Pages

Contient les pages éditoriales composées par blocs.

### News

Contient les actualités de la mairie.

### Events

Contient les événements municipaux.

### Documents

Contient les documents publics téléchargeables.

### Media

Contient les images et fichiers.

### Users

Contient les utilisateurs de l'administration Payload.

### Globals

Les globals servent aux éléments communs :

- header ;
- footer ;
- paramètres du site ;
- bandeau d'urgence global.

---

## 15. Exemple de page mairie

Exemple de page “Démarches administratives” :

```json
{
  "title": "Démarches administratives",
  "slug": "demarches-administratives",
  "layout": [
    {
      "blockType": "hero",
      "title": "Démarches administratives",
      "subtitle": "Retrouvez les principales démarches disponibles en mairie."
    },
    {
      "blockType": "cardGrid",
      "title": "Vos démarches",
      "cards": [
        {
          "title": "Carte d'identité",
          "href": "/demarches/carte-identite"
        },
        {
          "title": "Passeport",
          "href": "/demarches/passeport"
        },
        {
          "title": "État civil",
          "href": "/demarches/etat-civil"
        }
      ]
    },
    {
      "blockType": "alert",
      "level": "info",
      "text": "Certaines démarches nécessitent une prise de rendez-vous."
    },
    {
      "blockType": "documentsList",
      "title": "Documents utiles",
      "category": "demarches"
    }
  ]
}
```

---

## 16. Recommandations pour l'agent IA

Si un agent IA doit aider à modifier ou générer des pages, il doit respecter les règles suivantes.

### 16.1. Toujours raisonner en blocs

L'agent IA ne doit pas générer une page comme un grand bloc HTML.

Il doit proposer une structure sous forme de blocs Payload.

Exemple attendu :

```txt
Hero
RichText
CardGrid
Alert
DocumentsList
FAQ
```

### 16.2. Ne pas inventer de composants non prévus

L'agent IA doit utiliser uniquement les blocs disponibles dans le projet.

Si un besoin ne correspond à aucun bloc existant, il doit proposer :

- soit une combinaison de blocs existants ;
- soit la création d'un nouveau bloc, clairement justifiée.

### 16.3. Respecter la charte éditoriale

L'agent IA doit privilégier :

- un ton clair ;
- des phrases courtes ;
- une structure lisible ;
- des titres explicites ;
- des liens compréhensibles ;
- des informations vérifiables ;
- des contenus adaptés au service public.

### 16.4. Respecter l'accessibilité

L'agent IA doit éviter :

- les textes de lien vagues comme “cliquez ici” ;
- les images sans alternative ;
- les titres désordonnés ;
- les contenus uniquement visuels ;
- les phrases trop longues ;
- les tableaux complexes si non nécessaires.

### 16.5. Ne pas publier sans validation

Si l'agent IA est utilisé pour assister la rédaction, il doit produire ou modifier des brouillons.

La publication doit rester une action volontaire d'un utilisateur autorisé.

### 16.6. Préserver le modèle de données

L'agent IA doit produire des contenus compatibles avec les schémas Payload existants.

Il ne doit pas générer des champs non existants ou modifier arbitrairement la structure.

---

## 17. Format idéal de sortie pour un agent IA

Quand l'agent IA propose une page, il peut fournir une sortie structurée de ce type :

```json
{
  "title": "Inscription à la cantine scolaire",
  "slug": "inscription-cantine-scolaire",
  "layout": [
    {
      "blockType": "hero",
      "title": "Inscription à la cantine scolaire",
      "subtitle": "Retrouvez les informations utiles pour inscrire votre enfant à la cantine."
    },
    {
      "blockType": "richText",
      "content": "Les inscriptions à la cantine scolaire sont ouvertes aux familles résidant dans la commune."
    },
    {
      "blockType": "alert",
      "level": "warning",
      "title": "Date limite d'inscription",
      "text": "Les dossiers doivent être transmis avant le 30 juin."
    },
    {
      "blockType": "documentsList",
      "title": "Documents à fournir",
      "category": "scolaire"
    },
    {
      "blockType": "contact",
      "serviceName": "Service scolaire"
    }
  ]
}
```

Dans une intégration plus avancée, l'agent IA pourrait directement créer ou modifier un brouillon Payload à partir de cette structure.

---

## 18. Fonctionnalités utiles à prévoir

### 18.1. Bouton “Prévisualiser”

Permettre à l'agent de voir la page avant publication.

### 18.2. Bouton “Publier”

Réservé aux rôles autorisés.

### 18.3. Bouton “Dépublier”

Utile pour retirer temporairement une page.

### 18.4. Historique des versions

Permettre de revenir en arrière en cas d'erreur.

### 18.5. Validation éditoriale

Option utile si plusieurs agents contribuent.

### 18.6. Champs SEO simples

Prévoir :

- meta title ;
- meta description ;
- image de partage ;
- exclusion éventuelle de l'indexation.

### 18.7. Gestion des redirections

Utile si un slug change.

Exemple :

```txt
Ancien slug : /demarches/passeport
Nouveau slug : /services/passeport
Créer une redirection 301
```

---

## 19. Points d'attention techniques

### 19.1. Slugs

Les slugs doivent être uniques.

Il faut prévoir une stratégie pour :

- la page d'accueil ;
- les pages imbriquées ;
- les changements d'URL ;
- les redirections.

### 19.2. Relations

Les contenus dynamiques doivent être dans des collections séparées.

Ne pas dupliquer les actualités ou événements dans les pages.

### 19.3. Médias

Prévoir :

- texte alternatif obligatoire pour les images importantes ;
- formats optimisés ;
- limites de taille ;
- organisation par collection ou catégorie.

### 19.4. Documents

Prévoir :

- titre public du document ;
- fichier ;
- catégorie ;
- date de publication ;
- poids du fichier ;
- format ;
- description optionnelle.

### 19.5. Performance

Le rendu par blocs doit rester performant.

Éviter :

- des requêtes inutiles par bloc ;
- des images non optimisées ;
- des blocs trop complexes ;
- du contenu chargé côté client sans nécessité.

### 19.6. Sécurité

Éviter :

- HTML brut ;
- scripts injectables ;
- champs non validés ;
- droits trop larges ;
- publication sans contrôle.

---

## 20. Décision finale

La meilleure approche pour ce projet est :

```txt
Payload Blocks
+ Lexical Rich Text
+ Drafts / Versions
+ Live Preview
+ Next.js Draft Mode
+ rendu React contrôlé par blocs
+ permissions par rôle
```

Il n'est pas recommandé d'ajouter un éditeur WYSIWYG externe comme outil principal pour éditer des pages entières.

Tiptap, Slate, Lexical seul, Builder.io ou un constructeur drag-and-drop externe ne sont pas nécessaires dans ce contexte, sauf besoin très spécifique.

Payload fournit déjà les briques nécessaires.

La priorité doit être la conception d'un **design system éditorial** :

- suffisamment souple pour permettre de construire des pages complètes ;
- suffisamment contraint pour garantir la qualité, l'accessibilité et la cohérence du site municipal.

---

## 21. Résumé opérationnel pour l'agent IA

L'agent IA doit comprendre que :

1. Le site est en Next.js.
2. Le CMS utilisé est Payload.
3. Les pages doivent être composées avec des blocs Payload.
4. Le rich text sert au contenu, pas à la structure complète de la page.
5. Le layout est contrôlé par des composants React.
6. L'agent humain doit pouvoir prévisualiser en temps réel.
7. Les modifications doivent passer par des brouillons.
8. La publication doit être contrôlée par des rôles.
9. Le design ne doit pas être librement modifiable.
10. Les blocs doivent respecter l'accessibilité, le responsive et la charte graphique.

Formule de synthèse :

> L'agent de mairie compose et édite des pages avec des blocs validés dans Payload. Next.js rend ces blocs avec des composants React maîtrisés. Le système permet la prévisualisation, les brouillons, les versions et les permissions, sans donner une liberté graphique totale qui pourrait casser le site.
