import type { Block } from 'payload'

export const CollectionListBlock: Block = {
  slug: 'collectionList',
  labels: { singular: 'Liste automatique', plural: 'Listes automatiques' },
  fields: [
    { name: 'title', label: 'Titre du bloc', type: 'text' },
    {
      name: 'collection',
      label: 'Contenu à afficher',
      type: 'select',
      required: true,
      options: [
        { label: 'Actualités', value: 'news' },
        { label: 'Agenda', value: 'events' },
        { label: 'Documents', value: 'documents' },
        { label: 'Associations', value: 'associations' }
      ]
    },
    { name: 'limit', label: 'Nombre d’éléments', type: 'number', defaultValue: 3 }
  ]
}
