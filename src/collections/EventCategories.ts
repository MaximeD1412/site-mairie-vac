import type { CollectionConfig, FieldHook } from 'payload'
import { isAgentOrAdmin } from '../access'
import { slugify } from '../lib/slugify'

const generateSlug: FieldHook = ({ data, originalDoc, value }) => {
  const name = data?.name
  if (name !== undefined) {
    return slugify(name as string)
  }
  return originalDoc?.slug ?? value ?? ''
}

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
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { hidden: true },
      hooks: { beforeChange: [generateSlug] },
    },
    {
      name: 'color',
      label: 'Couleur',
      type: 'text',
      required: true,
      defaultValue: '#1D4ED8',
      admin: {
        components: {
          Field: '@/components/admin/ColorPickerField#ColorPickerField',
        },
      },
    },
  ],
}
