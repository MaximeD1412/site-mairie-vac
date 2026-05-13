import Link from 'next/link'
import { Search, Menu } from 'lucide-react'
import { hrefFromNavItem } from '@/lib/links'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

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

      <header className="sticky top-0 z-[100] bg-brand shadow-md">
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

          {/* Navigation principale — desktop */}
          <nav aria-label="Navigation principale" className="hidden md:flex">
            {items.map((item, i) => (
              <div key={i} className="relative group">
                <Link
                  href={hrefFromNavItem(item)}
                  className="flex items-center h-[68px] px-5 text-white/90 hover:text-brand-light hover:bg-white/10 text-[13.5px] font-semibold uppercase tracking-[0.4px] border-b-[3px] border-transparent hover:border-brand-light transition-all no-underline"
                >
                  {item.label}
                </Link>
                {item.children && item.children.length > 0 && (
                  <div className="absolute top-full left-0 min-w-[220px] bg-white shadow-lg border border-border rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-[110]">
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
            <Button
              variant="ghost"
              size="icon"
              aria-label="Rechercher sur le site"
              className="text-white hover:bg-white/12 hover:text-white"
            >
              <Search size={16} aria-hidden="true" />
            </Button>

            {/* Mobile nav */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Ouvrir le menu de navigation"
                  className="md:hidden text-white hover:bg-white/12 hover:text-white"
                >
                  <Menu size={20} aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <nav aria-label="Navigation mobile" className="flex flex-col pt-6">
                  {items.map((item, i) => (
                    <div key={i}>
                      <Link
                        href={hrefFromNavItem(item)}
                        className="block px-6 py-3 text-[14px] font-semibold hover:bg-brand-pale hover:text-brand transition-colors no-underline"
                      >
                        {item.label}
                      </Link>
                      {item.children?.map((child, j) => (
                        <Link
                          key={j}
                          href={hrefFromNavItem(child)}
                          className="block px-10 py-2.5 text-[13px] text-muted-foreground hover:bg-brand-pale hover:text-brand transition-colors no-underline"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </header>
    </>
  )
}
