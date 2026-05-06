import type { CollectionConfig } from 'payload'
import { isAgentOrAdmin } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Média', plural: 'Médias' },
  upload: {
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 900, height: 600, position: 'centre' }
    ],
    mimeTypes: ['image/*', 'application/pdf']
  },
  admin: { group: 'Contenus' },
  access: {
    read: () => true,
    create: isAgentOrAdmin,
    update: isAgentOrAdmin,
    delete: isAgentOrAdmin,
  },
  fields: [
    { name: 'alt', label: 'Texte alternatif', type: 'text', admin: { description: 'Obligatoire pour les images importantes, utile pour le RGAA.' } }
  ]
}
