import { useDraggable } from '@dnd-kit/core'
import type { KeyboardEvent } from 'react'
import { HOUR_HEIGHT_PX } from '@/config'
import { useCalendar } from '@/context/useCalendar'
import type { DayLayout } from '@/lib/conflicts'
import { cn } from '@/lib/utils'
import { durationMinutes, resizeEnd, toMinutes } from '@/lib/time'
import type { Appointment } from '@/types/appointment'
import { CardContent } from './CardContent'
import { moveId } from './dragIds'
import { ResizeHandle } from './ResizeHandle'

type AppointmentCardProps = {
  appointment: Appointment
  layout: DayLayout
  /** Live vertical travel of this card's resize handle, while it is dragged. */
  resizeDeltaY?: number
}

export function AppointmentCard({
  appointment,
  layout,
  resizeDeltaY,
}: AppointmentCardProps) {
  const { openEdit } = useCalendar()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({ id: moveId(appointment.id) })

  const { id, title, start } = appointment
  const end =
    resizeDeltaY === undefined
      ? appointment.end
      : resizeEnd(start, appointment.end, resizeDeltaY)
  const top = (toMinutes(start) / 60) * HOUR_HEIGHT_PX
  const height = (durationMinutes({ start, end }) / 60) * HOUR_HEIGHT_PX

  const { onKeyDown: dragKeyDown, ...dragListeners } = listeners ?? {}
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !isDragging) {
      openEdit(id)
      return
    }
    dragKeyDown?.(event)
  }

  return (
    <div
      ref={setNodeRef}
      className="absolute"
      style={{
        top,
        height,
        left: `${(layout.column / layout.columns) * 100}%`,
        width: `${100 / layout.columns}%`,
      }}
    >
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...dragListeners}
        onKeyDown={handleKeyDown}
        onClick={() => openEdit(id)}
        aria-label={`${title}, ${start} to ${appointment.end}`}
        className={cn(
          'absolute inset-x-0.5 inset-y-px min-h-5 cursor-grab overflow-hidden rounded-md bg-primary px-1.5 py-0.5 text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isDragging && 'opacity-40',
        )}
      >
        <CardContent title={title} start={start} end={end} />
      </div>
      <ResizeHandle appointmentId={id} title={title} />
    </div>
  )
}
