import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock next/image to avoid Next.js internals in jsdom
vi.mock('next/image', () => ({ default: (props: Record<string, unknown>) => <img {...props} /> }))

import { renderText, renderNode, RichTextBlock } from '../RichTextBlock'

// ---------------------------------------------------------------------------
// renderText
// ---------------------------------------------------------------------------
describe('renderText', () => {
  it('returns plain string when format is 0', () => {
    const result = renderText({ type: 'text', text: 'hello', format: 0 })
    expect(result).toBe('hello')
  })

  it('wraps bold text in <strong>', () => {
    const { container } = render(<>{renderText({ type: 'text', text: 'bold', format: 1 })}</>)
    expect(container.querySelector('strong')).toBeTruthy()
    expect(container.querySelector('strong')?.textContent).toBe('bold')
  })

  it('wraps italic text in <em>', () => {
    const { container } = render(<>{renderText({ type: 'text', text: 'italic', format: 2 })}</>)
    expect(container.querySelector('em')).toBeTruthy()
  })

  it('wraps code text in <code>', () => {
    const { container } = render(<>{renderText({ type: 'text', text: 'code', format: 16 })}</>)
    expect(container.querySelector('code')).toBeTruthy()
  })

  it('wraps bold+italic text in both <strong> and <em> (format=3)', () => {
    const { container } = render(<>{renderText({ type: 'text', text: 'both', format: 3 })}</>)
    expect(container.querySelector('strong')).toBeTruthy()
    expect(container.querySelector('em')).toBeTruthy()
  })

  it('handles missing text gracefully (returns empty string)', () => {
    const result = renderText({ type: 'text', format: 0 })
    expect(result).toBe('')
  })
})

