import Image from 'next/image'
import Link from 'next/link'
import { RichTextBlock } from '@/components/blocks/RichTextBlock'

interface EventImage {
  url?: string | null
  alt?: string | null
}

interface EventOrganizer {
  name?: string | null
}

interface EventCategoryObject {
  name?: string | null
  color?: string | null
}

interface EventArticleProps {
  title: string
  startDate: string
  endDate?: string | null
  location?: string | null
  category?: EventCategoryObject | string | number | null
  organizer?: EventOrganizer | string | null
  image?: EventImage | string | null
  description?: any
}

const DAY_FMT: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Paris' }
const TIME_FMT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }

const toParisDate = (d: Date) =>
  d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })

function formatEventDate(startISO: string, endISO?: string | null): string {
  const start = new Date(startISO)
  const end = endISO ? new Date(endISO) : null

  const startDay = start.toLocaleDateString('fr-FR', DAY_FMT)
  const startTime = start.toLocaleTimeString('fr-FR', TIME_FMT)

  if (!end) return `${startDay} · ${startTime}`

  if (toParisDate(start) === toParisDate(end)) {
    const endTime = end.toLocaleTimeString('fr-FR', TIME_FMT)
    return `${startDay} · ${startTime} – ${endTime}`
  }

  const endDay = end.toLocaleDateString('fr-FR', DAY_FMT)
  return `Du ${startDay} au ${endDay}`
}

export function EventArticle({
  title,
  startDate,
  endDate,
  location,
  category,
  organizer,
  image,
  description,
}: EventArticleProps) {
  const img = image && typeof image === 'object' ? image : null
  const org = organizer && typeof organizer === 'object' ? organizer : null
  const categoryObj = category && typeof category === 'object' ? category as EventCategoryObject : null
  const categoryLabel = categoryObj?.name ?? (typeof category === 'string' ? category : null)
  const categoryColor = categoryObj?.color ?? '#3B82F6'

  return (
    <main>
      {img?.url && (
        <div className="relative h-64 w-full overflow-hidden bg-brand">
          <Image src={img.url} alt={img.alt ?? title} fill className="object-cover" />
        </div>
      )}
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/agenda" className="text-sm text-brand-mid hover:text-teal no-underline">
          ← Retour à l'agenda
        </Link>

        {categoryLabel && (
          <div className="mt-6">
            <span
              className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {categoryLabel}
            </span>
          </div>
        )}

        <h1 className="mt-3 text-3xl font-extrabold text-text leading-tight">{title}</h1>

        <div className="mt-6 rounded-xl border border-border bg-white px-5 py-4 flex flex-col gap-2 text-[14px] text-text">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">📅</span>
            <span data-testid="event-date">{formatEventDate(startDate, endDate)}</span>
          </div>
          {location && (
            <div className="flex items-center gap-2">
              <span aria-hidden="true">📍</span>
              <span data-testid="event-location">{location}</span>
            </div>
          )}
          {org?.name && (
            <div className="flex items-center gap-2">
              <span aria-hidden="true">👤</span>
              <span data-testid="event-organizer">{org.name}</span>
            </div>
          )}
        </div>

        {description && <RichTextBlock content={description} />}
      </div>
    </main>
  )
}
