'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ChevronDown, LogOut, NotebookPen } from 'lucide-react'
import { hrefFromNavItem } from '@/lib/links'
import { MobileMenu } from './MobileMenu'
import { LoginPopover } from './LoginPopover'

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
  role: 'admin' | 'agent' | null
  userName?: string | null
}

const navItemClass =
  'flex items-center gap-1 h-[68px] px-4 text-[13.5px] font-semibold uppercase tracking-[0.4px] border-b-[3px] transition-all no-underline'

const roleLabel: Record<string, string> = {
  admin: 'Administrateur',
  agent: 'Agent mairie',
}

export function HeaderClient({ items, role, userName }: HeaderClientProps) {
  const router = useRouter()
  const [openItem, setOpenItem] = useState<number | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function cancelClose() {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  function scheduleClose() {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpenItem(null), 100)
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) clearTimeout(closeTimer.current)
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenItem(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function handleLogout() {
    await fetch('/api/users/logout', { method: 'POST' })
    router.refresh()
  }

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
            <div
              key={i}
              onMouseEnter={() => {
                if (hasChildren) {
                  cancelClose()
                  setOpenItem(i)
                }
              }}
              onMouseLeave={() => {
                if (hasChildren) scheduleClose()
              }}
            >
              {hasChildren ? (
                <button
                  aria-expanded={isOpen}
                  aria-haspopup="true"
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
        {role != null && userName && (
          <div className="hidden md:flex flex-col items-end leading-tight mr-1">
            <strong className="text-white text-[13px] font-bold">{userName}</strong>
            <span className="text-white/70 text-[11px]">{roleLabel[role] ?? role}</span>
          </div>
        )}

        {role != null && (
          <Link
            href="/brouillons"
            aria-label="Mes brouillons"
            className="hidden md:flex items-center justify-center w-9 h-9 rounded bg-white/15 text-white hover:bg-white/25 transition-colors"
          >
            <NotebookPen size={15} aria-hidden="true" />
          </Link>
        )}

        {role === 'admin' && (
          <Link
            href="/admin"
            className="hidden md:flex items-center h-9 px-3 rounded bg-white/15 text-white text-[13px] font-medium hover:bg-white/25 transition-colors no-underline"
          >
            Administration
          </Link>
        )}

        {role != null && (
          <button
            onClick={handleLogout}
            aria-label="Se déconnecter"
            className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded bg-white/15 text-white text-[13px] font-medium hover:bg-red-500/80 hover:text-white transition-colors"
          >
            <LogOut size={13} aria-hidden="true" />
            Déconnexion
          </button>
        )}

        {role == null && (
          <div className="hidden md:block">
            <LoginPopover />
          </div>
        )}

        <button
          aria-label="Rechercher sur le site"
          className="w-9 h-9 rounded-full bg-white/12 text-white flex items-center justify-center hover:bg-white/22 transition-colors"
        >
          <Search size={16} aria-hidden="true" />
        </button>
        <MobileMenu items={items} role={role} onLogout={handleLogout} />
      </div>

      {/* Mega menu panel — full viewport width, below header bar */}
      {openItem !== null && (items[openItem]?.children?.length ?? 0) > 0 && (
        <div
          className="hidden md:block absolute left-1/2 -translate-x-1/2 w-screen top-full bg-white border-t-2 border-brand-light shadow-xl z-110"
          role="region"
          aria-label={`Sous-menu ${items[openItem]!.label}`}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto max-w-7xl px-6 py-6">
            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-2 list-none m-0 p-0">
              {items[openItem]!.children!.map((child, j) => (
                <li key={j}>
                  <Link
                    href={hrefFromNavItem(child)}
                    onClick={() => setOpenItem(null)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium text-text hover:bg-brand-pale hover:text-brand no-underline transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-brand shrink-0" aria-hidden />
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
