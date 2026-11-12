import { useDraggable } from '@dnd-kit/core'
import { resizeId } from './dragIds'

type ResizeHandleProps = {
  appointmentId: string
  title: string
}

export function ResizeHandle({ appointmentId, title }: ResizeHandleProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: resizeId(appointmentId),
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Resize ${title}`}
      className="absolute inset-x-1 bottom-0 flex h-2 cursor-ns-resize items-end justify-center"
    >
      <span className="mb-px h-0.5 w-6 rounded-full bg-primary-foreground/60" />
    </div>
  )
}
