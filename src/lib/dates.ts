import { WEEK_STARTS_ON } from '@/config'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/** YYYY-MM-DD in local time (never UTC). */
export function toISODate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Parses YYYY-MM-DD as local midnight. */
export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** True for a real calendar date written as YYYY-MM-DD. */
export function isValidISODate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false
  return toISODate(parseISODate(value)) === value
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime())
  result.setDate(result.getDate() + days)
  return result
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7)
}

/** Local midnight of the first day of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const offset = (midnight.getDay() - WEEK_STARTS_ON + 7) % 7
  return addDays(midnight, -offset)
}

/** The 7 ISO dates of the week starting at `weekStart` (an ISO date). */
export function weekDays(weekStart: string): string[] {
  const start = parseISODate(weekStart)
  return Array.from({ length: 7 }, (_, index) =>
    toISODate(addDays(start, index)),
  )
}

/** "Nov 9 – 15, 2026", "Nov 30 – Dec 6, 2026" or "Dec 28, 2026 – Jan 3, 2027". */
export function formatWeekLabel(weekStart: string): string {
  const start = parseISODate(weekStart)
  const end = addDays(start, 6)
  const startMonth = MONTHS[start.getMonth()]
  const endMonth = MONTHS[end.getMonth()]

  if (start.getFullYear() !== end.getFullYear()) {
    return `${startMonth} ${start.getDate()}, ${start.getFullYear()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`
  }
  return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`
}

export function formatDayHeader(iso: string): { weekday: string; day: string } {
  const date = parseISODate(iso)
  return { weekday: WEEKDAYS[date.getDay()], day: String(date.getDate()) }
}

export function isToday(iso: string): boolean {
  return iso === toISODate(new Date())
}
