import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

vi.mock('@/lib/links', () => ({
  hrefFromNavItem: (item: any) => {
    if (item.kind === 'page') return `/${item.page?.slug ?? ''}`
    if (item.kind === 'external') return item.url ?? '#'
    return '#'
  },
}))

import { MobileMenu } from '../MobileMenu'

const simpleItem = (label: string, slug = label.toLowerCase()) => ({
  label,
  kind: 'page' as const,
  page: { slug },
})

const groupItem = (label: string, children: ReturnType<typeof simpleItem>[]) => ({
  label,
  kind: 'none' as const,  // retourne '#' via le mock
  children,
})

const linkedGroupItem = (label: string, slug: string, children: ReturnType<typeof simpleItem>[]) => ({
  label,
  kind: 'page' as const,
  page: { slug },
  children,
})

describe('MobileMenu', () => {
  it('renders the hamburger button', () => {
    render(<MobileMenu items={[]} />)
    expect(screen.getByRole('button', { name: /ouvrir le menu/i })).toBeInTheDocument()
  })

  it('hamburger aria-expanded is false initially', () => {
    render(<MobileMenu items={[]} />)
    expect(screen.getByRole('button', { name: /ouvrir le menu/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('drawer is closed initially', () => {
    render(<MobileMenu items={[]} />)
    expect(screen.getByRole('dialog')).toHaveClass('-translate-x-full')
  })

  it('drawer is inert when closed', () => {
    render(<MobileMenu items={[simpleItem('Agenda')]} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('inert')
  })

  it('drawer is not inert when open', () => {
    render(<MobileMenu items={[simpleItem('Agenda')]} />)
    fireEvent.click(screen.getByRole('button', { name: /ouvrir le menu/i }))
    expect(screen.getByRole('dialog')).not.toHaveAttribute('inert')
  })

  it('opens drawer on hamburger click', () => {
    render(<MobileMenu items={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /ouvrir le menu/i }))
    expect(screen.getByRole('dialog')).toHaveClass('translate-x-0')
  })

  it('hamburger aria-expanded becomes true when open', () => {
    render(<MobileMenu items={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /ouvrir le menu/i }))
    expect(screen.getByRole('button', { name: /ouvrir le menu/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes drawer on close button click', () => {
    render(<MobileMenu items={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /ouvrir le menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /fermer le menu/i }))
    expect(screen.getByRole('dialog')).toHaveClass('-translate-x-full')
  })

  it('closes drawer on overlay click', () => {
    render(<MobileMenu items={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /ouvrir le menu/i }))
    fireEvent.click(screen.getByTestId('mobile-menu-overlay'))
    expect(screen.getByRole('dialog')).toHaveClass('-translate-x-full')
  })

  it('closes drawer on Escape key', () => {
    render(<MobileMenu items={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /ouvrir le menu/i }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('dialog')).toHaveClass('-translate-x-full')
  })

  it('renders nav items', () => {
    render(<MobileMenu items={[simpleItem('Mairie'), simpleItem('Agenda')]} />)
    expect(screen.getByText('Mairie')).toBeInTheDocument()
    expect(screen.getByText('Agenda')).toBeInTheDocument()
  })

  it('closes on simple link click', () => {
    render(<MobileMenu items={[simpleItem('Agenda')]} />)
    fireEvent.click(screen.getByRole('button', { name: /ouvrir le menu/i }))
    fireEvent.click(screen.getByRole('link', { name: 'Agenda' }))
    expect(screen.getByRole('dialog')).toHaveClass('-translate-x-full')
  })

  it('shows expand button for item with children', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil')])]
    render(<MobileMenu items={items} />)
    expect(screen.getByRole('button', { name: /développer/i })).toBeInTheDocument()
  })

  it('sub-items are hidden initially', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil')])]
    render(<MobileMenu items={items} />)
    expect(screen.queryByText('Conseil')).toBeNull()
  })

  it('shows sub-items after accordion expand', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil', 'conseil')])]
    render(<MobileMenu items={items} />)
    fireEvent.click(screen.getByRole('button', { name: /développer/i }))
    expect(screen.getByText('Conseil')).toBeInTheDocument()
  })

  it('hides sub-items after second accordion click', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil', 'conseil')])]
    render(<MobileMenu items={items} />)
    fireEvent.click(screen.getByRole('button', { name: /développer/i }))
    fireEvent.click(screen.getByRole('button', { name: /réduire/i }))
    expect(screen.queryByText('Conseil')).toBeNull()
  })

  it('multiple accordions can be open simultaneously', () => {
    const items = [
      groupItem('Mairie', [simpleItem('Conseil', 'conseil')]),
      groupItem('Services', [simpleItem('Documents', 'documents')]),
    ]
    render(<MobileMenu items={items} />)
    const expandBtns = screen.getAllByRole('button', { name: /développer/i })
    fireEvent.click(expandBtns[0])
    fireEvent.click(expandBtns[1])
    expect(screen.getByText('Conseil')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
  })

  it('renders parent as link when it has a valid href', () => {
    const items = [linkedGroupItem('Mairie', 'mairie', [simpleItem('Conseil', 'conseil')])]
    render(<MobileMenu items={items} />)
    expect(screen.getByRole('link', { name: 'Mairie' })).toHaveAttribute('href', '/mairie')
  })

  it('renders parent as button (not link) when href is #', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil', 'conseil')])]
    render(<MobileMenu items={items} />)
    const parentToggle = screen.getByRole('button', { name: 'Mairie' })
    expect(parentToggle).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Mairie' })).toBeNull()
  })

  it('sub-item links have correct hrefs', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil', 'conseil-municipal')])]
    render(<MobileMenu items={items} />)
    fireEvent.click(screen.getByRole('button', { name: /développer/i }))
    expect(screen.getByRole('link', { name: 'Conseil' })).toHaveAttribute('href', '/conseil-municipal')
  })

  it('returns focus to hamburger button when drawer closes', () => {
    vi.useFakeTimers()
    render(<MobileMenu items={[]} />)
    const hamburger = screen.getByRole('button', { name: /ouvrir le menu/i })
    fireEvent.click(hamburger)
    fireEvent.click(screen.getByRole('button', { name: /fermer le menu/i }))
    vi.runAllTimers()
    expect(document.activeElement).toBe(hamburger)
    vi.useRealTimers()
  })

  it('affiche un bouton "Se connecter" quand role est null', () => {
    render(<MobileMenu items={[]} role={null} />)
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it("n'affiche pas le bouton \"Se connecter\" quand role est défini", () => {
    render(<MobileMenu items={[]} role="agent" onLogout={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /se connecter/i })).toBeNull()
  })

  it('affiche le formulaire de connexion après clic sur "Se connecter"', async () => {
    render(<MobileMenu items={[]} role={null} />)
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  })

  it('accordion expand button has aria-controls pointing to submenu', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil', 'conseil')])]
    render(<MobileMenu items={items} />)
    const btn = screen.getByRole('button', { name: /développer mairie/i })
    expect(btn).toHaveAttribute('aria-controls', 'submenu-0')
  })
})
