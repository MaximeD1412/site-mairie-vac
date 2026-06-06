import Image from 'next/image'
import Link from 'next/link'

interface EventImage {
  url?: string | null
  alt?: string | null
}

interface EventCategory {
  name?: string | null
  color?: string | null
}

interface EventCardProps {
  slug: string
  title: string
  startDate: string
  endDate?: string | null
  location?: string | null
  category?: EventCategory | null
  image?: EventImage | string | null
}

const DAY_FMT: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Paris' }
const TIME_FMT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }

function formatDate(startISO: string): string {
  const start = new Date(startISO)
  return `${start.toLocaleDateString('fr-FR', DAY_FMT)} · ${start.toLocaleTimeString('fr-FR', TIME_FMT)}`
}

const DEFAULT_COLOR = '#3B82F6'

export function EventCard({ slug, title, startDate, location, category, image }: EventCardProps) {
  const img = image && typeof image === 'object' ? image as EventImage : null
  const color = category?.color ?? DEFAULT_COLOR

  return (
    <Link
      href={`/agenda/${slug}`}
      className="flex gap-4 rounded-2xl bg-white shadow-sm no-underline hover:shadow-md transition-shadow overflow-hidden"
    >
      {img?.url && (
        <div className="relative w-32 shrink-0 bg-slate-100">
          <Image src={img.url} alt={img.alt ?? title} fill className="object-cover" />
        </div>
      )}
      <div className="flex flex-col gap-1 py-4 pr-4" style={!img?.url ? { paddingLeft: '1rem' } : undefined}>
        {category?.name && (
          <span
            data-testid="event-card-badge"
            className="inline-block w-fit px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {category.name}
          </span>
        )}
        <strong className="text-base text-text leading-snug">{title}</strong>
        <span data-testid="event-card-date" className="text-[13px] text-slate-500">
          {formatDate(startDate)}
        </span>
        {location && (
          <span data-testid="event-card-location" className="text-[13px] text-slate-500">
            📍 {location}
          </span>
        )}
      </div>
    </Link>
  )
}
