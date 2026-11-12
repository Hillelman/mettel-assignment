import {
  addMinutes,
  durationMinutes,
  fromMinutes,
  fromWallMinutes,
  isDateTime,
  resizeEnd,
  snapToStep,
  splitDateTime,
  toDateTime,
  toMinutes,
  toWallMinutes,
} from './time'

describe('time', () => {
  it('converts between HH:mm and minutes', () => {
    expect(toMinutes('09:30')).toBe(570)
    expect(fromMinutes(570)).toBe('09:30')
    expect(fromMinutes(0)).toBe('00:00')
  })

  it('snaps to the 15-minute step', () => {
    expect(snapToStep(7)).toBe(0)
    expect(snapToStep(8)).toBe(15)
    expect(snapToStep(62)).toBe(60)
  })

  it('computes the duration across dates', () => {
    expect(
      durationMinutes({ start: '2026-11-09T09:00', end: '2026-11-09T10:30' }),
    ).toBe(90)
    expect(
      durationMinutes({ start: '2026-11-09T22:00', end: '2026-11-10T02:00' }),
    ).toBe(240)
  })
})

describe('date-time helpers', () => {
  it('joins and splits a date-time', () => {
    expect(toDateTime('2026-11-09', '09:30')).toBe('2026-11-09T09:30')
    expect(splitDateTime('2026-11-09T09:30')).toEqual({
      date: '2026-11-09',
      time: '09:30',
    })
  })

  it('round-trips through wall minutes', () => {
    for (const value of ['2026-11-09T09:30', '1999-12-31T23:45', '2028-02-29T00:00']) {
      expect(fromWallMinutes(toWallMinutes(value))).toBe(value)
    }
  })

  it('validates the date-time format', () => {
    expect(isDateTime('2026-11-09T09:30')).toBe(true)
    expect(isDateTime('2026-11-09T24:00')).toBe(false)
    expect(isDateTime('2026-02-30T09:30')).toBe(false)
    expect(isDateTime('2026-11-09 09:30')).toBe(false)
    expect(isDateTime('2026-11-09')).toBe(false)
    expect(isDateTime('09:30')).toBe(false)
  })

  it('adds minutes across midnight, month and year boundaries', () => {
    expect(addMinutes('2026-11-09T23:30', 60)).toBe('2026-11-10T00:30')
    expect(addMinutes('2026-11-10T00:15', -30)).toBe('2026-11-09T23:45')
    expect(addMinutes('2026-11-30T23:00', 120)).toBe('2026-12-01T01:00')
    expect(addMinutes('2026-12-31T23:45', 15)).toBe('2027-01-01T00:00')
    expect(addMinutes('2028-02-28T23:00', 120)).toBe('2028-02-29T01:00')
  })

  it('keeps wall-clock durations exact across DST changes', () => {
    // US spring forward (2026-03-08) and fall back (2026-11-01), EU (2026-03-29).
    for (const [start, end] of [
      ['2026-03-07T12:00', '2026-03-09T12:00'],
      ['2026-10-31T12:00', '2026-11-02T12:00'],
      ['2026-03-28T12:00', '2026-03-30T12:00'],
    ]) {
      expect(durationMinutes({ start, end })).toBe(48 * 60)
      expect(addMinutes(start, 48 * 60)).toBe(end)
    }
    expect(addMinutes('2026-03-08T01:30', 60)).toBe('2026-03-08T02:30')
    expect(addMinutes('2026-11-01T00:30', 120)).toBe('2026-11-01T02:30')
  })
})

describe('resizeEnd', () => {
  const start = '2026-11-09T09:00'
  const end = '2026-11-09T10:00'

  it('snaps a pixel delta to 15-minute steps', () => {
    expect(resizeEnd(start, end, 12)).toBe('2026-11-09T10:15')
    expect(resizeEnd(start, end, 5)).toBe('2026-11-09T10:00')
    expect(resizeEnd(start, end, 24)).toBe('2026-11-09T10:30')
    expect(resizeEnd(start, end, -12)).toBe('2026-11-09T09:45')
  })

  it('clamps to the minimum duration', () => {
    expect(resizeEnd(start, end, -1000)).toBe('2026-11-09T09:15')
  })

  it('continues into the next day', () => {
    expect(resizeEnd('2026-11-09T23:00', '2026-11-09T23:30', 48)).toBe(
      '2026-11-10T00:30',
    )
  })
})
