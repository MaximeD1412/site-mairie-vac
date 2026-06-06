import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/image', () => ({ default: (props: Record<string, unknown>) => <img {...props as any} /> }))
vi.mock('next/link', () => ({ default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a> }))

import { EventCard } from '../EventCard'

const baseProps = {
  slug: 'concert-ete',
  title: "Concert d'été",
  startDate: '2026-07-20T18:00:00.000Z',
}

describe('EventCard', () => {
  it('renders the title as a link to /agenda/[slug]', () => {
    render(<EventCard {...baseProps} />)
    const link = screen.getByRole('link', { name: /concert d'été/i })
    expect(link).toHaveAttribute('href', '/agenda/concert-ete')
  })

  it('renders the formatted start date', () => {
    render(<EventCard {...baseProps} />)
    expect(screen.getByTestId('event-card-date')).toBeInTheDocument()
    expect(screen.getByTestId('event-card-date').textContent).toContain('·')
  })

  it('renders the location when provided', () => {
    render(<EventCard {...baseProps} location="Salle des fêtes" />)
    expect(screen.getByTestId('event-card-location')).toHaveTextContent('Salle des fêtes')
  })

  it('does not render a location element when absent', () => {
    render(<EventCard {...baseProps} />)
    expect(screen.queryByTestId('event-card-location')).toBeNull()
  })

  it('renders the category badge with name and color', () => {
    render(<EventCard {...baseProps} category={{ name: 'Culture', color: '#DB2777' }} />)
    const badge = screen.getByTestId('event-card-badge')
    expect(badge).toHaveTextContent('Culture')
    expect(badge).toHaveStyle({ color: '#DB2777' })
  })

  it('does not render a badge when category is absent', () => {
    render(<EventCard {...baseProps} />)
    expect(screen.queryByTestId('event-card-badge')).toBeNull()
  })

  it('renders an image when provided', () => {
    render(<EventCard {...baseProps} image={{ url: '/img.jpg', alt: 'photo' }} />)
    expect(screen.getByRole('img', { name: 'photo' })).toBeInTheDocument()
  })

  it('does not render an image when absent', () => {
    render(<EventCard {...baseProps} />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('uses title as img alt when image alt is absent', () => {
    render(<EventCard {...baseProps} image={{ url: '/img.jpg' }} />)
    expect(screen.getByRole('img', { name: "Concert d'été" })).toBeInTheDocument()
  })
})
