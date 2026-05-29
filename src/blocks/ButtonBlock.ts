import type { Block } from 'payload'

export const ButtonBlock: Block = {
  slug: 'button',
  labels: { singular: 'Bouton (CTA)', plural: 'Boutons (CTA)' },
  fields: [
    {
      name: 'text',
      label: 'Texte du bouton',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      label: 'Lien',
      type: 'text',
      required: true,
    },
    {
      name: 'variant',
      label: 'Variante',
      type: 'select',
      required: true,
      defaultValue: 'primary',
      options: [
        { label: 'Primaire', value: 'primary' },
        { label: 'Secondaire', value: 'secondary' },
      ],
    },
  ],
}
