import { useDraggable } from '@dnd-kit/core'
import type { AppointmentColor } from '@/config'
import { colorClasses } from '@/lib/colors'
import { cn } from '@/lib/utils'
import { resizeId, type ResizeEdge } from './dragIds'

type ResizeHandleProps = {
  appointmentId: string
  title: string
  color: AppointmentColor
  /** Which end of the appointment the handle moves. */
  edge: ResizeEdge
}

export function ResizeHandle({
  appointmentId,
  title,
  color,
  edge,
}: ResizeHandleProps) {
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
          'h-0.5 w-6 rounded-full',
          colorClasses(color).grip,
          atTop ? 'mt-px' : 'mb-px',
        )}
      />
    </div>
  )
}
