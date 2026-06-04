import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/image', () => ({
  default: ({ fill, priority, ...props }: any) => <img {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

vi.mock('@/components/HtmlContent', () => ({
  HtmlContent: ({ html, className }: any) =>
    html ? <div data-testid="html-content" className={className} dangerouslySetInnerHTML={{ __html: html }} /> : null,
}))

import { NewsArticle } from '../NewsArticle'

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

  it('renders HTML content and a separator when content is provided', () => {
    const { container } = render(<NewsArticle title="Titre" content="<p>Contenu</p>" />)
    expect(screen.getByTestId('html-content')).toBeInTheDocument()
    expect(container.querySelector('hr')).toBeInTheDocument()
  })

  it('does not render content or separator when content is empty string', () => {
    const { container } = render(<NewsArticle title="Titre" content="" />)
    expect(screen.queryByTestId('html-content')).toBeNull()
    expect(container.querySelector('hr')).toBeNull()
  })

  it('does not render content or separator when content is absent', () => {
    const { container } = render(<NewsArticle title="Titre" />)
    expect(screen.queryByTestId('html-content')).toBeNull()
    expect(container.querySelector('hr')).toBeNull()
  })

  it('renders a link back to /actualites', () => {
    render(<NewsArticle title="Titre" />)
    expect(screen.getByRole('link', { name: /retour aux actualit/i })).toHaveAttribute('href', '/actualites')
  })
})
