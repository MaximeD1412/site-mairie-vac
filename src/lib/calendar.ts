export interface CalendarEventInput {
  id: string
  slug?: string | null
  title: string
  startDate: string
  endDate?: string | null
  category?: { color?: string | null; name?: string | null } | null
}

export interface DotIndicator {
  type: 'dot'
  eventId: string
  slug: string | null
  title: string
  color: string
  col: number
  track: number
}

export interface BarIndicator {
  type: 'bar'
  eventId: string
  slug: string | null
  title: string
  color: string
  startCol: number
  endCol: number
  track: number
}

export type WeekIndicator = DotIndicator | BarIndicator

const DEFAULT_COLOR = '#3B82F6'

// Returns YYYY-MM-DD for a Date (using UTC date components, safe for noon-UTC dates)
export function toCalendarDateStr(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Returns YYYY-MM-DD for an ISO string interpreted in Europe/Paris timezone
function toParisDateStr(iso: string): string {
  return new Date(iso).toLocaleString('sv-SE', { timeZone: 'Europe/Paris' }).slice(0, 10)
}

// 0 = Monday, 6 = Sunday
function utcDayOfWeekMon0(d: Date): number {
  return (d.getUTCDay() + 6) % 7
}

/**
 * Builds a 6-week calendar grid (Mon–Sun) for the given year and month (0-indexed).
 * Each Date is set to noon UTC to avoid DST edge cases.
 */
export function buildCalendarGrid(year: number, month: number): Date[][] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1, 12, 0, 0))
  const startOffset = utcDayOfWeekMon0(firstOfMonth)
  const gridStart = new Date(Date.UTC(year, month, 1 - startOffset, 12, 0, 0))

  const weeks: Date[][] = []
  const cursor = new Date(gridStart)
  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor))
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

/**
 * Computes event indicators for a single week row (7 days, Mon–Sun).
 * Multi-day events are clipped to the week boundaries.
 * Overlapping indicators receive different track values (vertical stacking).
 */
export function getWeekIndicators(weekDays: Date[], events: CalendarEventInput[]): WeekIndicator[] {
  const weekStart = toCalendarDateStr(weekDays[0])
  const weekEnd = toCalendarDateStr(weekDays[6])

  const indicators: WeekIndicator[] = []
  // tracks[i] = last endCol used on track i
  const tracks: number[] = []

  for (const event of events) {
    const eventStart = toParisDateStr(event.startDate)
    const eventEnd = event.endDate ? toParisDateStr(event.endDate) : eventStart

    // Skip if no overlap with this week
    if (eventEnd < weekStart || eventStart > weekEnd) continue

    // Clip to week boundaries
    const clampedStart = eventStart < weekStart ? weekStart : eventStart
    const clampedEnd = eventEnd > weekEnd ? weekEnd : eventEnd

    // Find the grid date matching clampedStart/clampedEnd
    const startColDate = weekDays.find(d => toCalendarDateStr(d) === clampedStart)
    const endColDate = weekDays.find(d => toCalendarDateStr(d) === clampedEnd)
    if (!startColDate || !endColDate) continue

    const startCol = utcDayOfWeekMon0(startColDate)
    const endCol = utcDayOfWeekMon0(endColDate)
    const color = event.category?.color ?? DEFAULT_COLOR

    // Greedy track allocation: find first track where lastEndCol < startCol
    let track = tracks.findIndex(lastEnd => lastEnd < startCol)
    if (track === -1) {
      track = tracks.length
    }
    tracks[track] = endCol

    if (startCol === endCol) {
      indicators.push({
        type: 'dot',
        eventId: event.id,
        slug: event.slug ?? null,
        title: event.title,
        color,
        col: startCol,
        track,
      })
    } else {
      indicators.push({
        type: 'bar',
        eventId: event.id,
        slug: event.slug ?? null,
        title: event.title,
        color,
        startCol,
        endCol,
        track,
      })
    }
  }

  return indicators
}
