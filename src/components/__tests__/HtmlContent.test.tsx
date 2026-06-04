import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { HtmlContent } from '../HtmlContent'

describe('HtmlContent', () => {
  it('renders plain HTML content', () => {
    const { container } = render(<HtmlContent html="<p>Bonjour</p>" />)
    expect(container.querySelector('p')).toHaveTextContent('Bonjour')
  })

  it('returns null when html is null', () => {
    const { container } = render(<HtmlContent html={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when html is undefined', () => {
    const { container } = render(<HtmlContent html={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when html is empty string', () => {
    const { container } = render(<HtmlContent html="" />)
    expect(container.firstChild).toBeNull()
  })

  it('strips script tags (XSS)', () => {
    const { container } = render(
      <HtmlContent html='<p>Texte</p><script>alert("xss")</script>' />
    )
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('p')).toHaveTextContent('Texte')
  })

  it('strips event handlers (XSS)', () => {
    const { container } = render(
      <HtmlContent html='<p onclick="alert(1)">Texte</p>' />
    )
    const p = container.querySelector('p')
    expect(p).toBeInTheDocument()
    expect(p).not.toHaveAttribute('onclick')
  })

  it('strips javascript: hrefs (XSS)', () => {
    const { container } = render(
      <HtmlContent html='<a href="javascript:alert(1)">lien</a>' />
    )
    const a = container.querySelector('a')
    // sanitize-html keeps the <a> tag but removes the dangerous href
    expect(a).not.toHaveAttribute('href')
  })

  it('preserves allowed structural tags', () => {
    const { container } = render(
      <HtmlContent html="<h2>Titre</h2><p>Para</p><ul><li>Item</li></ul>" />
    )
    expect(container.querySelector('h2')).toHaveTextContent('Titre')
    expect(container.querySelector('p')).toHaveTextContent('Para')
    expect(container.querySelector('li')).toHaveTextContent('Item')
  })

  it('applies className to the wrapper', () => {
    const { container } = render(<HtmlContent html="<p>Test</p>" className="prose" />)
    expect(container.firstChild).toHaveClass('prose')
  })
})
