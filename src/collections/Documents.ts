import type { CollectionConfig } from 'payload'
import { isAgentOrAdmin } from '../access'

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Document', plural: 'Documents' },
  admin: { useAsTitle: 'title', group: 'Contenus' },
  access: { read: () => true, create: isAgentOrAdmin, update: isAgentOrAdmin, delete: isAgentOrAdmin },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true },
    { name: 'file', label: 'Fichier PDF', type: 'upload', relationTo: 'media', required: true },
    { name: 'category', label: 'Catégorie', type: 'select', required: true, options: ['Bulletin municipal', 'Compte-rendu', 'Arrêté', 'Formulaire', 'Autre'] },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea' }
  ]
}