// ---------------------------------------------------------------------------
// renderNode
// ---------------------------------------------------------------------------
describe('renderNode', () => {
  it('renders a paragraph node as <p>', () => {
    const node = {
      type: 'paragraph',
      children: [{ type: 'text', text: 'Hello world', format: 0 }],
    }
    const { container } = render(<>{renderNode(node, 0)}</>)
    expect(container.querySelector('p')).toBeTruthy()
    expect(container.querySelector('p')?.textContent).toBe('Hello world')
  })

  it('renders a heading node as <h1>', () => {
    const node = {
      type: 'heading',
      tag: 'h1',
      children: [{ type: 'text', text: 'Title', format: 0 }],
    }
    const { container } = render(<>{renderNode(node, 0)}</>)
    expect(container.querySelector('h1')).toBeTruthy()
    expect(container.querySelector('h1')?.textContent).toBe('Title')
  })

  it('renders a heading node as <h2>', () => {
    const node = {
      type: 'heading',
      tag: 'h2',
      children: [{ type: 'text', text: 'Subtitle', format: 0 }],
    }
    const { container } = render(<>{renderNode(node, 0)}</>)
    expect(container.querySelector('h2')).toBeTruthy()
  })

  it('renders a text node as <span>', () => {
    const node = { type: 'text', text: 'Span text', format: 0 }
    const { container } = render(<>{renderNode(node, 0)}</>)
    expect(container.querySelector('span')).toBeTruthy()
    expect(container.querySelector('span')?.textContent).toBe('Span text')
  })

  it('renders a bullet list as <ul>', () => {
    const node = {
      type: 'list',
      listType: 'bullet',
      children: [
        {
          type: 'listitem',
          children: [{ type: 'text', text: 'Item 1', format: 0 }],
        },
      ],
    }
    const { container } = render(<>{renderNode(node, 0)}</>)
    expect(container.querySelector('ul')).toBeTruthy()
    expect(container.querySelector('li')).toBeTruthy()
  })

  it('renders a numbered list as <ol>', () => {
    const node = {
      type: 'list',
      listType: 'number',
      children: [
        {
          type: 'listitem',
          children: [{ type: 'text', text: 'Step 1', format: 0 }],
        },
      ],
    }
    const { container } = render(<>{renderNode(node, 0)}</>)
    expect(container.querySelector('ol')).toBeTruthy()
  })

  it('renders a listitem as <li>', () => {
    const node = {
      type: 'listitem',
      children: [{ type: 'text', text: 'List item', format: 0 }],
    }
    const { container } = render(<>{renderNode(node, 0)}</>)
    expect(container.querySelector('li')).toBeTruthy()
    expect(container.querySelector('li')?.textContent).toBe('List item')
  })

  it('renders a link node as <a> with href', () => {
    const node = {
      type: 'link',
      fields: { url: 'https://example.com', newTab: false },
      children: [{ type: 'text', text: 'Click me', format: 0 }],
    }
    const { container } = render(<>{renderNode(node, 0)}</>)
    const anchor = container.querySelector('a')
    expect(anchor).toBeTruthy()
    expect(anchor?.getAttribute('href')).toBe('https://example.com')
    expect(anchor?.textContent).toBe('Click me')
  })

  it('renders a link with newTab=true as target=_blank', () => {
    const node = {
      type: 'link',
      fields: { url: 'https://example.com', newTab: true },
      children: [{ type: 'text', text: 'External', format: 0 }],
    }
    const { container } = render(<>{renderNode(node, 0)}</>)
    const anchor = container.querySelector('a')
    expect(anchor?.getAttribute('target')).toBe('_blank')
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('renders a quote node as <blockquote>', () => {
    const node = {
      type: 'quote',
      children: [{ type: 'text', text: 'A quote', format: 0 }],
    }
    const { container } = render(<>{renderNode(node, 0)}</>)
    expect(container.querySelector('blockquote')).toBeTruthy()
  })

  it('renders a horizontalrule node as <hr>', () => {
    const node = { type: 'horizontalrule' }
    const { container } = render(<>{renderNode(node, 0)}</>)
    expect(container.querySelector('hr')).toBeTruthy()
  })

  it('renders a linebreak node as <br>', () => {
    const node = { type: 'linebreak' }
    const { container } = render(<>{renderNode(node, 0)}</>)
    expect(container.querySelector('br')).toBeTruthy()
  })

  it('returns null for unknown node types', () => {
    const node = { type: 'unknown_type' }
    const result = renderNode(node, 0)
    expect(result).toBeNull()
  })

  it('renders link with # href when no url provided', () => {
    const { container } = render(
      <>{renderNode({ type: 'link', children: [{ type: 'text', text: 'click', format: 0 }] }, 0)}</>
    )
    expect(container.querySelector('a')?.getAttribute('href')).toBe('#')
  })

  it('renders heading with invalid tag as h2', () => {
    const { container } = render(
      <>{renderNode({ type: 'heading', tag: 'invalid', children: [] }, 0)}</>
    )
    expect(container.querySelector('h2')).not.toBeNull()
  })

  it('returns null for youtube with invalid videoID', () => {
    const result = renderNode({ type: 'youtube', videoID: 'bad!id' }, 0)
    expect(result).toBeNull()
  })

  it('renders upload image with empty string alt when alt is missing', () => {
    const { container } = render(
      <>{renderNode({ type: 'upload', value: { url: '/img.jpg', mimeType: 'image/jpeg' } }, 0)}</>
    )
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('')
  })
})

// ---------------------------------------------------------------------------
// RichTextBlock
// ---------------------------------------------------------------------------
describe('RichTextBlock', () => {
  it('returns null when content is undefined', () => {
    const { container } = render(<RichTextBlock />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when content.root.children is empty', () => {
    const { container } = render(<RichTextBlock content={{ root: { children: [] } }} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when content.root is undefined', () => {
    const { container } = render(<RichTextBlock content={{}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders children of root into a <section>', () => {
    const content = {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Hello from root', format: 0 }],
          },
        ],
      },
    }
    const { container } = render(<RichTextBlock content={content} />)
    expect(container.querySelector('section')).toBeTruthy()
    expect(container.querySelector('p')?.textContent).toBe('Hello from root')
  })

  it('renders multiple root children', () => {
    const content = {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h1',
            children: [{ type: 'text', text: 'Title', format: 0 }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Body text', format: 0 }],
          },
        ],
      },
    }
    const { container } = render(<RichTextBlock content={content} />)
    expect(container.querySelector('h1')).toBeTruthy()
    expect(container.querySelector('p')).toBeTruthy()
  })
})
