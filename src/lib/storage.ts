import { STORAGE_KEY } from '@/config'
import type { Appointment } from '@/types/appointment'
import { colorForId, isAppointmentColor } from './colors'
import { isValidISODate } from './dates'
import {
  MINUTES_PER_DAY,
  addMinutes,
  isTime,
  toDateTime,
} from './time'
import { isAppointment } from './validation'

/**
 * Converts an entry saved in the v1 shape (`date` plus HH:mm `start` and
 * `end`, where `end` may be 24:00) to date-times. Anything else is returned
 * as is, for `isAppointment` to accept or drop.
 */
function migrateEntry(entry: unknown): unknown {
  if (typeof entry !== 'object' || entry === null) return entry
  const { date, start, end, ...rest } = entry as Record<string, unknown>
  if (
    typeof date !== 'string' ||
    typeof start !== 'string' ||
    typeof end !== 'string' ||
    !isValidISODate(date) ||
    !isTime(start) ||
    !(isTime(end) || end === '24:00')
  ) {
    return entry
  }
  return {
    ...rest,
    start: toDateTime(date, start),
    end:
      end === '24:00'
        ? addMinutes(toDateTime(date, '00:00'), MINUTES_PER_DAY)
        : toDateTime(date, end),
  }
}

/**
 * Gives an entry without a valid color the color derived from its id, so it
 * looks the same on every load. Entries without a usable id are returned as
 * is, for `isAppointment` to drop.
 */
function withColor(entry: unknown): unknown {
  if (typeof entry !== 'object' || entry === null) return entry
  const candidate = entry as Record<string, unknown>
  const { id, color } = candidate
  if (typeof id !== 'string' || id.length === 0 || isAppointmentColor(color)) {
    return entry
  }
  return { ...candidate, color: colorForId(id) }
}

/** Reads saved appointments. Missing, malformed or invalid data is dropped. */
export function loadAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.map(migrateEntry).map(withColor).filter(isAppointment)
      : []
  } catch {
    return []
  }
}

/** Writes appointments. Never throws, so the app keeps working in memory. */
export function saveAppointments(list: Appointment[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Storage may be unavailable or full; state stays in memory.
  }
}
