import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`) }),
}))
vi.mock('@/lib/auth', () => ({ decodePayloadToken: vi.fn() }))
vi.mock('@/lib/payload', () => ({ getPayloadClient: vi.fn() }))
vi.mock('@/actions/events', () => ({ createEvent: vi.fn() }))
vi.mock('@/components/EventForm', () => ({
  EventForm: ({ action }: { action: unknown }) => (
    <div data-testid="event-form" data-action={typeof action} />
  ),
}))

import { cookies } from 'next/headers'
import { decodePayloadToken } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import EventNewPage from '../page'

const mockCookies = vi.mocked(cookies)
const mockDecodePayloadToken = vi.mocked(decodePayloadToken)
const mockGetPayloadClient = vi.mocked(getPayloadClient)

function setupAuth(role: string | null) {
  const cookieStore = {
    get: vi.fn().mockReturnValue(role ? { value: 'fake-token' } : undefined),
  }
  mockCookies.mockResolvedValue(cookieStore as any)
  mockDecodePayloadToken.mockReturnValue(role ? ({ role } as any) : null)
}

function setupPayload() {
  const find = vi.fn().mockResolvedValue({ docs: [] })
  mockGetPayloadClient.mockResolvedValue({ find } as any)
  return { find }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('EventNewPage', () => {
  const noSearchParams = { searchParams: Promise.resolve({}) }

  it('redirige vers /connexion si non authentifié', async () => {
    setupAuth(null)
    await expect(EventNewPage(noSearchParams)).rejects.toThrow('REDIRECT:/connexion')
  })

  it('redirige vers /connexion si rôle insuffisant', async () => {
    setupAuth('visitor')
    await expect(EventNewPage(noSearchParams)).rejects.toThrow('REDIRECT:/connexion')
  })

  it('affiche le formulaire pour un agent connecté', async () => {
    setupAuth('agent')
    setupPayload()
    const element = await EventNewPage(noSearchParams)
    render(element as React.ReactElement)
    expect(screen.getByTestId('event-form')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/nouvel événement/i)
  })

  it('affiche le formulaire pour un admin connecté', async () => {
    setupAuth('admin')
    setupPayload()
    const element = await EventNewPage(noSearchParams)
    render(element as React.ReactElement)
    expect(screen.getByTestId('event-form')).toBeInTheDocument()
  })
})
