import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/image', () => ({ default: (props: Record<string, unknown>) => <img {...props as any} /> }))
vi.mock('next/link', () => ({ default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a> }))
vi.mock('@/components/blocks/RichTextBlock', () => ({
  RichTextBlock: ({ content }: any) => content ? <div data-testid="rich-text" /> : null,
}))

import { EventArticle } from '../EventArticle'

describe('EventArticle', () => {
  it('renders the title as h1', () => {
    render(<EventArticle title="Concert d'été" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Concert d'été")
  })

  it('renders a link back to /agenda', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.getByRole('link', { name: /retour à l'agenda/i })).toHaveAttribute('href', '/agenda')
  })

  it('renders the category badge with name from object', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" category={{ name: 'Culture', color: '#DB2777' }} />)
    expect(screen.getByText('Culture')).toBeInTheDocument()
  })

  it('applies category color to badge', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" category={{ name: 'Sport', color: '#059669' }} />)
    const badge = screen.getByText('Sport')
    expect(badge).toHaveStyle({ color: '#059669' })
  })

  it('does not render a badge when category is absent', () => {
    const { container } = render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(container.querySelector('.rounded-full')).toBeNull()
  })

  it('renders just the start time when endDate is absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    const dateText = screen.getByTestId('event-date').textContent ?? ''
    expect(dateText).toContain('·')
    expect(dateText).not.toContain('–')
    expect(dateText).not.toMatch(/^Du /)
  })

  it('renders a time range when endDate is the same day', () => {
    render(
      <EventArticle
        title="Titre"
        startDate="2026-06-20T12:00:00.000Z"
        endDate="2026-06-20T16:00:00.000Z"
      />
    )
    const dateText = screen.getByTestId('event-date').textContent ?? ''
    expect(dateText).toContain('·')
    expect(dateText).toContain('–')
    expect(dateText).not.toMatch(/^Du /)
  })

  it('renders a multi-day range when endDate is a different day', () => {
    render(
      <EventArticle
        title="Titre"
        startDate="2026-06-20T12:00:00.000Z"
        endDate="2026-06-22T12:00:00.000Z"
      />
    )
    const dateText = screen.getByTestId('event-date').textContent ?? ''
    expect(dateText).toMatch(/^Du /)
    expect(dateText).toContain(' au ')
  })

  it('renders the location when provided', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" location="Salle des fêtes" />)
    expect(screen.getByText(/Salle des fêtes/)).toBeInTheDocument()
  })

  it('does not render a location row when location is absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.queryByTestId('event-location')).toBeNull()
  })

  it('renders the organizer name when provided', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" organizer={{ name: 'Association Lecture' }} />)
    expect(screen.getByText(/Association Lecture/)).toBeInTheDocument()
  })

  it('does not render organizer when absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.queryByTestId('event-organizer')).toBeNull()
  })

  it('does not render organizer when relation is a number (unresolved id)', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" organizer={42 as any} />)
    expect(screen.queryByTestId('event-organizer')).toBeNull()
  })

  it('renders the hero image when image url is provided', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" image={{ url: '/img.jpg' }} />)
    expect(screen.getByRole('img', { name: 'Titre' })).toBeInTheDocument()
  })

  it('does not render an image element when image is absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders richtext content when description is provided', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" description={{ root: { children: [] } }} />)
    expect(screen.getByTestId('rich-text')).toBeInTheDocument()
  })

  it('does not render richtext when description is absent', () => {
    render(<EventArticle title="Titre" startDate="2026-06-20T12:00:00.000Z" />)
    expect(screen.queryByTestId('rich-text')).toBeNull()
  })
})
