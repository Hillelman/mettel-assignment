import { colorClasses } from '@/lib/colors'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/types/appointment'
import { CardContent } from './CardContent'
import { isCompactCard } from './grid'

type DragPreviewProps = {
  appointment: Appointment
  /** Minutes the dragged segment is drawn for, which sets the preview's height. */
  durationMinutes: number
}

export function DragPreview({ appointment, durationMinutes }: DragPreviewProps) {
  return (
    <div
      className={cn(
        'h-full w-full cursor-grabbing rounded-md px-1.5 py-0.5 shadow-lg ring-2 ring-ring/40',
        colorClasses(appointment.color).card,
      )}
    >
      <CardContent
        title={appointment.title}
        start={appointment.start}
        end={appointment.end}
        compact={isCompactCard(durationMinutes)}
      />
    </div>
  )
}
