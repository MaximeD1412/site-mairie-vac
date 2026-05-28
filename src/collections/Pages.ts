import type { CollectionConfig } from 'payload'
import { publishedOrLoggedIn, isAgentOrAdmin } from '../access'
import { RichTextBlock } from '../blocks/RichTextBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import { QuickLinksBlock } from '../blocks/QuickLinksBlock'
import { CollectionListBlock } from '../blocks/CollectionListBlock'
import { PanneauPocketBlock } from '../blocks/PanneauPocketBlock'
import { GalleryBlock } from '../blocks/GalleryBlock'
import { AccordionBlock } from '../blocks/AccordionBlock'
import { MapBlock } from '../blocks/MapBlock'
import { ButtonBlock } from '../blocks/ButtonBlock'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  versions: { drafts: true },
  admin: { useAsTitle: 'title', group: 'Structure du site' },
  access: {
    read: publishedOrLoggedIn,
    create: isAgentOrAdmin,
    update: isAgentOrAdmin,
    delete: isAgentOrAdmin,
  },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, unique: true, admin: { description: 'Ex: vie-pratique/ecole ou mairie/conseil-municipal' } },
    { name: 'summary', label: 'Résumé', type: 'textarea' },
    { name: 'heroImage', label: 'Image d’en-tête', type: 'upload', relationTo: 'media' },
    {
      name: 'layout',
      label: 'Blocs de contenu',
      type: 'blocks',
      blocks: [RichTextBlock, ImageBlock, QuickLinksBlock, CollectionListBlock, PanneauPocketBlock, ButtonBlock, MapBlock, AccordionBlock, GalleryBlock]
    },
    {
      name: 'seo',
      label: 'Référencement',
      type: 'group',
      fields: [
        { name: 'title', label: 'Titre SEO', type: 'text' },
        { name: 'description', label: 'Description SEO', type: 'textarea' }
      ]
    }
  ]
}
