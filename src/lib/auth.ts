export function decodePayloadToken(token: string): { id?: string; role?: string; name?: string; email?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function resolveMiddlewareRedirect(pathname: string, token: string | undefined): string | null {
  if (pathname.startsWith('/admin')) {
    if (!token) return '/?auth=required'
    const decoded = decodePayloadToken(token)
    if (decoded?.role === 'agent') return '/'
    return null
  }

  if (pathname === '/documents/new' || /^\/documents\/\d+\/modifier$/.test(pathname)) {
    if (!token) return '/connexion'
    const decoded = decodePayloadToken(token)
    if (decoded?.role !== 'admin' && decoded?.role !== 'agent') return '/connexion'
    return null
  }

  if (pathname === '/actualites/new' || /^\/actualites\/[^/]+\/modifier$/.test(pathname)) {
    if (!token) return '/connexion'
    const decoded = decodePayloadToken(token)
    if (decoded?.role !== 'admin' && decoded?.role !== 'agent') return '/connexion'
    return null
  }

  if (pathname === '/brouillons') {
    if (!token) return '/connexion'
    const decoded = decodePayloadToken(token)
    if (decoded?.role !== 'admin' && decoded?.role !== 'agent') return '/connexion'
    return null
  }

  return null
}
