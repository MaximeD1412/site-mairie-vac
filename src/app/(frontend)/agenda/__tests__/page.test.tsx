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

function makeCategory(overrides: Record<string, unknown> = {}) {
  return {
    id: Math.floor(Math.random() * 1000),
    name: 'Test Category',
    slug: 'test-category',
    color: '#3B82F6',
    ...overrides,
  }
}

function setupPayload(
  docs: unknown[],
  totalDocs = docs.length,
  categories: unknown[] = [],
) {
  const find = vi.fn().mockImplementation(({ collection }: { collection: string }) => {
    if (collection === 'event-categories') {
      return Promise.resolve({ docs: categories, totalDocs: categories.length })
    }
    return Promise.resolve({ docs, totalDocs, page: 1 })
  })
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
        collection: 'events',
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
    const callArg = find.mock.calls.find((c: any) => c[0].collection === 'events')![0]
    const threshold = new Date(callArg.where.startDate.greater_than_equal)
    expect(threshold.getTime()).toBeGreaterThanOrEqual(before - 1000)
    expect(threshold.getTime()).toBeLessThanOrEqual(after + 1000)
  })

  it('shows all events when ?past=1', async () => {
    const { find } = setupPayload([])
    await EventsArchive({ searchParams: Promise.resolve({ past: '1' }) })
    const callArg = find.mock.calls.find((c: any) => c[0].collection === 'events')![0]
    expect(callArg.where).not.toHaveProperty('startDate')
  })

  it('uses page 1 by default with limit 12', async () => {
    const { find } = setupPayload([])
    await EventsArchive({ searchParams: Promise.resolve({}) })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'events', limit: 12, page: 1 }),
    )
  })

  it('passes the page number from searchParams', async () => {
    const { find } = setupPayload([])
    await EventsArchive({ searchParams: Promise.resolve({ page: '3' }) })
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'events', page: 3 }))
  })

  it('sorts by startDate ascending', async () => {
    const { find } = setupPayload([])
    await EventsArchive({ searchParams: Promise.resolve({}) })
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'events', sort: 'startDate' }))
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

  // Category filter tests
  it('loads event categories from payload', async () => {
    const { find } = setupPayload([], 0, [makeCategory()])
    await EventsArchive({ searchParams: Promise.resolve({}) })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'event-categories',
      }),
    )
  })

  it('renders a chip for each category', async () => {
    const cats = [
      makeCategory({ name: 'Sport', slug: 'sport' }),
      makeCategory({ name: 'Culture', slug: 'culture' }),
    ]
    setupPayload([], 0, cats)
    const page = await EventsArchive({ searchParams: Promise.resolve({}) })
    render(page)
    expect(screen.getByRole('link', { name: 'Sport' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Culture' })).toBeInTheDocument()
  })

  it('renders an "Tous" chip that clears the category filter', async () => {
    setupPayload([], 0, [makeCategory({ slug: 'sport', name: 'Sport' })])
    const page = await EventsArchive({ searchParams: Promise.resolve({ category: 'sport' }) })
    render(page)
    expect(screen.getByRole('link', { name: /tous/i })).toBeInTheDocument()
  })

  it('marks the active category chip with aria-current="page"', async () => {
    const cats = [makeCategory({ name: 'Sport', slug: 'sport' })]
    setupPayload([], 0, cats)
    const page = await EventsArchive({ searchParams: Promise.resolve({ category: 'sport' }) })
    render(page)
    const chip = screen.getByRole('link', { name: 'Sport' })
    expect(chip).toHaveAttribute('aria-current', 'page')
  })

  it('does not mark inactive chips with aria-current', async () => {
    const cats = [
      makeCategory({ name: 'Sport', slug: 'sport' }),
      makeCategory({ name: 'Culture', slug: 'culture' }),
    ]
    setupPayload([], 0, cats)
    const page = await EventsArchive({ searchParams: Promise.resolve({ category: 'sport' }) })
    render(page)
    const cultureChip = screen.getByRole('link', { name: 'Culture' })
    expect(cultureChip).not.toHaveAttribute('aria-current', 'page')
  })

  it('filters events by category slug when ?category is provided', async () => {
    const { find } = setupPayload([], 0, [makeCategory({ slug: 'sport' })])
    await EventsArchive({ searchParams: Promise.resolve({ category: 'sport' }) })
    const eventsCall = find.mock.calls.find((c: any) => c[0].collection === 'events')![0]
    expect(eventsCall.where).toMatchObject({
      'category.slug': { equals: 'sport' },
    })
  })

  it('does not filter by category when no ?category param', async () => {
    const { find } = setupPayload([])
    await EventsArchive({ searchParams: Promise.resolve({}) })
    const eventsCall = find.mock.calls.find((c: any) => c[0].collection === 'events')![0]
    expect(eventsCall.where).not.toHaveProperty('category.slug')
  })

  it('preserves ?category in pagination links', async () => {
    setupPayload(
      Array.from({ length: 12 }, (_, i) => makeEvent({ slug: `ev-${i}` })),
      25,
      [makeCategory({ slug: 'sport' })],
    )
    const page = await EventsArchive({
      searchParams: Promise.resolve({ category: 'sport', page: '1' }),
    })
    render(page)
    expect(screen.getByRole('link', { name: /suivant/i })).toHaveAttribute(
      'href',
      '/agenda?category=sport&page=2',
    )
  })

  it('resets page to 1 in category chip links', async () => {
    const cats = [makeCategory({ name: 'Sport', slug: 'sport' })]
    setupPayload([], 0, cats)
    const page = await EventsArchive({ searchParams: Promise.resolve({ page: '3' }) })
    render(page)
    const chip = screen.getByRole('link', { name: 'Sport' })
    expect(chip.getAttribute('href')).toMatch(/[?&]page=1|(?!page=)/)
    expect(chip.getAttribute('href')).not.toMatch(/page=[2-9]/)
  })

  it('combines ?category, ?page, and ?past correctly', async () => {
    const { find } = setupPayload(
      Array.from({ length: 12 }, (_, i) => makeEvent({ slug: `ev-${i}` })),
      25,
      [makeCategory({ slug: 'sport' })],
    )
    const page = await EventsArchive({
      searchParams: Promise.resolve({ category: 'sport', page: '2', past: '1' }),
    })
    render(page)

    const eventsCall = find.mock.calls.find((c: any) => c[0].collection === 'events')![0]
    expect(eventsCall.where).toMatchObject({
      _status: { equals: 'published' },
      'category.slug': { equals: 'sport' },
    })
    expect(eventsCall.where).not.toHaveProperty('startDate')
    expect(eventsCall.page).toBe(2)

    expect(screen.getByRole('link', { name: /précédent/i })).toHaveAttribute(
      'href',
      '/agenda?past=1&category=sport&page=1',
    )
  })
})
