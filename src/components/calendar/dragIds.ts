import { fromMinutes } from '@/lib/time'

const MOVE_PREFIX = 'move:'
const RESIZE_PREFIX = 'resize:'
const SLOT_PREFIX = 'slot:'

export type DragKind = 'move' | 'resize'

const DAY_SUFFIX = /@\d{4}-\d{2}-\d{2}$/

/**
 * Drag id of an appointment's card. Each day segment of a multi-day
 * appointment passes its `date` so the draggable ids stay unique.
 */
export function moveId(appointmentId: string, date?: string): string {
  return `${MOVE_PREFIX}${appointmentId}${date === undefined ? '' : `@${date}`}`
}

export function resizeId(appointmentId: string): string {
  return `${RESIZE_PREFIX}${appointmentId}`
}

export function slotId(date: string, hour: number): string {
  return `${SLOT_PREFIX}${date}:${hour}`
}

/** "HH:00" for the start of an hour slot. */
export function hourToTime(hour: number): string {
  return fromMinutes(hour * 60)
}

export function parseDragId(
  id: string,
): { kind: DragKind; appointmentId: string } | null {
  if (id.startsWith(MOVE_PREFIX)) {
    return {
      kind: 'move',
      appointmentId: id.slice(MOVE_PREFIX.length).replace(DAY_SUFFIX, ''),
    }
  }
  if (id.startsWith(RESIZE_PREFIX)) {
    return { kind: 'resize', appointmentId: id.slice(RESIZE_PREFIX.length) }
  }
  return null
}

export function parseSlotId(id: string): { date: string; hour: number } | null {
  if (!id.startsWith(SLOT_PREFIX)) return null
  const [date, hour] = id.slice(SLOT_PREFIX.length).split(':')
  const parsedHour = Number(hour)
  if (!date || hour === undefined || !Number.isInteger(parsedHour)) return null
  return { date, hour: parsedHour }
}
