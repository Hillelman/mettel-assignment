import { HOUR_HEIGHT_PX } from '@/config'
import type { DaySegment } from '@/lib/conflicts'
import { CardContent } from './CardContent'

type ResizeGhostProps = {
  segment: DaySegment
}

/** Live preview of a resize on one day, drawn over the real cards. */
export function ResizeGhost({ segment }: ResizeGhostProps) {
  const { appointment, startMinutes, endMinutes } = segment

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 z-10"
      style={{
        top: (startMinutes / 60) * HOUR_HEIGHT_PX,
        height: ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT_PX,
      }}
    >
      <div className="absolute inset-x-0.5 inset-y-px min-h-5 overflow-hidden rounded-md bg-primary px-1.5 py-0.5 text-primary-foreground shadow-lg ring-2 ring-ring/40">
        <CardContent
          title={appointment.title}
          start={appointment.start}
          end={appointment.end}
        />
      </div>
    </div>
  )
}
