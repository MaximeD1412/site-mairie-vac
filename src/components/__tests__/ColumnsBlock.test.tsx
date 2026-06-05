import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  DragEndEvent: {},
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: {},
  horizontalListSortingStrategy: {},
  arrayMove: vi.fn((arr: unknown[], from: number, to: number) => {
    const result = [...arr]
    const [item] = result.splice(from, 1)
    result.splice(to, 0, item)
    return result
  }),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: vi.fn(() => '') } },
}))

vi.mock('../RichEditor', () => ({
  RichEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div data-testid="rich-editor">
      <textarea data-testid="rich-editor-textarea" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  ),
}))

vi.mock('../MediaLibraryModal', () => ({
  MediaLibraryModal: ({
    onSelect,
    onClose,
  }: {
    onSelect: (url: string, alt: string) => void
    onClose: () => void
  }) => (
    <div role="dialog" data-testid="media-library-modal">
      <button onClick={() => onSelect('/media/test.jpg', 'Test alt')}>Choisir image</button>
      <button onClick={onClose}>Fermer</button>
    </div>
  ),
}))

import { BlockEditor, snapColumnWidths, type Block, type ColumnsBlock as ColumnsBlockType } from '../BlockEditor'

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Cycle 1 — bouton + Colonnes activé, crée un ColumnsBlock 2 colonnes 50/50
// ---------------------------------------------------------------------------
describe('BlockEditor — ajout d\'un ColumnsBlock', () => {
  it('le bouton + Colonnes est présent et activé', () => {
    render(<BlockEditor value={[]} onChange={vi.fn()} />)
    const btn = screen.getByRole('button', { name: '+ Colonnes' })
    expect(btn).toBeInTheDocument()
    expect(btn).not.toBeDisabled()
  })

  it('cliquer sur + Colonnes appelle onChange avec un ColumnsBlock 2 colonnes 50/50', () => {
    const onChange = vi.fn()
    render(<BlockEditor value={[]} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '+ Colonnes' }))
    expect(onChange).toHaveBeenCalledOnce()
    const [newBlocks] = onChange.mock.calls[0] as [Block[]]
    expect(newBlocks).toHaveLength(1)
    const col = newBlocks[0] as ColumnsBlockType
    expect(col.type).toBe('columns')
    expect(col.columns).toHaveLength(2)
    expect(col.columns[0].widthPct).toBe(50)
    expect(col.columns[1].widthPct).toBe(50)
    expect(col.columns[0].blocks).toEqual([])
    expect(col.columns[1].blocks).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Cycle 2 — le ColumnsBlock se rend avec ses colonnes
// ---------------------------------------------------------------------------
describe('ColumnsBlock — rendu', () => {
  const colBlock: ColumnsBlockType = {
    id: 'cb1',
    type: 'columns',
    columns: [
      { id: 'c1', widthPct: 50, blocks: [] },
      { id: 'c2', widthPct: 50, blocks: [] },
    ],
  }

  it('rend autant de régions de colonnes que de colonnes définies', () => {
    render(<BlockEditor value={[colBlock]} onChange={vi.fn()} />)
    const cols = screen.getAllByRole('region', { name: /colonne \d+/i })
    expect(cols).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// Cycle 3 — la toolbar interne d'une colonne n'inclut pas + Colonnes
// ---------------------------------------------------------------------------
describe('ColumnsBlock — toolbar interne sans nesting', () => {
  const colBlock: ColumnsBlockType = {
    id: 'cb1',
    type: 'columns',
    columns: [
      { id: 'c1', widthPct: 50, blocks: [] },
      { id: 'c2', widthPct: 50, blocks: [] },
    ],
  }

  it('les toolbars internes ont + Texte, + Image, + Vidéo mais pas + Colonnes', () => {
    render(<BlockEditor value={[colBlock]} onChange={vi.fn()} />)
    const innerToolbars = screen.getAllByRole('toolbar', { name: /ajouter un bloc dans la colonne/i })
    expect(innerToolbars.length).toBeGreaterThan(0)
    for (const toolbar of innerToolbars) {
      expect(toolbar).toHaveTextContent(/\+ Texte/)
      expect(toolbar).toHaveTextContent(/\+ Image/)
      expect(toolbar).toHaveTextContent(/\+ Vidéo/)
      expect(toolbar).not.toHaveTextContent('+ Colonnes')
    }
  })
})

// ---------------------------------------------------------------------------
// Cycle 4 — ajouter un bloc feuille dans une colonne met à jour le ColumnsBlock
// ---------------------------------------------------------------------------
describe('ColumnsBlock — ajout de blocs dans une colonne', () => {
  const colBlock: ColumnsBlockType = {
    id: 'cb1',
    type: 'columns',
    columns: [
      { id: 'c1', widthPct: 50, blocks: [] },
      { id: 'c2', widthPct: 50, blocks: [] },
    ],
  }

  it('ajouter + Texte dans la première colonne appelle onChange avec un richText dans columns[0]', () => {
    const onChange = vi.fn()
    render(<BlockEditor value={[colBlock]} onChange={onChange} />)
    const innerToolbars = screen.getAllByRole('toolbar', { name: /ajouter un bloc dans la colonne/i })
    const addTextBtns = innerToolbars[0].querySelectorAll('button')
    const addTextBtn = Array.from(addTextBtns).find((b) => b.textContent?.includes('+ Texte'))!
    fireEvent.click(addTextBtn)
    expect(onChange).toHaveBeenCalledOnce()
    const [newBlocks] = onChange.mock.calls[0] as [Block[]]
    const updated = newBlocks[0] as ColumnsBlockType
    expect(updated.columns[0].blocks).toHaveLength(1)
    expect(updated.columns[0].blocks[0].type).toBe('richText')
    expect(updated.columns[1].blocks).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Cycle 5 — bouton "Ajouter une colonne"
// ---------------------------------------------------------------------------
describe('ColumnsBlock — ajout de colonne', () => {
  const colBlock: ColumnsBlockType = {
    id: 'cb1',
    type: 'columns',
    columns: [
      { id: 'c1', widthPct: 50, blocks: [] },
      { id: 'c2', widthPct: 50, blocks: [] },
    ],
  }

  it('cliquer sur Ajouter une colonne appelle onChange avec 3 colonnes à largeurs égales', () => {
    const onChange = vi.fn()
    render(<BlockEditor value={[colBlock]} onChange={onChange} />)
    const addColBtn = screen.getByRole('button', { name: /ajouter une colonne/i })
    fireEvent.click(addColBtn)
    expect(onChange).toHaveBeenCalledOnce()
    const [newBlocks] = onChange.mock.calls[0] as [Block[]]
    const updated = newBlocks[0] as ColumnsBlockType
    expect(updated.columns).toHaveLength(3)
    const total = updated.columns.reduce((s, c) => s + c.widthPct, 0)
    expect(total).toBe(100)
  })
})

// ---------------------------------------------------------------------------
// Cycle 6 — supprimer une colonne vide sans confirmation
// ---------------------------------------------------------------------------
describe('ColumnsBlock — suppression de colonne vide', () => {
  const colBlock: ColumnsBlockType = {
    id: 'cb1',
    type: 'columns',
    columns: [
      { id: 'c1', widthPct: 50, blocks: [] },
      { id: 'c2', widthPct: 50, blocks: [] },
    ],
  }

  it('supprimer une colonne vide appelle onChange sans confirmation', () => {
    const onChange = vi.fn()
    vi.spyOn(window, 'confirm')
    render(<BlockEditor value={[colBlock]} onChange={onChange} />)
    const delColBtns = screen.getAllByRole('button', { name: /supprimer la colonne/i })
    fireEvent.click(delColBtns[0])
    expect(window.confirm).not.toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledOnce()
    const [newBlocks] = onChange.mock.calls[0] as [Block[]]
    const updated = newBlocks[0] as ColumnsBlockType
    expect(updated.columns).toHaveLength(1)
    expect(updated.columns[0].id).toBe('c2')
  })
})

// ---------------------------------------------------------------------------
// Cycle 7 — supprimer une colonne non-vide demande confirmation
// ---------------------------------------------------------------------------
describe('ColumnsBlock — suppression de colonne non-vide', () => {
  const colBlock: ColumnsBlockType = {
    id: 'cb1',
    type: 'columns',
    columns: [
      { id: 'c1', widthPct: 50, blocks: [{ id: 'leaf1', type: 'richText', html: '<p>Hi</p>' }] },
      { id: 'c2', widthPct: 50, blocks: [] },
    ],
  }

  it('supprimer une colonne non-vide demande confirmation (confirm=true → supprime)', () => {
    const onChange = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<BlockEditor value={[colBlock]} onChange={onChange} />)
    const delColBtns = screen.getAllByRole('button', { name: /supprimer la colonne/i })
    fireEvent.click(delColBtns[0])
    expect(window.confirm).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledOnce()
    const [newBlocks] = onChange.mock.calls[0] as [Block[]]
    const updated = newBlocks[0] as ColumnsBlockType
    expect(updated.columns).toHaveLength(1)
  })

  it('supprimer une colonne non-vide annulé (confirm=false → garde la colonne)', () => {
    const onChange = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<BlockEditor value={[colBlock]} onChange={onChange} />)
    const delColBtns = screen.getAllByRole('button', { name: /supprimer la colonne/i })
    fireEvent.click(delColBtns[0])
    expect(window.confirm).toHaveBeenCalledOnce()
    expect(onChange).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Cycle 8 — snapColumnWidths (pure function)
// ---------------------------------------------------------------------------
describe('snapColumnWidths', () => {
  it('snap 2 colonnes : position 48% → 50/50', () => {
    const result = snapColumnWidths([48, 52])
    expect(result).toEqual([50, 50])
  })

  it('snap 2 colonnes : position 20% → 25/75', () => {
    const result = snapColumnWidths([20, 80])
    expect(result).toEqual([25, 75])
  })

  it('snap 2 colonnes : position 60% → 67/33', () => {
    const result = snapColumnWidths([60, 40])
    expect(result).toEqual([67, 33])
  })

  it('snap 3 colonnes : arrondi multiple de 5, somme = 100', () => {
    const result = snapColumnWidths([37, 32, 31])
    const total = result.reduce((s, v) => s + v, 0)
    expect(total).toBe(100)
    result.forEach((v) => expect(v % 5).toBe(0))
  })
})
