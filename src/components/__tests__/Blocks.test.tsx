import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RenderBlocks } from '../Blocks'

vi.mock('../blocks/RichTextBlock', () => ({ RichTextBlock: () => <div data-testid="rich-text-block" /> }))
vi.mock('../blocks/ImageBlock', () => ({ ImageBlock: () => <div data-testid="image-block" /> }))
vi.mock('../blocks/QuickLinksBlock', () => ({ QuickLinksBlock: () => <div data-testid="quick-links-block" /> }))
vi.mock('../blocks/CollectionListBlock', () => ({ CollectionListBlock: () => <div data-testid="collection-list-block" /> }))
vi.mock('../blocks/PanneauPocketBlock', () => ({ PanneauPocketBlock: () => <div data-testid="panneau-pocket-block" /> }))
vi.mock('../blocks/ColumnsBlock', () => ({ ColumnsBlock: () => <div data-testid="columns-block" /> }))
vi.mock('../HtmlContent', () => ({ HtmlContent: () => <div data-testid="html-content" /> }))

describe('RenderBlocks', () => {
  it('returns null when blocks is undefined', () => {
    const { container } = render(<RenderBlocks />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when blocks is an empty array', () => {
    const { container } = render(<RenderBlocks blocks={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('routes blockType "richText" to RichTextBlock', () => {
    render(<RenderBlocks blocks={[{ blockType: 'richText', content: {} }]} />)
    expect(screen.getByTestId('rich-text-block')).toBeInTheDocument()
  })

  it('routes blockType "image" to ImageBlock', () => {
    render(<RenderBlocks blocks={[{ blockType: 'image', image: null, caption: '' }]} />)
    expect(screen.getByTestId('image-block')).toBeInTheDocument()
  })

  it('routes blockType "quickLinks" to QuickLinksBlock', () => {
    render(<RenderBlocks blocks={[{ blockType: 'quickLinks', links: [] }]} />)
    expect(screen.getByTestId('quick-links-block')).toBeInTheDocument()
  })

  it('routes blockType "collectionList" to CollectionListBlock', () => {
    render(<RenderBlocks blocks={[{ blockType: 'collectionList', collection: 'posts', limit: 5, title: 'Posts' }]} />)
    expect(screen.getByTestId('collection-list-block')).toBeInTheDocument()
  })

  it('routes blockType "panneauPocket" to PanneauPocketBlock', () => {
    render(<RenderBlocks blocks={[{ blockType: 'panneauPocket', title: 'Annonces', widgetUrl: 'https://example.com' }]} />)
    expect(screen.getByTestId('panneau-pocket-block')).toBeInTheDocument()
  })

  it('renders nothing for an unknown blockType', () => {
    const { container } = render(<RenderBlocks blocks={[{ blockType: 'unknown' }]} />)
    // The fragment wrapper exists but should contain no rendered block elements
    expect(container.querySelector('[data-testid]')).toBeNull()
  })

  // BlockEditor format (type discriminator)
  it('routes type "columns" to ColumnsBlock', () => {
    render(<RenderBlocks blocks={[{ type: 'columns', columns: [] }]} />)
    expect(screen.getByTestId('columns-block')).toBeInTheDocument()
  })

  it('routes blockType "columns" to ColumnsBlock', () => {
    render(<RenderBlocks blocks={[{ blockType: 'columns', columns: [] }]} />)
    expect(screen.getByTestId('columns-block')).toBeInTheDocument()
  })

  it('routes type "richText" with html to HtmlContent', () => {
    render(<RenderBlocks blocks={[{ type: 'richText', html: '<p>Hi</p>' }]} />)
    expect(screen.getByTestId('html-content')).toBeInTheDocument()
  })

  it('routes type "image" with url to ImageBlock', () => {
    render(<RenderBlocks blocks={[{ type: 'image', url: '/img.jpg', alt: 'Alt', caption: '' }]} />)
    expect(screen.getByTestId('image-block')).toBeInTheDocument()
  })

  it('routes type "video" with src to a video element', () => {
    const { container } = render(<RenderBlocks blocks={[{ type: 'video', src: '/v.mp4', isEmbed: false }]} />)
    expect(container.querySelector('video')).toBeInTheDocument()
  })

  it('routes type "video" with isEmbed=true to an iframe', () => {
    const { container } = render(<RenderBlocks blocks={[{ type: 'video', src: 'https://youtube.com/embed/abc', isEmbed: true }]} />)
    expect(container.querySelector('iframe')).toBeInTheDocument()
  })

  it('renders multiple blocks when multiple block objects are provided', () => {
    render(
      <RenderBlocks
        blocks={[
          { blockType: 'richText', content: {} },
          { blockType: 'image', image: null },
          { blockType: 'quickLinks', links: [] },
        ]}
      />,
    )
    expect(screen.getByTestId('rich-text-block')).toBeInTheDocument()
    expect(screen.getByTestId('image-block')).toBeInTheDocument()
    expect(screen.getByTestId('quick-links-block')).toBeInTheDocument()
  })
})
