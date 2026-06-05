import Image from 'next/image'

interface HeroImage {
  url?: string | null
  alt?: string | null
}

interface HeroSettings {
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroImage?: HeroImage | string | null
}

interface HeroProps {
  settings?: HeroSettings | null
}

export function Hero({ settings }: HeroProps) {
  const title = settings?.heroTitle ?? 'La Ville-aux-Clercs'
  const subtitle = settings?.heroSubtitle ?? 'Bienvenue sur le site officiel de la mairie'
  const image = settings?.heroImage && typeof settings.heroImage === 'object' ? settings.heroImage : null

  return (
    <div className="relative h-[380px] bg-gradient-to-br from-[#0d2a52] via-brand to-teal overflow-hidden flex items-center justify-center">

      {image?.url && (
        <Image
          src={image.url}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" aria-hidden="true" />

      <div className="relative text-center text-white px-6">
        <div className="inline-block mb-4 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest">
          Commune de Loir-et-Cher · 41160
        </div>
        <h1 className="text-[46px] font-extrabold leading-tight mb-3 drop-shadow-md">
          {title}
        </h1>
        <p className="text-[17px] text-white/85">{subtitle}</p>
      </div>

    </div>
  )
}
