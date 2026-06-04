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

import { RichEditor } from '../RichEditor'

beforeEach(() => {
  vi.clearAllMocks()
  capturedOnUpdate = undefined
  mockIsActive.mockReturnValue(false)
  mockGetHTML.mockReturnValue('<p></p>')
})

describe('RichEditor', () => {
  it('affiche les 7 boutons de la barre d\'outils avec aria-label', () => {
    render(<RichEditor value="" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Gras' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Italique' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Titre H2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Titre H3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Liste à puces' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Liste numérotée' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lien' })).toBeInTheDocument()
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
})
