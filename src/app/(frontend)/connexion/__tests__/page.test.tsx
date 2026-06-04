import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import ConnexionPage from '../page'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  global.fetch = vi.fn()
})

describe('ConnexionPage', () => {
  it('affiche un formulaire avec email, mot de passe et bouton de connexion', () => {
    render(<ConnexionPage />)
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it("affiche une erreur en cas d'identifiants incorrects", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response)
    render(<ConnexionPage />)
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'agent@test.fr' } })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'mauvais' } })
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('redirige vers / en cas de succès', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true } as Response)
    render(<ConnexionPage />)
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'admin@test.fr' } })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'correct' } })
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })
})
