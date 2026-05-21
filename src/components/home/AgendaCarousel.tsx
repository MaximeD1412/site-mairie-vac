'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface CarouselCategory {
  name?: string | null
  color?: string | null
}

export interface CarouselImage {
  url?: string | null
  alt?: string | null
}

export interface CarouselEvent {
  id: string
  slug?: string | null
  title: string
  startDate: string
  endDate?: string | null
  location?: string | null
  category?: CarouselCategory | null
  image?: CarouselImage | null
}

const CONTAINER_H = 480
const SLIDE_H = Math.round(CONTAINER_H * 0.75) // 360px
const AUTO_MS = 5000
const DEFAULT_COLOR = '#3B82F6'

const DAY_FMT: Intl.DateTimeFormatOptions = {
  weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Paris',
}
const TIME_FMT: Intl.DateTimeFormatOptions = {
  hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris',
}

function toParisDateStr(d: Date): string {
  return d.toLocaleString('sv-SE', { timeZone: 'Europe/Paris' }).slice(0, 10)
}

function formatDate(startISO: string, endISO?: string | null): string {
  const start = new Date(startISO)
  const end = endISO ? new Date(endISO) : null
  const startDay = start.toLocaleDateString('fr-FR', DAY_FMT)
  const startTime = start.toLocaleTimeString('fr-FR', TIME_FMT)
  if (!end) return `${startDay} · ${startTime}`
  if (toParisDateStr(start) === toParisDateStr(end)) {
    return `${startDay} · ${startTime} – ${end.toLocaleTimeString('fr-FR', TIME_FMT)}`
  }
  return `Du ${startDay} au ${end.toLocaleDateString('fr-FR', DAY_FMT)}`
}

export function AgendaCarousel({ events }: { events: CarouselEvent[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const count = events.length
  const renderedEvents = count > 1 ? [...events, events[0]] : events

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const scheduleNext = useCallback(() => {
    clearTimer()
    timerRef.current = setTimeout(() => {
      setCurrent(prev => (prev + 1) % count)
    }, AUTO_MS)
  }, [count, clearTimer])

  useEffect(() => {
    if (!paused && count > 1) scheduleNext()
    return clearTimer
  }, [paused, current, scheduleNext, clearTimer, count])

  const navigate = (dir: 'prev' | 'next') => {
    setCurrent(prev =>
      dir === 'prev' ? (prev - 1 + count) % count : (prev + 1) % count,
    )
  }

  if (count === 0) return null

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white shadow-sm"
      style={{ height: CONTAINER_H }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides track */}
      <div
        data-testid="carousel-track"
        data-current-index={current}
        className="transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(${-current * SLIDE_H}px)` }}
      >
        {renderedEvents.map((event, i) => {
          const img = event.image && typeof event.image === 'object' ? event.image : null
          const color = event.category?.color ?? DEFAULT_COLOR
          return (
            <Link
              key={`${event.id}-${i}`}
              data-testid="carousel-slide"
              href={`/agenda/${event.slug ?? event.id}`}
              className="flex no-underline border-b border-border last:border-0"
              style={{ height: SLIDE_H }}
              aria-label={event.title}
              aria-hidden={i === renderedEvents.length - 1 && count > 1 ? true : undefined}
            >
              {img?.url && (
                <div className="relative w-[40%] shrink-0 overflow-hidden">
                  <Image
                    src={img.url}
                    alt={img.alt ?? event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col justify-center gap-2 px-5 py-4 flex-1 min-w-0">
                {event.category?.name && (
                  <span
                    className="self-start px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ backgroundColor: `${color}22`, color }}
                  >
                    {event.category.name}
                  </span>
                )}
                <strong className="text-[15px] font-bold text-text leading-snug line-clamp-2">
                  {event.title}
                </strong>
                <p className="text-[12px] text-muted">
                  📅 {formatDate(event.startDate, event.endDate)}
                </p>
                {event.location && (
                  <p className="text-[12px] text-muted truncate">📍 {event.location}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Navigation arrows */}
      {count > 1 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
          <button
            onClick={() => navigate('prev')}
            aria-label="Précédent"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/90 shadow text-brand text-xs hover:bg-white transition-colors"
          >
            ▲
          </button>
          <button
            onClick={() => navigate('next')}
            aria-label="Suivant"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/90 shadow text-brand text-xs hover:bg-white transition-colors"
          >
            ▼
          </button>
        </div>
      )}

      {/* Position indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {events.map((_, i) => (
          <span
            key={i}
            data-testid="carousel-dot"
            className={`h-1.5 rounded-full transition-all ${
              i === current ? 'w-4 bg-brand' : 'w-1.5 bg-brand/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
