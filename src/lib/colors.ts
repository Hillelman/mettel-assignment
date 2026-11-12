import { APPOINTMENT_COLORS, type AppointmentColor } from '@/config'

type ColorClasses = {
  /** Card background and text. */
  card: string
  /** Resize grip, readable on the card background. */
  grip: string
  /** Round swatch of the color. */
  swatch: string
}

/**
 * Static class strings per color, so Tailwind can see every class. Never
 * build these names at runtime.
 */
const COLOR_CLASSES: Record<AppointmentColor, ColorClasses> = {
  blue: {
    card: 'bg-appointment-blue text-appointment-blue-foreground',
    grip: 'bg-appointment-blue-foreground/60',
    swatch: 'bg-appointment-blue',
  },
  sky: {
    card: 'bg-appointment-sky text-appointment-sky-foreground',
    grip: 'bg-appointment-sky-foreground/60',
    swatch: 'bg-appointment-sky',
  },
  teal: {
    card: 'bg-appointment-teal text-appointment-teal-foreground',
    grip: 'bg-appointment-teal-foreground/60',
    swatch: 'bg-appointment-teal',
  },
  green: {
    card: 'bg-appointment-green text-appointment-green-foreground',
    grip: 'bg-appointment-green-foreground/60',
    swatch: 'bg-appointment-green',
  },
  lime: {
    card: 'bg-appointment-lime text-appointment-lime-foreground',
    grip: 'bg-appointment-lime-foreground/60',
    swatch: 'bg-appointment-lime',
  },
  amber: {
    card: 'bg-appointment-amber text-appointment-amber-foreground',
    grip: 'bg-appointment-amber-foreground/60',
    swatch: 'bg-appointment-amber',
  },
  orange: {
    card: 'bg-appointment-orange text-appointment-orange-foreground',
    grip: 'bg-appointment-orange-foreground/60',
    swatch: 'bg-appointment-orange',
  },
  red: {
    card: 'bg-appointment-red text-appointment-red-foreground',
    grip: 'bg-appointment-red-foreground/60',
    swatch: 'bg-appointment-red',
  },
  pink: {
    card: 'bg-appointment-pink text-appointment-pink-foreground',
    grip: 'bg-appointment-pink-foreground/60',
    swatch: 'bg-appointment-pink',
  },
  violet: {
    card: 'bg-appointment-violet text-appointment-violet-foreground',
    grip: 'bg-appointment-violet-foreground/60',
    swatch: 'bg-appointment-violet',
  },
}

export function isAppointmentColor(value: unknown): value is AppointmentColor {
  return APPOINTMENT_COLORS.some((color) => color.id === value)
}

export function colorClasses(color: AppointmentColor): ColorClasses {
  return COLOR_CLASSES[color]
}

export function colorLabel(color: AppointmentColor): string {
  return APPOINTMENT_COLORS.find((item) => item.id === color)?.label ?? color
}

/** A palette color derived from a simple hash of `id`: the same id always gives the same color. */
export function colorForId(id: string): AppointmentColor {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0
  }
  return APPOINTMENT_COLORS[hash % APPOINTMENT_COLORS.length].id
}
