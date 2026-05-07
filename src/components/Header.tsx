import Link from 'next/link'
import { hrefFromNavItem } from '@/lib/links'

export function Header({ navigation }: { navigation?: any }) {
  const items = navigation?.items || []
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="font-bold text-xl text-teal-800 no-underline">La Ville-aux-Clercs</Link>
        <nav aria-label="Navigation principale" className="hidden md:flex gap-5 text-sm font-medium">
          {items.map((item: any, i: number) => (
            <Link key={i} href={hrefFromNavItem(item)} className="text-slate-700 hover:text-teal-800">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
