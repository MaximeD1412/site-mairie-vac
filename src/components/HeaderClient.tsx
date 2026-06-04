'use client'

import { useState, useEffect } from 'react'
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

interface HeaderClientProps {
  items: NavItem[]
}

const navItemClass =
  'flex items-center gap-1 h-[68px] px-4 text-[13.5px] font-semibold uppercase tracking-[0.4px] border-b-[3px] transition-all no-underline'

export function HeaderClient({ items }: HeaderClientProps) {
  const [openItem, setOpenItem] = useState<number | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const header = document.querySelector('header')
      if (header && !header.contains(e.target as Node)) setOpenItem(null)
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

  return (
    <>
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
                    aria-hidden
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

      {/* Mega menu panel — absolute, full width, below header bar */}
      {openItem !== null && (items[openItem]?.children?.length ?? 0) > 0 && (
        <div
          className="hidden md:block absolute inset-x-0 top-full bg-white border-t-2 border-brand-light shadow-xl z-110"
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
    </>
  )
}
