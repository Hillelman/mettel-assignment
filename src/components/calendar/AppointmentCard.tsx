import { useDraggable } from '@dnd-kit/core'
import type { KeyboardEvent } from 'react'
import { HOUR_HEIGHT_PX } from '@/config'
import { useCalendar } from '@/context/useCalendar'
import type { DayLayout, DaySegment } from '@/lib/conflicts'
import { colorClasses } from '@/lib/colors'
import { formatCardRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CardContent } from './CardContent'
import { moveId } from './dragIds'
import { isCompactCard } from './grid'
import { ResizeHandle } from './ResizeHandle'

type AppointmentCardProps = {
  segment: DaySegment
  /** ISO date of the day column the segment is drawn in. */
  date: string
  layout: DayLayout
  /** The appointment is being resized; its live preview is drawn on top. */
  isResizing: boolean
}

export function AppointmentCard({
  segment,
  date,
  layout,
  isResizing,
}: AppointmentCardProps) {
  const { openEdit } = useCalendar()
  const { appointment, startMinutes, endMinutes, isFirst, isLast } = segment
  const { id, title, start, end, color } = appointment
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({ id: moveId(id, date) })

  const top = (startMinutes / 60) * HOUR_HEIGHT_PX
  const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT_PX

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
        aria-label={`${title}, ${formatCardRange(start, end, ' to ')}`}
        className={cn(
          'absolute inset-x-0.5 inset-y-px min-h-5 cursor-grab overflow-hidden rounded-md px-1.5 py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring',
          colorClasses(color).card,
          (isDragging || isResizing) && 'opacity-40',
        )}
      >
        <CardContent
          title={title}
          start={start}
          end={end}
          compact={isCompactCard(endMinutes - startMinutes)}
        />
      </div>
      {isFirst && (
        <ResizeHandle
          appointmentId={id}
          title={title}
          color={color}
          edge="start"
        />
      )}
      {isLast && (
        <ResizeHandle
          appointmentId={id}
          title={title}
          color={color}
          edge="end"
        />
      )}
    </div>
  )
}
