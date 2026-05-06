import type { CollectionConfig } from 'payload'
import { publishedOrLoggedIn, isAgentOrAdmin } from '../access'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Événement', plural: 'Agenda' },
  versions: { drafts: true },
  admin: { useAsTitle: 'title', group: 'Contenus' },
  access: { read: publishedOrLoggedIn, create: isAgentOrAdmin, update: isAgentOrAdmin, delete: isAgentOrAdmin },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, unique: true },
    { name: 'startDate', label: 'Date de début', type: 'date', required: true },
    { name: 'endDate', label: 'Date de fin', type: 'date' },
    { name: 'location', label: 'Lieu', type: 'text' },
    { name: 'category', label: 'Catégorie', type: 'select', options: ['Municipal', 'Association', 'Culture', 'Sport', 'École', 'Autre'] },
    { name: 'image', label: 'Image', type: 'upload', relationTo: 'media' },
    { name: 'description', label: 'Description', type: 'richText' }
  ]
}
