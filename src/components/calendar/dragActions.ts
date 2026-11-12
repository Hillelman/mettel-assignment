import { durationMinutes, fromMinutes, resizeEnd, toMinutes } from '@/lib/time'
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
  const sameHour =
    slot.date === appointment.date &&
    slot.hour === Math.floor(toMinutes(appointment.start) / 60)
  if (sameHour) return

  const start = hourToTime(slot.hour)
  const end = fromMinutes(toMinutes(start) + durationMinutes(appointment))
  requestSave({ ...appointment, date: slot.date, start, end }, appointment.id)
}
