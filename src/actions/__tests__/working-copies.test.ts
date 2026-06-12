import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))
vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}))
vi.mock('@/lib/auth', () => ({
  decodePayloadToken: vi.fn(),
}))

import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { decodePayloadToken } from '@/lib/auth'
import { saveWorkingCopy, deleteWorkingCopy, getWorkingCopy } from '../working-copies'

const mockCookies = vi.mocked(cookies)
const mockGetPayloadClient = vi.mocked(getPayloadClient)
const mockDecodePayloadToken = vi.mocked(decodePayloadToken)

function setupAuth(userId: number | null) {
  const cookieStore = {
    get: vi.fn().mockReturnValue(userId !== null ? { value: 'fake-token' } : undefined),
  }
  mockCookies.mockResolvedValue(cookieStore as any)
  if (userId !== null) {
    mockDecodePayloadToken.mockReturnValue({ id: userId, role: 'agent' })
  } else {
    mockDecodePayloadToken.mockReturnValue(null)
  }
}

function setupPayload() {
  const create = vi.fn()
  const update = vi.fn()
  const find = vi.fn()
  const del = vi.fn()
  mockGetPayloadClient.mockResolvedValue({ create, update, find, delete: del } as any)
  return { create, update, find, del }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('saveWorkingCopy', () => {
  it('retourne une erreur si non authentifié', async () => {
    setupAuth(null)
    const result = await saveWorkingCopy('events', { title: 'Test' })
    expect(result).toEqual({ error: 'Non authentifié' })
  })

  it('crée une nouvelle working-copy si aucune existante', async () => {
    setupAuth(42)
    const { create, find } = setupPayload()
    find.mockResolvedValue({ docs: [] })
    create.mockResolvedValue({ id: 1 })

    const result = await saveWorkingCopy('events', { title: 'Test' })

    expect(find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'working-copies' }))
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'working-copies',
        data: expect.objectContaining({ author: 42, collection: 'events' }),
      }),
    )
    expect(result).toEqual({ id: '1' })
  })

  it('met à jour la working-copy existante', async () => {
    setupAuth(42)
    const { update, find } = setupPayload()
    find.mockResolvedValue({ docs: [{ id: 5 }] })
    update.mockResolvedValue({ id: 5 })

    const result = await saveWorkingCopy('events', { title: 'Modifié' })

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'working-copies',
        id: 5,
        data: { data: { title: 'Modifié' } },
      }),
    )
    expect(result).toEqual({ id: '5' })
  })

  it('inclut relatedId dans la recherche et la création', async () => {
    setupAuth(42)
    const { create, find } = setupPayload()
    find.mockResolvedValue({ docs: [] })
    create.mockResolvedValue({ id: 3 })

    await saveWorkingCopy('news', { title: 'News' }, '99')

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ relatedId: '99', collection: 'news' }),
      }),
    )
  })

  it('utilise la condition exists:false quand pas de relatedId', async () => {
    setupAuth(1)
    const { create, find } = setupPayload()
    find.mockResolvedValue({ docs: [] })
    create.mockResolvedValue({ id: 7 })

    await saveWorkingCopy('events', {})

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          and: expect.arrayContaining([{ relatedId: { exists: false } }]),
        }),
      }),
    )
  })
})

describe('getWorkingCopy', () => {
  it('retourne null si non authentifié', async () => {
    setupAuth(null)
    setupPayload()
    const result = await getWorkingCopy('news', '99')
    expect(result).toBeNull()
  })

  it('retourne null si aucune working-copy trouvée', async () => {
    setupAuth(42)
    const { find } = setupPayload()
    find.mockResolvedValue({ docs: [] })
    const result = await getWorkingCopy('events', '5')
    expect(result).toBeNull()
  })

  it('retourne id, data et updatedAt si une working-copy existe', async () => {
    setupAuth(42)
    const { find } = setupPayload()
    find.mockResolvedValue({
      docs: [{ id: 7, data: { title: 'Brouillon' }, updatedAt: '2026-06-10T10:00:00.000Z' }],
    })
    const result = await getWorkingCopy('news', '99')
    expect(result).toEqual({ id: '7', data: { title: 'Brouillon' }, updatedAt: '2026-06-10T10:00:00.000Z' })
  })

  it('filtre par auteur, collection et relatedId', async () => {
    setupAuth(42)
    const { find } = setupPayload()
    find.mockResolvedValue({ docs: [{ id: 1, data: {}, updatedAt: '' }] })

    await getWorkingCopy('events', '55')

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'working-copies',
        where: expect.objectContaining({
          and: expect.arrayContaining([
            { author: { equals: 42 } },
            { collection: { equals: 'events' } },
            { relatedId: { equals: '55' } },
          ]),
        }),
      }),
    )
  })
})

describe('deleteWorkingCopy', () => {
  it('ne fait rien si non authentifié', async () => {
    setupAuth(null)
    const { del } = setupPayload()
    await deleteWorkingCopy('events')
    expect(del).not.toHaveBeenCalled()
  })

  it('supprime la working-copy correspondante', async () => {
    setupAuth(42)
    const { find, del } = setupPayload()
    find.mockResolvedValue({ docs: [{ id: 10 }] })
    del.mockResolvedValue({})

    await deleteWorkingCopy('events', '5')

    expect(del).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'working-copies', id: 10 }),
    )
  })

  it('ne fait rien si aucune working-copy trouvée', async () => {
    setupAuth(42)
    const { find, del } = setupPayload()
    find.mockResolvedValue({ docs: [] })

    await deleteWorkingCopy('news')

    expect(del).not.toHaveBeenCalled()
  })

  it('supprime plusieurs working-copies si plusieurs trouvées', async () => {
    setupAuth(42)
    const { find, del } = setupPayload()
    find.mockResolvedValue({ docs: [{ id: 1 }, { id: 2 }] })
    del.mockResolvedValue({})

    await deleteWorkingCopy('events')

    expect(del).toHaveBeenCalledTimes(2)
  })
})
