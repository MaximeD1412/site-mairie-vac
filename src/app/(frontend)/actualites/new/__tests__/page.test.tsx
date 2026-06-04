import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`) }),
}))
vi.mock('@/lib/auth', () => ({ decodePayloadToken: vi.fn() }))
vi.mock('@/actions/news', () => ({ createNews: vi.fn() }))
vi.mock('@/components/NewsForm', () => ({
  NewsForm: ({ action }: { action: unknown }) => (
    <div data-testid="news-form" data-action={typeof action} />
  ),
}))

import { cookies } from 'next/headers'
import { decodePayloadToken } from '@/lib/auth'
import NewsNewPage from '../page'

const mockCookies = vi.mocked(cookies)
const mockDecodePayloadToken = vi.mocked(decodePayloadToken)

function setupAuth(role: string | null) {
  const cookieStore = {
    get: vi.fn().mockReturnValue(role ? { value: 'fake-token' } : undefined),
  }
  mockCookies.mockResolvedValue(cookieStore as any)
  mockDecodePayloadToken.mockReturnValue(role ? ({ role } as any) : null)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NewsNewPage', () => {
  it('redirige vers /connexion si non authentifié', async () => {
    setupAuth(null)
    await expect(NewsNewPage()).rejects.toThrow('REDIRECT:/connexion')
  })

  it('redirige vers /connexion si rôle insuffisant', async () => {
    setupAuth('visitor')
    await expect(NewsNewPage()).rejects.toThrow('REDIRECT:/connexion')
  })

  it('affiche le formulaire pour un agent connecté', async () => {
    setupAuth('agent')
    const element = await NewsNewPage()
    render(element as React.ReactElement)
    expect(screen.getByTestId('news-form')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/nouvelle actualité/i)
  })

  it('affiche le formulaire pour un admin connecté', async () => {
    setupAuth('admin')
    const element = await NewsNewPage()
    render(element as React.ReactElement)
    expect(screen.getByTestId('news-form')).toBeInTheDocument()
  })
})
