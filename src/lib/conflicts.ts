import { SLOT_SEARCH_DAYS, STEP_MINUTES } from '@/config'
import type { Appointment } from '@/types/appointment'
import {
  MINUTES_PER_DAY,
  durationMinutes,
  fromWallMinutes,
  toDateTime,
  toWallMinutes,
} from './time'

type TimeRange = Pick<Appointment, 'start' | 'end'>

export type Slot = { start: string; end: string }

export type DayLayout = { column: number; columns: number }

/** The part of an appointment that falls on one day. Minutes are since that day's 00:00. */
export type DaySegment = {
  appointment: Appointment
  startMinutes: number
  endMinutes: number
  /** The segment holds the appointment's start. */
  isFirst: boolean
  /** The segment holds the appointment's end. */
  isLast: boolean
}

/** Overlapping date-times. Back-to-back ranges do not overlap. */
export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end
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

/**
 * Nearest free slot with the same duration, in STEP_MINUTES steps, searching
 * forward from the proposed start and then backward, up to `searchDays`
 * each way. Ties go to the forward slot. Null when nothing nearby is free.
 */
export function findNextFreeSlot(
  proposed: TimeRange,
  all: Appointment[],
  ignoreId?: string,
  searchDays = SLOT_SEARCH_DAYS,
): Slot | null {
  const duration = durationMinutes(proposed)
  if (duration <= 0) return null

  const others = all
    .filter((appointment) => appointment.id !== ignoreId)
    .map((appointment) => ({
      start: toWallMinutes(appointment.start),
      end: toWallMinutes(appointment.end),
    }))
  const origin = toWallMinutes(proposed.start)

  const isFree = (start: number): boolean =>
    !others.some((other) => start < other.end && other.start < start + duration)

  const maxOffset = searchDays * MINUTES_PER_DAY
  for (let offset = 0; offset <= maxOffset; offset += STEP_MINUTES) {
    for (const start of [origin + offset, origin - offset]) {
      if (isFree(start)) {
        return {
          start: fromWallMinutes(start),
          end: fromWallMinutes(start + duration),
        }
      }
    }
  }
  return null
}

/**
 * The segments of `appointments` that fall on `date`, in input order. An
 * appointment ending exactly at 00:00 has no segment on that next day.
 */
export function segmentsForDay(
  appointments: Appointment[],
  date: string,
): DaySegment[] {
  const dayStart = toWallMinutes(toDateTime(date, '00:00'))
  const dayEnd = dayStart + MINUTES_PER_DAY

  const segments: DaySegment[] = []
  for (const appointment of appointments) {
    const start = toWallMinutes(appointment.start)
    const end = toWallMinutes(appointment.end)
    if (start >= dayEnd || end <= dayStart) continue
    segments.push({
      appointment,
      startMinutes: Math.max(start, dayStart) - dayStart,
      endMinutes: Math.min(end, dayEnd) - dayStart,
      isFirst: start >= dayStart,
      isLast: end <= dayEnd,
    })
  }
  return segments
}

/**
 * Side-by-side layout for the segments of one day. Segments that overlap,
 * directly or through a chain, share a cluster; each appointment gets a
 * column and the cluster's column count.
 */
export function layoutDay(segments: DaySegment[]): Map<string, DayLayout> {
  const sorted = [...segments].sort(
    (a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes,
  )

  const result = new Map<string, DayLayout>()
  let cluster: { id: string; column: number }[] = []
  let columnEnds: number[] = []
  let clusterEnd = 0

  const flush = () => {
    for (const item of cluster) {
      result.set(item.id, { column: item.column, columns: columnEnds.length })
    }
    cluster = []
    columnEnds = []
  }

  for (const { appointment, startMinutes, endMinutes } of sorted) {
    if (cluster.length > 0 && startMinutes >= clusterEnd) flush()
    if (cluster.length === 0) clusterEnd = endMinutes

    let column = columnEnds.findIndex((columnEnd) => columnEnd <= startMinutes)
    if (column === -1) column = columnEnds.length
    columnEnds[column] = endMinutes
    clusterEnd = Math.max(clusterEnd, endMinutes)
    cluster.push({ id: appointment.id, column })
  }
  flush()

  return result
}
