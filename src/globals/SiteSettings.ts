import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Paramètres du site',
  admin: { group: 'Paramètres', hidden: ({ user }) => user?.role !== 'admin' },
  access: { read: () => true, update: isAdmin },
  fields: [
    {
      name: 'logo',
      label: 'Logo (header)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Affiché en haut à gauche sur toutes les pages. Format carré recommandé (ex : 80×80px).' },
    },
    {
      name: 'heroImage',
      label: "Photo hero (page d'accueil)",
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'heroTitle',
      label: 'Titre hero',
      type: 'text',
      defaultValue: 'La Ville-aux-Clercs',
    },
    {
      name: 'heroSubtitle',
      label: 'Sous-titre hero',
      type: 'text',
      defaultValue: 'Bienvenue sur le site officiel de la mairie',
    },
    {
      name: 'panneauPocketUrl',
      label: 'URL iframe PanneauPocket',
      type: 'text',
      admin: { description: "URL fournie par PanneauPocket pour l'embed iframe" },
    },
  ],
}
