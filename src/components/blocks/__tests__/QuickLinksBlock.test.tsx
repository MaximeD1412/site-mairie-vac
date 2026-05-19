import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import { QuickLinksBlock } from '../QuickLinksBlock'

describe('QuickLinksBlock', () => {
  it('returns null when links is undefined', () => {
    const { container } = render(<QuickLinksBlock />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when links is an empty array', () => {
    const { container } = render(<QuickLinksBlock links={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a <section> when links has items', () => {
    const { container } = render(
      <QuickLinksBlock links={[{ label: 'Accueil', url: '/' }]} />,
    )
    expect(container.querySelector('section')).toBeTruthy()
  })

  it('renders each link as an <a> with correct href and label', () => {
    render(
      <QuickLinksBlock
        links={[
          { label: 'Accueil', url: '/' },
          { label: 'Contact', url: '/contact' },
        ]}
      />,
    )
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0].getAttribute('href')).toBe('/')
    expect(links[0].textContent).toContain('Accueil')
    expect(links[1].getAttribute('href')).toBe('/contact')
    expect(links[1].textContent).toContain('Contact')
  })

  it('renders description <p> when description is provided', () => {
    render(
      <QuickLinksBlock
        links={[{ label: 'Accueil', url: '/', description: 'Page principale' }]}
      />,
    )
    const p = screen.getByText('Page principale')
    expect(p.tagName.toLowerCase()).toBe('p')
  })

  it('does NOT render description when description is null', () => {
    const { container } = render(
      <QuickLinksBlock
        links={[{ label: 'Accueil', url: '/', description: null }]}
      />,
    )
    expect(container.querySelector('p')).toBeNull()
  })

  it('does NOT render description when description is undefined', () => {
    const { container } = render(
      <QuickLinksBlock links={[{ label: 'Accueil', url: '/' }]} />,
    )
    expect(container.querySelector('p')).toBeNull()
  })
})
