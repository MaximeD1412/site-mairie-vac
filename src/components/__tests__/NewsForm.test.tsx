import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, useActionState: vi.fn() }
})

vi.mock('@/components/BlockEditor', () => ({
  BlockEditor: ({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) => (
    <div data-testid="block-editor">
      <button
        type="button"
        data-testid="block-editor-add"
        onClick={() => onChange([...value, { id: 'test-id', type: 'richText', html: '<p>Bloc test</p>' }])}
      >
        + Texte
      </button>
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
    expect(screen.getByLabelText(/résumé/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/image de couverture/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date de publication/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mettre en avant/i)).toBeInTheDocument()
    expect(screen.getByTestId('block-editor')).toBeInTheDocument()
  })

  it('affiche le bouton "Créer" en mode création', () => {
    render(<NewsForm action={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument()
  })

  it('affiche le bouton "Modifier" en mode édition', () => {
    const news = {
      id: 1, title: 'Test', slug: 'test', summary: 'Résumé',
      publishedAt: '2026-01-01T00:00:00.000Z', featured: false, layout: null,
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
      publishedAt: '2026-01-01T00:00:00.000Z', featured: false, layout: null,
      updatedAt: '', createdAt: '',
    }
    render(<NewsForm action={vi.fn()} news={news as any} deleteAction={vi.fn()} />)
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument()
  })

  it('génère le slug automatiquement depuis le titre', () => {
    render(<NewsForm action={vi.fn()} />)
    const titleInput = screen.getByLabelText(/titre/i)
    fireEvent.change(titleInput, { target: { value: 'Conseil Municipal 2026' } })
    const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement
    expect(slugInput.value).toBe('conseil-municipal-2026')
  })

  it('le slug est pré-rempli en mode édition', () => {
    const news = {
      id: 1, title: 'Titre existant', slug: 'titre-existant', summary: 'Résumé',
      publishedAt: '2026-01-01T00:00:00.000Z', featured: false, layout: null,
      updatedAt: '', createdAt: '',
    }
    render(<NewsForm action={vi.fn()} news={news as any} />)
    const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement
    expect(slugInput.value).toBe('titre-existant')
  })

  it('en mode édition, modifier le titre ne modifie pas le slug', () => {
    const news = {
      id: 1, title: 'Titre existant', slug: 'titre-existant', summary: 'Résumé',
      publishedAt: '2026-01-01T00:00:00.000Z', featured: false, layout: null,
      updatedAt: '', createdAt: '',
    }
    render(<NewsForm action={vi.fn()} news={news as any} />)
    const titleInput = screen.getByLabelText(/titre/i)
    fireEvent.change(titleInput, { target: { value: 'Nouveau titre quelconque' } })
    const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement
    expect(slugInput.value).toBe('titre-existant')
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

  it('le layout BlockEditor est sérialisé en JSON dans un champ caché', () => {
    render(<NewsForm action={vi.fn()} />)
    const hiddenInput = document.querySelector('input[name="layout"]') as HTMLInputElement
    expect(hiddenInput?.value).toBe('[]')

    fireEvent.click(screen.getByTestId('block-editor-add'))
    expect(JSON.parse(hiddenInput?.value ?? '[]')).toHaveLength(1)
  })

  it('le layout est pré-rempli depuis news.layout en mode édition', () => {
    const existingLayout = [{ id: 'abc', type: 'richText', html: '<p>Contenu existant</p>' }]
    const news = {
      id: 1, title: 'Test', slug: 'test', summary: 'Résumé',
      publishedAt: '2026-01-01T00:00:00.000Z', featured: false, layout: existingLayout,
      updatedAt: '', createdAt: '',
    }
    render(<NewsForm action={vi.fn()} news={news as any} />)
    const hiddenInput = document.querySelector('input[name="layout"]') as HTMLInputElement
    expect(JSON.parse(hiddenInput?.value ?? '[]')).toEqual(existingLayout)
  })
})
