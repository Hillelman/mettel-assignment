import { appointmentRules, isAppointment } from './validation'

const valid = {
  id: 'a',
  title: 'Dentist',
  date: '2026-11-09',
  start: '09:00',
  end: '10:00',
}

describe('isAppointment', () => {
  it('accepts a valid appointment, with or without notes', () => {
    expect(isAppointment(valid)).toBe(true)
    expect(isAppointment({ ...valid, notes: 'Bring forms', end: '24:00' })).toBe(true)
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

  it('rejects a missing id', () => {
    expect(isAppointment({ ...valid, id: undefined })).toBe(false)
  })

  it('rejects a bad time format', () => {
    expect(isAppointment({ ...valid, start: '9:00' })).toBe(false)
    expect(isAppointment({ ...valid, end: '10:60' })).toBe(false)
    expect(isAppointment({ ...valid, start: '24:00', end: '24:00' })).toBe(false)
  })

  it('rejects a bad date', () => {
    expect(isAppointment({ ...valid, date: '2026-02-30' })).toBe(false)
  })

  it('rejects end before or equal to start', () => {
    expect(isAppointment({ ...valid, end: '09:00' })).toBe(false)
    expect(isAppointment({ ...valid, end: '08:00' })).toBe(false)
  })

  it('rejects non-string notes', () => {
    expect(isAppointment({ ...valid, notes: 5 })).toBe(false)
  })
})

describe('appointmentRules', () => {
  const values = { title: '', date: '', start: '09:00', end: '10:00' }

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

  it('validates the date', () => {
    expect(check('date', '2026-13-01')).toBe('Enter a valid date')
    expect(check('date', '2026-11-09')).toBe(true)
  })

  it('validates start format and step', () => {
    expect(check('start', 'abc')).toBe('Enter a time as HH:mm')
    expect(check('start', '09:10')).toBe('Use 15-minute steps')
    expect(check('start', '09:15')).toBe(true)
  })

  it('requires end after start', () => {
    expect(check('end', '09:00')).toBe('End time must be after the start time')
    expect(check('end', '08:00')).toBe('End time must be after the start time')
    expect(check('end', '09:15')).toBe(true)
    expect(check('end', '24:00')).toBe(true)
  })

  it('limits the notes length', () => {
    expect(check('notes', undefined)).toBe(true)
    expect(check('notes', 'a'.repeat(501))).toBe('Notes must be 500 characters or fewer')
  })
})
