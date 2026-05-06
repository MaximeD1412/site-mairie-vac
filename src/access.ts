import type { Access } from 'payload'

export const isAdmin: Access = ({ req }) => Boolean(req.user?.role === 'admin')

export const isAgentOrAdmin: Access = ({ req }) => {
  return Boolean(req.user && ['admin', 'agent'].includes(String(req.user.role)))
}

export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
