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
import { EventForm } from '../EventForm'

const mockUseActionState = vi.mocked(useActionState)

const mockCategories = [
  { id: 1, name: 'Culture', slug: 'culture', color: '#3B82F6', updatedAt: '', createdAt: '' },
  { id: 2, name: 'Sport', slug: 'sport', color: '#EF4444', updatedAt: '', createdAt: '' },
]

const mockAssociations = [
  { id: 10, name: 'Amicale des pêcheurs', updatedAt: '', createdAt: '' },
]

beforeEach(() => {
  mockUseActionState.mockReturnValue([null, vi.fn(), false] as any)
})

describe('EventForm', () => {
  it('affiche tous les champs du formulaire', () => {
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )

    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date et heure de début/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date et heure de fin/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lieu/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/organisateur/i)).toBeInTheDocument()
    expect(screen.getByTestId('rich-editor')).toBeInTheDocument()
  })

  it('affiche les options de catégorie chargées', () => {
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    expect(screen.getByRole('option', { name: 'Culture' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Sport' })).toBeInTheDocument()
  })

  it('affiche les options d\'association chargées', () => {
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    expect(screen.getByRole('option', { name: 'Amicale des pêcheurs' })).toBeInTheDocument()
  })

  it('affiche le bouton "Créer" en mode création', () => {
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument()
  })

  it('affiche le bouton "Modifier" en mode édition', () => {
    const event = {
      id: 1, title: 'Concert', slug: 'concert',
      startDate: '2026-06-21T18:00:00.000Z',
      updatedAt: '', createdAt: '',
    }
    render(
      <EventForm
        action={vi.fn()}
        event={event as any}
        categories={mockCategories}
        associations={mockAssociations}
      />,
    )
    expect(screen.getByRole('button', { name: 'Modifier' })).toBeInTheDocument()
  })

  it('le bouton Supprimer est absent en mode création', () => {
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    expect(screen.queryByRole('button', { name: /supprimer/i })).not.toBeInTheDocument()
  })

  it('le bouton Supprimer est présent quand deleteAction est fournie', () => {
    const event = {
      id: 1, title: 'Concert', slug: 'concert',
      startDate: '2026-06-21T18:00:00.000Z',
      updatedAt: '', createdAt: '',
    }
    render(
      <EventForm
        action={vi.fn()}
        event={event as any}
        deleteAction={vi.fn()}
        categories={mockCategories}
        associations={mockAssociations}
      />,
    )
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument()
  })

  it('génère le slug automatiquement depuis le titre', () => {
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    const titleInput = screen.getByLabelText(/titre/i)
    fireEvent.change(titleInput, { target: { value: 'Fête de la Musique 2026' } })
    const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement
    expect(slugInput.value).toBe('fete-de-la-musique-2026')
  })

  it('le slug est pré-rempli en mode édition', () => {
    const event = {
      id: 1, title: 'Concert', slug: 'concert',
      startDate: '2026-06-21T18:00:00.000Z',
      updatedAt: '', createdAt: '',
    }
    render(
      <EventForm
        action={vi.fn()}
        event={event as any}
        categories={mockCategories}
        associations={mockAssociations}
      />,
    )
    const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement
    expect(slugInput.value).toBe('concert')
  })

  it('le slug ne change plus quand il a été modifié manuellement', () => {
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    const slugInput = screen.getByLabelText(/slug/i)
    fireEvent.change(slugInput, { target: { value: 'mon-slug-perso' } })
    const titleInput = screen.getByLabelText(/titre/i)
    fireEvent.change(titleInput, { target: { value: 'Nouveau titre' } })
    expect((screen.getByLabelText(/slug/i) as HTMLInputElement).value).toBe('mon-slug-perso')
  })

  it('affiche le message d\'erreur du serveur', () => {
    mockUseActionState.mockReturnValue([{ error: 'Erreur de sauvegarde' }, vi.fn(), false] as any)
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    expect(screen.getByText('Erreur de sauvegarde')).toBeInTheDocument()
  })

  it('désactive le bouton soumettre pendant l\'envoi', () => {
    mockUseActionState.mockReturnValue([null, vi.fn(), true] as any)
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    const btn = screen.getByRole('button', { name: /enregistrement/i })
    expect(btn).toBeDisabled()
  })

  it('la description RichEditor est synchronisée dans un champ caché', () => {
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    const textarea = screen.getByTestId('rich-editor-textarea')
    fireEvent.change(textarea, { target: { value: '<p>Description riche</p>' } })
    const hiddenInput = document.querySelector('input[name="description"]') as HTMLInputElement
    expect(hiddenInput?.value).toBe('<p>Description riche</p>')
  })
})
