import Link from 'next/link'
import { NewsCard } from '@/components/news/NewsCard'
import type { NewsItem } from '@/components/news/NewsCard'

interface SiteSettingsData {
  panneauPocketUrl?: string | null
}

interface ActuPanneauSectionProps {
  news: NewsItem[]
  settings?: SiteSettingsData | null
  role?: string
}

export function ActuPanneauSection({ news, settings, role }: ActuPanneauSectionProps) {
  const [featured, ...allRest] = news
  const rest = allRest.slice(0, 2)
  const panneauUrl = settings?.panneauPocketUrl

  return (
    <section className="py-14 px-6">
      <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-[1fr_380px]">

        {/* Colonne gauche — Actualités */}
        <div>
          <div className="flex items-baseline justify-between mb-7">
            <h2 className="text-[25px] font-extrabold text-brand">
              Actualités
              <span className="block w-10 h-1 bg-teal rounded mt-2" aria-hidden="true" />
            </h2>
            <div className="flex items-center gap-3">
              {(role === 'agent' || role === 'admin') && (
                <Link href="/actualites/new" className="inline-flex items-center gap-1 text-[12px] font-semibold text-teal border border-teal rounded px-2 py-1 hover:bg-teal hover:text-white transition-colors no-underline">
                  + Nouvelle actualité
                </Link>
              )}
              <Link href="/actualites" className="text-brand-mid text-[13px] font-semibold no-underline hover:text-teal">
                Toutes les actualités →
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {featured && <NewsCard item={featured} featured />}
            {rest.map((item) => <NewsCard key={item.id} item={item} />)}
            {news.length === 0 && (
              <p className="text-muted text-[13px]">Aucune actualité pour le moment.</p>
            )}
          </div>
        </div>

        {/* Colonne droite — PanneauPocket */}
        <div>
          <div className="flex items-baseline mb-7">
            <h2 className="text-[25px] font-extrabold text-brand">
              Infos locales
              <span className="block w-10 h-1 bg-teal rounded mt-2" aria-hidden="true" />
            </h2>
          </div>
          <div className="rounded-xl overflow-hidden border border-border flex flex-col min-h-[480px]">
            <div className="bg-brand flex items-center gap-3 px-5 py-3.5 shrink-0">
              <div className="w-8 h-8 rounded-md bg-teal flex items-center justify-center text-white text-base" aria-hidden="true">📢</div>
              <div>
                <strong className="block text-white text-[14px]">PanneauPocket</strong>
                <span className="text-white/70 text-[11px]">La Ville-aux-Clercs</span>
              </div>
            </div>
            {panneauUrl ? (
              <iframe
                src={panneauUrl}
                title="Informations locales — PanneauPocket La Ville-aux-Clercs"
                className="flex-1 w-full border-0 min-h-[440px]"
                loading="lazy"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted text-[13px] p-6 text-center bg-[#f8faff]">
                URL PanneauPocket non configurée.<br />
                Renseigner dans <em>Paramètres du site</em> dans l&apos;administration.
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
