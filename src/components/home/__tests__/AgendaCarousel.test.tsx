import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }))
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

import { AgendaCarousel, type CarouselEvent } from '../AgendaCarousel'

const makeEvent = (i: number, overrides: Partial<CarouselEvent> = {}): CarouselEvent => ({
  id: `${i}`,
  slug: `event-${i}`,
  title: `Événement ${i}`,
  startDate: '2026-06-10T19:00:00.000Z',
  ...overrides,
})

describe('AgendaCarousel', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders nothing when events is empty', () => {
    const { container } = render(<AgendaCarousel events={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the first event title', () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2)]} />)
    expect(screen.getAllByText('Événement 1')[0]).toBeInTheDocument()
  })

  it('renders a link to the event slug', () => {
    render(<AgendaCarousel events={[makeEvent(1)]} />)
    expect(screen.getByRole('link', { name: /Événement 1/i })).toHaveAttribute('href', '/agenda/event-1')
  })

  it('advances to next event after 5 seconds', async () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2)]} />)
    const track = screen.getByTestId('carousel-track')
    await act(async () => { vi.advanceTimersByTime(5000) })
    expect(track).toHaveAttribute('data-current-index', '1')
    expect(track).toHaveStyle({ transform: 'translateY(-360px)' })
  })

  it('wraps around from last to first', async () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2)]} />)
    const track = screen.getByTestId('carousel-track')
    await act(async () => { vi.advanceTimersByTime(5000) })
    expect(track).toHaveAttribute('data-current-index', '1')
    await act(async () => { vi.advanceTimersByTime(5000) })
    expect(track).toHaveAttribute('data-current-index', '0')
    expect(track).toHaveStyle({ transform: 'translateY(0px)' })
  })

  it('navigates down on next button click', () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2), makeEvent(3)]} />)
    const track = screen.getByTestId('carousel-track')
    fireEvent.click(screen.getByRole('button', { name: /suivant/i }))
    expect(track).toHaveAttribute('data-current-index', '1')
    expect(track).toHaveStyle({ transform: 'translateY(-360px)' })
  })

  it('navigates up on prev button click', () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2), makeEvent(3)]} />)
    const track = screen.getByTestId('carousel-track')
    fireEvent.click(screen.getByRole('button', { name: /suivant/i }))
    fireEvent.click(screen.getByRole('button', { name: /précédent/i }))
    expect(track).toHaveAttribute('data-current-index', '0')
    expect(track).toHaveStyle({ transform: 'translateY(0px)' })
  })

  it('keeps a cloned first slide after the last event for the peek pattern', () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2)]} />)
    expect(screen.getAllByTestId('carousel-slide')).toHaveLength(3)
    expect(screen.getAllByText('Événement 1')).toHaveLength(2)
  })

  it('renders image when event has one', () => {
    const events = [makeEvent(1, { image: { url: '/img.jpg', alt: 'Photo' } })]
    render(<AgendaCarousel events={events} />)
    expect(screen.getByRole('img', { name: 'Photo' })).toBeInTheDocument()
  })

  it('renders category badge with name and color', () => {
    const events = [makeEvent(1, { category: { name: 'Culture', color: '#DB2777' } })]
    render(<AgendaCarousel events={events} />)
    const badge = screen.getByText('Culture')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ color: '#DB2777' })
  })

  it('renders dot indicators equal to event count', () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2), makeEvent(3)]} />)
    const dots = screen.getAllByTestId('carousel-dot')
    expect(dots).toHaveLength(3)
  })

  it('does not render arrows when only one event', () => {
    render(<AgendaCarousel events={[makeEvent(1)]} />)
    expect(screen.queryByRole('button', { name: /suivant/i })).toBeNull()
  })

  it('resets the 5-second timer after manual navigation', async () => {
    render(<AgendaCarousel events={[makeEvent(1), makeEvent(2), makeEvent(3)]} />)
    const track = screen.getByTestId('carousel-track')
    await act(async () => { vi.advanceTimersByTime(3000) }) // 3s into first 5s window
    fireEvent.click(screen.getByRole('button', { name: /suivant/i })) // navigate at t=3s
    await act(async () => { vi.advanceTimersByTime(3000) }) // only 3s since click
    expect(track).toHaveAttribute('data-current-index', '1') // should NOT have auto-advanced yet
    await act(async () => { vi.advanceTimersByTime(2000) }) // now 5s since click
    expect(track).toHaveAttribute('data-current-index', '2') // NOW auto-advances
  })
})
