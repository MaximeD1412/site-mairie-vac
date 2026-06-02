'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, ChevronDown } from 'lucide-react'
import { hrefFromNavItem } from '@/lib/links'
import { MobileMenu } from './MobileMenu'

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

interface HeaderProps {
  navigation?: { items?: NavItem[] }
}

export function Header({ navigation }: HeaderProps) {
  const [openItem, setOpenItem] = useState<number | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const items = navigation?.items ?? []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenItem(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenItem(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navItemClass =
    'flex items-center gap-1 h-[68px] px-4 text-[13.5px] font-semibold uppercase tracking-[0.4px] border-b-[3px] transition-all no-underline'

  return (
    <>
      {/* Skip link RGAA */}
      <a className="skip-link" href="#main-content">
        Aller au contenu principal
      </a>

      <header ref={headerRef} className="relative sticky top-0 z-[100] bg-brand shadow-md">
        <div className="mx-auto max-w-7xl px-6 h-[68px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline shrink-0">
            <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center text-brand font-bold text-lg">
              M
            </div>
            <div className="text-white leading-tight">
              <strong className="block text-[15px] font-bold">La Ville-aux-Clercs</strong>
              <span className="text-[11px] text-white/70">Site officiel de la mairie</span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Navigation principale" className="hidden md:flex">
            {items.map((item, i) => {
              const hasChildren = (item.children?.length ?? 0) > 0
              const isOpen = openItem === i
              const activeClass = isOpen
                ? 'text-brand-light border-brand-light bg-white/10'
                : 'text-white/90 border-transparent hover:text-brand-light hover:bg-white/10 hover:border-brand-light'

              return (
                <div key={i}>
                  {hasChildren ? (
                    <button
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      onClick={() => setOpenItem(isOpen ? null : i)}
                      className={`${navItemClass} ${activeClass}`}
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        aria-hidden="true"
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={hrefFromNavItem(item)}
                      className={`${navItemClass} text-white/90 border-transparent hover:text-brand-light hover:bg-white/10 hover:border-brand-light`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              aria-label="Rechercher sur le site"
              className="w-9 h-9 rounded-full bg-white/12 text-white flex items-center justify-center hover:bg-white/22 transition-colors"
            >
              <Search size={16} aria-hidden="true" />
            </button>
            <MobileMenu items={items} />
          </div>

        </div>

        {/* Mega menu panel — desktop, full width, below header bar */}
        {openItem !== null && (items[openItem]?.children?.length ?? 0) > 0 && (
          <div
            className="hidden md:block absolute inset-x-0 top-full bg-white border-t-2 border-brand-light shadow-xl z-[110]"
            role="region"
            aria-label={`Sous-menu ${items[openItem]!.label}`}
          >
            <div className="mx-auto max-w-7xl px-6 py-6">
              <ul className="grid grid-cols-2 lg:grid-cols-3 gap-2 list-none m-0 p-0">
                {items[openItem]!.children!.map((child, j) => (
                  <li key={j}>
                    <Link
                      href={hrefFromNavItem(child)}
                      onClick={() => setOpenItem(null)}
                      className="block px-4 py-3 rounded-lg text-[14px] font-medium text-text hover:bg-brand-pale hover:text-brand no-underline transition-colors"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </header>
    </>
  )
}
