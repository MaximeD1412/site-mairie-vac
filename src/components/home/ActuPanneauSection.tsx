import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface NewsImage {
  url?: string | null
}

interface NewsItem {
  id: string
  slug?: string | null
  title: string
  summary?: string | null
  publishedAt?: string | null
  image?: NewsImage | string | null
}

interface SiteSettingsData {
  panneauPocketUrl?: string | null
}

interface ActuPanneauSectionProps {
  news: NewsItem[]
  settings?: SiteSettingsData | null
}

function NewsCard({ item, featured }: { item: NewsItem; featured?: boolean }) {
  const image = item.image && typeof item.image === 'object' ? item.image : null

  return (
    <Link
      href={`/actualites/${item.slug ?? item.id}`}
      aria-label={`Lire l'actualité : ${item.title}`}
      className="no-underline"
    >
      <Card className={`overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all ${featured ? 'flex-col' : 'flex-row'} flex rounded-xl`}>
        <div className={`bg-gradient-to-br from-brand-light to-brand-mid relative ${featured ? 'h-[200px]' : 'w-[130px] shrink-0'}`}>
          {image?.url && (
            <Image src={image.url} alt="" aria-hidden="true" fill className="object-cover" />
          )}
        </div>
        <CardContent className="p-5 flex flex-col gap-2">
          <Badge variant="secondary" className="bg-teal-light text-teal w-fit text-[10.5px] uppercase tracking-wide font-bold">
            {featured ? 'À la une' : 'Actualité'}
          </Badge>
          <strong className="text-[15px] font-bold text-foreground leading-snug">{item.title}</strong>
          {item.summary && <p className="text-[13px] text-muted-foreground line-clamp-2">{item.summary}</p>}
          <span className="text-[11.5px] text-muted-foreground">
            {item.publishedAt
              ? new Date(item.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
              : ''}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

export function ActuPanneauSection({ news, settings }: ActuPanneauSectionProps) {
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
            <Link href="/actualites" className="text-brand-mid text-[13px] font-semibold no-underline hover:text-teal">
              Toutes les actualités →
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {featured && <NewsCard item={featured} featured />}
            {rest.map((item) => <NewsCard key={item.id} item={item} />)}
            {news.length === 0 && (
              <p className="text-muted-foreground text-[13px]">Aucune actualité pour le moment.</p>
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
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-[13px] p-6 text-center bg-[#f8faff]">
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
