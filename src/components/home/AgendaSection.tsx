import Link from 'next/link'
import { Plus } from 'lucide-react'
import { AgendaCarousel, type CarouselEvent } from './AgendaCarousel'
import { MiniCalendar } from './MiniCalendar'
import type { CalendarEventInput } from '@/lib/calendar'
import { EditButton } from '@/components/EditButton'

interface AgendaSectionProps {
  carouselEvents: CarouselEvent[]
  calendarEvents: CalendarEventInput[]
}

export function AgendaSection({ carouselEvents, calendarEvents }: AgendaSectionProps) {
  return (
    <section className="bg-brand-pale py-14 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="text-[25px] font-extrabold text-brand">
            Agenda
            <span className="block w-10 h-1 bg-teal rounded mt-2" aria-hidden="true" />
          </h2>
          <div className="flex items-center gap-3">
            <EditButton href="/agenda/new" label="Nouvel événement" icon={<Plus size={14} />} />
            <Link
              href="/agenda"
              className="text-brand-mid text-[13px] font-semibold no-underline hover:text-teal"
            >
              Tous les événements →
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Carousel — 60% */}
          <div className="w-full md:w-[60%]">
            {carouselEvents.length === 0 ? (
              <p className="text-muted text-[13px]">Aucun événement à venir.</p>
            ) : (
              <AgendaCarousel events={carouselEvents} />
            )}
          </div>

          {/* Mini-calendrier — 40% */}
          <div className="w-full md:w-[40%]">
            <MiniCalendar events={calendarEvents} showLegend />
          </div>
        </div>
      </div>
    </section>
  )
}
