import {
  addDays,
  addWeeks,
  formatDayHeader,
  formatWeekLabel,
  isToday,
  isValidISODate,
  parseISODate,
  startOfWeek,
  toISODate,
  weekDays,
} from './dates'

describe('dates', () => {
  it('formats and parses local dates', () => {
    const date = new Date(2026, 10, 9, 23, 59)
    expect(toISODate(date)).toBe('2026-11-09')
    expect(toISODate(parseISODate('2026-11-09'))).toBe('2026-11-09')
    expect(parseISODate('2026-11-09').getHours()).toBe(0)
  })

  it('validates ISO dates', () => {
    expect(isValidISODate('2026-11-09')).toBe(true)
    expect(isValidISODate('2026-02-30')).toBe(false)
    expect(isValidISODate('11/09/2026')).toBe(false)
  })

  it('finds the week start for a Sunday and a Monday (week starts on Monday)', () => {
    expect(toISODate(startOfWeek(new Date(2026, 10, 15, 18, 30)))).toBe('2026-11-09')
    expect(toISODate(startOfWeek(new Date(2026, 10, 9)))).toBe('2026-11-09')
    expect(toISODate(startOfWeek(new Date(2026, 10, 12)))).toBe('2026-11-09')
  })

  it('adds days and weeks across month boundaries', () => {
    expect(toISODate(addDays(new Date(2026, 10, 30), 1))).toBe('2026-12-01')
    expect(toISODate(addWeeks(new Date(2026, 10, 9), -1))).toBe('2026-11-02')
  })

  it('lists 7 consecutive days', () => {
    expect(weekDays('2026-12-28')).toEqual([
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
    ])
  })

  it('labels a week in the same month, across months and across years', () => {
    expect(formatWeekLabel('2026-11-09')).toBe('Nov 9 – 15, 2026')
    expect(formatWeekLabel('2026-11-30')).toBe('Nov 30 – Dec 6, 2026')
    expect(formatWeekLabel('2026-12-28')).toBe('Dec 28, 2026 – Jan 3, 2027')
  })

  it('formats the day header', () => {
    expect(formatDayHeader('2026-11-09')).toEqual({ weekday: 'Mon', day: '9' })
  })

  it('detects today', () => {
    expect(isToday(toISODate(new Date()))).toBe(true)
    expect(isToday('2000-01-01')).toBe(false)
  })
})
