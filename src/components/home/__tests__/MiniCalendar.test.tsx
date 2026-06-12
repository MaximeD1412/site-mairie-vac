import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

import { MiniCalendar } from '../MiniCalendar'

const MAY_2026 = new Date(2026, 4, 1) // mai 2026

describe('MiniCalendar', () => {
  it('displays the current month name', () => {
    render(<MiniCalendar events={[]} initialDate={MAY_2026} />)
    expect(screen.getAllByText(/mai 2026/i).length).toBeGreaterThanOrEqual(1)
  })

  it('navigates to next month on click', () => {
    render(<MiniCalendar events={[]} initialDate={MAY_2026} />)
    fireEvent.click(screen.getByRole('button', { name: /mois suivant/i }))
    expect(screen.getAllByText(/juin 2026/i).length).toBeGreaterThanOrEqual(1)
  })

  it('navigates to previous month on click', () => {
    render(<MiniCalendar events={[]} initialDate={MAY_2026} />)
    fireEvent.click(screen.getByRole('button', { name: /mois précédent/i }))
    expect(screen.getAllByText(/avril 2026/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders day-of-week headers', () => {
    render(<MiniCalendar events={[]} initialDate={MAY_2026} />)
    expect(screen.getByText('Lu')).toBeInTheDocument()
    expect(screen.getByText('Di')).toBeInTheDocument()
  })

  it('renders day number 1 for the month', () => {
    render(<MiniCalendar events={[]} initialDate={MAY_2026} />)
    // Il y a plusieurs "1" possibles (1er du mois + 1er d'un autre mois)
    const cells = screen.getAllByText('1')
    expect(cells.length).toBeGreaterThanOrEqual(1)
  })

  it('renders a dot indicator for a single-day event in the displayed month', () => {
    const events = [{ id: '1', slug: 'e1', title: 'Test', startDate: '2026-05-15T10:00:00.000Z' }]
    render(<MiniCalendar events={events} initialDate={MAY_2026} />)
    expect(screen.getByTestId('indicator-dot-1')).toBeInTheDocument()
  })

  it('renders a bar indicator for a multi-day event', () => {
    const events = [{
      id: '1',
      slug: 'e1',
      title: 'Expo',
      startDate: '2026-05-25T10:00:00.000Z',
      endDate: '2026-05-27T17:00:00.000Z',
    }]
    render(<MiniCalendar events={events} initialDate={MAY_2026} />)
    expect(screen.getByTestId('indicator-bar-1')).toBeInTheDocument()
  })

  it('renders a link to the event on dot click', () => {
    const events = [{ id: '1', slug: 'evt-slug', title: 'Test', startDate: '2026-05-15T10:00:00.000Z' }]
    render(<MiniCalendar events={events} initialDate={MAY_2026} />)
    const dot = screen.getByTestId('indicator-dot-1')
    expect(dot.closest('a')).toHaveAttribute('href', '/agenda/evt-slug')
  })

  it('links to /agenda when multiple events share a dot day', () => {
    const events = [
      { id: '1', slug: 'e1', title: 'A', startDate: '2026-05-15T10:00:00.000Z' },
      { id: '2', slug: 'e2', title: 'B', startDate: '2026-05-15T14:00:00.000Z' },
    ]
    render(<MiniCalendar events={events} initialDate={MAY_2026} />)
    // Both dots on May 15 — the day cell link should point to /agenda
    const dot1 = screen.getByTestId('indicator-dot-1')
    expect(dot1.closest('a')).toHaveAttribute('href', '/agenda')
  })

  describe('légende des catégories', () => {
    const eventsWithCategories = [
      { id: '1', slug: 'e1', title: 'Fest', startDate: '2026-05-10T10:00:00.000Z', category: { color: '#ff0000', name: 'Sport' } },
      { id: '2', slug: 'e2', title: 'Expo', startDate: '2026-05-12T10:00:00.000Z', category: { color: '#00ff00', name: 'Culture' } },
    ]

    it('does not render legend when showLegend is not set', () => {
      render(<MiniCalendar events={eventsWithCategories} initialDate={MAY_2026} />)
      expect(screen.queryByRole('list', { name: /légende/i })).not.toBeInTheDocument()
    })

    it('renders legend with category names when showLegend is true', () => {
      render(<MiniCalendar events={eventsWithCategories} initialDate={MAY_2026} showLegend />)
      const legend = screen.getByRole('list', { name: /légende/i })
      expect(legend).toBeInTheDocument()
      expect(screen.getByText('Sport')).toBeInTheDocument()
      expect(screen.getByText('Culture')).toBeInTheDocument()
    })

    it('deduplicates categories with same name and color', () => {
      const events = [
        { id: '1', slug: 'e1', title: 'A', startDate: '2026-05-10T10:00:00.000Z', category: { color: '#ff0000', name: 'Sport' } },
        { id: '2', slug: 'e2', title: 'B', startDate: '2026-05-12T10:00:00.000Z', category: { color: '#ff0000', name: 'Sport' } },
      ]
      render(<MiniCalendar events={events} initialDate={MAY_2026} showLegend />)
      expect(screen.getAllByText('Sport')).toHaveLength(1)
    })

    it('does not render legend when no event has a named category', () => {
      const events = [
        { id: '1', slug: 'e1', title: 'Test', startDate: '2026-05-10T10:00:00.000Z' },
      ]
      render(<MiniCalendar events={events} initialDate={MAY_2026} showLegend />)
      expect(screen.queryByRole('list', { name: /légende/i })).not.toBeInTheDocument()
    })

    it('skips events whose category has no name', () => {
      const events = [
        { id: '1', slug: 'e1', title: 'A', startDate: '2026-05-10T10:00:00.000Z', category: { color: '#ff0000', name: 'Sport' } },
        { id: '2', slug: 'e2', title: 'B', startDate: '2026-05-12T10:00:00.000Z', category: { color: '#00ff00' } },
      ]
      render(<MiniCalendar events={events} initialDate={MAY_2026} showLegend />)
      expect(screen.getByText('Sport')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(1)
    })
  })
})
