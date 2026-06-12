import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, useActionState: vi.fn() }
})

vi.mock('@/actions/working-copies', () => ({
  saveWorkingCopy: vi.fn(),
  deleteWorkingCopy: vi.fn(),
}))

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
    expect(screen.getByLabelText(/date et heure de début/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date et heure de fin/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lieu/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/organisateur/i)).toBeInTheDocument()
    expect(screen.getByTestId('block-editor')).toBeInTheDocument()
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

  it('affiche les boutons "Soumettre en brouillon" et "Publier"', () => {
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    expect(screen.getByRole('button', { name: 'Soumettre en brouillon' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publier' })).toBeInTheDocument()
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
    const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement
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
    const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement
    expect(slugInput.value).toBe('concert')
  })

  it('en mode édition, modifier le titre ne modifie pas le slug', () => {
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
    const titleInput = screen.getByLabelText(/titre/i)
    fireEvent.change(titleInput, { target: { value: 'Nouveau titre' } })
    const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement
    expect(slugInput.value).toBe('concert')
  })

  it('affiche le message d\'erreur du serveur', () => {
    mockUseActionState.mockReturnValue([{ error: 'Erreur de sauvegarde' }, vi.fn(), false] as any)
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    expect(screen.getByText('Erreur de sauvegarde')).toBeInTheDocument()
  })

  it('désactive les boutons soumettre pendant l\'envoi', () => {
    mockUseActionState.mockReturnValue([null, vi.fn(), true] as any)
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    const btns = screen.getAllByRole('button', { name: /enregistrement/i })
    expect(btns).toHaveLength(2)
    btns.forEach((btn) => expect(btn).toBeDisabled())
  })

  it('le layout BlockEditor est sérialisé en JSON dans un champ caché', () => {
    render(
      <EventForm action={vi.fn()} categories={mockCategories} associations={mockAssociations} />,
    )
    const hiddenInput = document.querySelector('input[name="layout"]') as HTMLInputElement
    expect(hiddenInput?.value).toBe('[]')

    fireEvent.click(screen.getByTestId('block-editor-add'))
    expect(JSON.parse(hiddenInput?.value ?? '[]')).toHaveLength(1)
  })

  it('le layout est pré-rempli depuis event.layout en mode édition', () => {
    const existingLayout = [{ id: 'abc', type: 'richText', html: '<p>Description existante</p>' }]
    const event = {
      id: 1, title: 'Concert', slug: 'concert',
      startDate: '2026-06-21T18:00:00.000Z',
      layout: existingLayout,
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
    const hiddenInput = document.querySelector('input[name="layout"]') as HTMLInputElement
    expect(JSON.parse(hiddenInput?.value ?? '[]')).toEqual(existingLayout)
  })
})
