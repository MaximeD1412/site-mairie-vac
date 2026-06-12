'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  buildCalendarGrid,
  getWeekIndicators,
  toCalendarDateStr,
  type CalendarEventInput,
  type DotIndicator,
  type BarIndicator,
  type WeekIndicator,
} from '@/lib/calendar'

interface MiniCalendarProps {
  events: CalendarEventInput[]
  initialDate?: Date
  showLegend?: boolean
}

const DAYS_FR = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]
const INDICATOR_H = 8  // px, hauteur d'un indicateur
const INDICATOR_GAP = 2 // px, espace entre indicateurs

export function MiniCalendar({ events, initialDate, showLegend }: MiniCalendarProps) {
  const now = initialDate ?? new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const todayStr = toCalendarDateStr(
    new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), 12, 0, 0)),
  )

  const grid = buildCalendarGrid(year, month)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 select-none">
      {/* Live region: announces month changes to screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {MONTHS_FR[month]} {year}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          aria-label="Mois précédent"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-pale text-brand transition-colors text-sm"
        >
          ◀
        </button>
        <span className="text-[13px] font-bold text-text capitalize">
          {MONTHS_FR[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          aria-label="Mois suivant"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-pale text-brand transition-colors text-sm"
        >
          ▶
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_FR.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {grid.map((weekDays, wi) => {
        const indicators = getWeekIndicators(weekDays, events)
        const maxTrack = indicators.reduce((m, ind) => Math.max(m, ind.track), -1)
        const indicatorRowH = maxTrack >= 0 ? (maxTrack + 1) * (INDICATOR_H + INDICATOR_GAP) : 0

        return (
          <div key={wi}>
            {/* Day number cells */}
            <div className="grid grid-cols-7">
              {weekDays.map((day) => {
                const dateStr = toCalendarDateStr(day)
                const isCurrentMonth = day.getUTCMonth() === month
                const isToday = dateStr === todayStr
                return (
                  <div
                    key={dateStr}
                    className={`text-center text-[12px] py-1 ${
                      isCurrentMonth ? 'text-text' : 'text-muted/40'
                    } ${isToday ? 'font-bold' : ''}`}
                  >
                    {isToday ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white text-[11px]">
                        {day.getUTCDate()}
                      </span>
                    ) : (
                      day.getUTCDate()
                    )}
                  </div>
                )
              })}
            </div>

            {/* Indicators layer */}
            {indicatorRowH > 0 && (
              <div className="relative" style={{ height: indicatorRowH }}>
                {(() => {
                  const colCounts: Record<number, number> = {}
                  for (const ind of indicators) {
                    if (ind.type === 'dot') colCounts[(ind as DotIndicator).col] = (colCounts[(ind as DotIndicator).col] ?? 0) + 1
                  }
                  return indicators.map((ind) => (
                    <IndicatorEl
                      key={`${ind.eventId}-${year}-${month}-${wi}`}
                      indicator={ind}
                      isMultiEvent={ind.type === 'dot' && (colCounts[(ind as DotIndicator).col] ?? 0) > 1}
                    />
                  ))
                })()}
              </div>
            )}
          </div>
        )
      })}
      {showLegend && <CategoryLegend events={events} />}
    </div>
  )
}

function CategoryLegend({ events }: { events: CalendarEventInput[] }) {
  const seen = new Set<string>()
  const categories: { name: string; color: string }[] = []

  for (const event of events) {
    const { name, color } = event.category ?? {}
    if (!name || !color) continue
    const key = `${color}::${name}`
    if (seen.has(key)) continue
    seen.add(key)
    categories.push({ name, color })
  }

  if (categories.length === 0) return null

  return (
    <ul
      className="mt-3 pt-3 border-t border-muted/20 flex flex-wrap gap-x-4 gap-y-1"
      aria-label="Légende des catégories"
    >
      {categories.map(({ name, color }) => (
        <li key={name} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          <span className="text-[11px] text-text">{name}</span>
        </li>
      ))}
    </ul>
  )
}

function IndicatorEl({
  indicator,
  isMultiEvent,
}: {
  indicator: WeekIndicator
  isMultiEvent: boolean
}) {
  const top = indicator.track * (INDICATOR_H + INDICATOR_GAP)
  const colW = 100 / 7

  if (indicator.type === 'dot') {
    const dot = indicator as DotIndicator
    const href = isMultiEvent ? '/agenda' : (dot.slug ? `/agenda/${dot.slug}` : '/agenda')
    return (
      <Link href={href} aria-label={dot.title}>
        <span
          data-testid={`indicator-dot-${dot.eventId}`}
          title={dot.title}
          className="absolute rounded-full"
          style={{
            left: `calc(${dot.col * colW + colW / 2}% - ${INDICATOR_H / 2}px)`,
            top,
            width: INDICATOR_H,
            height: INDICATOR_H,
            backgroundColor: dot.color,
          }}
        />
      </Link>
    )
  }

  const bar = indicator as BarIndicator
  const href = bar.slug ? `/agenda/${bar.slug}` : '/agenda'

  return (
    <Link href={href} aria-label={bar.title}>
      <span
        data-testid={`indicator-bar-${bar.eventId}`}
        title={bar.title}
        className="absolute rounded-full"
        style={{
          left: `${bar.startCol * colW}%`,
          top,
          width: `${(bar.endCol - bar.startCol + 1) * colW}%`,
          height: INDICATOR_H,
          backgroundColor: bar.color,
        }}
      />
    </Link>
  )
}
