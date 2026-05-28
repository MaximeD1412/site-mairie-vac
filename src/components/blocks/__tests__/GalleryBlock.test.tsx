import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }))

vi.mock('yet-another-react-lightbox/styles.css', () => ({}))

// next/dynamic returns a stub without calling the import function at all
vi.mock('next/dynamic', () => ({
  default: (_importFn: any, _opts?: any) =>
    function LightboxStub({ open, close, index: slideIndex }: any) {
      if (!open) return null
      return (
        <div role="dialog" aria-label="lightbox" data-index={slideIndex}>
          <button onClick={close}>Fermer</button>
        </div>
      )
    },
}))

import { GalleryBlock } from '../GalleryBlock'

const makeItem = (url: string, alt = 'photo', width = 800, height = 600) => ({
  image: { url, alt, width, height },
})

describe('GalleryBlock', () => {
  it('returns null when images is undefined', () => {
    const { container } = render(<GalleryBlock />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when images is null', () => {
    const { container } = render(<GalleryBlock images={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when images is an empty array', () => {
    const { container } = render(<GalleryBlock images={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when all items have no valid image object', () => {
    const { container } = render(
      <GalleryBlock images={[{ image: null }, { image: 'not-an-object' }]} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders a <section> when images has valid items', () => {
    const { container } = render(<GalleryBlock images={[makeItem('/a.jpg')]} />)
    expect(container.querySelector('section')).toBeTruthy()
  })

  it('renders a grid <ul> with one <li> per image', () => {
    render(
      <GalleryBlock
        images={[makeItem('/a.jpg'), makeItem('/b.jpg'), makeItem('/c.jpg')]}
      />
    )
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
  })

  it('renders each image with correct src and alt', () => {
    render(
      <GalleryBlock
        images={[
          makeItem('/a.jpg', 'Photo A'),
          makeItem('/b.jpg', 'Photo B'),
        ]}
      />
    )
    const imgs = screen.getAllByRole('img')
    expect(imgs[0].getAttribute('src')).toBe('/a.jpg')
    expect(imgs[0].getAttribute('alt')).toBe('Photo A')
    expect(imgs[1].getAttribute('src')).toBe('/b.jpg')
    expect(imgs[1].getAttribute('alt')).toBe('Photo B')
  })

  it('renders buttons with aria-label from image alt', () => {
    render(<GalleryBlock images={[makeItem('/a.jpg', 'Vue aérienne')]} />)
    const btn = screen.getByRole('button', { name: 'Vue aérienne' })
    expect(btn).toBeTruthy()
  })

  it('falls back to "Image N" aria-label when alt is empty', () => {
    render(<GalleryBlock images={[{ image: { url: '/a.jpg', alt: '', width: 400, height: 300 } }]} />)
    const btn = screen.getByRole('button', { name: 'Image 1' })
    expect(btn).toBeTruthy()
  })

  it('does not render lightbox initially', () => {
    render(<GalleryBlock images={[makeItem('/a.jpg')]} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens lightbox when an image button is clicked', () => {
    render(
      <GalleryBlock
        images={[makeItem('/a.jpg', 'First'), makeItem('/b.jpg', 'Second')]}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Second' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('passes the correct slide index when opening lightbox', () => {
    render(
      <GalleryBlock
        images={[makeItem('/a.jpg', 'First'), makeItem('/b.jpg', 'Second')]}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Second' }))
    expect(screen.getByRole('dialog').getAttribute('data-index')).toBe('1')
  })

  it('closes lightbox when close is called', () => {
    render(<GalleryBlock images={[makeItem('/a.jpg', 'First')]} />)
    fireEvent.click(screen.getByRole('button', { name: 'First' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('skips items where image is a string (not resolved)', () => {
    render(
      <GalleryBlock
        images={[
          { image: 'unresolved-id' },
          makeItem('/real.jpg', 'Real'),
        ]}
      />
    )
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(1)
    expect(imgs[0].getAttribute('src')).toBe('/real.jpg')
  })
})
