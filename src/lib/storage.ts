import { STORAGE_KEY } from '@/config'
import type { Appointment } from '@/types/appointment'
import { isAppointment } from './validation'

/** Reads saved appointments. Missing, malformed or invalid data is dropped. */
export function loadAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isAppointment) : []
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
