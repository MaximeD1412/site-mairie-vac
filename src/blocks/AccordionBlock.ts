import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const AccordionBlock: Block = {
  slug: 'accordion',
  labels: { singular: 'Accordéon', plural: 'Accordéons' },
  fields: [
    {
      name: 'items',
      label: 'Éléments',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', label: 'Titre', type: 'text', required: true },
        {
          name: 'content',
          label: 'Contenu',
          type: 'richText',
          required: true,
          editor: lexicalEditor(),
        },
      ],
    },
  ],
}
