import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import EventDetailPage, { generateMetadata } from '../page'

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('@/components/events/EventArticle', () => ({
  EventArticle: ({ title, layout }: any) => (
    <main data-testid="event-article">
      <h1>{title}</h1>
      {layout?.length > 0 && <span data-testid="has-layout" />}
    </main>
  ),
}))

vi.mock('@/components/EditButton', () => ({
  EditButton: () => null,
}))

const mockGetPayloadClient = vi.mocked(getPayloadClient)
const mockNotFound = vi.mocked(notFound)

function publishedEventWhere(slug: string) {
  return {
    and: [
      { slug: { equals: slug } },
      { _status: { equals: 'published' } },
    ],
  }
}

function mockPayloadFind(docs: any[]) {
  const find = vi.fn().mockResolvedValue({ docs })
  mockGetPayloadClient.mockResolvedValue({ find } as any)
  return find
}

describe('EventDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches a published event by slug and renders EventArticle', async () => {
    const event = {
      id: 1,
      title: 'Concert du 14 juillet',
      slug: 'concert-14-juillet',
      startDate: '2026-07-14T20:00:00.000Z',
      layout: [{ id: 'b1', type: 'richText', html: '<p>Programme</p>' }],
    }
    const find = mockPayloadFind([event])

    const element = await EventDetailPage({
      params: Promise.resolve({ slug: 'concert-14-juillet' }),
    })

    expect(find).toHaveBeenCalledWith({
      collection: 'events',
      where: publishedEventWhere('concert-14-juillet'),
      depth: 1,
      limit: 1,
    })

    render(element as React.ReactElement)
    expect(screen.getByTestId('event-article')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Concert du 14 juillet')
    expect(screen.getByTestId('has-layout')).toBeInTheDocument()
  })

  it('calls notFound when no published event matches the slug', async () => {
    mockPayloadFind([])

    await expect(
      EventDetailPage({ params: Promise.resolve({ slug: 'inexistant' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the published event title', async () => {
    const find = mockPayloadFind([
      { id: 1, title: 'Fête du village', slug: 'fete-du-village' },
    ])

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'fete-du-village' }),
    })

    expect(find).toHaveBeenCalledWith({
      collection: 'events',
      where: publishedEventWhere('fete-du-village'),
      depth: 1,
      limit: 1,
    })
    expect(metadata).toEqual({ title: 'Fête du village' })
  })

  it('returns empty metadata when no published event matches the slug', async () => {
    mockPayloadFind([])

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'inexistant' }),
    })

    expect(metadata).toEqual({})
  })
})
