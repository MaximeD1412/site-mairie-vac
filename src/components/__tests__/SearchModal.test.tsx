import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import React from 'react'

const mockNavigate = vi.fn()

vi.mock('../NavigationContext', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('lucide-react', () => ({
  X: () => <svg data-testid="icon-x" />,
  Search: () => <svg data-testid="icon-search" />,
  Loader2: () => <svg data-testid="icon-loader" />,
}))

import { SearchModal } from '../SearchModal'

const mockClose = vi.fn()

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  global.fetch = vi.fn()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('SearchModal', () => {
  it('affiche le dialog avec un input de recherche', () => {
    render(<SearchModal onClose={mockClose} />)
    expect(screen.getByRole('dialog', { name: /recherche/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/terme de recherche/i)).toBeInTheDocument()
  })

  it('appelle onClose sur la touche Escape', () => {
    render(<SearchModal onClose={mockClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(mockClose).toHaveBeenCalledOnce()
  })

  it('appelle onClose en cliquant sur l\'overlay', () => {
    render(<SearchModal onClose={mockClose} />)
    fireEvent.click(screen.getByRole('dialog'))
    expect(mockClose).toHaveBeenCalledOnce()
  })

  it('appelle onClose en cliquant le bouton de fermeture', () => {
    render(<SearchModal onClose={mockClose} />)
    fireEvent.click(screen.getByRole('button', { name: /fermer/i }))
    expect(mockClose).toHaveBeenCalledOnce()
  })

  it('ne déclenche pas de requête si le terme fait moins de 2 caractères', () => {
    render(<SearchModal onClose={mockClose} />)
    fireEvent.change(screen.getByLabelText(/terme de recherche/i), { target: { value: 'a' } })
    act(() => { vi.advanceTimersByTime(300) })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('déclenche une requête après 300ms de debounce', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ json: async () => [] } as Response)
    render(<SearchModal onClose={mockClose} />)
    fireEvent.change(screen.getByLabelText(/terme de recherche/i), { target: { value: 'mairie' } })
    expect(global.fetch).not.toHaveBeenCalled()
    await act(async () => { await vi.runAllTimersAsync() })
    expect(global.fetch).toHaveBeenCalledWith('/api/search?q=mairie')
  })

  it("annule la requête précédente si l'utilisateur retape avant 300ms", async () => {
    vi.mocked(global.fetch).mockResolvedValue({ json: async () => [] } as Response)
    render(<SearchModal onClose={mockClose} />)
    const input = screen.getByLabelText(/terme de recherche/i)
    fireEvent.change(input, { target: { value: 'mai' } })
    act(() => { vi.advanceTimersByTime(200) })
    fireEvent.change(input, { target: { value: 'mairie' } })
    await act(async () => { await vi.runAllTimersAsync() })
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith('/api/search?q=mairie')
  })

  it('affiche le message "Aucun résultat" si la liste est vide', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ json: async () => [] } as Response)
    render(<SearchModal onClose={mockClose} />)
    fireEvent.change(screen.getByLabelText(/terme de recherche/i), { target: { value: 'zzz' } })
    await act(async () => { await vi.runAllTimersAsync() })
    expect(screen.getByText(/aucun résultat pour « zzz »/i)).toBeInTheDocument()
  })

  it('affiche les résultats avec badge type + titre + date', async () => {
    const results = [
      { title: 'Conseil municipal', type: 'Actualité', date: '2024-03-15T00:00:00.000Z', url: '/actualites/conseil' },
      { title: 'Fête du village', type: 'Événement', date: '2024-06-01T00:00:00.000Z', url: '/agenda/fete' },
      { title: 'Contact', type: 'Page', date: null, url: '/contact' },
    ]
    vi.mocked(global.fetch).mockResolvedValueOnce({ json: async () => results } as Response)
    render(<SearchModal onClose={mockClose} />)
    fireEvent.change(screen.getByLabelText(/terme de recherche/i), { target: { value: 'conseil' } })
    await act(async () => { await vi.runAllTimersAsync() })
    expect(screen.getByText('Conseil municipal')).toBeInTheDocument()
    expect(screen.getByText('Actualité')).toBeInTheDocument()
    expect(screen.getByText('Fête du village')).toBeInTheDocument()
    expect(screen.getByText('Événement')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Page')).toBeInTheDocument()
  })

  it("n'affiche pas de date pour les résultats de type Page", async () => {
    const results = [
      { title: 'Contact', type: 'Page', date: null, url: '/contact' },
    ]
    vi.mocked(global.fetch).mockResolvedValueOnce({ json: async () => results } as Response)
    render(<SearchModal onClose={mockClose} />)
    fireEvent.change(screen.getByLabelText(/terme de recherche/i), { target: { value: 'contact' } })
    await act(async () => { await vi.runAllTimersAsync() })
    expect(screen.getByText('Contact')).toBeInTheDocument()
    const listbox = screen.getByRole('listbox')
    expect(listbox.querySelector('span:last-child[class*="text-gray-400"]')).toBeNull()
  })

  it("navigue vers l'URL et ferme le modal au clic sur un résultat", async () => {
    const results = [
      { title: 'Conseil municipal', type: 'Actualité', date: null, url: '/actualites/conseil' },
    ]
    vi.mocked(global.fetch).mockResolvedValueOnce({ json: async () => results } as Response)
    render(<SearchModal onClose={mockClose} />)
    fireEvent.change(screen.getByLabelText(/terme de recherche/i), { target: { value: 'conseil' } })
    await act(async () => { await vi.runAllTimersAsync() })
    fireEvent.click(screen.getByText('Conseil municipal'))
    expect(mockNavigate).toHaveBeenCalledWith('/actualites/conseil')
    expect(mockClose).toHaveBeenCalledOnce()
  })
})
