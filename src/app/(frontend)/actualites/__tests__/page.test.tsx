import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}))

vi.mock('@/components/news/NewsCard', () => ({
  NewsCard: ({ item }: any) => <div data-testid="news-card">{item.title}</div>,
}))

vi.mock('@/components/EditButton', () => ({
  EditButton: ({ href, label }: any) => <a data-testid="edit-button" href={href}>{label}</a>,
}))

import { getPayloadClient } from '@/lib/payload'
import NewsArchive from '../page'

const mockGetPayloadClient = vi.mocked(getPayloadClient)

function mockPayload(docs: any[], totalDocs = docs.length, totalPages = 1, hasNextPage = false, hasPrevPage = false) {
  const find = vi.fn().mockResolvedValue({ docs, totalDocs, totalPages, hasNextPage, hasPrevPage, page: 1 })
  mockGetPayloadClient.mockResolvedValue({ find } as any)
  return find
}

beforeEach(() => vi.clearAllMocks())

describe('NewsArchive page', () => {
  it('queries only published news', async () => {
    const find = mockPayload([])
    const element = await NewsArchive({ searchParams: Promise.resolve({}) })
    render(element as React.ReactElement)

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'news',
        where: expect.objectContaining({ _status: { equals: 'published' } }),
      }),
    )
  })

  it('uses page 1 by default', async () => {
    const find = mockPayload([])
    await NewsArchive({ searchParams: Promise.resolve({}) })

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 12 }),
    )
  })

  it('uses the page number from searchParams', async () => {
    const find = mockPayload([])
    await NewsArchive({ searchParams: Promise.resolve({ page: '3' }) })

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3 }),
    )
  })

  it('renders a NewsCard for each article', async () => {
    mockPayload([
      { id: '1', slug: 'a', title: 'Article A', publishedAt: '2026-01-01' },
      { id: '2', slug: 'b', title: 'Article B', publishedAt: '2026-01-02' },
    ])
    const element = await NewsArchive({ searchParams: Promise.resolve({}) })
    render(element as React.ReactElement)

    expect(screen.getAllByTestId('news-card')).toHaveLength(2)
    expect(screen.getByText('Article A')).toBeInTheDocument()
    expect(screen.getByText('Article B')).toBeInTheDocument()
  })

  it('renders the EditButton', async () => {
    mockPayload([])
    const element = await NewsArchive({ searchParams: Promise.resolve({}) })
    render(element as React.ReactElement)

    const btn = screen.getByTestId('edit-button')
    expect(btn).toHaveAttribute('href', '/actualites/new')
  })

  it('shows a "next page" link when hasNextPage is true', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [], totalDocs: 13, totalPages: 2, hasNextPage: true, hasPrevPage: false, page: 1 })
    mockGetPayloadClient.mockResolvedValue({ find } as any)

    const element = await NewsArchive({ searchParams: Promise.resolve({}) })
    render(element as React.ReactElement)

    expect(screen.getByRole('link', { name: /suivant/i })).toHaveAttribute('href', '?page=2')
  })

  it('shows a "previous page" link when hasPrevPage is true', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [], totalDocs: 25, totalPages: 3, hasNextPage: true, hasPrevPage: true, page: 2 })
    mockGetPayloadClient.mockResolvedValue({ find } as any)

    const element = await NewsArchive({ searchParams: Promise.resolve({ page: '2' }) })
    render(element as React.ReactElement)

    expect(screen.getByRole('link', { name: /précédent/i })).toHaveAttribute('href', '?page=1')
  })

  it('does not show pagination links when there is only one page', async () => {
    mockPayload([])
    const element = await NewsArchive({ searchParams: Promise.resolve({}) })
    render(element as React.ReactElement)

    expect(screen.queryByRole('link', { name: /suivant/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /précédent/i })).toBeNull()
  })
})
