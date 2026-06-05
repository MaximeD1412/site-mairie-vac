import { describe, it, expect } from 'vitest'
import { resolveMiddlewareRedirect } from '../auth'

function makeToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fakesig`
}

describe('resolveMiddlewareRedirect', () => {
  it('redirige un agent de /admin vers /', () => {
    const token = makeToken({ role: 'agent' })
    expect(resolveMiddlewareRedirect('/admin', token)).toBe('/')
  })

  it('redirige un agent de /admin/collections/news vers /', () => {
    const token = makeToken({ role: 'agent' })
    expect(resolveMiddlewareRedirect('/admin/collections/news', token)).toBe('/')
  })

  it("laisse passer un admin sur /admin", () => {
    const token = makeToken({ role: 'admin' })
    expect(resolveMiddlewareRedirect('/admin', token)).toBeNull()
  })

  it("redirige un accès sans cookie sur /admin vers /?auth=required", () => {
    expect(resolveMiddlewareRedirect('/admin', undefined)).toBe('/?auth=required')
  })

  it('retourne null pour une route non concernée', () => {
    expect(resolveMiddlewareRedirect('/actualites', undefined)).toBeNull()
  })

  it('redirige vers /connexion pour /actualites/new sans cookie', () => {
    expect(resolveMiddlewareRedirect('/actualites/new', undefined)).toBe('/connexion')
  })

  it('redirige vers /connexion pour /actualites/[slug]/modifier sans cookie', () => {
    expect(resolveMiddlewareRedirect('/actualites/mon-titre/modifier', undefined)).toBe('/connexion')
  })

  it('laisse passer un agent sur /actualites/new', () => {
    const token = makeToken({ role: 'agent' })
    expect(resolveMiddlewareRedirect('/actualites/new', token)).toBeNull()
  })

  it('laisse passer un admin sur /actualites/[slug]/modifier', () => {
    const token = makeToken({ role: 'admin' })
    expect(resolveMiddlewareRedirect('/actualites/mon-titre/modifier', token)).toBeNull()
  })

  it('redirige un visiteur vers /connexion sur /actualites/new', () => {
    const token = makeToken({ role: 'visitor' })
    expect(resolveMiddlewareRedirect('/actualites/new', token)).toBe('/connexion')
  })
})
