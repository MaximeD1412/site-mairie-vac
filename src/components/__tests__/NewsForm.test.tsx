import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, useActionState: vi.fn() }
})

vi.mock('@/components/RichEditor', () => ({
  RichEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div data-testid="rich-editor">
      <textarea
        data-testid="rich-editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}))

import { useActionState } from 'react'
import { NewsForm } from '../NewsForm'

const mockUseActionState = vi.mocked(useActionState)

beforeEach(() => {
  mockUseActionState.mockReturnValue([null, vi.fn(), false] as any)
})

describe('NewsForm', () => {
  it('affiche tous les champs du formulaire', () => {
    render(<NewsForm action={vi.fn()} />)

    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/résumé/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/image de couverture/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date de publication/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mettre en avant/i)).toBeInTheDocument()
    expect(screen.getByTestId('rich-editor')).toBeInTheDocument()
  })

  it('affiche le bouton "Créer" en mode création', () => {
    render(<NewsForm action={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument()
  })

  it('affiche le bouton "Modifier" en mode édition', () => {
    const news = {
      id: 1, title: 'Test', slug: 'test', summary: 'Résumé',
      publishedAt: '2026-01-01T00:00:00.000Z', featured: false, content: null,
      updatedAt: '', createdAt: '',
    }
    render(<NewsForm action={vi.fn()} news={news as any} />)
    expect(screen.getByRole('button', { name: 'Modifier' })).toBeInTheDocument()
  })

  it('le bouton Supprimer est absent en mode création', () => {
    render(<NewsForm action={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /supprimer/i })).not.toBeInTheDocument()
  })

  it('le bouton Supprimer est présent quand deleteAction est fournie', () => {
    const news = {
      id: 1, title: 'Test', slug: 'test', summary: 'Résumé',
      publishedAt: '2026-01-01T00:00:00.000Z', featured: false, content: null,
      updatedAt: '', createdAt: '',
    }
    render(<NewsForm action={vi.fn()} news={news as any} deleteAction={vi.fn()} />)
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument()
  })

  it('génère le slug automatiquement depuis le titre', () => {
    render(<NewsForm action={vi.fn()} />)
    const titleInput = screen.getByLabelText(/titre/i)
    fireEvent.change(titleInput, { target: { value: 'Conseil Municipal 2026' } })
    const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement
    expect(slugInput.value).toBe('conseil-municipal-2026')
  })

  it('le slug est pré-rempli en mode édition', () => {
    const news = {
      id: 1, title: 'Titre existant', slug: 'titre-existant', summary: 'Résumé',
      publishedAt: '2026-01-01T00:00:00.000Z', featured: false, content: null,
      updatedAt: '', createdAt: '',
    }
    render(<NewsForm action={vi.fn()} news={news as any} />)
    const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement
    expect(slugInput.value).toBe('titre-existant')
  })

  it('le slug ne change plus quand il a été modifié manuellement', () => {
    render(<NewsForm action={vi.fn()} />)
    const slugInput = screen.getByLabelText(/slug/i)
    fireEvent.change(slugInput, { target: { value: 'mon-slug-perso' } })
    const titleInput = screen.getByLabelText(/titre/i)
    fireEvent.change(titleInput, { target: { value: 'Nouveau titre quelconque' } })
    expect((screen.getByLabelText(/slug/i) as HTMLInputElement).value).toBe('mon-slug-perso')
  })

  it('affiche le message d\'erreur du serveur', () => {
    mockUseActionState.mockReturnValue([{ error: 'Erreur de sauvegarde' }, vi.fn(), false] as any)
    render(<NewsForm action={vi.fn()} />)
    expect(screen.getByText('Erreur de sauvegarde')).toBeInTheDocument()
  })

  it('désactive le bouton soumettre pendant l\'envoi', () => {
    mockUseActionState.mockReturnValue([null, vi.fn(), true] as any)
    render(<NewsForm action={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /enregistrement/i })
    expect(btn).toBeDisabled()
  })

  it('le contenu RichEditor est synchronisé dans un champ caché', () => {
    render(<NewsForm action={vi.fn()} />)
    const textarea = screen.getByTestId('rich-editor-textarea')
    fireEvent.change(textarea, { target: { value: '<p>Contenu riche</p>' } })
    const hiddenInput = document.querySelector('input[name="content"]') as HTMLInputElement
    expect(hiddenInput?.value).toBe('<p>Contenu riche</p>')
  })
})
