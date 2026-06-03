import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/dynamic', () => ({
  default: (_loader: any, _opts: any) =>
    function MockLeafletMap({ lat, lng }: { lat: number; lng: number }) {
      return <div data-testid="leaflet-map" data-lat={lat} data-lng={lng} />
    },
}))

import { MapBlock } from '../MapBlock'

describe('MapBlock', () => {
  it('renders the LeafletMap with correct lat/lng', () => {
    render(<MapBlock lat={48.8566} lng={2.3522} />)
    const map = screen.getByTestId('leaflet-map')
    expect(map).toBeTruthy()
    expect(map.getAttribute('data-lat')).toBe('48.8566')
    expect(map.getAttribute('data-lng')).toBe('2.3522')
  })

  it('renders <h2> when title is provided', () => {
    render(<MapBlock lat={48.8566} lng={2.3522} title="Mairie" />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.textContent).toBe('Mairie')
  })

  it('does NOT render <h2> when title is null', () => {
    const { container } = render(<MapBlock lat={48.8566} lng={2.3522} title={null} />)
    expect(container.querySelector('h2')).toBeNull()
  })

  it('does NOT render <h2> when title is undefined', () => {
    const { container } = render(<MapBlock lat={48.8566} lng={2.3522} />)
    expect(container.querySelector('h2')).toBeNull()
  })

  it('renders address <p> when address is provided', () => {
    render(<MapBlock lat={48.8566} lng={2.3522} address="1 Place de la Mairie" />)
    const p = screen.getByText('1 Place de la Mairie')
    expect(p.tagName.toLowerCase()).toBe('p')
  })

  it('does NOT render address <p> when address is null', () => {
    const { container } = render(<MapBlock lat={48.8566} lng={2.3522} address={null} />)
    expect(container.querySelector('p')).toBeNull()
  })
})
