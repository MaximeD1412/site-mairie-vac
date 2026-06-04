import Link from 'next/link'
import { HeaderClient } from './HeaderClient'

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

      <header className="sticky top-0 z-100 bg-brand shadow-md">
        <div className="mx-auto max-w-7xl px-6 h-17 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline shrink-0">
            <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center text-brand font-bold text-lg">
              M
            </div>
            <div className="text-white leading-tight">
              <strong className="block text-[15px] font-bold">La Ville-aux-Clercs</strong>
              <span className="text-[11px] text-white/85">Site officiel de la mairie</span>
            </div>
          </Link>

          {/* Nav + méga menu + actions — partie interactive côté client */}
          <HeaderClient items={items} />

        </div>
      </header>
    </>
  )
}
