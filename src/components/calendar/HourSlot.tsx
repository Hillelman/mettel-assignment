import { HOUR_HEIGHT_PX } from '@/config'
import { useCalendar } from '@/context/useCalendar'
import { toDateTime } from '@/lib/time'
import { hourToTime } from './dragIds'

type HourSlotProps = {
  date: string
  hour: number
}

export function HourSlot({ date, hour }: HourSlotProps) {
  const { openCreate } = useCalendar()
  const start = hourToTime(hour)

  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={`New appointment on ${date} at ${start}`}
      onClick={() => openCreate({ start: toDateTime(date, start) })}
      className="block w-full cursor-pointer border-t border-border transition-colors hover:bg-accent/50"
      style={{ height: HOUR_HEIGHT_PX }}
    />
  )
}
