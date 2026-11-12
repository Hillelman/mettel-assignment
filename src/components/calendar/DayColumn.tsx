import { useMemo } from 'react'
import { layoutDay, type DaySegment } from '@/lib/conflicts'
import { AppointmentCard } from './AppointmentCard'
import { DayHeader } from './DayHeader'
import { HourGutter } from './HourGutter'
import { HourSlot } from './HourSlot'
import { HOURS } from './grid'

type DayColumnProps = {
  date: string
  segments: DaySegment[]
  /** The appointment whose resize handle is being dragged, if it is on this day. */
  resizing: { id: string; deltaY: number } | null
}

export function DayColumn({ date, segments, resizing }: DayColumnProps) {
  const layouts = useMemo(() => layoutDay(segments), [segments])

  return (
    <section aria-label={date} className="min-w-0">
      <DayHeader date={date} />
      <div className="flex">
        <HourGutter className="md:hidden" />
        <div className="relative min-w-0 flex-1">
          {HOURS.map((hour) => (
            <HourSlot key={hour} date={date} hour={hour} />
          ))}
          {segments.map((segment) => {
            const { appointment, isLast } = segment
            const layout = layouts.get(appointment.id)
            if (!layout) return null
            return (
              <AppointmentCard
                key={appointment.id}
                segment={segment}
                date={date}
                layout={layout}
                resizeDeltaY={
                  isLast && resizing?.id === appointment.id
                    ? resizing.deltaY
                    : undefined
                }
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
