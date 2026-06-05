import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

type OnUpdateArgs = { editor: { getHTML: () => string } }
let capturedOnUpdate: ((args: OnUpdateArgs) => void) | undefined

const mockRun = vi.hoisted(() => vi.fn())
const mockIsActive = vi.hoisted(() => vi.fn((_name?: string, _attrs?: object): boolean => false))
const mockGetHTML = vi.hoisted(() => vi.fn(() => '<p></p>'))

const mockEditor = vi.hoisted(() => ({
  chain: () => ({
    focus: () => ({
      toggleBold: () => ({ run: mockRun }),
      toggleItalic: () => ({ run: mockRun }),
      toggleHeading: () => ({ run: mockRun }),
      toggleBulletList: () => ({ run: mockRun }),
      toggleOrderedList: () => ({ run: mockRun }),
      setLink: () => ({ run: mockRun }),
      unsetLink: () => ({ run: mockRun }),
      setImage: () => ({ run: mockRun }),
      insertContent: () => ({ run: mockRun }),
      setTextAlign: () => ({ run: mockRun }),
      setColor: () => ({ run: mockRun }),
      insertTable: () => ({ run: mockRun }),
      addRowAfter: () => ({ run: mockRun }),
      deleteRow: () => ({ run: mockRun }),
      addColumnAfter: () => ({ run: mockRun }),
      deleteColumn: () => ({ run: mockRun }),
    }),
  }),
  isActive: mockIsActive,
  getHTML: mockGetHTML,
}))

vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn((options?: { onUpdate?: (args: OnUpdateArgs) => void }) => {
    capturedOnUpdate = options?.onUpdate
    return mockEditor
  }),
  EditorContent: () => <div data-testid="editor-content" />,
}))

vi.mock('@tiptap/starter-kit', () => ({ default: { configure: vi.fn(() => ({})) } }))
vi.mock('@tiptap/extension-link', () => ({ default: { configure: vi.fn(() => ({})) } }))
vi.mock('@tiptap/extension-image', () => ({ default: { configure: vi.fn(() => ({})) } }))
vi.mock('@tiptap/extension-table', () => ({
  Table: { configure: vi.fn(() => ({})), name: 'table' },
  TableRow: { name: 'tableRow' },
  TableCell: { name: 'tableCell' },
  TableHeader: { name: 'tableHeader' },
}))
vi.mock('@tiptap/extension-text-align', () => ({
  TextAlign: { configure: vi.fn(() => ({})) },
  default: { configure: vi.fn(() => ({})) },
}))
vi.mock('@tiptap/extension-color', () => ({
  Color: { name: 'color' },
  default: { name: 'color' },
}))
vi.mock('@tiptap/extension-text-style', () => ({
  TextStyle: { name: 'textStyle' },
  default: { name: 'textStyle' },
}))
vi.mock('../MediaLibraryModal', () => ({
  MediaLibraryModal: ({ onSelect, onClose }: { onSelect: (url: string, alt: string) => void; onClose: () => void }) => (
    <div role="dialog" data-testid="media-library-modal">
      <button onClick={() => onSelect('/media/test.jpg', 'Test')}>Choisir</button>
      <button onClick={onClose}>Fermer</button>
    </div>
  ),
}))

type DocumentInsertMode =
  | { type: 'link'; href: string; label: string }
  | { type: 'pdf-viewer'; src: string; title: string }
  | { type: 'video'; src: string; mimeType: string }

let capturedOnDocInsert: ((mode: DocumentInsertMode) => void) | undefined

vi.mock('../DocumentLibraryModal', () => ({
  DocumentLibraryModal: ({ onInsert, onClose }: { onInsert: (mode: DocumentInsertMode) => void; onClose: () => void }) => {
    capturedOnDocInsert = onInsert
    return (
      <div role="dialog" data-testid="document-library-modal">
        <button onClick={() => onInsert({ type: 'link', href: '/media/doc.pdf', label: 'Mon doc' })}>Insérer lien</button>
        <button onClick={() => onInsert({ type: 'pdf-viewer', src: '/media/doc.pdf', title: 'Mon doc' })}>Insérer PDF</button>
        <button onClick={() => onInsert({ type: 'video', src: '/media/vid.mp4', mimeType: 'video/mp4' })}>Insérer vidéo</button>
        <button onClick={onClose}>Fermer</button>
      </div>
    )
  },
}))

import { RichEditor } from '../RichEditor'

beforeEach(() => {
  vi.clearAllMocks()
  capturedOnUpdate = undefined
  capturedOnDocInsert = undefined
  mockIsActive.mockReturnValue(false)
  mockGetHTML.mockReturnValue('<p></p>')
})

