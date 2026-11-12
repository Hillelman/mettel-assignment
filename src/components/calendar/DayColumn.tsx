import { useMemo } from 'react'
import { layoutDay } from '@/lib/conflicts'
import type { Appointment } from '@/types/appointment'
import { AppointmentCard } from './AppointmentCard'
import { DayHeader } from './DayHeader'
import { HourGutter } from './HourGutter'
import { HourSlot } from './HourSlot'
import { HOURS } from './grid'

type DayColumnProps = {
  date: string
  appointments: Appointment[]
  /** The appointment whose resize handle is being dragged, if it is on this day. */
  resizing: { id: string; deltaY: number } | null
}

export function DayColumn({ date, appointments, resizing }: DayColumnProps) {
  const layouts = useMemo(() => layoutDay(appointments), [appointments])

  return (
    <section aria-label={date} className="min-w-0">
      <DayHeader date={date} />
      <div className="flex">
        <HourGutter className="md:hidden" />
        <div className="relative min-w-0 flex-1">
          {HOURS.map((hour) => (
            <HourSlot key={hour} date={date} hour={hour} />
          ))}
          {appointments.map((appointment) => {
            const layout = layouts.get(appointment.id)
            if (!layout) return null
            return (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                layout={layout}
                resizeDeltaY={
                  resizing?.id === appointment.id ? resizing.deltaY : undefined
                }
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
