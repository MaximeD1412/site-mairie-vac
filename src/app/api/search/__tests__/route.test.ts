import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown) => ({ json: () => Promise.resolve(data) }),
  },
}))

import { getPayloadClient } from '@/lib/payload'
import { GET } from '../route'

const mockGetPayloadClient = vi.mocked(getPayloadClient)

function makeRequest(q?: string) {
  const url = new URL(
    q !== undefined
      ? `http://localhost/api/search?q=${encodeURIComponent(q)}`
      : 'http://localhost/api/search',
  )
  return { nextUrl: { searchParams: url.searchParams } } as any
}

function setupPayload(overrides: { newsDocs?: any[]; eventsDocs?: any[]; pagesDocs?: any[] } = {}) {
  const find = vi.fn().mockImplementation(({ collection }: { collection: string }) => {
    if (collection === 'news') return Promise.resolve({ docs: overrides.newsDocs ?? [] })
    if (collection === 'events') return Promise.resolve({ docs: overrides.eventsDocs ?? [] })
    if (collection === 'pages') return Promise.resolve({ docs: overrides.pagesDocs ?? [] })
    return Promise.resolve({ docs: [] })
  })
  mockGetPayloadClient.mockResolvedValue({ find } as any)
  return { find }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/search', () => {
  it('retourne [] si q est absent', async () => {
    const { find } = setupPayload()
    const res = await GET(makeRequest())
    expect(await res.json()).toEqual([])
    expect(find).not.toHaveBeenCalled()
  })

  it('retourne [] si q fait 1 caractère', async () => {
    const { find } = setupPayload()
    const res = await GET(makeRequest('a'))
    expect(await res.json()).toEqual([])
    expect(find).not.toHaveBeenCalled()
  })

  it('retourne [] si q est une chaîne vide', async () => {
    const { find } = setupPayload()
    const res = await GET(makeRequest(''))
    expect(await res.json()).toEqual([])
    expect(find).not.toHaveBeenCalled()
  })

  it('interroge les 3 collections en parallèle avec _status published et limit 4', async () => {
    const { find } = setupPayload()

    await GET(makeRequest('conseil'))

    for (const collection of ['news', 'events', 'pages']) {
      expect(find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection,
          where: { title: { like: 'conseil' }, _status: { equals: 'published' } },
          limit: 4,
        }),
      )
    }
    expect(find).toHaveBeenCalledTimes(3)
  })

  it('retourne les résultats des 3 collections avec la bonne forme', async () => {
    setupPayload({
      newsDocs: [{ title: 'News test', slug: 'news-test', publishedAt: '2026-01-01T00:00:00.000Z' }],
      eventsDocs: [{ title: 'Event test', slug: 'event-test', startDate: '2026-02-01T00:00:00.000Z' }],
      pagesDocs: [{ title: 'Page test', slug: 'page-test' }],
    })

    const res = await GET(makeRequest('test'))
    const data = await res.json()

    expect(data).toContainEqual({
      title: 'News test',
      type: 'Actualité',
      date: '2026-01-01T00:00:00.000Z',
      url: '/actualites/news-test',
    })
    expect(data).toContainEqual({
      title: 'Event test',
      type: 'Événement',
      date: '2026-02-01T00:00:00.000Z',
      url: '/agenda/event-test',
    })
    expect(data).toContainEqual({
      title: 'Page test',
      type: 'Page',
      date: null,
      url: '/page-test',
    })
  })
})
