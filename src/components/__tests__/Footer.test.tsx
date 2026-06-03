import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from '../Footer'

describe('Footer', () => {
  it('renders a link to the accessibility declaration page', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /accessibilité/i })
    expect(link).toHaveAttribute('href', '/accessibilite')
  })
})
