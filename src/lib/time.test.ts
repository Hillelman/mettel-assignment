import { fromMinutes, resizeEnd, snapToStep, toMinutes, durationMinutes } from './time'

describe('time', () => {
  it('converts between HH:mm and minutes', () => {
    expect(toMinutes('09:30')).toBe(570)
    expect(toMinutes('24:00')).toBe(1440)
    expect(fromMinutes(570)).toBe('09:30')
    expect(fromMinutes(1440)).toBe('24:00')
    expect(fromMinutes(0)).toBe('00:00')
  })

  it('snaps to the 15-minute step', () => {
    expect(snapToStep(7)).toBe(0)
    expect(snapToStep(8)).toBe(15)
    expect(snapToStep(62)).toBe(60)
  })

  it('computes the duration', () => {
    expect(durationMinutes({ start: '09:00', end: '10:30' })).toBe(90)
  })
})

describe('resizeEnd', () => {
  it('snaps a pixel delta to 15-minute steps', () => {
    expect(resizeEnd('09:00', '10:00', 12)).toBe('10:15')
    expect(resizeEnd('09:00', '10:00', 5)).toBe('10:00')
    expect(resizeEnd('09:00', '10:00', 24)).toBe('10:30')
    expect(resizeEnd('09:00', '10:00', -12)).toBe('09:45')
  })

  it('clamps to the minimum duration', () => {
    expect(resizeEnd('09:00', '10:00', -1000)).toBe('09:15')
  })

  it('clamps to 24:00', () => {
    expect(resizeEnd('23:00', '23:30', 1000)).toBe('24:00')
  })
})
