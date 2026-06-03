import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access'

export const MairieInfo: GlobalConfig = {
  slug: 'mairie-info',
  label: 'Informations de la mairie',
  admin: { group: 'Paramètres', hidden: ({ user }) => user?.role !== 'admin' },
  access: { read: () => true, update: isAdmin },
  fields: [
    { name: 'address', label: 'Adresse', type: 'text', required: true, defaultValue: '1 Rue de la Mairie, 41160 La Ville-aux-Clercs' },
    { name: 'phone', label: 'Téléphone', type: 'text', required: true, defaultValue: '02.54.80.62.55' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'facebookUrl', label: 'URL page Facebook', type: 'text' },
    {
      name: 'openingHours',
      label: "Horaires d'ouverture",
      type: 'array',
      fields: [
        { name: 'days', label: 'Jours', type: 'text' },
        { name: 'hours', label: 'Horaires', type: 'text' },
      ],
    },
  ],
}
