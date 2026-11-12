import type {
  Collision,
  CollisionDetection,
  DragEndEvent,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core'
import { HOUR_HEIGHT_PX, STEP_MINUTES } from '@/config'
import type { DragEndInput } from './dragActions'
import { parseDayId, parseDragId } from './dragIds'

/**
 * The day column under the dragged edge: the top and horizontal centre of a
 * moved card, or the pointer of a resize handle (the handle's own edge when
 * dragged with the keyboard).
 */
export const dayUnderDraggedEdge: CollisionDetection = ({
  active,
  collisionRect,
  pointerCoordinates,
  droppableRects,
  droppableContainers,
}) => {
  const drag = parseDragId(String(active.id))
  let x = collisionRect.left + collisionRect.width / 2
  let y = collisionRect.top + 1
  if (drag?.kind === 'resize') {
    if (pointerCoordinates) {
      x = pointerCoordinates.x
      y = pointerCoordinates.y
    } else if (drag.edge === 'end') {
      y = collisionRect.bottom - 1
    }
  }

  const collisions: Collision[] = []
  for (const container of droppableContainers) {
    if (parseDayId(String(container.id)) === null) continue
    const rect = droppableRects.get(container.id)
    if (
      rect &&
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      collisions.push({ id: container.id, data: { droppableContainer: container } })
    }
  }
  return collisions
}

/** Viewport y where a mouse or touch drag started, or null for the keyboard. */
function pointerStartY(event: Event | null): number | null {
  if (event instanceof MouseEvent) return event.clientY
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    return event.touches[0]?.clientY ?? null
  }
  return null
}

/**
 * The drag in the shape `applyDragEnd` takes: the day column under the drag
 * and the offset of the dragged edge from the column's top. A moved card uses
 * its top edge; a resize uses the pointer, or the handle's edge by keyboard.
 */
export function toDragInput({
  active,
  over,
  delta,
  activatorEvent,
}: Pick<DragEndEvent, 'active' | 'over' | 'delta' | 'activatorEvent'>): DragEndInput {
  const activeId = String(active.id)
  const rect = active.rect.current.translated
  if (!over || !rect) return { activeId, overId: null, offsetPx: 0 }

  const drag = parseDragId(activeId)
  let y = rect.top
  if (drag?.kind === 'resize') {
    const startY = pointerStartY(activatorEvent)
    if (startY !== null) y = startY + delta.y
    else if (drag.edge === 'end') y = rect.bottom
  }
  return { activeId, overId: String(over.id), offsetPx: y - over.rect.top }
}

/** Arrow keys: up and down step one time step, left and right one day column. */
export const keyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { context: { active, over, collisionRect }, currentCoordinates },
) => {
  const isResize =
    active !== null && parseDragId(String(active.id))?.kind === 'resize'
  const stepY = (HOUR_HEIGHT_PX * STEP_MINUTES) / 60
  const stepX = over?.rect.width ?? collisionRect?.width ?? HOUR_HEIGHT_PX

  switch (event.code) {
    case 'ArrowDown':
      event.preventDefault()
      return { ...currentCoordinates, y: currentCoordinates.y + stepY }
    case 'ArrowUp':
      event.preventDefault()
      return { ...currentCoordinates, y: currentCoordinates.y - stepY }
    case 'ArrowRight':
      if (isResize) return undefined
      event.preventDefault()
      return { ...currentCoordinates, x: currentCoordinates.x + stepX }
    case 'ArrowLeft':
      if (isResize) return undefined
      event.preventDefault()
      return { ...currentCoordinates, x: currentCoordinates.x - stepX }
    default:
      return undefined
  }
}
