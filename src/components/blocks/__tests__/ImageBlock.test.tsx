import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }))

import { ImageBlock } from '../ImageBlock'

describe('ImageBlock', () => {
  it('returns null when image is null', () => {
    const { container } = render(<ImageBlock image={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when image is undefined', () => {
    const { container } = render(<ImageBlock />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when image is a string (not an object with url)', () => {
    const { container } = render(<ImageBlock image="https://example.com/photo.jpg" />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when image.url is missing', () => {
    const { container } = render(<ImageBlock image={{ alt: 'test', width: 800, height: 500 }} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when image.url is null', () => {
    const { container } = render(<ImageBlock image={{ url: null, alt: 'test', width: 800, height: 500 }} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders <figure> with <img> when image has url, width, height, alt', () => {
    render(
      <ImageBlock
        image={{ url: '/photo.jpg', alt: 'A photo', width: 1200, height: 600 }}
      />
    )
    expect(screen.getByRole('figure')).toBeTruthy()
    const img = screen.getByRole('img')
    expect(img).toBeTruthy()
    expect(img.getAttribute('src')).toBe('/photo.jpg')
    expect(img.getAttribute('alt')).toBe('A photo')
    expect(img.getAttribute('width')).toBe('1200')
    expect(img.getAttribute('height')).toBe('600')
  })

  it('renders <figcaption> when caption is provided', () => {
    render(
      <ImageBlock
        image={{ url: '/photo.jpg', alt: 'A photo', width: 800, height: 500 }}
        caption="This is a caption"
      />
    )
    const figcaption = screen.getByText('This is a caption')
    expect(figcaption.tagName.toLowerCase()).toBe('figcaption')
  })

  it('does NOT render <figcaption> when caption is null', () => {
    const { container } = render(
      <ImageBlock
        image={{ url: '/photo.jpg', alt: 'A photo', width: 800, height: 500 }}
        caption={null}
      />
    )
    expect(container.querySelector('figcaption')).toBeNull()
  })

  it('does NOT render <figcaption> when caption is undefined', () => {
    const { container } = render(
      <ImageBlock
        image={{ url: '/photo.jpg', alt: 'A photo', width: 800, height: 500 }}
      />
    )
    expect(container.querySelector('figcaption')).toBeNull()
  })

  it('uses width default (800) when width is not provided', () => {
    render(<ImageBlock image={{ url: '/photo.jpg', alt: 'test' }} />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('width')).toBe('800')
  })

  it('uses height default (500) when height is not provided', () => {
    render(<ImageBlock image={{ url: '/photo.jpg', alt: 'test' }} />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('height')).toBe('500')
  })
})
