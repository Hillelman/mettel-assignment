import type { AppointmentColor } from '@/config'
import { colorClasses, colorLabel } from '@/lib/colors'
import { cn } from '@/lib/utils'

type ColorSwatchProps = {
  color: AppointmentColor
}

/** A round swatch followed by the color name. */
export function ColorSwatch({ color }: ColorSwatchProps) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'size-3 shrink-0 rounded-full ring-1 ring-black/10',
          colorClasses(color).swatch,
        )}
      />
      <span>{colorLabel(color)}</span>
    </>
  )
}
