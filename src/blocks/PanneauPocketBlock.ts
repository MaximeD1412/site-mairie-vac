import type { Block } from 'payload'

export const PanneauPocketBlock: Block = {
  slug: 'panneauPocket',
  labels: { singular: 'PanneauPocket', plural: 'PanneauPocket' },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', defaultValue: 'Infos utiles et alertes' },
    { name: 'widgetUrl', label: 'URL du widget', type: 'text', admin: { description: 'Laisser vide pour utiliser NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL.' } }
  ]
}
