import type { Block } from 'payload'

export const ContactBlock: Block = {
  slug: 'contact',
  labels: { singular: 'Formulaire Contact', plural: 'Formulaires Contact' },
  fields: [
    { name: 'title', label: 'Titre', type: 'text' },
  ],
}
