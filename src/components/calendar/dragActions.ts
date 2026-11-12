import { HOUR_HEIGHT_PX, MIN_DURATION_MINUTES } from '@/config'
import type { Slot } from '@/lib/conflicts'
import {
  MINUTES_PER_DAY,
  addMinutes,
  durationMinutes,
  fromWallMinutes,
  snapToStep,
  splitDateTime,
  toDateTime,
  toWallMinutes,
} from '@/lib/time'
import type { Appointment, AppointmentInput } from '@/types/appointment'
import { parseDayId, parseDragId, type ResizeEdge } from './dragIds'

export type DragEndInput = {
  activeId: string
  /** Id of the day column under the drag, or null when dropped outside any column. */
  overId: string | null
  /** Vertical offset in px of the dragged edge from the top of that column. */
  offsetPx: number
}

type RequestSave = (input: AppointmentInput, id?: string) => boolean

/** Wall-clock minutes of 00:00 on `date`. */
function dayStartMinutes(date: string): number {
  return toWallMinutes(toDateTime(date, '00:00'))
}

/** Pixels from a column's top as minutes, snapped to the step and kept within the day. */
function offsetToMinutes(offsetPx: number): number {
  const minutes = snapToStep((offsetPx / HOUR_HEIGHT_PX) * 60)
  return Math.min(Math.max(minutes, 0), MINUTES_PER_DAY)
}

/**
 * Where a move lands. `offsetPx` is the top of the dragged segment, taken
 * from the top of the `dropDate` column. The whole appointment shifts so the
 * grabbed segment's top lands there and the duration is kept. Null when the
 * start does not change.
 */
export function moveTarget(
  appointment: Appointment,
  grabbedSegmentDay: string,
  dropDate: string,
  offsetPx: number,
): Slot | null {
  const start = toWallMinutes(appointment.start)
  const segmentOffset = Math.max(start, dayStartMinutes(grabbedSegmentDay)) - start
  const newStart = dayStartMinutes(dropDate) + offsetToMinutes(offsetPx) - segmentOffset
  if (newStart === start) return null

  const from = fromWallMinutes(newStart)
  return { start: from, end: addMinutes(from, durationMinutes(appointment)) }
}

/**
 * The range after dragging one edge to `offsetPx` below the top of the `date`
 * column. Only that edge changes, snapped to the step and kept at least
 * MIN_DURATION_MINUTES from the other edge.
 */
export function resizeTarget(
  appointment: Appointment,
  edge: ResizeEdge,
  date: string,
  offsetPx: number,
): Slot {
  const edgeMinutes = dayStartMinutes(date) + offsetToMinutes(offsetPx)
  if (edge === 'start') {
    const latest = toWallMinutes(appointment.end) - MIN_DURATION_MINUTES
    return {
      start: fromWallMinutes(Math.min(edgeMinutes, latest)),
      end: appointment.end,
    }
  }
  const earliest = toWallMinutes(appointment.start) + MIN_DURATION_MINUTES
  return {
    start: appointment.start,
    end: fromWallMinutes(Math.max(edgeMinutes, earliest)),
  }
}

/**
 * Turns a finished drag into at most one save request. Unchanged results and
 * drops outside any day column request nothing.
 */
export function applyDragEnd(
  { activeId, overId, offsetPx }: DragEndInput,
  appointments: Appointment[],
  requestSave: RequestSave,
): void {
  const drag = parseDragId(activeId)
  if (!drag) return
  const appointment = appointments.find((item) => item.id === drag.appointmentId)
  if (!appointment) return
  const date = overId === null ? null : parseDayId(overId)
  if (!date) return

  const target =
    drag.kind === 'move'
      ? moveTarget(
          appointment,
          drag.day ?? splitDateTime(appointment.start).date,
          date,
          offsetPx,
        )
      : resizeTarget(appointment, drag.edge, date, offsetPx)
  if (!target) return
  if (target.start === appointment.start && target.end === appointment.end) return

  requestSave({ ...appointment, ...target }, appointment.id)
}
