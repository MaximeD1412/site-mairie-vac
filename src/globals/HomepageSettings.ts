import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access'

export const HomepageSettings: GlobalConfig = {
  slug: 'homepage-settings',
  label: "Page d'accueil",
  admin: { group: 'Paramètres', hidden: ({ user }) => user?.role !== 'admin' },
  access: { read: () => true, update: isAdmin },
  fields: [
    {
      name: 'quickLinks',
      label: 'Liens rapides (max 6)',
      type: 'array',
      maxRows: 6,
      admin: {
        description: "Ces liens apparaissent sous la photo d'accueil avec une icône.",
      },
      fields: [
        { name: 'label', label: 'Libellé', type: 'text', required: true },
        {
          name: 'icon',
          label: 'Icône',
          type: 'select',
          required: true,
          options: [
            { label: 'Actualités / Journal', value: 'Newspaper' },
            { label: 'Agenda / Calendrier', value: 'CalendarDays' },
            { label: 'Démarches / Document', value: 'ClipboardList' },
            { label: 'Famille / École', value: 'School' },
            { label: 'Urbanisme / Maison', value: 'Home' },
            { label: 'Contact / Téléphone', value: 'Phone' },
            { label: 'Bibliothèque / Livre', value: 'BookOpen' },
            { label: 'Associations / Groupe', value: 'Users' },
            { label: 'Documents / Fichier', value: 'FileText' },
            { label: 'Informations / Info', value: 'Info' },
          ],
        },
        { name: 'href', label: 'Lien (URL ou chemin)', type: 'text', required: true },
      ],
    },
  ],
}
