import { APPOINTMENT_COLORS } from '@/config'
import { colorForId, isAppointmentColor } from './colors'

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
})
