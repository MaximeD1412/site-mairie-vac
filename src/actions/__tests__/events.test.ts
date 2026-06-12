import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`) }),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))
vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}))
vi.mock('@/lib/auth', () => ({
  decodePayloadToken: vi.fn(),
}))

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { decodePayloadToken } from '@/lib/auth'
import { createEvent, updateEvent, deleteEvent } from '../events'
import { slugify } from '@/lib/slugify'

const mockCookies = vi.mocked(cookies)
const mockRedirect = vi.mocked(redirect)
const mockRevalidatePath = vi.mocked(revalidatePath)
const mockGetPayloadClient = vi.mocked(getPayloadClient)
const mockDecodePayloadToken = vi.mocked(decodePayloadToken)

function makeFormData(fields: Record<string, string | File>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return fd
}

function setupAuth(role: 'admin' | 'agent' | 'visitor' | null) {
  const cookieStore = {
    get: vi.fn().mockReturnValue(role ? { value: 'fake-token' } : undefined),
  }
  mockCookies.mockResolvedValue(cookieStore as any)
  if (role) {
    mockDecodePayloadToken.mockReturnValue({ role })
  } else {
    mockDecodePayloadToken.mockReturnValue(null)
  }
}

function setupPayload() {
  const create = vi.fn()
  const update = vi.fn()
  const del = vi.fn()
  mockGetPayloadClient.mockResolvedValue({ create, update, delete: del } as any)
  return { create, update, del }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('slugify', () => {
  it('convertit un titre en slug', () => {
    expect(slugify('Fête de la Musique 2026')).toBe('fete-de-la-musique-2026')
  })

  it('supprime les accents', () => {
    expect(slugify('Réunion du Château')).toBe('reunion-du-chateau')
  })

  it('normalise les tirets multiples', () => {
    expect(slugify('A  B   C')).toBe('a-b-c')
  })
})

describe('createEvent', () => {
  it('redirige vers /connexion si pas de cookie', async () => {
    setupAuth(null)
    await expect(createEvent(null, makeFormData({}))).rejects.toThrow('REDIRECT:/connexion')
  })

  it('redirige vers /connexion si rôle insuffisant', async () => {
    setupAuth('visitor')
    await expect(createEvent(null, makeFormData({}))).rejects.toThrow('REDIRECT:/connexion')
  })

  it('retourne une erreur si champs obligatoires absents', async () => {
    setupAuth('agent')
    const result = await createEvent(null, makeFormData({ title: '', slug: '', startDate: '' }))
    expect(result).toEqual({ error: expect.stringContaining('obligatoires') })
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('crée un événement et redirige vers /agenda/[slug]', async () => {
    setupAuth('agent')
    const { create } = setupPayload()
    create.mockResolvedValue({ id: 1, slug: 'fete-musique' })

    const fd = makeFormData({
      title: 'Fête Musique',
      slug: 'fete-musique',
      startDate: '2026-06-21T18:00',
    })

    await expect(createEvent(null, fd)).rejects.toThrow('REDIRECT:/agenda/fete-musique')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'events',
        data: expect.objectContaining({ title: 'Fête Musique', slug: 'fete-musique' }),
      }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/agenda')
  })

  it('upload l\'image si un fichier est fourni', async () => {
    setupAuth('admin')
    const { create } = setupPayload()
    create.mockResolvedValueOnce({ id: 99 }).mockResolvedValueOnce({ id: 1, slug: 'test' })

    const file = new File(['img'], 'cover.jpg', { type: 'image/jpeg' })
    const fd = makeFormData({
      title: 'Test', slug: 'test', startDate: '2026-06-21T18:00',
    })
    fd.append('image', file)

    await expect(createEvent(null, fd)).rejects.toThrow('REDIRECT:/agenda/test')
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ collection: 'media' }))
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'events',
        data: expect.objectContaining({ image: 99 }),
      }),
    )
  })

  it('inclut la catégorie si renseignée', async () => {
    setupAuth('agent')
    const { create } = setupPayload()
    create.mockResolvedValue({ id: 1, slug: 'concert' })

    const fd = makeFormData({
      title: 'Concert', slug: 'concert', startDate: '2026-07-14T20:00', category: '3',
    })

    await expect(createEvent(null, fd)).rejects.toThrow('REDIRECT:/agenda/concert')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ category: 3 }),
      }),
    )
  })

  it('retourne une erreur si date de fin antérieure à la date de début', async () => {
    setupAuth('agent')
    const result = await createEvent(null, makeFormData({
      title: 'Fête', slug: 'fete', startDate: '2026-06-21T18:00', endDate: '2026-06-21T17:00',
    }))
    expect(result).toEqual({ error: expect.stringContaining('postérieure') })
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('retourne une erreur si date de fin égale à la date de début', async () => {
    setupAuth('agent')
    const result = await createEvent(null, makeFormData({
      title: 'Fête', slug: 'fete', startDate: '2026-06-21T18:00', endDate: '2026-06-21T18:00',
    }))
    expect(result).toEqual({ error: expect.stringContaining('postérieure') })
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('sauvegarde normalement si pas de date de fin', async () => {
    setupAuth('agent')
    const { create } = setupPayload()
    create.mockResolvedValue({ id: 1, slug: 'fete' })
    await expect(createEvent(null, makeFormData({
      title: 'Fête', slug: 'fete', startDate: '2026-06-21T18:00',
    }))).rejects.toThrow('REDIRECT:/agenda/fete')
  })

  it('sauvegarde normalement si date de fin valide', async () => {
    setupAuth('agent')
    const { create } = setupPayload()
    create.mockResolvedValue({ id: 1, slug: 'fete' })
    await expect(createEvent(null, makeFormData({
      title: 'Fête', slug: 'fete', startDate: '2026-06-21T18:00', endDate: '2026-06-21T20:00',
    }))).rejects.toThrow('REDIRECT:/agenda/fete')
  })
})

describe('updateEvent', () => {
  it('redirige vers /connexion si non authentifié', async () => {
    setupAuth(null)
    await expect(updateEvent(1, null, makeFormData({}))).rejects.toThrow('REDIRECT:/connexion')
  })

  it('retourne une erreur si champs obligatoires absents', async () => {
    setupAuth('agent')
    const result = await updateEvent(1, null, makeFormData({ title: '', slug: '', startDate: '' }))
    expect(result).toEqual({ error: expect.stringContaining('obligatoires') })
  })

  it('retourne une erreur si date de fin antérieure à la date de début', async () => {
    setupAuth('agent')
    const result = await updateEvent(1, null, makeFormData({
      title: 'Fête', slug: 'fete', startDate: '2026-06-21T18:00', endDate: '2026-06-21T17:00',
    }))
    expect(result).toEqual({ error: expect.stringContaining('postérieure') })
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('retourne une erreur si date de fin égale à la date de début', async () => {
    setupAuth('agent')
    const result = await updateEvent(1, null, makeFormData({
      title: 'Fête', slug: 'fete', startDate: '2026-06-21T18:00', endDate: '2026-06-21T18:00',
    }))
    expect(result).toEqual({ error: expect.stringContaining('postérieure') })
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('sauvegarde normalement si pas de date de fin', async () => {
    setupAuth('agent')
    const { update } = setupPayload()
    update.mockResolvedValue({ id: 1 })
    await expect(updateEvent(1, null, makeFormData({
      title: 'Fête', slug: 'fete', startDate: '2026-06-21T18:00',
    }))).rejects.toThrow('REDIRECT:/agenda/fete')
  })

  it('sauvegarde normalement si date de fin valide', async () => {
    setupAuth('agent')
    const { update } = setupPayload()
    update.mockResolvedValue({ id: 1 })
    await expect(updateEvent(1, null, makeFormData({
      title: 'Fête', slug: 'fete', startDate: '2026-06-21T18:00', endDate: '2026-06-21T20:00',
    }))).rejects.toThrow('REDIRECT:/agenda/fete')
  })

  it('met à jour l\'événement et redirige vers /agenda/[slug]', async () => {
    setupAuth('agent')
    const { update } = setupPayload()
    update.mockResolvedValue({ id: 1 })

    const fd = makeFormData({
      title: 'Concert modifié',
      slug: 'concert-modifie',
      startDate: '2026-08-01T19:00',
    })

    await expect(updateEvent(5, null, fd)).rejects.toThrow('REDIRECT:/agenda/concert-modifie')
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'events',
        id: 5,
        data: expect.objectContaining({ title: 'Concert modifié', slug: 'concert-modifie' }),
      }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/agenda')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/agenda/concert-modifie')
  })
})

describe('deleteEvent', () => {
  it('redirige vers /connexion si non authentifié', async () => {
    setupAuth(null)
    await expect(deleteEvent(1, new FormData())).rejects.toThrow('REDIRECT:/connexion')
  })

  it('supprime l\'événement et redirige vers /agenda', async () => {
    setupAuth('admin')
    const { del } = setupPayload()
    del.mockResolvedValue({})

    await expect(deleteEvent(3, new FormData())).rejects.toThrow('REDIRECT:/agenda')
    expect(del).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'events', id: 3 }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/agenda')
  })
})
