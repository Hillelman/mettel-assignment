import { fromMinutes } from '@/lib/time'

const MOVE_PREFIX = 'move:'
const RESIZE_START_PREFIX = 'resize-start:'
const RESIZE_END_PREFIX = 'resize-end:'
const DAY_PREFIX = 'day:'

export type ResizeEdge = 'start' | 'end'

type DragTarget =
  | {
      kind: 'move'
      appointmentId: string
      /** ISO date of the grabbed segment, when the card passed it. */
      day: string | null
    }
  | { kind: 'resize'; appointmentId: string; edge: ResizeEdge }

const DAY_SUFFIX = /@(\d{4}-\d{2}-\d{2})$/

/**
 * Drag id of an appointment's card. Each day segment of a multi-day
 * appointment passes its `date` so the draggable ids stay unique.
 */
export function moveId(appointmentId: string, date?: string): string {
  return `${MOVE_PREFIX}${appointmentId}${date === undefined ? '' : `@${date}`}`
}

export function resizeId(appointmentId: string, edge: ResizeEdge): string {
  const prefix = edge === 'start' ? RESIZE_START_PREFIX : RESIZE_END_PREFIX
  return `${prefix}${appointmentId}`
}

/** Droppable id of a day column. */
export function dayId(date: string): string {
  return `${DAY_PREFIX}${date}`
}

/** "HH:00" for the start of an hour row. */
export function hourToTime(hour: number): string {
  return fromMinutes(hour * 60)
}

export function parseDragId(id: string): DragTarget | null {
  if (id.startsWith(MOVE_PREFIX)) {
    const rest = id.slice(MOVE_PREFIX.length)
    const day = DAY_SUFFIX.exec(rest)?.[1] ?? null
    return {
      kind: 'move',
      appointmentId: rest.replace(DAY_SUFFIX, ''),
      day,
    }
  }
  if (id.startsWith(RESIZE_START_PREFIX)) {
    return {
      kind: 'resize',
      edge: 'start',
      appointmentId: id.slice(RESIZE_START_PREFIX.length),
    }
  }
  if (id.startsWith(RESIZE_END_PREFIX)) {
    return {
      kind: 'resize',
      edge: 'end',
      appointmentId: id.slice(RESIZE_END_PREFIX.length),
    }
  }
  return null
}

/** The ISO date of a day column droppable id, or null for any other id. */
export function parseDayId(id: string): string | null {
  return id.startsWith(DAY_PREFIX) ? id.slice(DAY_PREFIX.length) : null
}
