import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/page',
}))

vi.mock('lucide-react', () => ({
  Loader2: () => <svg data-testid="loader-icon" />,
}))

import { NavigationProvider, useNavigate } from '../NavigationContext'
import { NavigationOverlay } from '../NavigationOverlay'

function App() {
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate('/other')}>go</button>
      <NavigationOverlay />
    </>
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('NavigationOverlay', () => {
  it("n'est pas visible quand aucune navigation n'est en cours", () => {
    render(
      <NavigationProvider>
        <App />
      </NavigationProvider>
    )
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.queryByTestId('loader-icon')).toBeNull()
  })

  it('est visible après 200ms de navigation en cours', () => {
    render(
      <NavigationProvider>
        <App />
      </NavigationProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'go' }))
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
  })

  it("couvre tout l'écran et bloque les interactions", () => {
    render(
      <NavigationProvider>
        <App />
      </NavigationProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'go' }))
    act(() => { vi.advanceTimersByTime(200) })
    const overlay = screen.getByRole('status')
    expect(overlay.className).toContain('fixed')
    expect(overlay.className).toContain('inset-0')
  })
})
