import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { MediaLibraryModal } from '../MediaLibraryModal'

const MEDIA_DOCS = [
  { id: '1', url: '/media/photo1.jpg', alt: 'Photo 1', filename: 'photo1.jpg', mimeType: 'image/jpeg' },
  { id: '2', url: '/media/photo2.png', alt: 'Photo 2', filename: 'photo2.png', mimeType: 'image/png' },
]

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ docs: MEDIA_DOCS }),
    }),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('MediaLibraryModal', () => {
  it('affiche le modal avec le rôle dialog', async () => {
    render(<MediaLibraryModal onSelect={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('affiche les images existantes depuis /api/media', async () => {
    render(<MediaLibraryModal onSelect={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByAltText('Photo 1')).toBeInTheDocument()
      expect(screen.getByAltText('Photo 2')).toBeInTheDocument()
    })
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/media'))
  })

  it('appelle onSelect avec l\'URL et l\'alt quand on clique sur une image', async () => {
    const onSelect = vi.fn()
    render(<MediaLibraryModal onSelect={onSelect} onClose={vi.fn()} />)
    await waitFor(() => screen.getByAltText('Photo 1'))
    fireEvent.click(screen.getByAltText('Photo 1'))
    expect(onSelect).toHaveBeenCalledWith('/media/photo1.jpg', 'Photo 1')
  })

  it('appelle onClose quand on appuie sur Échap', async () => {
    const onClose = vi.fn()
    render(<MediaLibraryModal onSelect={vi.fn()} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('appelle onClose quand on clique sur le bouton Fermer', () => {
    const onClose = vi.fn()
    render(<MediaLibraryModal onSelect={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /fermer/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('affiche un bouton Uploader', () => {
    render(<MediaLibraryModal onSelect={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /uploader/i })).toBeInTheDocument()
  })

  it('upload un fichier et appelle onSelect avec l\'image uploadée', async () => {
    const onSelect = vi.fn()
    const uploadedMedia = { id: '3', url: '/media/new.jpg', alt: 'new.jpg', mimeType: 'image/jpeg' }

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ docs: MEDIA_DOCS }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ doc: uploadedMedia }) })
    vi.stubGlobal('fetch', fetchMock)

    render(<MediaLibraryModal onSelect={onSelect} onClose={vi.fn()} />)

    const file = new File(['img'], 'new.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('/media/new.jpg', 'new.jpg')
    })
  })

  it('le modal a un label accessible', () => {
    render(<MediaLibraryModal onSelect={vi.fn()} onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby')
  })
})
