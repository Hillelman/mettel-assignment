import { HOUR_HEIGHT_PX } from '@/config'
import { cn } from '@/lib/utils'
import { hourToTime } from './dragIds'
import { HOURS } from './grid'

type HourGutterProps = {
  className?: string
}

export function HourGutter({ className }: HourGutterProps) {
  return (
    <div className={cn('w-12 shrink-0 text-xs text-muted-foreground', className)}>
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="border-t border-transparent pr-1 text-right"
          style={{ height: HOUR_HEIGHT_PX }}
        >
          <span className="-mt-2 block">{hourToTime(hour)}</span>
        </div>
      ))}
    </div>
  )
}
