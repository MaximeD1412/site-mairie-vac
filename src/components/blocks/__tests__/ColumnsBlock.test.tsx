import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('../../Blocks', () => ({
  RenderBlocks: ({ blocks }: { blocks?: any[] }) =>
    blocks?.length ? <div data-testid="render-blocks">{blocks.length} blocs</div> : null,
}))

import { ColumnsBlock } from '../ColumnsBlock'

describe('ColumnsBlock', () => {
  it('renders nothing when columns is empty', () => {
    const { container } = render(<ColumnsBlock columns={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders one region per column', () => {
    render(
      <ColumnsBlock
        columns={[
          { id: 'c1', widthPct: 50, blocks: [] },
          { id: 'c2', widthPct: 50, blocks: [] },
        ]}
      />,
    )
    const cols = screen.getAllByRole('region')
    expect(cols).toHaveLength(2)
  })

  it('applies widthPct values as fr units in gridTemplateColumns', () => {
    const { container } = render(
      <ColumnsBlock
        columns={[
          { id: 'c1', widthPct: 33, blocks: [] },
          { id: 'c2', widthPct: 67, blocks: [] },
        ]}
      />,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ gridTemplateColumns: '33fr 67fr' })
  })

  it('uses CSS grid for layout', () => {
    const { container } = render(
      <ColumnsBlock columns={[{ id: 'c1', widthPct: 50, blocks: [] }]} />,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ gridTemplateColumns: '50fr' })
  })

  it('renders sub-blocks inside each column via RenderBlocks', () => {
    render(
      <ColumnsBlock
        columns={[
          { id: 'c1', widthPct: 50, blocks: [{ type: 'richText', html: '<p>Hi</p>' }] },
          { id: 'c2', widthPct: 50, blocks: [] },
        ]}
      />,
    )
    expect(screen.getByTestId('render-blocks')).toBeInTheDocument()
  })
})
