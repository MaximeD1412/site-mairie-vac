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
    { name: 'category', label: 'Catégorie', type: 'select', required: true, options: [
      { label: 'Bulletin municipal', value: 'bulletin-municipal' },
      { label: 'Ptitmag', value: 'ptitmag' },
      { label: 'BEPOS', value: 'bepos' },
      { label: 'PV du conseil municipal', value: 'pv-conseil' },
      { label: 'Actes administratifs', value: 'actes-administratifs' },
      { label: 'Compte-rendu', value: 'compte-rendu' },
      { label: 'Arrêté', value: 'arrete' },
      { label: 'Formulaire', value: 'formulaire' },
      { label: 'Autre', value: 'autre' },
    ]},
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea' }
  ]
}
