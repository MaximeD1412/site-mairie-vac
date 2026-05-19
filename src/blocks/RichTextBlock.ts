import type { Block } from 'payload'
import { lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'
import { YoutubeFeature } from 'payloadcms-lexical-ext'

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Texte riche', plural: 'Textes riches' },
  fields: [
    {
      name: 'content',
      label: 'Contenu',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          UploadFeature({ collections: { media: { fields: [] } } }),
          YoutubeFeature(),
        ],
      }),
    },
  ],
}
