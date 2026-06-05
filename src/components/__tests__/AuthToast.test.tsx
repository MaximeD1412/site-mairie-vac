import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'

const mockReplace = vi.hoisted(() => vi.fn())
const mockToastError = vi.hoisted(() => vi.fn())
const mockUseSearchParams = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useSearchParams: mockUseSearchParams,
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('sonner', () => ({
  toast: { error: mockToastError },
}))

import { AuthToast } from '../AuthToast'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthToast', () => {
  it('affiche le toast et nettoie l\'URL quand ?auth=required est présent', () => {
    mockUseSearchParams.mockReturnValue({ get: (key: string) => key === 'auth' ? 'required' : null })
    render(<AuthToast />)
    expect(mockToastError).toHaveBeenCalledWith('Vous devez être connecté pour accéder à cette page')
    expect(mockReplace).toHaveBeenCalledWith('/')
  })

  it("n'affiche pas le toast quand le paramètre est absent", () => {
    mockUseSearchParams.mockReturnValue({ get: () => null })
    render(<AuthToast />)
    expect(mockToastError).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
