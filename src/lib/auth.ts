export function decodePayloadToken(token: string): { role?: string } | null {
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
    if (!token) return null
    const decoded = decodePayloadToken(token)
    if (decoded?.role === 'agent') return '/'
    return null
  }
  return null
}
