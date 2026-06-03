import { describe, it, expect } from 'vitest'
import {
  buildCalendarGrid,
  getWeekIndicators,
  toCalendarDateStr,
  type CalendarEventInput,
  type DotIndicator,
  type BarIndicator,
} from '../calendar'

// Semaine du 25 au 31 mai 2026 (Lu-Di)
const WEEK_MAY_25: Date[] = Array.from({ length: 7 }, (_, i) =>
  new Date(Date.UTC(2026, 4, 25 + i, 12, 0, 0)),
)

describe('toCalendarDateStr', () => {
  it('returns YYYY-MM-DD string for a UTC noon date', () => {
    const d = new Date(Date.UTC(2026, 4, 25, 12, 0, 0))
    expect(toCalendarDateStr(d)).toBe('2026-05-25')
  })
})

describe('buildCalendarGrid', () => {
  it('returns 6 weeks of 7 days', () => {
    const grid = buildCalendarGrid(2026, 4) // Mai 2026
    expect(grid).toHaveLength(6)
    grid.forEach(week => expect(week).toHaveLength(7))
  })

  it('starts on the Monday on or before the 1st of the month', () => {
    // 1er mai 2026 = vendredi → grille commence lundi 27 avril
    const grid = buildCalendarGrid(2026, 4)
    expect(toCalendarDateStr(grid[0][0])).toBe('2026-04-27')
  })

  it('week rows run Monday to Sunday', () => {
    const grid = buildCalendarGrid(2026, 4)
    // Lundi = getUTCDay() === 1
    expect(grid[0][0].getUTCDay()).toBe(1)
    // Dimanche = getUTCDay() === 0
    expect(grid[0][6].getUTCDay()).toBe(0)
  })

  it('covers all days of the month', () => {
    const grid = buildCalendarGrid(2026, 4)
    const allDates = grid.flat().map(toCalendarDateStr)
    for (let d = 1; d <= 31; d++) {
      expect(allDates).toContain(`2026-05-${String(d).padStart(2, '0')}`)
    }
  })
})

describe('getWeekIndicators', () => {
  it('returns a dot for a single-day event', () => {
    const events: CalendarEventInput[] = [
      { id: '1', slug: 'e1', title: 'Test', startDate: '2026-05-25T10:00:00.000Z' },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect(indicators).toHaveLength(1)
    expect(indicators[0].type).toBe('dot')
    expect((indicators[0] as DotIndicator).col).toBe(0) // Lundi = col 0
  })

  it('returns a bar for a multi-day event within the week', () => {
    const events: CalendarEventInput[] = [
      {
        id: '1',
        slug: 'e1',
        title: 'Expo',
        startDate: '2026-05-25T10:00:00.000Z',
        endDate: '2026-05-27T17:00:00.000Z',
      },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect(indicators[0].type).toBe('bar')
    expect((indicators[0] as BarIndicator).startCol).toBe(0) // Lundi
    expect((indicators[0] as BarIndicator).endCol).toBe(2) // Mercredi
  })

  it('clips a bar that starts before the week', () => {
    const events: CalendarEventInput[] = [
      {
        id: '1',
        slug: 'e1',
        title: 'Long event',
        startDate: '2026-05-20T10:00:00.000Z', // Mercredi sem. précédente
        endDate: '2026-05-26T17:00:00.000Z',   // Mardi de cette semaine
      },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect((indicators[0] as BarIndicator).startCol).toBe(0) // Clippé au Lundi
    expect((indicators[0] as BarIndicator).endCol).toBe(1)   // Mardi
  })

  it('clips a bar that ends after the week', () => {
    const events: CalendarEventInput[] = [
      {
        id: '1',
        slug: 'e1',
        title: 'Long event',
        startDate: '2026-05-28T10:00:00.000Z', // Jeudi
        endDate: '2026-06-02T17:00:00.000Z',   // Après la semaine
      },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect((indicators[0] as BarIndicator).startCol).toBe(3) // Jeudi
    expect((indicators[0] as BarIndicator).endCol).toBe(6)   // Clippé au Dimanche
  })

  it('skips events entirely outside the week', () => {
    const events: CalendarEventInput[] = [
      { id: '1', slug: 'e1', title: 'Ailleurs', startDate: '2026-06-10T10:00:00.000Z' },
    ]
    expect(getWeekIndicators(WEEK_MAY_25, events)).toHaveLength(0)
  })

  it('assigns different tracks to events on the same day', () => {
    const events: CalendarEventInput[] = [
      { id: '1', slug: 'e1', title: 'A', startDate: '2026-05-25T10:00:00.000Z' },
      { id: '2', slug: 'e2', title: 'B', startDate: '2026-05-25T14:00:00.000Z' },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect(indicators[0].track).toBe(0)
    expect(indicators[1].track).toBe(1)
  })

  it('uses category color when provided', () => {
    const events: CalendarEventInput[] = [
      {
        id: '1',
        slug: 'e1',
        title: 'Test',
        startDate: '2026-05-25T10:00:00.000Z',
        category: { color: '#DB2777' },
      },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect(indicators[0].color).toBe('#DB2777')
  })

  it('falls back to default color when category has no color', () => {
    const events: CalendarEventInput[] = [
      { id: '1', slug: 'e1', title: 'Test', startDate: '2026-05-25T10:00:00.000Z' },
    ]
    const indicators = getWeekIndicators(WEEK_MAY_25, events)
    expect(indicators[0].color).toBe('#3B82F6')
  })
})
