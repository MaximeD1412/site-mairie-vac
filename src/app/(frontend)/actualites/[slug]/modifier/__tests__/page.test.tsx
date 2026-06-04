import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`) }),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))
vi.mock('@/lib/auth', () => ({ decodePayloadToken: vi.fn() }))
vi.mock('@/lib/payload', () => ({ getPayloadClient: vi.fn() }))
vi.mock('@/actions/news', () => ({ updateNews: vi.fn(), deleteNews: vi.fn() }))
vi.mock('@/components/NewsForm', () => ({
  NewsForm: ({ news, deleteAction }: { news?: unknown; deleteAction?: unknown }) => (
    <div
      data-testid="news-form"
      data-has-news={!!news}
      data-has-delete={!!deleteAction}
    />
  ),
}))

import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { decodePayloadToken } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import NewsModifierPage from '../page'

const mockCookies = vi.mocked(cookies)
const mockDecodePayloadToken = vi.mocked(decodePayloadToken)
const mockGetPayloadClient = vi.mocked(getPayloadClient)
const mockNotFound = vi.mocked(notFound)

function setupAuth(role: string | null) {
  const cookieStore = {
    get: vi.fn().mockReturnValue(role ? { value: 'fake-token' } : undefined),
  }
  mockCookies.mockResolvedValue(cookieStore as any)
  mockDecodePayloadToken.mockReturnValue(role ? ({ role } as any) : null)
}

const existingNews = {
  id: 1,
  title: 'Conseil Municipal',
  slug: 'conseil-municipal',
  summary: 'Résumé',
  publishedAt: '2026-01-01T00:00:00.000Z',
  featured: false,
  content: '<p>Contenu</p>',
  updatedAt: '',
  createdAt: '',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NewsModifierPage', () => {
  it('redirige vers /connexion si non authentifié', async () => {
    setupAuth(null)
    await expect(
      NewsModifierPage({ params: Promise.resolve({ slug: 'conseil-municipal' }) }),
    ).rejects.toThrow('REDIRECT:/connexion')
  })

  it('redirige vers /connexion si rôle insuffisant', async () => {
    setupAuth('visitor')
    await expect(
      NewsModifierPage({ params: Promise.resolve({ slug: 'conseil-municipal' }) }),
    ).rejects.toThrow('REDIRECT:/connexion')
  })

  it('appelle notFound si l\'actualité n\'existe pas', async () => {
    setupAuth('agent')
    const find = vi.fn().mockResolvedValue({ docs: [] })
    mockGetPayloadClient.mockResolvedValue({ find } as any)

    await expect(
      NewsModifierPage({ params: Promise.resolve({ slug: 'inexistant' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('affiche le formulaire pré-rempli pour un agent', async () => {
    setupAuth('agent')
    const find = vi.fn().mockResolvedValue({ docs: [existingNews] })
    mockGetPayloadClient.mockResolvedValue({ find } as any)

    const element = await NewsModifierPage({
      params: Promise.resolve({ slug: 'conseil-municipal' }),
    })
    render(element as React.ReactElement)

    const form = screen.getByTestId('news-form')
    expect(form).toBeInTheDocument()
    expect(form).toHaveAttribute('data-has-news', 'true')
    expect(form).toHaveAttribute('data-has-delete', 'true')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/modifier/i)
  })
})
