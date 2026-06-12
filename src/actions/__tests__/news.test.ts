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
vi.mock('../working-copies', () => ({
  deleteWorkingCopy: vi.fn(),
  saveWorkingCopy: vi.fn(),
}))

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { decodePayloadToken } from '@/lib/auth'
import { createNews, updateNews, deleteNews } from '../news'
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
    expect(slugify('Conseil Municipal 2026')).toBe('conseil-municipal-2026')
  })

  it('supprime les accents', () => {
    expect(slugify('Réunion du Château')).toBe('reunion-du-chateau')
  })

  it('supprime les caractères spéciaux', () => {
    expect(slugify('Fête & Événements !')).toBe('fete-evenements')
  })

  it('normalise les tirets multiples', () => {
    expect(slugify('A  B   C')).toBe('a-b-c')
  })
})

describe('createNews', () => {
  it('redirige vers /connexion si pas de cookie', async () => {
    setupAuth(null)
    await expect(createNews(null, makeFormData({}))).rejects.toThrow('REDIRECT:/connexion')
  })

  it('redirige vers /connexion si rôle insuffisant', async () => {
    setupAuth('visitor')
    await expect(createNews(null, makeFormData({}))).rejects.toThrow('REDIRECT:/connexion')
  })

  it('retourne une erreur si champs obligatoires absents', async () => {
    setupAuth('agent')
    const result = await createNews(null, makeFormData({ title: '', slug: '', summary: '', publishedAt: '' }))
    expect(result).toEqual({ error: expect.stringContaining('obligatoires') })
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('crée une actualité et redirige vers /actualites/[slug]', async () => {
    setupAuth('agent')
    const { create } = setupPayload()
    create.mockResolvedValue({ id: 1, slug: 'mon-titre' })

    const fd = makeFormData({
      title: 'Mon titre',
      slug: 'mon-titre',
      summary: 'Résumé test',
      publishedAt: '2026-01-01',
      layout: '[]',
    })

    await expect(createNews(null, fd)).rejects.toThrow('REDIRECT:/actualites/mon-titre')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'news',
        data: expect.objectContaining({ title: 'Mon titre', slug: 'mon-titre' }),
      }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/actualites')
  })

  it('crée avec _status published par défaut', async () => {
    setupAuth('agent')
    const { create } = setupPayload()
    create.mockResolvedValue({ id: 1, slug: 'mon-titre' })

    await expect(createNews(null, makeFormData({
      title: 'Mon titre', slug: 'mon-titre', summary: 'Résumé', publishedAt: '2026-01-01',
    }))).rejects.toThrow('REDIRECT:/actualites/mon-titre')

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ _status: 'published' }) }),
    )
  })

  it('crée avec _status draft si _intentStatus vaut draft', async () => {
    setupAuth('agent')
    const { create } = setupPayload()
    create.mockResolvedValue({ id: 1, slug: 'mon-titre' })

    await expect(createNews(null, makeFormData({
      title: 'Mon titre', slug: 'mon-titre', summary: 'Résumé', publishedAt: '2026-01-01', _intentStatus: 'draft',
    }))).rejects.toThrow('REDIRECT:/actualites/mon-titre')

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ _status: 'draft' }) }),
    )
  })

  it('upload l\'image si un fichier est fourni', async () => {
    setupAuth('admin')
    const { create } = setupPayload()
    create.mockResolvedValueOnce({ id: 99 }).mockResolvedValueOnce({ id: 1, slug: 'test' })

    const file = new File(['img'], 'cover.jpg', { type: 'image/jpeg' })
    const fd = makeFormData({
      title: 'Test', slug: 'test', summary: 'Résumé', publishedAt: '2026-01-01',
    })
    fd.append('image', file)

    await expect(createNews(null, fd)).rejects.toThrow('REDIRECT:/actualites/test')
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ collection: 'media' }))
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'news',
        data: expect.objectContaining({ image: 99 }),
      }),
    )
  })
})

describe('updateNews', () => {
  it('redirige vers /connexion si non authentifié', async () => {
    setupAuth(null)
    await expect(updateNews(1, null, makeFormData({}))).rejects.toThrow('REDIRECT:/connexion')
  })

  it('retourne une erreur si champs obligatoires absents', async () => {
    setupAuth('agent')
    const result = await updateNews(1, null, makeFormData({ title: '', slug: '', summary: '', publishedAt: '' }))
    expect(result).toEqual({ error: expect.stringContaining('obligatoires') })
  })

  it('met à jour l\'actualité et redirige vers /actualites/[slug]', async () => {
    setupAuth('agent')
    const { update } = setupPayload()
    update.mockResolvedValue({ id: 1 })

    const fd = makeFormData({
      title: 'Titre modifié',
      slug: 'titre-modifie',
      summary: 'Nouveau résumé',
      publishedAt: '2026-02-01',
      layout: '[]',
    })

    await expect(updateNews(5, null, fd)).rejects.toThrow('REDIRECT:/actualites/titre-modifie')
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'news',
        id: 5,
        data: expect.objectContaining({ title: 'Titre modifié', slug: 'titre-modifie' }),
      }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/actualites')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/actualites/titre-modifie')
  })
})

  it('met à jour avec _status draft si _intentStatus vaut draft', async () => {
    setupAuth('agent')
    const { update } = setupPayload()
    update.mockResolvedValue({ id: 1 })

    await expect(updateNews(5, null, makeFormData({
      title: 'Titre', slug: 'titre', summary: 'Résumé', publishedAt: '2026-01-01', _intentStatus: 'draft',
    }))).rejects.toThrow('REDIRECT:/actualites/titre')

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ _status: 'draft' }) }),
    )
  })

  it('met à jour avec _status published par défaut', async () => {
    setupAuth('agent')
    const { update } = setupPayload()
    update.mockResolvedValue({ id: 1 })

    await expect(updateNews(5, null, makeFormData({
      title: 'Titre', slug: 'titre', summary: 'Résumé', publishedAt: '2026-01-01',
    }))).rejects.toThrow('REDIRECT:/actualites/titre')

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ _status: 'published' }) }),
    )
  })
})

describe('deleteNews', () => {
  it('redirige vers /connexion si non authentifié', async () => {
    setupAuth(null)
    await expect(deleteNews(1, new FormData())).rejects.toThrow('REDIRECT:/connexion')
  })

  it('supprime l\'actualité et redirige vers /actualites', async () => {
    setupAuth('admin')
    const { del } = setupPayload()
    del.mockResolvedValue({})

    await expect(deleteNews(3, new FormData())).rejects.toThrow('REDIRECT:/actualites')
    expect(del).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'news', id: 3 }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/actualites')
  })
})
