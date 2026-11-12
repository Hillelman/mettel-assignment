import { formatDayHeader, isToday } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { DAY_HEADER_HEIGHT_CLASS } from './grid'

type DayHeaderProps = {
  date: string
}

export function DayHeader({ date }: DayHeaderProps) {
  const { weekday, day } = formatDayHeader(date)
  const today = isToday(date)

  return (
    <h2
      aria-current={today ? 'date' : undefined}
      data-today={today}
      className={cn(
        DAY_HEADER_HEIGHT_CLASS,
        'sticky top-0 z-20 flex flex-col items-center justify-center rounded-md border-b bg-background text-sm',
        today && 'bg-primary text-primary-foreground',
      )}
    >
      <span className="text-xs uppercase">{weekday}</span>
      <span className="text-lg font-semibold">{day}</span>
    </h2>
  )
}
