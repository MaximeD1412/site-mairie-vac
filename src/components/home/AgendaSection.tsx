import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface EventItem {
  id: string
  slug?: string | null
  title: string
  startDate?: string | null
  location?: string | null
  category?: string | null
}

interface AgendaSectionProps {
  events: EventItem[]
}

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export function AgendaSection({ events }: AgendaSectionProps) {
  return (
    <section className="bg-brand-pale py-14 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="text-[25px] font-extrabold text-brand">
            Agenda
            <span className="block w-10 h-1 bg-teal rounded mt-2" aria-hidden="true" />
          </h2>
          <Link href="/agenda" className="text-brand-mid text-[13px] font-semibold no-underline hover:text-teal">
            Tous les événements →
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="text-muted-foreground text-[13px]">Aucun événement à venir.</p>
        ) : (
          <ul className="flex flex-col gap-3 list-none p-0 m-0">
            {events.slice(0, 4).map((event) => {
              const date = event.startDate ? new Date(event.startDate) : null
              return (
                <li key={event.id}>
                  <Card className="rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <Link
                      href={`/agenda/${event.slug ?? event.id}`}
                      className="flex items-center gap-5 px-5 py-4 border-l-4 border-teal no-underline"
                      aria-label={`Voir l'événement : ${event.title}`}
                    >
                      {date && (
                        <div className="min-w-[54px] text-center bg-brand text-white rounded-lg py-2 px-1.5 shrink-0" aria-hidden="true">
                          <div className="text-[21px] font-extrabold leading-none">{date.getDate()}</div>
                          <div className="text-[10.5px] uppercase tracking-wide opacity-85 mt-0.5">{MONTHS_FR[date.getMonth()]}</div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <strong className="block text-[14.5px] font-bold text-foreground truncate">{event.title}</strong>
                        {event.location && (
                          <span className="text-[12px] text-muted-foreground">📍 {event.location}</span>
                        )}
                      </div>
                      {event.category && (
                        <Badge variant="outline" className="shrink-0 bg-brand-pale text-brand border-none text-[11px] font-semibold">
                          {event.category}
                        </Badge>
                      )}
                    </Link>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
