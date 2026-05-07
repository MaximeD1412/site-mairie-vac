import Link from 'next/link'

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
          <p className="text-muted text-[13px]">Aucun événement à venir.</p>
        ) : (
          <ul className="flex flex-col gap-3 list-none p-0 m-0">
            {events.map((event) => {
              const date = event.startDate ? new Date(event.startDate) : null
              return (
                <li key={event.id}>
                  <Link
                    href={`/agenda/${event.slug ?? event.id}`}
                    className="flex items-center gap-5 bg-white rounded-xl px-5 py-4 border-l-4 border-teal no-underline hover:shadow-md transition-shadow"
                    aria-label={`Voir l'événement : ${event.title}`}
                  >
                    {date && (
                      <div className="min-w-[54px] text-center bg-brand text-white rounded-lg py-2 px-1.5 shrink-0" aria-hidden="true">
                        <div className="text-[21px] font-extrabold leading-none">{date.getDate()}</div>
                        <div className="text-[10.5px] uppercase tracking-wide opacity-85 mt-0.5">{MONTHS_FR[date.getMonth()]}</div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <strong className="block text-[14.5px] font-bold text-text truncate">{event.title}</strong>
                      {event.location && (
                        <span className="text-[12px] text-muted">📍 {event.location}</span>
                      )}
                    </div>
                    {event.category && (
                      <span className="shrink-0 bg-brand-pale text-brand px-3 py-1 rounded-full text-[11px] font-semibold">
                        {event.category}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
