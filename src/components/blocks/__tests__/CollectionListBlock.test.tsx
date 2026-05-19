import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { getPayloadClient } from '@/lib/payload'
import { formatDate, CollectionListBlock } from '../CollectionListBlock'

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}))

const mockGetPayloadClient = getPayloadClient as ReturnType<typeof vi.fn>

describe('formatDate', () => {
  it('formats a date string to French locale', () => {
    const result = formatDate('2024-01-15')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })
})

describe('CollectionListBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders news items', async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          { id: '1', title: 'Test News', slug: 'test-news', publishedAt: '2024-01-15', summary: 'A summary' },
        ],
      }),
    })

    const html = renderToStaticMarkup(
      await CollectionListBlock({ collection: 'news' }) as React.ReactElement
    )
    expect(html).toContain('Test News')
    expect(html).toContain('/actualites/test-news')
  })

  it('renders events items', async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          { id: '1', title: 'Test Event', slug: 'test-event', startDate: '2024-06-01' },
        ],
      }),
    })

    const html = renderToStaticMarkup(
      await CollectionListBlock({ collection: 'events' }) as React.ReactElement
    )
    expect(html).toContain('Test Event')
    expect(html).toContain('/agenda/test-event')
  })

  it('renders with a title when provided', async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    })

    const html = renderToStaticMarkup(
      await CollectionListBlock({ collection: 'news', title: 'Mes actualités' }) as React.ReactElement
    )
    expect(html).toContain('Mes actualités')
  })

  it('renders null for unknown collection', async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    })

    const result = await CollectionListBlock({ collection: 'unknown' as any })
    expect(result).toBeNull()
  })
})
