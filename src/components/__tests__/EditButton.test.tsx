import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

vi.mock('@/lib/auth', () => ({
  decodePayloadToken: vi.fn(),
}))

import { cookies } from 'next/headers'
import { decodePayloadToken } from '@/lib/auth'
import { EditButton } from '../EditButton'

const mockCookies = vi.mocked(cookies)
const mockDecode = vi.mocked(decodePayloadToken)

function mockToken(role: string | null) {
  const tokenValue = role ? 'fake.token.value' : undefined
  mockCookies.mockResolvedValue({
    get: vi.fn().mockReturnValue(tokenValue ? { value: tokenValue } : undefined),
  } as any)
  if (role) {
    mockDecode.mockReturnValue({ role })
  } else {
    mockDecode.mockReturnValue(null)
  }
}

describe('EditButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a link for admin users', async () => {
    mockToken('admin')
    const element = await EditButton({ href: '/actualites/new', label: 'Nouvelle actualité' })
    render(element as React.ReactElement)
    const link = screen.getByRole('link', { name: 'Nouvelle actualité' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/actualites/new')
  })

  it('renders a link for agent users', async () => {
    mockToken('agent')
    const element = await EditButton({ href: '/agenda/new', label: 'Nouvel événement' })
    render(element as React.ReactElement)
    expect(screen.getByRole('link', { name: 'Nouvel événement' })).toBeInTheDocument()
  })

  it('renders nothing for unauthenticated users', async () => {
    mockToken(null)
    const element = await EditButton({ href: '/actualites/new', label: 'Nouvelle actualité' })
    expect(element).toBeNull()
  })

  it('renders nothing for unknown roles', async () => {
    mockToken('visitor')
    const element = await EditButton({ href: '/actualites/new', label: 'Nouvelle actualité' })
    expect(element).toBeNull()
  })

  it('applies primary styles by default', async () => {
    mockToken('admin')
    const element = await EditButton({ href: '/actualites/new', label: 'Test' })
    render(element as React.ReactElement)
    const link = screen.getByRole('link')
    expect(link.className.split(' ')).toContain('bg-brand')
    expect(link.className.split(' ')).not.toContain('border-brand')
  })

  it('applies secondary styles when variant="secondary"', async () => {
    mockToken('admin')
    const element = await EditButton({ href: '/actualites/new', label: 'Test', variant: 'secondary' })
    render(element as React.ReactElement)
    const link = screen.getByRole('link')
    expect(link.className.split(' ')).toContain('border-brand')
    expect(link.className.split(' ')).not.toContain('bg-brand')
  })
})
