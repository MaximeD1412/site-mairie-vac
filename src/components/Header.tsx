import Link from 'next/link'
import { Search } from 'lucide-react'
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

interface HeaderProps {
  navigation?: { items?: NavItem[] }
}

export function Header({ navigation }: HeaderProps) {
  const items = navigation?.items ?? []

  return (
    <>
      {/* Skip link RGAA */}
      <a className="skip-link" href="#main-content">
        Aller au contenu principal
      </a>

      <header className="sticky top-0 z-50 bg-brand shadow-md">
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

          {/* Navigation principale */}
          <nav aria-label="Navigation principale" className="hidden md:flex">
            {items.map((item, i) => (
              <div key={i} className="relative group">
                <Link
                  href={hrefFromNavItem(item)}
                  className="flex items-center h-[68px] px-5 text-white/90 hover:text-white hover:bg-white/10 text-[13.5px] font-semibold uppercase tracking-[0.4px] border-b-[3px] border-transparent hover:border-brand-light transition-all no-underline"
                >
                  {item.label}
                </Link>

                {/* Dropdown enfants */}
                {item.children && item.children.length > 0 && (
                  <div className="absolute top-full left-0 min-w-[220px] bg-white shadow-lg border border-border rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {item.children.map((child, j) => (
                      <Link
                        key={j}
                        href={hrefFromNavItem(child)}
                        className="block px-5 py-3 text-[13.5px] text-text hover:bg-brand-pale hover:text-brand border-b border-border last:border-0 no-underline transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              aria-label="Rechercher sur le site"
              className="w-9 h-9 rounded-full bg-white/12 text-white flex items-center justify-center hover:bg-white/22 transition-colors"
            >
              <Search size={16} aria-hidden="true" />
            </button>
          </div>

        </div>
      </header>
    </>
  )
}
