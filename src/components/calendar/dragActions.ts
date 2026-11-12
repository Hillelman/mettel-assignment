import {
  addMinutes,
  durationMinutes,
  resizeEnd,
  splitDateTime,
  toDateTime,
  toMinutes,
} from '@/lib/time'
import type { Appointment, AppointmentInput } from '@/types/appointment'
import { hourToTime, parseDragId, parseSlotId } from './dragIds'

export type DragEndInput = {
  activeId: string
  /** Id of the droppable under the drag, or null when dropped outside any slot. */
  overId: string | null
  /** Vertical pointer travel in px. */
  deltaY: number
}

type RequestSave = (input: AppointmentInput, id?: string) => boolean

/**
 * Turns a finished drag into at most one save request. Moves land on the
 * dropped hour slot and keep their duration; resizes snap the end to the step.
 * Unchanged results and drops outside any slot request nothing.
 */
export function applyDragEnd(
  { activeId, overId, deltaY }: DragEndInput,
  appointments: Appointment[],
  requestSave: RequestSave,
): void {
  const drag = parseDragId(activeId)
  if (!drag) return
  const appointment = appointments.find((item) => item.id === drag.appointmentId)
  if (!appointment) return

  if (drag.kind === 'resize') {
    const end = resizeEnd(appointment.start, appointment.end, deltaY)
    if (end === appointment.end) return
    requestSave({ ...appointment, end }, appointment.id)
    return
  }

  const slot = overId === null ? null : parseSlotId(overId)
  if (!slot) return
  const from = splitDateTime(appointment.start)
  const sameHour =
    slot.date === from.date && slot.hour === Math.floor(toMinutes(from.time) / 60)
  if (sameHour) return

  const start = toDateTime(slot.date, hourToTime(slot.hour))
  const end = addMinutes(start, durationMinutes(appointment))
  requestSave({ ...appointment, start, end }, appointment.id)
}
