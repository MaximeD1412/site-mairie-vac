import type { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'image', label: 'Image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', label: 'Légende', type: 'text' }
  ]
}
