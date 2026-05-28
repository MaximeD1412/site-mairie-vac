import type { CollectionConfig } from 'payload'
import { isAgentOrAdmin } from '../access'

export const EventCategories: CollectionConfig = {
  slug: 'event-categories',
  labels: { singular: 'Catégorie', plural: "Catégories d'événements" },
  admin: { useAsTitle: 'name', group: 'Contenus' },
  access: {
    read: () => true,
    create: isAgentOrAdmin,
    update: isAgentOrAdmin,
    delete: isAgentOrAdmin,
  },
  fields: [
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, unique: true },
    {
      name: 'color',
      label: 'Couleur',
      type: 'text',
      required: true,
      defaultValue: '#3B82F6',
      admin: { description: 'Couleur hexadécimale (ex: #3B82F6)' },
    },
  ],
}
