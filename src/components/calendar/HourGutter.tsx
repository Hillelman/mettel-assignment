import { HOUR_HEIGHT_PX } from '@/config'
import { cn } from '@/lib/utils'
import { hourToTime } from './dragIds'
import { GRID_BOTTOM_PAD_CLASS, HOURS } from './grid'

type HourGutterProps = {
  className?: string
}

const LABEL_ROW_CLASS = 'border-t border-transparent pr-1 text-right'
const LABEL_CLASS = '-mt-2 block'

export function HourGutter({ className }: HourGutterProps) {
  return (
    <div className={cn('w-12 shrink-0 text-xs text-muted-foreground', className)}>
      {HOURS.map((hour) => (
        <div
          key={hour}
          className={LABEL_ROW_CLASS}
          style={{ height: HOUR_HEIGHT_PX }}
        >
          <span className={LABEL_CLASS}>{hourToTime(hour)}</span>
        </div>
      ))}
      <div className={cn(LABEL_ROW_CLASS, GRID_BOTTOM_PAD_CLASS)}>
        <span className={LABEL_CLASS}>{hourToTime(HOURS.length)}</span>
      </div>
    </div>
  )
}
