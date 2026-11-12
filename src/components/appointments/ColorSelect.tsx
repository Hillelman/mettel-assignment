import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { APPOINTMENT_COLORS, type AppointmentColor } from '@/config'
import { isAppointmentColor } from '@/lib/colors'
import { ColorSwatch } from './ColorSwatch'

type ColorSelectProps = {
  id: string
  value: AppointmentColor
  onChange: (color: AppointmentColor) => void
  onBlur: () => void
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

export function ColorSelect({
  value,
  onChange,
  onBlur,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: ColorSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (isAppointmentColor(next)) onChange(next)
      }}
    >
      <SelectTrigger
        id={id}
        className="w-full"
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        onBlur={onBlur}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {APPOINTMENT_COLORS.map(({ id: colorId }) => (
          <SelectItem key={colorId} value={colorId}>
            <ColorSwatch color={colorId} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
