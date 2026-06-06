import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/image', () => ({
  default: ({ fill, priority, sizes, ...props }: any) => <img {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

import { NewsCard } from '../NewsCard'

const baseItem = {
  id: '1',
  slug: 'mon-actualite',
  title: 'Mon actualité',
  summary: 'Un résumé court.',
  publishedAt: '2026-05-19T00:00:00.000Z',
  image: null,
}

describe('NewsCard', () => {
  it('renders the title as a link to the article', () => {
    render(<NewsCard item={baseItem} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/actualites/mon-actualite')
    expect(link).toHaveTextContent('Mon actualité')
  })

  it('renders the summary when provided', () => {
    render(<NewsCard item={baseItem} />)
    expect(screen.getByText('Un résumé court.')).toBeInTheDocument()
  })

  it('does not render a summary when absent', () => {
    render(<NewsCard item={{ ...baseItem, summary: null }} />)
    expect(screen.queryByText('Un résumé court.')).toBeNull()
  })

  it('renders the formatted date when publishedAt is provided', () => {
    render(<NewsCard item={baseItem} />)
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('does not render a date when publishedAt is absent', () => {
    render(<NewsCard item={{ ...baseItem, publishedAt: null }} />)
    expect(screen.queryByText(/2026/)).toBeNull()
  })

  it('renders the image when image url is provided', () => {
    const { container } = render(
      <NewsCard item={{ ...baseItem, image: { url: '/img.jpg' } }} />,
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/img.jpg')
  })

  it('does not render an img element when image is absent', () => {
    const { container } = render(<NewsCard item={baseItem} />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('uses the id as fallback href when slug is absent', () => {
    render(<NewsCard item={{ ...baseItem, slug: null }} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/actualites/1')
  })
})
