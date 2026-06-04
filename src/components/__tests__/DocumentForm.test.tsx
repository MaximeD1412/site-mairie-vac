import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, useActionState: vi.fn() }
})

import { useActionState } from 'react'
import { DocumentForm } from '../DocumentForm'

const mockUseActionState = vi.mocked(useActionState)

beforeEach(() => {
  mockUseActionState.mockReturnValue([null, vi.fn(), false] as any)
})

describe('DocumentForm', () => {
  it('affiche tous les champs du formulaire', () => {
    render(<DocumentForm action={vi.fn()} />)

    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fichier pdf/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('le champ date est obligatoire', () => {
    render(<DocumentForm action={vi.fn()} />)
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
    expect(dateInput.required).toBe(true)
  })

  it('le champ date est obligatoire en mode modification', () => {
    const doc = {
      id: 1, title: 'Doc test', category: 'bulletin-municipal',
      date: '2026-01-01T00:00:00.000Z', updatedAt: '', createdAt: '',
    }
    render(<DocumentForm action={vi.fn()} document={doc as any} />)
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
    expect(dateInput.required).toBe(true)
  })

  it('affiche le bouton "Créer" en mode création', () => {
    render(<DocumentForm action={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument()
  })

  it('affiche le bouton "Modifier" en mode édition', () => {
    const doc = {
      id: 1, title: 'Doc test', category: 'bulletin-municipal',
      date: '2026-01-01T00:00:00.000Z', updatedAt: '', createdAt: '',
    }
    render(<DocumentForm action={vi.fn()} document={doc as any} />)
    expect(screen.getByRole('button', { name: 'Modifier' })).toBeInTheDocument()
  })

  it('affiche le message d\'erreur du serveur', () => {
    mockUseActionState.mockReturnValue([{ error: 'Erreur de sauvegarde' }, vi.fn(), false] as any)
    render(<DocumentForm action={vi.fn()} />)
    expect(screen.getByText('Erreur de sauvegarde')).toBeInTheDocument()
  })

  it('le bouton Supprimer est absent en mode création', () => {
    render(<DocumentForm action={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /supprimer/i })).not.toBeInTheDocument()
  })

  it('le bouton Supprimer est présent quand deleteAction est fournie', () => {
    const doc = {
      id: 1, title: 'Doc test', category: 'bulletin-municipal',
      date: '2026-01-01T00:00:00.000Z', updatedAt: '', createdAt: '',
    }
    render(<DocumentForm action={vi.fn()} document={doc as any} deleteAction={vi.fn()} />)
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument()
  })
})
