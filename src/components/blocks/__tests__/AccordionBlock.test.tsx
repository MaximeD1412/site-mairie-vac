import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('../RichTextBlock', () => ({
  RichTextBlock: () => <div data-testid="richtext" />,
}))

import { AccordionBlock } from '../AccordionBlock'

describe('AccordionBlock', () => {
  it('returns null when items is undefined', () => {
    const { container } = render(<AccordionBlock />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when items is an empty array', () => {
    const { container } = render(<AccordionBlock items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a <section> when items has entries', () => {
    const { container } = render(<AccordionBlock items={[{ title: 'Q1' }]} />)
    expect(container.querySelector('section')).toBeTruthy()
  })

  it('renders a button for each item with the item title', () => {
    render(
      <AccordionBlock items={[{ title: 'Question 1' }, { title: 'Question 2' }]} />,
    )
    expect(screen.getByText('Question 1')).toBeTruthy()
    expect(screen.getByText('Question 2')).toBeTruthy()
  })

  it('panels are hidden by default', () => {
    render(<AccordionBlock items={[{ title: 'Q' }]} />)
    const panel = document.getElementById('accordion-panel-0')
    expect(panel?.classList.contains('hidden')).toBe(true)
  })

  it('opens the panel on click and updates aria-expanded', () => {
    render(<AccordionBlock items={[{ title: 'Q' }]} />)
    const button = screen.getByRole('button', { name: /Q/ })
    expect(button.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBe('true')
    const panel = document.getElementById('accordion-panel-0')
    expect(panel?.classList.contains('hidden')).toBe(false)
  })

  it('closes the panel on a second click', () => {
    render(<AccordionBlock items={[{ title: 'Q' }]} />)
    const button = screen.getByRole('button', { name: /Q/ })

    fireEvent.click(button)
    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBe('false')
    const panel = document.getElementById('accordion-panel-0')
    expect(panel?.classList.contains('hidden')).toBe(true)
  })

  it('button has aria-controls matching panel id', () => {
    render(<AccordionBlock items={[{ title: 'Q' }]} />)
    const button = screen.getByRole('button', { name: /Q/ })
    expect(button.getAttribute('aria-controls')).toBe('accordion-panel-0')
  })

  it('opening one item closes the previously open item', () => {
    render(
      <AccordionBlock items={[{ title: 'Item 1' }, { title: 'Item 2' }]} />,
    )
    const btn1 = screen.getByRole('button', { name: /Item 1/ })
    const btn2 = screen.getByRole('button', { name: /Item 2/ })

    fireEvent.click(btn1)
    expect(btn1.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(btn2)
    expect(btn1.getAttribute('aria-expanded')).toBe('false')
    expect(btn2.getAttribute('aria-expanded')).toBe('true')
  })
})
