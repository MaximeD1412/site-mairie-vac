import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import React from 'react'

const mockPush = vi.fn()
let mockPathname = '/initial'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}))

import { NavigationProvider, useNavigate, useIsPending } from '../NavigationContext'

function TestConsumer({ targetUrl = '/target' }: { targetUrl?: string }) {
  const navigate = useNavigate()
  const isPending = useIsPending()
  return (
    <div>
      <button onClick={() => navigate(targetUrl)}>navigate</button>
      {isPending && <div data-testid="overlay-visible" />}
    </div>
  )
}

function renderWithProvider(targetUrl?: string) {
  return render(
    <NavigationProvider>
      <TestConsumer targetUrl={targetUrl} />
    </NavigationProvider>
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  mockPathname = '/initial'
})

afterEach(() => {
  vi.useRealTimers()
})

describe('NavigationContext', () => {
  it('navigate() appelle router.push avec l\'URL cible', () => {
    renderWithProvider('/about')
    fireEvent.click(screen.getByRole('button', { name: 'navigate' }))
    expect(mockPush).toHaveBeenCalledWith('/about')
  })

  it('l\'overlay n\'est pas visible avant 200ms', () => {
    renderWithProvider()
    fireEvent.click(screen.getByRole('button', { name: 'navigate' }))
    act(() => { vi.advanceTimersByTime(199) })
    expect(screen.queryByTestId('overlay-visible')).toBeNull()
  })

  it('l\'overlay devient visible après 200ms', () => {
    renderWithProvider()
    fireEvent.click(screen.getByRole('button', { name: 'navigate' }))
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.getByTestId('overlay-visible')).toBeInTheDocument()
  })

  it('l\'overlay disparaît quand usePathname() change', () => {
    const { rerender } = render(
      <NavigationProvider>
        <TestConsumer />
      </NavigationProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'navigate' }))
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.getByTestId('overlay-visible')).toBeInTheDocument()

    mockPathname = '/target'
    rerender(
      <NavigationProvider>
        <TestConsumer />
      </NavigationProvider>
    )
    expect(screen.queryByTestId('overlay-visible')).toBeNull()
  })

  it('l\'overlay disparaît après 10 secondes (force-close)', () => {
    renderWithProvider()
    fireEvent.click(screen.getByRole('button', { name: 'navigate' }))
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.getByTestId('overlay-visible')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(10000) })
    expect(screen.queryByTestId('overlay-visible')).toBeNull()
  })

  it('le listener document déclenche l\'overlay sur un lien interne', () => {
    renderWithProvider()
    const link = document.createElement('a')
    link.href = '/autre-page'
    document.body.appendChild(link)
    fireEvent.click(link)
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.getByTestId('overlay-visible')).toBeInTheDocument()
    document.body.removeChild(link)
  })

  it('le listener document ne déclenche pas l\'overlay sur un lien externe', () => {
    renderWithProvider()
    const link = document.createElement('a')
    link.href = 'https://example.com/page'
    document.body.appendChild(link)
    fireEvent.click(link)
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.queryByTestId('overlay-visible')).toBeNull()
    document.body.removeChild(link)
  })

  it('le listener document ne déclenche pas l\'overlay sur un lien hash', () => {
    renderWithProvider()
    const link = document.createElement('a')
    link.href = '#section'
    document.body.appendChild(link)
    fireEvent.click(link)
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.queryByTestId('overlay-visible')).toBeNull()
    document.body.removeChild(link)
  })

  it('le listener document ne déclenche pas l\'overlay sur la même page', () => {
    mockPathname = '/current'
    renderWithProvider()
    const link = document.createElement('a')
    link.href = '/current'
    document.body.appendChild(link)
    fireEvent.click(link)
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.queryByTestId('overlay-visible')).toBeNull()
    document.body.removeChild(link)
  })
})
