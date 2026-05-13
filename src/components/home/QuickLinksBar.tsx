import Link from 'next/link'
import {
  Newspaper, CalendarDays, ClipboardList, School,
  Home, Phone, BookOpen, Users, FileText, Info,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'

type IconComponent = React.FC<LucideProps>

const ICON_MAP: Record<string, IconComponent> = {
  Newspaper, CalendarDays, ClipboardList, School,
  Home, Phone, BookOpen, Users, FileText, Info,
}

interface QuickLink {
  label: string
  icon?: string | null
  href: string
  id?: string | null
}

interface QuickLinksSettings {
  quickLinks?: QuickLink[] | null
}

interface QuickLinksBarProps {
  settings?: QuickLinksSettings | null
}

export function QuickLinksBar({ settings }: QuickLinksBarProps) {
  const links = settings?.quickLinks ?? []
  if (links.length === 0) return null

  return (
    <div className="bg-white shadow-[0_4px_20px_rgba(26,97,171,0.12)] relative z-10">
      <div className="mx-auto max-w-7xl px-6 flex justify-center flex-wrap">
        {links.map((link, i) => {
          const Icon = link.icon ? ICON_MAP[link.icon] : undefined
          return (
            <Link
              key={link.id ?? i}
              href={link.href}
              className="flex flex-col items-center gap-2 px-7 py-5 text-foreground hover:text-brand hover:bg-brand-pale border-b-[3px] border-transparent hover:border-teal min-w-[110px] no-underline transition-all"
            >
              <span className="w-[46px] h-[46px] rounded-xl bg-brand-pale flex items-center justify-center text-brand">
                {Icon && <Icon size={20} aria-hidden={true} />}
              </span>
              <span className="text-[11.5px] font-semibold text-center leading-tight">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
