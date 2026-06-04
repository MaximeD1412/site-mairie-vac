import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import NewsDetailPage, { generateMetadata } from '../page'

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('@/components/news/NewsArticle', () => ({
  NewsArticle: ({ title, publishedAt, summary, image, content }: any) => (
    <article data-testid="news-article">
      <h1>{title}</h1>
      <span>{publishedAt}</span>
      <p>{summary}</p>
      {image && <span data-testid="has-image" />}
      {content && <span data-testid="has-content" />}
    </article>
  ),
}))

vi.mock('@/components/EditButton', () => ({
  EditButton: () => null,
}))

const mockGetPayloadClient = vi.mocked(getPayloadClient)
const mockNotFound = vi.mocked(notFound)

function publishedNewsWhere(slug: string) {
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

describe('NewsDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches a published article by slug and renders NewsArticle', async () => {
    const article = {
      id: 1,
      title: 'Conseil municipal',
      slug: 'conseil-municipal',
      summary: 'Compte rendu du dernier conseil.',
      publishedAt: '2026-05-19T00:00:00.000Z',
      image: { url: '/image.jpg' },
      content: { root: { children: [{ type: 'paragraph', children: [] }] } },
    }
    const find = mockPayloadFind([article])

    const element = await NewsDetailPage({
      params: Promise.resolve({ slug: 'conseil-municipal' }),
    })

    expect(find).toHaveBeenCalledWith({
      collection: 'news',
      where: publishedNewsWhere('conseil-municipal'),
      depth: 1,
      limit: 1,
    })

    render(element as React.ReactElement)
    expect(screen.getByTestId('news-article')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Conseil municipal')
    expect(screen.getByText('Compte rendu du dernier conseil.')).toBeInTheDocument()
    expect(screen.getByTestId('has-image')).toBeInTheDocument()
    expect(screen.getByTestId('has-content')).toBeInTheDocument()
  })

  it('calls notFound when no published article matches the slug', async () => {
    mockPayloadFind([])

    await expect(
      NewsDetailPage({ params: Promise.resolve({ slug: 'inexistant' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the published article title and summary', async () => {
    const find = mockPayloadFind([
      {
        id: 1,
        title: 'Titre metadata',
        slug: 'titre-metadata',
        summary: 'Résumé metadata',
        publishedAt: '2026-05-19T00:00:00.000Z',
      },
    ])

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'titre-metadata' }),
    })

    expect(find).toHaveBeenCalledWith({
      collection: 'news',
      where: publishedNewsWhere('titre-metadata'),
      limit: 1,
    })
    expect(metadata).toEqual({
      title: 'Titre metadata',
      description: 'Résumé metadata',
    })
  })

  it('returns empty metadata when no published article matches the slug', async () => {
    mockPayloadFind([])

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'inexistant' }),
    })

    expect(metadata).toEqual({})
  })
})
