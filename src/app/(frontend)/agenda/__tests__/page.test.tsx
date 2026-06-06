import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}))
vi.mock('@/components/EditButton', () => ({
  EditButton: ({ href, label }: any) => <a href={href}>{label}</a>,
}))
vi.mock('@/components/events/EventCard', () => ({
  EventCard: ({ title, slug }: any) => <div data-testid="event-card" data-slug={slug}>{title}</div>,
}))

import { getPayloadClient } from '@/lib/payload'
import EventsArchive from '../page'

const mockGetPayloadClient = vi.mocked(getPayloadClient)

function makeEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: Math.random(),
    slug: 'test-event',
    title: 'Test Event',
    startDate: new Date(Date.now() + 86400000).toISOString(),
    _status: 'published',
    ...overrides,
  }
}

function setupPayload(docs: unknown[], totalDocs = docs.length) {
  const find = vi.fn().mockResolvedValue({ docs, totalDocs, page: 1 })
  mockGetPayloadClient.mockResolvedValue({ find } as any)
  return { find }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('EventsArchive page', () => {
  it('renders the Agenda heading', async () => {
    setupPayload([])
    const page = await EventsArchive({ searchParams: Promise.resolve({}) })
    render(page)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Agenda')
  })

  it('renders an EventCard for each event', async () => {
    const events = [makeEvent({ slug: 'ev-1', title: 'Event 1' }), makeEvent({ slug: 'ev-2', title: 'Event 2' })]
    setupPayload(events)
    const page = await EventsArchive({ searchParams: Promise.resolve({}) })
    render(page)
    expect(screen.getAllByTestId('event-card')).toHaveLength(2)
  })

  it('queries only published events', async () => {
    const { find } = setupPayload([])
    await EventsArchive({ searchParams: Promise.resolve({}) })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          _status: { equals: 'published' },
        }),
      }),
    )
  })

  it('hides past events by default (startDate >= now)', async () => {
    const { find } = setupPayload([])
    const before = Date.now()
    await EventsArchive({ searchParams: Promise.resolve({}) })
    const after = Date.now()
    const callArg = find.mock.calls[0][0]
    const threshold = new Date(callArg.where.startDate.greater_than_equal)
    expect(threshold.getTime()).toBeGreaterThanOrEqual(before - 1000)
    expect(threshold.getTime()).toBeLessThanOrEqual(after + 1000)
  })

  it('shows all events when ?past=1', async () => {
    const { find } = setupPayload([])
    await EventsArchive({ searchParams: Promise.resolve({ past: '1' }) })
    const callArg = find.mock.calls[0][0]
    expect(callArg.where).not.toHaveProperty('startDate')
  })

  it('uses page 1 by default with limit 12', async () => {
    const { find } = setupPayload([])
    await EventsArchive({ searchParams: Promise.resolve({}) })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 12, page: 1 }),
    )
  })

  it('passes the page number from searchParams', async () => {
    const { find } = setupPayload([])
    await EventsArchive({ searchParams: Promise.resolve({ page: '3' }) })
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }))
  })

  it('sorts by startDate ascending', async () => {
    const { find } = setupPayload([])
    await EventsArchive({ searchParams: Promise.resolve({}) })
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ sort: 'startDate' }))
  })

  it('renders an EditButton for agents', async () => {
    setupPayload([])
    const page = await EventsArchive({ searchParams: Promise.resolve({}) })
    render(page)
    expect(screen.getByRole('link', { name: /nouvel événement/i })).toBeInTheDocument()
  })

  it('shows previous page link when page > 1', async () => {
    setupPayload([], 25)
    const page = await EventsArchive({ searchParams: Promise.resolve({ page: '2' }) })
    render(page)
    expect(screen.getByRole('link', { name: /précédent/i })).toHaveAttribute('href', '/agenda?page=1')
  })

  it('shows next page link when there are more pages', async () => {
    setupPayload(Array.from({ length: 12 }, (_, i) => makeEvent({ slug: `ev-${i}` })), 25)
    const page = await EventsArchive({ searchParams: Promise.resolve({ page: '1' }) })
    render(page)
    expect(screen.getByRole('link', { name: /suivant/i })).toHaveAttribute('href', '/agenda?page=2')
  })

  it('preserves ?past=1 in pagination links', async () => {
    setupPayload(Array.from({ length: 12 }, (_, i) => makeEvent({ slug: `ev-${i}` })), 25)
    const page = await EventsArchive({ searchParams: Promise.resolve({ page: '1', past: '1' }) })
    render(page)
    expect(screen.getByRole('link', { name: /suivant/i })).toHaveAttribute('href', '/agenda?past=1&page=2')
  })
})
