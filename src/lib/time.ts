import { STEP_MINUTES } from '@/config'
import { isValidISODate } from './dates'

export const MINUTES_PER_DAY = 24 * 60

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/
const DATE_TIME_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/

/** True for a valid wall-clock time, 00:00 to 23:59. */
export function isTime(value: string): boolean {
  return TIME_PATTERN.test(value)
}

/** True for a valid local date-time written as YYYY-MM-DDTHH:mm. */
export function isDateTime(value: string): boolean {
  const match = DATE_TIME_PATTERN.exec(value)
  return match !== null && isValidISODate(match[1]) && isTime(match[2])
}

export function toDateTime(date: string, time: string): string {
  return `${date}T${time}`
}

export function splitDateTime(value: string): { date: string; time: string } {
  const [date, time] = value.split('T')
  return { date, time }
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** Formats minutes since midnight as HH:mm. */
export function fromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

/**
 * Wall-clock minutes of a date-time on a DST-free timeline (UTC based), so
 * differences never drift by an hour across a daylight saving change.
 */
export function toWallMinutes(value: string): number {
  const { date, time } = splitDateTime(value)
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  return Date.UTC(year, month - 1, day, hours, minutes) / 60000
}

/** Inverse of `toWallMinutes`. */
export function fromWallMinutes(minutes: number): string {
  const date = new Date(minutes * 60000)
  const year = String(date.getUTCFullYear()).padStart(4, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const rest = String(date.getUTCMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${rest}`
}

export function addMinutes(value: string, minutes: number): string {
  return fromWallMinutes(toWallMinutes(value) + minutes)
}

export function snapToStep(minutes: number): number {
  return Math.round(minutes / STEP_MINUTES) * STEP_MINUTES
}

export function durationMinutes(range: { start: string; end: string }): number {
  return toWallMinutes(range.end) - toWallMinutes(range.start)
}
