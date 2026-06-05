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

import { BlockEditor, type Block } from '../BlockEditor'

const emptyBlocks: Block[] = []

const richTextBlock: Block = { id: 'b1', type: 'richText', html: '<p>Hello</p>' }
const imageBlock: Block = { id: 'b2', type: 'image', url: '/img/photo.jpg', alt: 'Photo', caption: '' }
const videoBlock: Block = { id: 'b3', type: 'video', src: 'https://youtu.be/abc', isEmbed: true }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('BlockEditor — rendu initial', () => {
  it('se rend sans crash avec une liste vide', () => {
    render(<BlockEditor value={emptyBlocks} onChange={vi.fn()} />)
    expect(screen.getByRole('region', { name: /éditeur de blocs/i })).toBeInTheDocument()
  })

  it('affiche un bloc richText existant avec le RichEditor', () => {
    render(<BlockEditor value={[richTextBlock]} onChange={vi.fn()} />)
    expect(screen.getByTestId('rich-editor')).toBeInTheDocument()
  })

  it('affiche un bloc image existant avec un aperçu', () => {
    render(<BlockEditor value={[imageBlock]} onChange={vi.fn()} />)
    const img = screen.getByRole('img', { name: 'Photo' })
    expect(img).toHaveAttribute('src', '/img/photo.jpg')
  })

  it('affiche un bloc vidéo existant avec l\'URL', () => {
    render(<BlockEditor value={[videoBlock]} onChange={vi.fn()} />)
    expect(screen.getByText('https://youtu.be/abc')).toBeInTheDocument()
  })
})

describe('BlockEditor — toolbar d\'ajout', () => {
  it('affiche les boutons + Texte, + Image, + Vidéo', () => {
    render(<BlockEditor value={emptyBlocks} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '+ Texte' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Image' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Vidéo' })).toBeInTheDocument()
  })

  it('le bouton + Colonnes est présent mais désactivé', () => {
    render(<BlockEditor value={emptyBlocks} onChange={vi.fn()} />)
    const colBtn = screen.getByRole('button', { name: '+ Colonnes' })
    expect(colBtn).toBeInTheDocument()
    expect(colBtn).toBeDisabled()
  })
})

describe('BlockEditor — ajout de blocs', () => {
  it('ajouter un bloc richText appelle onChange avec un nouveau bloc richText', () => {
    const onChange = vi.fn()
    render(<BlockEditor value={emptyBlocks} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '+ Texte' }))
    expect(onChange).toHaveBeenCalledOnce()
    const [newBlocks] = onChange.mock.calls[0]
    expect(newBlocks).toHaveLength(1)
    expect(newBlocks[0].type).toBe('richText')
    expect(newBlocks[0].html).toBe('')
  })

  it('ajouter un bloc image ouvre le modal médiathèque', () => {
    render(<BlockEditor value={emptyBlocks} onChange={vi.fn()} />)
    expect(screen.queryByTestId('media-library-modal')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '+ Image' }))
    expect(screen.getByTestId('media-library-modal')).toBeInTheDocument()
  })

  it('choisir une image depuis le modal ajoute le bloc et ferme le modal', () => {
    const onChange = vi.fn()
    render(<BlockEditor value={emptyBlocks} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '+ Image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Choisir image' }))
    expect(screen.queryByTestId('media-library-modal')).not.toBeInTheDocument()
    expect(onChange).toHaveBeenCalledOnce()
    const [newBlocks] = onChange.mock.calls[0]
    expect(newBlocks[0].type).toBe('image')
    expect(newBlocks[0].url).toBe('/media/test.jpg')
    expect(newBlocks[0].alt).toBe('Test alt')
  })

  it('ajouter un bloc vidéo appelle onChange avec un nouveau bloc video vide', () => {
    const onChange = vi.fn()
    render(<BlockEditor value={emptyBlocks} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '+ Vidéo' }))
    expect(onChange).toHaveBeenCalledOnce()
    const [newBlocks] = onChange.mock.calls[0]
    expect(newBlocks[0].type).toBe('video')
    expect(newBlocks[0].src).toBe('')
  })
})

describe('BlockEditor — suppression de blocs', () => {
  it('affiche un bouton supprimer sur chaque bloc', () => {
    render(<BlockEditor value={[richTextBlock, imageBlock]} onChange={vi.fn()} />)
    const deleteButtons = screen.getAllByRole('button', { name: /supprimer le bloc/i })
    expect(deleteButtons).toHaveLength(2)
  })

  it('supprimer un bloc appelle onChange sans ce bloc', () => {
    const onChange = vi.fn()
    render(<BlockEditor value={[richTextBlock, imageBlock]} onChange={onChange} />)
    const deleteButtons = screen.getAllByRole('button', { name: /supprimer le bloc/i })
    fireEvent.click(deleteButtons[0])
    const [newBlocks] = onChange.mock.calls[0]
    expect(newBlocks).toHaveLength(1)
    expect(newBlocks[0].id).toBe('b2')
  })
})

describe('BlockEditor — édition des blocs', () => {
  it('modifier le contenu d\'un bloc richText appelle onChange avec le html mis à jour', () => {
    const onChange = vi.fn()
    render(<BlockEditor value={[richTextBlock]} onChange={onChange} />)
    const textarea = screen.getByTestId('rich-editor-textarea')
    fireEvent.change(textarea, { target: { value: '<p>Updated</p>' } })
    const [newBlocks] = onChange.mock.calls[0]
    expect(newBlocks[0].html).toBe('<p>Updated</p>')
  })

  it('modifier l\'URL d\'un bloc vidéo appelle onChange avec la nouvelle src', () => {
    const onChange = vi.fn()
    render(<BlockEditor value={[videoBlock]} onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: /url de la vidéo/i })
    fireEvent.change(input, { target: { value: 'https://vimeo.com/123' } })
    const [newBlocks] = onChange.mock.calls[0]
    expect(newBlocks[0].src).toBe('https://vimeo.com/123')
  })

  it('modifier la légende d\'un bloc image appelle onChange avec la nouvelle caption', () => {
    const onChange = vi.fn()
    render(<BlockEditor value={[imageBlock]} onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: /légende/i })
    fireEvent.change(input, { target: { value: 'Une belle photo' } })
    const [newBlocks] = onChange.mock.calls[0]
    expect(newBlocks[0].caption).toBe('Une belle photo')
  })
})

describe('BlockEditor — drag & drop', () => {
  it('affiche une poignée de drag sur chaque bloc', () => {
    render(<BlockEditor value={[richTextBlock, imageBlock]} onChange={vi.fn()} />)
    const handles = screen.getAllByRole('button', { name: /déplacer le bloc/i })
    expect(handles).toHaveLength(2)
  })
})
