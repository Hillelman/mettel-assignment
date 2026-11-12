import type {
  Collision,
  CollisionDetection,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core'
import { HOUR_HEIGHT_PX, STEP_MINUTES } from '@/config'
import { parseDragId } from './dragIds'

/**
 * The droppable under the horizontal centre and top edge of the dragged card,
 * so the card's start is what snaps to a slot, wherever it was grabbed.
 */
export const slotUnderCardTop: CollisionDetection = ({
  collisionRect,
  droppableRects,
  droppableContainers,
}) => {
  const x = collisionRect.left + collisionRect.width / 2
  const y = collisionRect.top + 1
  const collisions: Collision[] = []
  for (const container of droppableContainers) {
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

/** Arrow keys: a move jumps one slot or day, a resize one step. */
export const keyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { context: { active, over, collisionRect }, currentCoordinates },
) => {
  const isResize =
    active !== null && parseDragId(String(active.id))?.kind === 'resize'
  const stepY = isResize ? (HOUR_HEIGHT_PX * STEP_MINUTES) / 60 : HOUR_HEIGHT_PX
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
