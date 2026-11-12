import type { Appointment } from '@/types/appointment'
import { CardContent } from './CardContent'

type DragPreviewProps = {
  appointment: Appointment
}

export function DragPreview({ appointment }: DragPreviewProps) {
  return (
    <div className="h-full w-full cursor-grabbing rounded-md bg-primary px-1.5 py-0.5 text-primary-foreground shadow-lg ring-2 ring-ring/40">
      <CardContent
        title={appointment.title}
        start={appointment.start}
        end={appointment.end}
      />
    </div>
  )
}
