'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { hrefFromNavItem } from '@/lib/links'

interface NavChild {
  label: string
  kind: string
  page?: { slug: string }
  url?: string
}

interface NavItem {
  label: string
  kind: string
  page?: { slug: string }
  url?: string
  children?: NavChild[]
}

interface MobileMenuProps {
  items: NavItem[]
}

export function MobileMenu({ items }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setIsOpen(false)
    // Focus return is deferred to next tick so inert is removed first
    setTimeout(() => triggerRef.current?.focus(), 0)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const dialog = dialogRef.current
    const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

    const getFocusables = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(focusableSelectors) ?? [])

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key !== 'Tab' || !dialog) return

      const focusables = getFocusables()
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handler)

    // Move focus into the dialog when it opens
    const focusables = getFocusables()
    if (focusables.length > 0) focusables[0].focus()

    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, close])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const toggleItem = useCallback((index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={isOpen}
        className="md:hidden w-9 h-9 rounded-full bg-white/12 text-white flex items-center justify-center hover:bg-white/22 transition-colors"
      >
        <span aria-hidden="true" className="text-lg leading-none">☰</span>
      </button>

      {isOpen && (
        <div
          data-testid="mobile-menu-overlay"
          className="fixed inset-0 bg-black/50 z-[200]"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        inert={!isOpen || undefined}
        className={`fixed top-0 left-0 h-full w-[280px] max-w-[85vw] bg-brand z-[210] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-[68px] shrink-0 border-b border-white/10">
          <Link href="/" onClick={close} className="flex items-center gap-3 no-underline">
            <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center text-brand font-bold text-sm">
              M
            </div>
            <span className="text-white text-[14px] font-bold">La Ville-aux-Clercs</span>
          </Link>
          <button
            onClick={close}
            aria-label="Fermer le menu"
            className="w-9 h-9 rounded-full bg-white/12 text-white flex items-center justify-center hover:bg-white/22 transition-colors"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2" aria-label="Menu principal">
          {items.map((item, i) => {
            const href = hrefFromNavItem(item)
            const hasChildren = Array.isArray(item.children) && item.children.length > 0
            const isExpanded = openItems.has(i)

            if (!hasChildren) {
              return (
                <Link
                  key={i}
                  href={href}
                  onClick={close}
                  className="flex items-center px-5 py-3 text-white/90 hover:text-white hover:bg-white/10 text-[14px] font-semibold no-underline transition-colors"
                >
                  {item.label}
                </Link>
              )
            }

            return (
              <div key={i}>
                <div className="flex items-center">
                  {href !== '#' ? (
                    <Link
                      href={href}
                      onClick={close}
                      className="flex-1 px-5 py-3 text-white/90 hover:text-white hover:bg-white/10 text-[14px] font-semibold no-underline transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => toggleItem(i)}
                      aria-expanded={isExpanded}
                      aria-controls={`submenu-${i}`}
                      className="flex-1 px-5 py-3 text-white/90 hover:text-white hover:bg-white/10 text-[14px] font-semibold transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  )}
                  <button
                    onClick={() => toggleItem(i)}
                    aria-label={isExpanded ? `Réduire ${item.label}` : `Développer ${item.label}`}
                    aria-expanded={isExpanded}
                    aria-controls={`submenu-${i}`}
                    className="px-4 py-3 text-white/70 hover:text-white transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-block text-[10px] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    >
                      ▶
                    </span>
                  </button>
                </div>

                {isExpanded && (
                  <div id={`submenu-${i}`}>
                    {item.children!.map((child, j) => (
                      <Link
                        key={j}
                        href={hrefFromNavItem(child)}
                        onClick={close}
                        className="flex items-center pl-10 pr-5 py-2.5 text-white/75 hover:text-white hover:bg-white/10 text-[13px] no-underline transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </>
  )
}
