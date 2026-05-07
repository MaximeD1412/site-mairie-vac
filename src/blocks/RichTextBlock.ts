import type { Block } from 'payload'

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Texte riche', plural: 'Textes riches' },
  fields: [
    { name: 'content', label: 'Contenu', type: 'richText', required: true }
  ]
}
