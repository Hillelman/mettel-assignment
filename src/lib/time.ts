import { HOUR_HEIGHT_PX, MIN_DURATION_MINUTES, STEP_MINUTES } from '@/config'

export const MINUTES_PER_DAY = 24 * 60

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

/** True for a valid wall-clock time, 00:00 to 23:59. */
export function isTime(value: string): boolean {
  return TIME_PATTERN.test(value)
}

/** True for a valid end time: any wall-clock time, or 24:00 (end of day). */
export function isEndTime(value: string): boolean {
  return value === '24:00' || isTime(value)
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** Formats minutes as HH:mm. 1440 gives "24:00", which is only valid as an end value. */
export function fromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

export function snapToStep(minutes: number): number {
  return Math.round(minutes / STEP_MINUTES) * STEP_MINUTES
}

export function durationMinutes(range: { start: string; end: string }): number {
  return toMinutes(range.end) - toMinutes(range.start)
}

/**
 * New end time after dragging the resize handle by `deltaPx`.
 * Snapped to the step, at least MIN_DURATION after the start, at most 24:00.
 */
export function resizeEnd(
  start: string,
  originalEnd: string,
  deltaPx: number,
): string {
  const deltaMinutes = (deltaPx / HOUR_HEIGHT_PX) * 60
  const snapped = snapToStep(toMinutes(originalEnd) + deltaMinutes)
  const minEnd = toMinutes(start) + MIN_DURATION_MINUTES
  return fromMinutes(Math.min(Math.max(snapped, minEnd), MINUTES_PER_DAY))
}
