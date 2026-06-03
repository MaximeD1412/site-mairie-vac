import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/image', () => ({
  default: ({ fill, priority, ...props }: any) => <img {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

vi.mock('@/components/blocks/RichTextBlock', () => ({
  RichTextBlock: ({ content }: any) =>
    content?.root?.children?.length ? <div data-testid="rich-text" /> : null,
}))

import { NewsArticle } from '../NewsArticle'

const contentWithChildren = {
  root: {
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Contenu', format: 0 }],
      },
    ],
  },
}

describe('NewsArticle', () => {
  it('renders the article title as h1', () => {
    render(<NewsArticle title="Mon article" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mon article')
  })

  it('renders the date when publishedAt is provided', () => {
    render(<NewsArticle title="Titre" publishedAt="2026-05-19T00:00:00.000Z" />)
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('does not render a date when publishedAt is absent', () => {
    render(<NewsArticle title="Titre" />)
    expect(screen.queryByText(/janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre/i)).toBeNull()
  })

  it('renders the summary when provided', () => {
    render(<NewsArticle title="Titre" summary="Un résumé court" />)
    expect(screen.getByText('Un résumé court')).toBeInTheDocument()
  })

  it('does not render a summary element when summary is absent', () => {
    render(<NewsArticle title="Titre" />)
    expect(screen.queryByText(/résumé/)).toBeNull()
  })

  it('renders the hero image as decorative when image url is provided', () => {
    const { container } = render(<NewsArticle title="Titre" image={{ url: '/img.jpg' }} />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/img.jpg')
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('does not render an image element when image is absent', () => {
    render(<NewsArticle title="Titre" />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders richtext content and a separator when content has children', () => {
    const { container } = render(<NewsArticle title="Titre" content={contentWithChildren} />)
    expect(screen.getByTestId('rich-text')).toBeInTheDocument()
    expect(container.querySelector('hr')).toBeInTheDocument()
  })

  it('does not render richtext or separator when content is empty', () => {
    const { container } = render(<NewsArticle title="Titre" content={{ root: { children: [] } }} />)
    expect(screen.queryByTestId('rich-text')).toBeNull()
    expect(container.querySelector('hr')).toBeNull()
  })

  it('does not render richtext or separator when content is absent', () => {
    const { container } = render(<NewsArticle title="Titre" />)
    expect(screen.queryByTestId('rich-text')).toBeNull()
    expect(container.querySelector('hr')).toBeNull()
  })

  it('renders a link back to /actualites', () => {
    render(<NewsArticle title="Titre" />)
    expect(screen.getByRole('link', { name: /retour aux actualit/i })).toHaveAttribute('href', '/actualites')
  })
})