describe('RichEditor', () => {
  it('affiche les boutons de mise en forme de base avec aria-label', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Gras' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Italique' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Titre H2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Titre H3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Liste à puces' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Liste numérotée' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lien' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Image' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Document' })).toBeInTheDocument()
  })

  it('affiche les boutons d\'alignement de texte', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Aligner à gauche' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Centrer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aligner à droite' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Justifier' })).toBeInTheDocument()
  })

  it('affiche le bouton couleur de texte', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Couleur de texte' })).toBeInTheDocument()
  })

  it('affiche les boutons de gestion de tableau', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Insérer un tableau' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ajouter une ligne' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Supprimer la ligne' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ajouter une colonne' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Supprimer la colonne' })).toBeInTheDocument()
  })

  it('la barre d\'outils a le rôle toolbar', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
  })

  it('affiche la zone d\'édition', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('onChange reçoit du HTML sanitisé quand le contenu change', () => {
    const onChange = vi.fn()
    mockGetHTML.mockReturnValue('<p>Contenu <script>alert("xss")</script></p>')
    render(<RichEditor value="" onChange={onChange} />)

    capturedOnUpdate?.({ editor: mockEditor })

    expect(onChange).toHaveBeenCalledWith('<p>Contenu </p>')
  })

  it('aria-pressed reflète l\'état actif du bouton gras', () => {
    mockIsActive.mockImplementation((name?: string): boolean => name === 'bold')
    render(<RichEditor value="" onChange={vi.fn()} />)

    const boldBtn = screen.getByRole('button', { name: 'Gras' })
    expect(boldBtn).toHaveAttribute('aria-pressed', 'true')

    const italicBtn = screen.getByRole('button', { name: 'Italique' })
    expect(italicBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('cliquer sur Gras appelle la commande toggleBold', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Gras' }))
    expect(mockRun).toHaveBeenCalledOnce()
  })

  it('cliquer sur "Aligner à gauche" appelle setTextAlign(left)', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Aligner à gauche' }))
    expect(mockRun).toHaveBeenCalledOnce()
  })

  it('cliquer sur "Centrer" appelle setTextAlign(center)', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Centrer' }))
    expect(mockRun).toHaveBeenCalledOnce()
  })

  it('cliquer sur "Aligner à droite" appelle setTextAlign(right)', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Aligner à droite' }))
    expect(mockRun).toHaveBeenCalledOnce()
  })

  it('cliquer sur "Justifier" appelle setTextAlign(justify)', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Justifier' }))
    expect(mockRun).toHaveBeenCalledOnce()
  })

  it('changer la couleur déclenche setColor', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement
    expect(colorInput).not.toBeNull()
    fireEvent.change(colorInput, { target: { value: '#ff0000' } })
    expect(mockRun).toHaveBeenCalledOnce()
  })

  it('cliquer sur "Insérer un tableau" appelle insertTable', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Insérer un tableau' }))
    expect(mockRun).toHaveBeenCalledOnce()
  })

  it('cliquer sur "Ajouter une ligne" appelle addRowAfter', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une ligne' }))
    expect(mockRun).toHaveBeenCalledOnce()
  })

  it('cliquer sur "Supprimer la ligne" appelle deleteRow', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer la ligne' }))
    expect(mockRun).toHaveBeenCalledOnce()
  })

  it('cliquer sur "Ajouter une colonne" appelle addColumnAfter', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une colonne' }))
    expect(mockRun).toHaveBeenCalledOnce()
  })

  it('cliquer sur "Supprimer la colonne" appelle deleteColumn', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer la colonne' }))
    expect(mockRun).toHaveBeenCalledOnce()
  })

  it('cliquer sur Image ouvre le modal médiathèque', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    expect(screen.queryByTestId('media-library-modal')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Image' }))
    expect(screen.getByTestId('media-library-modal')).toBeInTheDocument()
  })

  it('choisir une image depuis le modal insère l\'image dans l\'éditeur', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Choisir' }))
    expect(mockRun).toHaveBeenCalled()
  })

  it('fermer le modal cache la médiathèque', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Image' }))
    expect(screen.getByTestId('media-library-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(screen.queryByTestId('media-library-modal')).not.toBeInTheDocument()
  })

  it('cliquer sur Document ouvre le modal de documents', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    expect(screen.queryByTestId('document-library-modal')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Document' }))
    expect(screen.getByTestId('document-library-modal')).toBeInTheDocument()
  })

  it('fermer le modal de documents le cache', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Document' }))
    expect(screen.getByTestId('document-library-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(screen.queryByTestId('document-library-modal')).not.toBeInTheDocument()
  })

  it('insérer un lien depuis le modal appelle la commande insertContent et ferme le modal', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Document' }))
    expect(screen.getByTestId('document-library-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Insérer lien' }))
    expect(mockRun).toHaveBeenCalled()
    expect(screen.queryByTestId('document-library-modal')).not.toBeInTheDocument()
  })
})
