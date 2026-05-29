import type { Block } from 'payload'

export const MapBlock: Block = {
  slug: 'map',
  labels: { singular: 'Carte', plural: 'Cartes' },
  fields: [
    { name: 'title', label: 'Titre', type: 'text' },
    { name: 'address', label: 'Adresse (texte libre)', type: 'text' },
    { name: 'lat', label: 'Latitude', type: 'number', required: true },
    { name: 'lng', label: 'Longitude', type: 'number', required: true },
  ],
}
