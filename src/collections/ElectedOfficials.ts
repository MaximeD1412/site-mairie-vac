import type { CollectionConfig } from 'payload'
import { isAgentOrAdmin } from '../access'

export const ElectedOfficials: CollectionConfig = {
  slug: 'elected-officials',
  labels: { singular: 'Élu', plural: 'Élus' },
  admin: { useAsTitle: 'name', group: 'Vie municipale' },
  access: { read: () => true, create: isAgentOrAdmin, update: isAgentOrAdmin, delete: isAgentOrAdmin },
  fields: [
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'role', label: 'Fonction', type: 'text', required: true },
    { name: 'delegation', label: 'Délégation', type: 'text' },
    { name: 'photo', label: 'Photo', type: 'upload', relationTo: 'media' },
    { name: 'order', label: 'Ordre d’affichage', type: 'number', defaultValue: 0 }
  ]
}
