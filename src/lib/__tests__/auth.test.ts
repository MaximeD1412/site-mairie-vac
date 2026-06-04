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
})
