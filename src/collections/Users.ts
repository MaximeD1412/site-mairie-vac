import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  auth: true,
  admin: { useAsTitle: 'email', group: 'Administration', hidden: ({ user }) => user?.role !== 'admin' },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'role',
      label: 'Rôle',
      type: 'select',
      required: true,
      defaultValue: 'agent',
      options: [
        { label: 'Administrateur technique', value: 'admin' },
        { label: 'Agent mairie', value: 'agent' }
      ]
    },
    { name: 'name', label: 'Nom', type: 'text' }
  ]
}
