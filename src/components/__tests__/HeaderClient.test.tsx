import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
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

vi.mock('../MobileMenu', () => ({
  MobileMenu: () => <div data-testid="mobile-menu" />,
}))

vi.mock('../LoginPopover', () => ({
  LoginPopover: () => <div data-testid="login-popover" />,
}))

import { HeaderClient } from '../HeaderClient'

const simpleItem = (label: string, slug = label.toLowerCase()) => ({
  label,
  kind: 'page' as const,
  page: { slug },
})

const groupItem = (label: string, children: ReturnType<typeof simpleItem>[]) => ({
  label,
  kind: 'none' as const,
  children,
})

describe('HeaderClient', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nav items', () => {
    render(<HeaderClient items={[simpleItem('Mairie'), simpleItem('Agenda')]} role={null} />)
    expect(screen.getByText('Mairie')).toBeInTheDocument()
    expect(screen.getByText('Agenda')).toBeInTheDocument()
  })

  it('mega-menu is closed initially', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil')])]
    render(<HeaderClient items={items} role={null} />)
    expect(screen.queryByRole('region', { name: /sous-menu mairie/i })).toBeNull()
  })

  it('hovering a nav item with children opens the mega-menu', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil')])]
    render(<HeaderClient items={items} role={null} />)
    fireEvent.mouseEnter(screen.getByText('Mairie').closest('div')!)
    expect(screen.getByRole('region', { name: /sous-menu mairie/i })).toBeInTheDocument()
  })

  it('mega-menu does not open on hover for items without children', () => {
    const items = [simpleItem('Agenda')]
    render(<HeaderClient items={items} role={null} />)
    const link = screen.getByRole('link', { name: 'Agenda' })
    fireEvent.mouseEnter(link.closest('div')!)
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('moving mouse away from nav item closes the menu after 100ms', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil')])]
    render(<HeaderClient items={items} role={null} />)
    const wrapper = screen.getByText('Mairie').closest('div')!
    fireEvent.mouseEnter(wrapper)
    expect(screen.getByRole('region', { name: /sous-menu mairie/i })).toBeInTheDocument()
    fireEvent.mouseLeave(wrapper)
    // before delay — still open
    expect(screen.getByRole('region', { name: /sous-menu mairie/i })).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(100) })
    expect(screen.queryByRole('region', { name: /sous-menu mairie/i })).toBeNull()
  })

  it('entering the panel cancels the close timer', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil')])]
    render(<HeaderClient items={items} role={null} />)
    fireEvent.mouseEnter(screen.getByText('Mairie').closest('div')!)
    const panel = screen.getByRole('region', { name: /sous-menu mairie/i })
    fireEvent.mouseLeave(screen.getByText('Mairie').closest('div')!)
    fireEvent.mouseEnter(panel)
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.getByRole('region', { name: /sous-menu mairie/i })).toBeInTheDocument()
  })

  it('leaving the panel closes the menu after 100ms', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil')])]
    render(<HeaderClient items={items} role={null} />)
    fireEvent.mouseEnter(screen.getByText('Mairie').closest('div')!)
    const panel = screen.getByRole('region', { name: /sous-menu mairie/i })
    fireEvent.mouseLeave(panel)
    act(() => { vi.advanceTimersByTime(100) })
    expect(screen.queryByRole('region', { name: /sous-menu mairie/i })).toBeNull()
  })

  it('pressing Escape closes the open mega-menu', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil')])]
    render(<HeaderClient items={items} role={null} />)
    fireEvent.mouseEnter(screen.getByText('Mairie').closest('div')!)
    expect(screen.getByRole('region', { name: /sous-menu mairie/i })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('region', { name: /sous-menu mairie/i })).toBeNull()
  })

  it('hovering a second item closes the first and opens the second', () => {
    const items = [
      groupItem('Mairie', [simpleItem('Conseil')]),
      groupItem('Services', [simpleItem('Documents')]),
    ]
    render(<HeaderClient items={items} role={null} />)
    fireEvent.mouseEnter(screen.getByText('Mairie').closest('div')!)
    expect(screen.getByRole('region', { name: /sous-menu mairie/i })).toBeInTheDocument()
    fireEvent.mouseEnter(screen.getByText('Services').closest('div')!)
    expect(screen.queryByRole('region', { name: /sous-menu mairie/i })).toBeNull()
    expect(screen.getByRole('region', { name: /sous-menu services/i })).toBeInTheDocument()
  })

  it('sub-items are rendered inside the mega-menu', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil'), simpleItem('Histoire')])]
    render(<HeaderClient items={items} role={null} />)
    fireEvent.mouseEnter(screen.getByText('Mairie').closest('div')!)
    expect(screen.getByText('Conseil')).toBeInTheDocument()
    expect(screen.getByText('Histoire')).toBeInTheDocument()
  })

  it('each sub-item has a colored bullet span', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil'), simpleItem('Histoire')])]
    render(<HeaderClient items={items} role={null} />)
    fireEvent.mouseEnter(screen.getByText('Mairie').closest('div')!)
    const panel = screen.getByRole('region', { name: /sous-menu mairie/i })
    const bullets = panel.querySelectorAll('span.rounded-full.bg-brand')
    expect(bullets).toHaveLength(2)
    bullets.forEach(b => expect(b).toHaveAttribute('aria-hidden'))
  })

  it('mega-menu panel has full-viewport-width class', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil')])]
    render(<HeaderClient items={items} role={null} />)
    fireEvent.mouseEnter(screen.getByText('Mairie').closest('div')!)
    const panel = screen.getByRole('region', { name: /sous-menu mairie/i })
    expect(panel.className).toMatch(/w-screen/)
  })

  it('clicking a sub-item closes the mega-menu', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil', 'conseil')])]
    render(<HeaderClient items={items} role={null} />)
    fireEvent.mouseEnter(screen.getByText('Mairie').closest('div')!)
    fireEvent.click(screen.getByRole('link', { name: /conseil/i }))
    expect(screen.queryByRole('region', { name: /sous-menu mairie/i })).toBeNull()
  })

  it('button has aria-expanded=false when mega-menu is closed', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil')])]
    render(<HeaderClient items={items} role={null} />)
    expect(screen.getByRole('button', { name: /mairie/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('button has aria-expanded=true when mega-menu is open', () => {
    const items = [groupItem('Mairie', [simpleItem('Conseil')])]
    render(<HeaderClient items={items} role={null} />)
    fireEvent.mouseEnter(screen.getByText('Mairie').closest('div')!)
    expect(screen.getByRole('button', { name: /mairie/i })).toHaveAttribute('aria-expanded', 'true')
  })
})
