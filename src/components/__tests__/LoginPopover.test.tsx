import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock('lucide-react', () => ({
  User: () => <svg data-testid="icon-user" />,
  X: () => <svg data-testid="icon-x" />,
  LogIn: () => <svg data-testid="icon-login" />,
}))

import { LoginPopover } from '../LoginPopover'

beforeEach(() => {
  vi.clearAllMocks()
  global.fetch = vi.fn()
})

describe('LoginPopover', () => {
  it('affiche le bouton déclencheur', () => {
    render(<LoginPopover />)
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it('le formulaire est caché initialement', () => {
    render(<LoginPopover />)
    expect(screen.queryByLabelText(/e-mail/i)).toBeNull()
  })

  it('ouvre le formulaire au clic sur le déclencheur', () => {
    render(<LoginPopover />)
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connexion/i })).toBeInTheDocument()
  })

  it("affiche une erreur en cas d'identifiants incorrects", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response)
    render(<LoginPopover />)
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'agent@test.fr' } })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'mauvais' } })
    fireEvent.click(screen.getByRole('button', { name: /connexion/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('appelle router.refresh() et ferme le popover en cas de succès', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true } as Response)
    render(<LoginPopover />)
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'admin@test.fr' } })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'correct' } })
    fireEvent.click(screen.getByRole('button', { name: /connexion/i }))
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledOnce()
    })
    expect(screen.queryByLabelText(/e-mail/i)).toBeNull()
  })

  it('se ferme sur la touche Escape', () => {
    render(<LoginPopover />)
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByLabelText(/e-mail/i)).toBeNull()
  })
})
