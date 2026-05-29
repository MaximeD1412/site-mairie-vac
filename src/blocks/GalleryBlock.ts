import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Galerie', plural: 'Galeries' },
  fields: [
    {
      name: 'images',
      label: 'Images',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'image', label: 'Image', type: 'upload', relationTo: 'media', required: true }
      ]
    }
  ]
}
