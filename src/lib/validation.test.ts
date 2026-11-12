import { appointmentRules, isAppointment } from './validation'

const valid = {
  id: 'a',
  title: 'Dentist',
  start: '2026-11-09T09:00',
  end: '2026-11-09T10:00',
  color: 'blue',
}

describe('isAppointment', () => {
  it('accepts a valid appointment, with or without notes', () => {
    expect(isAppointment(valid)).toBe(true)
    expect(isAppointment({ ...valid, notes: 'Bring forms' })).toBe(true)
    expect(isAppointment({ ...valid, end: '2026-11-10T02:00' })).toBe(true)
  })

  it('rejects non-objects', () => {
    expect(isAppointment(null)).toBe(false)
    expect(isAppointment('x')).toBe(false)
  })

  it('rejects a missing or blank title', () => {
    const { title, ...withoutTitle } = valid
    expect(title).toBe('Dentist')
    expect(isAppointment(withoutTitle)).toBe(false)
    expect(isAppointment({ ...valid, title: '   ' })).toBe(false)
  })

  it('rejects a bad date-time format', () => {
    expect(isAppointment({ ...valid, start: '2026-11-09T9:00' })).toBe(false)
    expect(isAppointment({ ...valid, end: '2026-11-09T10:60' })).toBe(false)
    expect(isAppointment({ ...valid, end: '2026-11-09T24:00' })).toBe(false)
    expect(isAppointment({ ...valid, start: '09:00', end: '10:00' })).toBe(false)
    expect(isAppointment({ ...valid, start: '2026-11-09 09:00' })).toBe(false)
  })

  it('rejects end before or equal to start, across dates too', () => {
    expect(isAppointment({ ...valid, end: '2026-11-09T09:00' })).toBe(false)
    expect(isAppointment({ ...valid, end: '2026-11-09T08:00' })).toBe(false)
    expect(isAppointment({ ...valid, end: '2026-11-08T23:00' })).toBe(false)
    expect(
      isAppointment({ ...valid, start: '2026-11-10T09:00', end: '2026-11-09T10:00' }),
    ).toBe(false)
  })

  it('rejects non-string notes', () => {
    expect(isAppointment({ ...valid, notes: 5 })).toBe(false)
  })

  it('rejects a missing or unknown color', () => {
    const { color, ...withoutColor } = valid
    expect(color).toBe('blue')
    expect(isAppointment(withoutColor)).toBe(false)
    expect(isAppointment({ ...valid, color: 'chartreuse' })).toBe(false)
    expect(isAppointment({ ...valid, color: 3 })).toBe(false)
  })
})

describe('appointmentRules', () => {
  const values = {
    title: '',
    startDate: '2026-11-09',
    startTime: '09:00',
    endDate: '2026-11-09',
    endTime: '10:00',
  }

  function check<K extends keyof typeof appointmentRules>(
    field: K,
    value: string | undefined,
    form = values,
  ) {
    const rules = appointmentRules[field]
    const validate = rules.validate as (v: string | undefined, f: typeof form) => unknown
    return validate(value, form)
  }

  it('requires the title and limits its trimmed length', () => {
    expect(appointmentRules.title.required).toBe('Title is required')
    expect(check('title', '   ')).toBe('Title is required')
    expect(check('title', 'a'.repeat(81))).toBe('Title must be 80 characters or fewer')
    expect(check('title', ` ${'a'.repeat(80)} `)).toBe(true)
  })

  it('validates the dates', () => {
    expect(appointmentRules.startDate.required).toBe('Start date is required')
    expect(appointmentRules.endDate.required).toBe('End date is required')
    expect(check('startDate', '2026-13-01')).toBe('Enter a valid date')
    expect(check('endDate', '2026-02-30')).toBe('Enter a valid date')
    expect(check('startDate', '2026-11-09')).toBe(true)
  })

  it('validates start time format and step', () => {
    expect(appointmentRules.startTime.required).toBe('Start time is required')
    expect(check('startTime', 'abc')).toBe('Enter a time as HH:mm')
    expect(check('startTime', '09:10')).toBe('Use 15-minute steps')
    expect(check('startTime', '09:15')).toBe(true)
  })

  it('validates end time format and step', () => {
    expect(appointmentRules.endTime.required).toBe('End time is required')
    expect(check('endTime', '24:00')).toBe('Enter a time as HH:mm')
    expect(check('endTime', '10:10')).toBe('Use 15-minute steps')
  })

  it('requires the end date-time after the start date-time', () => {
    const message = 'End must be after the start'
    expect(check('endTime', '09:00')).toBe(message)
    expect(check('endTime', '08:00')).toBe(message)
    expect(check('endTime', '09:15')).toBe(true)
    expect(check('endTime', '08:00', { ...values, endDate: '2026-11-10' })).toBe(true)
    expect(check('endTime', '12:00', { ...values, endDate: '2026-11-08' })).toBe(message)
    expect(check('endTime', '09:00', { ...values, endDate: '2026-11-10' })).toBe(true)
  })

  it('does not compare against an invalid start', () => {
    expect(check('endTime', '09:00', { ...values, startDate: '' })).toBe(true)
  })

  it('limits the notes length', () => {
    expect(check('notes', undefined)).toBe(true)
    expect(check('notes', 'a'.repeat(501))).toBe('Notes must be 500 characters or fewer')
  })

  it('requires a color from the palette', () => {
    expect(appointmentRules.color.required).toBe('Color is required')
    expect(check('color', 'blue')).toBe(true)
    expect(check('color', 'chartreuse')).toBe('Choose a color from the list')
  })
})
