import type { Block } from 'payload'

export const QuickLinksBlock: Block = {
  slug: 'quickLinks',
  labels: { singular: 'Liens rapides', plural: 'Liens rapides' },
  fields: [
    {
      name: 'links',
      label: 'Liens',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'label', label: 'Libellé', type: 'text', required: true },
        { name: 'url', label: 'URL', type: 'text', required: true },
        { name: 'description', label: 'Description courte', type: 'text' }
      ]
    }
  ]
}
