import { APPOINTMENT_COLORS } from '@/config'
import {
  colorClasses,
  colorForId,
  colorLabel,
  isAppointmentColor,
  randomColor,
} from './colors'

describe('colorClasses', () => {
  it.each(APPOINTMENT_COLORS)('returns static classes for $id', ({ id }) => {
    expect(colorClasses(id)).toEqual({
      card: `bg-appointment-${id} text-appointment-${id}-foreground`,
      grip: `bg-appointment-${id}-foreground/60`,
      swatch: `bg-appointment-${id}`,
    })
  })
})

describe('colorLabel', () => {
  it('returns the configured label', () => {
    expect(colorLabel('violet')).toBe('Violet')
  })
})

describe('isAppointmentColor', () => {
  it('accepts every palette id and nothing else', () => {
    for (const { id } of APPOINTMENT_COLORS) {
      expect(isAppointmentColor(id)).toBe(true)
    }
    expect(isAppointmentColor('purple')).toBe(false)
    expect(isAppointmentColor(undefined)).toBe(false)
    expect(isAppointmentColor(3)).toBe(false)
  })
})

describe('colorForId', () => {
  it('is stable and always in the palette', () => {
    for (const id of ['a', 'b', 'abc', crypto.randomUUID(), '', 'ünï']) {
      const color = colorForId(id)
      expect(isAppointmentColor(color)).toBe(true)
      expect(colorForId(id)).toBe(color)
    }
  })

  it('spreads different ids over several colors', () => {
    const colors = new Set(
      Array.from({ length: 50 }, (_, index) => colorForId(`id-${index}`)),
    )
    expect(colors.size).toBeGreaterThan(3)
  })
})

describe('randomColor', () => {
  afterEach(() => vi.restoreAllMocks())

  it('picks the palette color at the random index', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(randomColor()).toBe('blue')
    vi.spyOn(Math, 'random').mockReturnValue(0.95)
    expect(randomColor()).toBe('violet')
  })
})
