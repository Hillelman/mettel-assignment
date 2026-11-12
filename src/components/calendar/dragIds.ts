import { fromMinutes } from '@/lib/time'

const MOVE_PREFIX = 'move:'
const RESIZE_PREFIX = 'resize:'
const SLOT_PREFIX = 'slot:'

export type DragKind = 'move' | 'resize'

export function moveId(appointmentId: string): string {
  return `${MOVE_PREFIX}${appointmentId}`
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
    return { kind: 'move', appointmentId: id.slice(MOVE_PREFIX.length) }
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
