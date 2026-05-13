"use client"

import Link from 'next/link'
import { Menu } from 'lucide-react'
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

export function MobileNav({ items }: { items: NavItem[] }) {
  return (
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
  )
}
