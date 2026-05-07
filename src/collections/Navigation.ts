import type { CollectionConfig } from 'payload'
import { isAgentOrAdmin } from '../access'

const navItemFields = [
  { name: 'label', label: 'Libellé', type: 'text', required: true },
  {
    name: 'kind',
    label: 'Type de lien',
    type: 'select',
    required: true,
    defaultValue: 'page',
    options: [
      { label: 'Page CMS', value: 'page' },
      { label: 'URL externe', value: 'external' },
      { label: 'Actualités', value: 'newsArchive' },
      { label: 'Agenda', value: 'eventsArchive' },
      { label: 'Documents', value: 'documentsArchive' },
      { label: 'Associations', value: 'associationsArchive' }
    ]
  },
  { name: 'page', label: 'Page', type: 'relationship', relationTo: 'pages', admin: { condition: (_, siblingData) => siblingData?.kind === 'page' } },
  { name: 'url', label: 'URL', type: 'text', admin: { condition: (_, siblingData) => siblingData?.kind === 'external' } },
  {
    name: 'children',
    label: 'Sous-menu',
    type: 'array',
    fields: [
      { name: 'label', label: 'Libellé', type: 'text', required: true },
      { name: 'page', label: 'Page', type: 'relationship', relationTo: 'pages' },
      { name: 'url', label: 'URL externe optionnelle', type: 'text' }
    ]
  }
] as any

export const Navigation: CollectionConfig = {
  slug: 'navigation',
  labels: { singular: 'Menu', plural: 'Menus' },
  admin: { useAsTitle: 'name', group: 'Structure du site' },
  access: {
    read: () => true,
    create: isAgentOrAdmin,
    update: isAgentOrAdmin,
    delete: isAgentOrAdmin,
  },
  fields: [
    { name: 'name', label: 'Nom', type: 'text', required: true },
    {
      name: 'location',
      label: 'Emplacement',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'Menu principal', value: 'main' },
        { label: 'Pied de page', value: 'footer' }
      ]
    },
    { name: 'items', label: 'Liens', type: 'array', fields: navItemFields }
  ]
}
