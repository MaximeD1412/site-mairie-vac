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
vi.mock('@/actions/events', () => ({ updateEvent: vi.fn(), deleteEvent: vi.fn() }))
vi.mock('@/components/EventForm', () => ({
  EventForm: ({ event, deleteAction }: { event?: unknown; deleteAction?: unknown }) => (
    <div
      data-testid="event-form"
      data-has-event={!!event}
      data-has-delete={!!deleteAction}
    />
  ),
}))

import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { decodePayloadToken } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import EventModifierPage from '../page'

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

const existingEvent = {
  id: 1,
  title: 'Fête de la Musique',
  slug: 'fete-de-la-musique',
  startDate: '2026-06-21T18:00:00.000Z',
  updatedAt: '',
  createdAt: '',
}

function setupPayload(eventDocs: unknown[] = [existingEvent]) {
  const find = vi
    .fn()
    .mockResolvedValueOnce({ docs: eventDocs })
    .mockResolvedValueOnce({ docs: [] })
    .mockResolvedValueOnce({ docs: [] })
  mockGetPayloadClient.mockResolvedValue({ find } as any)
  return { find }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('EventModifierPage', () => {
  it('redirige vers /connexion si non authentifié', async () => {
    setupAuth(null)
    await expect(
      EventModifierPage({ params: Promise.resolve({ slug: 'fete-de-la-musique' }) }),
    ).rejects.toThrow('REDIRECT:/connexion')
  })

  it('redirige vers /connexion si rôle insuffisant', async () => {
    setupAuth('visitor')
    await expect(
      EventModifierPage({ params: Promise.resolve({ slug: 'fete-de-la-musique' }) }),
    ).rejects.toThrow('REDIRECT:/connexion')
  })

  it('appelle notFound si l\'événement n\'existe pas', async () => {
    setupAuth('agent')
    setupPayload([])

    await expect(
      EventModifierPage({ params: Promise.resolve({ slug: 'inexistant' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('affiche le formulaire pré-rempli pour un agent', async () => {
    setupAuth('agent')
    setupPayload()

    const element = await EventModifierPage({
      params: Promise.resolve({ slug: 'fete-de-la-musique' }),
    })
    render(element as React.ReactElement)

    const form = screen.getByTestId('event-form')
    expect(form).toBeInTheDocument()
    expect(form).toHaveAttribute('data-has-event', 'true')
    expect(form).toHaveAttribute('data-has-delete', 'true')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/modifier/i)
  })

  it('affiche le formulaire pour un admin connecté', async () => {
    setupAuth('admin')
    setupPayload()

    const element = await EventModifierPage({
      params: Promise.resolve({ slug: 'fete-de-la-musique' }),
    })
    render(element as React.ReactElement)
    expect(screen.getByTestId('event-form')).toBeInTheDocument()
  })
})
