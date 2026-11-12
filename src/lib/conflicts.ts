import { STEP_MINUTES } from '@/config'
import type { Appointment } from '@/types/appointment'
import { MINUTES_PER_DAY, durationMinutes, fromMinutes, toMinutes } from './time'

type TimeRange = Pick<Appointment, 'date' | 'start' | 'end'>

export type Slot = { start: string; end: string }

export type DayLayout = { column: number; columns: number }

/** Same date and overlapping times. Back-to-back ranges do not overlap. */
export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return (
    a.date === b.date &&
    toMinutes(a.start) < toMinutes(b.end) &&
    toMinutes(b.start) < toMinutes(a.end)
  )
}

/** All appointments overlapping `proposed`, leaving out the one with `ignoreId`. */
export function findConflicts(
  proposed: TimeRange,
  all: Appointment[],
  ignoreId?: string,
): Appointment[] {
  return all.filter(
    (appointment) =>
      appointment.id !== ignoreId && overlaps(proposed, appointment),
  )
}

/** True when the proposed range starts and ends within the same day. */
export function fitsInDay(proposed: Pick<Appointment, 'start' | 'end'>): boolean {
  return toMinutes(proposed.start) >= 0 && toMinutes(proposed.end) <= MINUTES_PER_DAY
}

/**
 * Nearest free slot on the same date with the same duration, in STEP_MINUTES
 * steps, searching forward from the proposed start and then backward.
 * Ties go to the forward slot. Null when the day has no room.
 */
export function findNextFreeSlot(
  proposed: TimeRange,
  all: Appointment[],
  ignoreId?: string,
): Slot | null {
  const duration = durationMinutes(proposed)
  if (duration <= 0 || duration > MINUTES_PER_DAY) return null

  const others = all.filter(
    (appointment) =>
      appointment.id !== ignoreId && appointment.date === proposed.date,
  )
  const origin = toMinutes(proposed.start)
  const latestStart = MINUTES_PER_DAY - duration

  const isFree = (start: number): boolean =>
    start >= 0 &&
    start <= latestStart &&
    !others.some(
      (other) =>
        start < toMinutes(other.end) && toMinutes(other.start) < start + duration,
    )

  for (let offset = 0; offset <= MINUTES_PER_DAY; offset += STEP_MINUTES) {
    for (const start of [origin + offset, origin - offset]) {
      if (isFree(start)) {
        return { start: fromMinutes(start), end: fromMinutes(start + duration) }
      }
    }
  }
  return null
}

/**
 * Side-by-side layout for one day. Appointments that overlap, directly or
 * through a chain, share a cluster; each gets a column and the cluster's
 * column count.
 */
export function layoutDay(appointments: Appointment[]): Map<string, DayLayout> {
  const sorted = [...appointments].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      toMinutes(a.start) - toMinutes(b.start) ||
      toMinutes(a.end) - toMinutes(b.end),
  )

  const result = new Map<string, DayLayout>()
  let cluster: { id: string; column: number }[] = []
  let columnEnds: number[] = []
  let clusterDate = ''
  let clusterEnd = 0

  const flush = () => {
    for (const item of cluster) {
      result.set(item.id, { column: item.column, columns: columnEnds.length })
    }
    cluster = []
    columnEnds = []
  }

  for (const appointment of sorted) {
    const start = toMinutes(appointment.start)
    const end = toMinutes(appointment.end)

    if (cluster.length > 0 && (appointment.date !== clusterDate || start >= clusterEnd)) {
      flush()
    }
    if (cluster.length === 0) {
      clusterDate = appointment.date
      clusterEnd = end
    }

    let column = columnEnds.findIndex((columnEnd) => columnEnd <= start)
    if (column === -1) column = columnEnds.length
    columnEnds[column] = end
    clusterEnd = Math.max(clusterEnd, end)
    cluster.push({ id: appointment.id, column })
  }
  flush()

  return result
}
