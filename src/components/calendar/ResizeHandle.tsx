import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { resizeId, type ResizeEdge } from './dragIds'

type ResizeHandleProps = {
  appointmentId: string
  title: string
  /** Which end of the appointment the handle moves. */
  edge: ResizeEdge
}

export function ResizeHandle({ appointmentId, title, edge }: ResizeHandleProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: resizeId(appointmentId, edge),
  })
  const atTop = edge === 'start'

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Resize ${edge} of ${title}`}
      className={cn(
        'absolute inset-x-1 flex h-2 cursor-ns-resize justify-center',
        atTop ? 'top-0 items-start' : 'bottom-0 items-end',
      )}
    >
      <span
        className={cn(
          'h-0.5 w-6 rounded-full bg-primary-foreground/60',
          atTop ? 'mt-px' : 'mb-px',
        )}
      />
    </div>
  )
}
