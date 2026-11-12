import { useDroppable } from '@dnd-kit/core'
import { useMemo } from 'react'
import { layoutDay, segmentsForDay, type DaySegment } from '@/lib/conflicts'
import type { Appointment } from '@/types/appointment'
import { cn } from '@/lib/utils'
import { AppointmentCard } from './AppointmentCard'
import { DayHeader } from './DayHeader'
import { dayId } from './dragIds'
import { HourGutter } from './HourGutter'
import { HourSlot } from './HourSlot'
import { GRID_BOTTOM_PAD_CLASS, HOURS } from './grid'
import { ResizeGhost } from './ResizeGhost'

export type ResizeState = {
  /** The appointment whose edge is being dragged. */
  id: string
  /** The appointment as it would be saved now, or null outside any day column. */
  preview: Appointment | null
}

type DayColumnProps = {
  date: string
  segments: DaySegment[]
  resizing: ResizeState | null
}

export function DayColumn({ date, segments, resizing }: DayColumnProps) {
  const layouts = useMemo(() => layoutDay(segments), [segments])
  const { setNodeRef } = useDroppable({ id: dayId(date) })
  const ghosts = useMemo(
    () => (resizing?.preview ? segmentsForDay([resizing.preview], date) : []),
    [resizing, date],
  )

  return (
    <section aria-label={date} className="min-w-0">
      <DayHeader date={date} />
      <div className="flex">
        <HourGutter className="md:hidden" />
        <div
          ref={setNodeRef}
          className="relative min-w-0 flex-1 border-l md:border-l-0"
        >
          {HOURS.map((hour) => (
            <HourSlot key={hour} date={date} hour={hour} />
          ))}
          <div className={cn(GRID_BOTTOM_PAD_CLASS, 'border-t border-border')} />
          {segments.map((segment) => {
            const { appointment } = segment
            const layout = layouts.get(appointment.id)
            if (!layout) return null
            return (
              <AppointmentCard
                key={appointment.id}
                segment={segment}
                date={date}
                layout={layout}
                isResizing={resizing?.id === appointment.id}
              />
            )
          })}
          {ghosts.map((segment) => (
            <ResizeGhost key={segment.appointment.id} segment={segment} />
          ))}
        </div>
      </div>
    </section>
  )
}
