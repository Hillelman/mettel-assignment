import { formatRangeFrom } from '@/lib/format'
import type { Appointment } from '@/types/appointment'

type ConflictListProps = {
  conflicts: Appointment[]
  /** ISO date; ranges inside it are shown as times only. */
  referenceDate: string
}

export function ConflictList({ conflicts, referenceDate }: ConflictListProps) {
  return (
    <ul className="grid gap-2">
      {conflicts.map((appointment) => (
        <li
          key={appointment.id}
          className="flex items-center justify-between gap-4 rounded-md border px-3 py-2 text-sm"
        >
          <span className="font-medium">{appointment.title}</span>
          <span className="text-muted-foreground">
            {formatRangeFrom(appointment.start, appointment.end, referenceDate)}
          </span>
        </li>
      ))}
    </ul>
  )
}
