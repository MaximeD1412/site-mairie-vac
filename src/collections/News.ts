import type { CollectionConfig } from 'payload'
import { publishedOrLoggedIn, isAgentOrAdmin } from '../access'

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'Actualité', plural: 'Actualités' },
  versions: { drafts: true },
  admin: { useAsTitle: 'title', group: 'Contenus' },
  access: { read: publishedOrLoggedIn, create: isAgentOrAdmin, update: isAgentOrAdmin, delete: isAgentOrAdmin },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, unique: true },
    { name: 'summary', label: 'Résumé', type: 'textarea', required: true },
    { name: 'image', label: 'Image', type: 'upload', relationTo: 'media' },
    { name: 'publishedAt', label: 'Date de publication', type: 'date', required: true },
    { name: 'featured', label: 'Mettre en avant', type: 'checkbox', defaultValue: false },
    { name: 'layout', label: 'Contenu', type: 'json' },
  ],
}
