import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

interface OpeningHour {
  days?: string | null
  hours?: string | null
  id?: string | null
}

interface MairieInfoData {
  address?: string | null
  phone?: string | null
  email?: string | null
  facebookUrl?: string | null
  openingHours?: OpeningHour[] | null
}

interface NavItem {
  label: string
  url?: string | null
  kind?: string
  page?: { slug: string } | null
}

interface FooterNavData {
  items?: NavItem[] | null
}

interface FooterProps {
  mairieInfo?: MairieInfoData | null
  footerNav?: FooterNavData | null
}

export function Footer({ mairieInfo, footerNav }: FooterProps) {
  const links = footerNav?.items ?? []
  const hours = mairieInfo?.openingHours ?? []

  return (
    <footer className="bg-brand text-white/85">
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-8 grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">

        {/* Colonne 1 — identité + coordonnées */}
        <div>
          <strong className="block text-white text-[17px] mb-1">La Ville-aux-Clercs</strong>
          <span className="text-white/60 text-[11px]">Site officiel · 41160</span>
          <p className="mt-4 text-[13px] leading-7">
            {mairieInfo?.address ?? '1 Rue de la Mairie, 41160 La Ville-aux-Clercs'}<br />
            {mairieInfo?.phone && <>{mairieInfo.phone}<br /></>}
            {mairieInfo?.email && <>{mairieInfo.email}</>}
          </p>
        </div>

        {/* Colonne 2 — liens nav footer */}
        <div>
          <h2 className="text-brand-light text-[11px] uppercase tracking-widest font-bold mb-3">
            Navigation
          </h2>
          <ul className="space-y-2 list-none p-0 m-0">
            {links.map((item, i) => (
              <li key={item.label ?? i}>
                <Link
                  href={item.url ?? (item.page?.slug ? `/${item.page.slug}` : '#')}
                  className="text-white/75 hover:text-white text-[13px] no-underline transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Colonne 3 — horaires */}
        <div>
          <h2 className="text-brand-light text-[11px] uppercase tracking-widest font-bold mb-3">
            Horaires mairie
          </h2>
          <ul className="space-y-2 list-none p-0 m-0">
            {hours.length > 0
              ? hours.map((h, i) => (
                  <li key={h.id ?? i} className="text-[13px] text-white/75">{h.days} : {h.hours}</li>
                ))
              : (
                <>
                  <li className="text-[13px] text-white/75">Lun–Ven : 9h–12h</li>
                  <li className="text-[13px] text-white/75">Mar–Jeu : 14h–17h</li>
                </>
              )}
          </ul>
        </div>

        {/* Colonne 4 — légal */}
        <div>
          <h2 className="text-brand-light text-[11px] uppercase tracking-widest font-bold mb-3">
            Informations
          </h2>
          <ul className="space-y-2 list-none p-0 m-0">
            <li><Link href="/mentions-legales" className="text-white/75 hover:text-white text-[13px] no-underline transition-colors">Mentions légales</Link></li>
            <li><Link href="/accessibilite" className="text-white/75 hover:text-white text-[13px] no-underline transition-colors">Accessibilité</Link></li>
          </ul>
        </div>

      </div>

      <div className="mx-auto max-w-7xl px-6">
        <Separator className="bg-white/10" />
        <div className="py-4 flex justify-between text-[12px] text-white/50">
          <span>© {new Date().getFullYear()} Mairie de La Ville-aux-Clercs</span>
          <span>Tous droits réservés</span>
        </div>
      </div>
    </footer>
  )
}
