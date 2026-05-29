import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('@/actions/sendContact', () => ({
  sendContact: vi.fn(),
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useActionState: vi.fn(),
  }
})

import { useActionState } from 'react'
import { ContactBlock } from '../ContactBlock'

const mockUseActionState = vi.mocked(useActionState)

beforeEach(() => {
  mockUseActionState.mockReturnValue([null, vi.fn(), false] as any)
})

describe('ContactBlock', () => {
  it('renders the form with all required fields', () => {
    render(<ContactBlock />)
    expect(screen.getByLabelText(/nom/i)).toBeTruthy()
    expect(screen.getByLabelText(/email/i)).toBeTruthy()
    expect(screen.getByLabelText(/message/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /envoyer/i })).toBeTruthy()
  })

  it('renders the RGPD notice', () => {
    render(<ContactBlock />)
    expect(
      screen.getByText(/vos données sont utilisées uniquement pour traiter votre demande/i),
    ).toBeTruthy()
  })

  it('renders the optional title when provided', () => {
    render(<ContactBlock title="Contactez-nous" />)
    expect(screen.getByRole('heading', { name: 'Contactez-nous' })).toBeTruthy()
  })

  it('does not render a heading when title is absent', () => {
    render(<ContactBlock />)
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('shows a success message when state has success', () => {
    mockUseActionState.mockReturnValue([{ success: true }, vi.fn(), false] as any)
    render(<ContactBlock />)
    expect(screen.getByRole('status')).toBeTruthy()
    expect(screen.getByText(/votre message a bien été envoyé/i)).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('shows an error message when state has error', () => {
    mockUseActionState.mockReturnValue([
      { error: "L'envoi a échoué. Veuillez réessayer ultérieurement." },
      vi.fn(),
      false,
    ] as any)
    render(<ContactBlock />)
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText(/l'envoi a échoué/i)).toBeTruthy()
  })

  it('disables the submit button while pending', () => {
    mockUseActionState.mockReturnValue([null, vi.fn(), true] as any)
    render(<ContactBlock />)
    const btn = screen.getByRole('button')
    expect((btn as HTMLButtonElement).disabled).toBe(true)
    expect(btn.textContent).toContain('Envoi en cours')
  })
})
