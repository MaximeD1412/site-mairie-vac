import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PanneauPocketBlock } from '../PanneauPocketBlock'

describe('PanneauPocketBlock', () => {
  const originalEnv = process.env.NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL = originalEnv
  })

  it('renders <iframe> with the provided widgetUrl', () => {
    render(<PanneauPocketBlock widgetUrl="https://example.com/widget" />)
    const iframe = screen.getByTitle('PanneauPocket — informations et alertes locales')
    expect(iframe).toBeTruthy()
    expect(iframe.getAttribute('src')).toBe('https://example.com/widget')
  })

  it('falls back to process.env.NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL when widgetUrl is not provided', () => {
    process.env.NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL = 'https://env-widget.com'
    render(<PanneauPocketBlock />)
    const iframe = screen.getByTitle('PanneauPocket — informations et alertes locales')
    expect(iframe).toBeTruthy()
    expect(iframe.getAttribute('src')).toBe('https://env-widget.com')
  })

  it('renders a fallback <p> message when neither widgetUrl nor env var is set', () => {
    render(<PanneauPocketBlock />)
    const fallback = screen.getByText('Widget PanneauPocket non configuré.')
    expect(fallback).toBeTruthy()
    expect(fallback.tagName.toLowerCase()).toBe('p')
  })

  it('renders <h2> with title when provided', () => {
    render(
      <PanneauPocketBlock
        title="Informations locales"
        widgetUrl="https://example.com/widget"
      />
    )
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeTruthy()
    expect(heading.textContent).toBe('Informations locales')
  })

  it('does NOT render <h2> when title is null', () => {
    const { container } = render(
      <PanneauPocketBlock
        title={null}
        widgetUrl="https://example.com/widget"
      />
    )
    const h2 = container.querySelector('h2')
    expect(h2).toBeNull()
  })

  it('does NOT render <h2> when title is undefined', () => {
    const { container } = render(
      <PanneauPocketBlock widgetUrl="https://example.com/widget" />
    )
    const h2 = container.querySelector('h2')
    expect(h2).toBeNull()
  })
})
