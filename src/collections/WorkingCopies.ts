import type { CollectionConfig, Access } from 'payload'

const isOwner: Access = ({ req }) => {
  if (!req.user) return false
  return { author: { equals: req.user.id } }
}

export const WorkingCopies: CollectionConfig = {
  slug: 'working-copies',
  labels: { singular: 'Copie de travail', plural: 'Copies de travail' },
  admin: { hidden: true },
  access: {
    read: isOwner,
    create: ({ req }) => Boolean(req.user),
    update: isOwner,
    delete: isOwner,
  },
  fields: [
    {
      name: 'author',
      label: 'Auteur',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'collection',
      label: 'Collection',
      type: 'select',
      required: true,
      options: [
        { label: 'Événement', value: 'events' },
        { label: 'Actualité', value: 'news' },
      ],
    },
    {
      name: 'relatedId',
      label: 'ID du document existant',
      type: 'number',
    },
    {
      name: 'data',
      label: 'Données',
      type: 'json',
      required: true,
    },
  ],
}
