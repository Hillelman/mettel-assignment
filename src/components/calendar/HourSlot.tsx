import { useDroppable } from '@dnd-kit/core'
import { HOUR_HEIGHT_PX } from '@/config'
import { useCalendar } from '@/context/useCalendar'
import { toDateTime } from '@/lib/time'
import { cn } from '@/lib/utils'
import { hourToTime, slotId } from './dragIds'

type HourSlotProps = {
  date: string
  hour: number
}

export function HourSlot({ date, hour }: HourSlotProps) {
  const { openCreate } = useCalendar()
  const { setNodeRef, isOver } = useDroppable({ id: slotId(date, hour) })
  const start = hourToTime(hour)

  return (
    <button
      ref={setNodeRef}
      type="button"
      tabIndex={-1}
      aria-label={`New appointment on ${date} at ${start}`}
      onClick={() => openCreate({ start: toDateTime(date, start) })}
      className={cn(
        'block w-full cursor-pointer border-t border-border transition-colors hover:bg-accent/50',
        isOver && 'bg-accent',
      )}
      style={{ height: HOUR_HEIGHT_PX }}
    />
  )
}
