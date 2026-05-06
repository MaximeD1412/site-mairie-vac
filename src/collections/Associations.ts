import type { CollectionConfig } from 'payload'
import { isAgentOrAdmin } from '../access'

export const Associations: CollectionConfig = {
  slug: 'associations',
  labels: { singular: 'Association', plural: 'Associations' },
  admin: { useAsTitle: 'name', group: 'Vie locale' },
  access: { read: () => true, create: isAgentOrAdmin, update: isAgentOrAdmin, delete: isAgentOrAdmin },
  fields: [
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'category', label: 'Catégorie', type: 'select', options: ['Sport', 'Culture', 'Solidarité', 'Loisirs', 'Autre'] },
    { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
    { name: 'description', label: 'Description', type: 'richText' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Téléphone', type: 'text' },
    { name: 'website', label: 'Site web', type: 'text' }
  ]
}
