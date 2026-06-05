import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

const mockDocs = [
  {
    id: 1,
    title: 'Bulletin municipal 2024',
    category: 'bulletin-municipal',
    file: { url: '/media/bulletin.pdf', mimeType: 'application/pdf', filename: 'bulletin.pdf' },
  },
  {
    id: 2,
    title: 'Présentation vidéo',
    category: 'autre',
    file: { url: '/media/video.mp4', mimeType: 'video/mp4', filename: 'video.mp4' },
  },
  {
    id: 3,
    title: 'Formulaire inscription',
    category: 'formulaire',
    file: { url: '/media/form.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename: 'form.docx' },
  },
]

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ docs: mockDocs }),
    }),
  )
})

import { DocumentLibraryModal } from '../DocumentLibraryModal'

describe('DocumentLibraryModal', () => {
  it('affiche le titre et le bouton fermer', async () => {
    render(<DocumentLibraryModal onInsert={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Insérer un document')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument()
  })

  it('a le rôle dialog avec aria-modal', () => {
    render(<DocumentLibraryModal onInsert={vi.fn()} onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('charge et affiche la liste des documents', async () => {
    render(<DocumentLibraryModal onInsert={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('Bulletin municipal 2024')).toBeInTheDocument()
      expect(screen.getByText('Présentation vidéo')).toBeInTheDocument()
      expect(screen.getByText('Formulaire inscription')).toBeInTheDocument()
    })
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/documents'))
  })

  it('le bouton fermer appelle onClose', () => {
    const onClose = vi.fn()
    render(<DocumentLibraryModal onInsert={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('Escape appelle onClose', () => {
    const onClose = vi.fn()
    render(<DocumentLibraryModal onInsert={vi.fn()} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('sélectionner un document affiche le panneau d\'options', async () => {
    render(<DocumentLibraryModal onInsert={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => screen.getByText('Bulletin municipal 2024'))
    fireEvent.click(screen.getByText('Bulletin municipal 2024'))
    expect(screen.getByText('Lien texte')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Insérer le lien/ })).toBeInTheDocument()
  })

  it('le champ texte du lien est pré-rempli avec le titre du document', async () => {
    render(<DocumentLibraryModal onInsert={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => screen.getByText('Bulletin municipal 2024'))
    fireEvent.click(screen.getByText('Bulletin municipal 2024'))
    const input = screen.getByRole('textbox', { name: /Texte du lien/ })
    expect((input as HTMLInputElement).value).toBe('Bulletin municipal 2024')
  })

  it('insérer un lien texte appelle onInsert avec type link', async () => {
    const onInsert = vi.fn()
    render(<DocumentLibraryModal onInsert={onInsert} onClose={vi.fn()} />)
    await waitFor(() => screen.getByText('Bulletin municipal 2024'))
    fireEvent.click(screen.getByText('Bulletin municipal 2024'))
    fireEvent.click(screen.getByRole('button', { name: /Insérer le lien/ }))
    expect(onInsert).toHaveBeenCalledWith({
      type: 'link',
      href: '/media/bulletin.pdf',
      label: 'Bulletin municipal 2024',
    })
  })

  it('un PDF affiche l\'option viewer PDF', async () => {
    render(<DocumentLibraryModal onInsert={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => screen.getByText('Bulletin municipal 2024'))
    fireEvent.click(screen.getByText('Bulletin municipal 2024'))
    expect(screen.getByText('Afficher en viewer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Insérer le viewer PDF/ })).toBeInTheDocument()
  })

  it('insérer un viewer PDF appelle onInsert avec type pdf-viewer', async () => {
    const onInsert = vi.fn()
    render(<DocumentLibraryModal onInsert={onInsert} onClose={vi.fn()} />)
    await waitFor(() => screen.getByText('Bulletin municipal 2024'))
    fireEvent.click(screen.getByText('Bulletin municipal 2024'))
    fireEvent.click(screen.getByRole('button', { name: /Insérer le viewer PDF/ }))
    expect(onInsert).toHaveBeenCalledWith({
      type: 'pdf-viewer',
      src: '/media/bulletin.pdf',
      title: 'Bulletin municipal 2024',
    })
  })

  it('une vidéo affiche l\'option lecteur vidéo', async () => {
    render(<DocumentLibraryModal onInsert={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => screen.getByText('Présentation vidéo'))
    fireEvent.click(screen.getByText('Présentation vidéo'))
    expect(screen.getByText('Lecteur vidéo inline')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Insérer le lecteur vidéo/ })).toBeInTheDocument()
  })

  it('insérer une vidéo appelle onInsert avec type video', async () => {
    const onInsert = vi.fn()
    render(<DocumentLibraryModal onInsert={onInsert} onClose={vi.fn()} />)
    await waitFor(() => screen.getByText('Présentation vidéo'))
    fireEvent.click(screen.getByText('Présentation vidéo'))
    fireEvent.click(screen.getByRole('button', { name: /Insérer le lecteur vidéo/ }))
    expect(onInsert).toHaveBeenCalledWith({
      type: 'video',
      src: '/media/video.mp4',
      mimeType: 'video/mp4',
    })
  })

  it('un document non-PDF/non-vidéo n\'affiche pas les options viewer/vidéo', async () => {
    render(<DocumentLibraryModal onInsert={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => screen.getByText('Formulaire inscription'))
    fireEvent.click(screen.getByText('Formulaire inscription'))
    expect(screen.queryByText('Afficher en viewer')).not.toBeInTheDocument()
    expect(screen.queryByText('Lecteur vidéo inline')).not.toBeInTheDocument()
  })

  it('le bouton retour revient à la liste', async () => {
    render(<DocumentLibraryModal onInsert={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => screen.getByText('Bulletin municipal 2024'))
    fireEvent.click(screen.getByText('Bulletin municipal 2024'))
    expect(screen.queryByText('Bulletin municipal 2024')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Retour/ }))
    expect(screen.getByText('Présentation vidéo')).toBeInTheDocument()
  })
})
