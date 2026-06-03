import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ButtonBlock } from '../ButtonBlock'

describe('ButtonBlock', () => {
  it('renders an anchor with the given text and url', () => {
    render(<ButtonBlock text="En savoir plus" url="/page" variant="primary" />)
    const link = screen.getByRole('link', { name: 'En savoir plus' })
    expect(link.getAttribute('href')).toBe('/page')
  })

  it('applies primary variant classes', () => {
    render(<ButtonBlock text="CTA" url="/cta" variant="primary" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('bg-primary')
    expect(link.className).not.toContain('border')
  })

  it('applies secondary variant classes', () => {
    render(<ButtonBlock text="CTA" url="/cta" variant="secondary" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('border-primary')
    expect(link.className).toContain('text-primary')
    expect(link.className).not.toContain('text-white')
  })
})
