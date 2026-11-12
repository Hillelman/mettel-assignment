import type { Appointment } from '@/types/appointment'
import {
  findConflicts,
  findNextFreeSlot,
  fitsInDay,
  layoutDay,
  overlaps,
} from './conflicts'

function appt(
  id: string,
  start: string,
  end: string,
  date = '2026-11-09',
): Appointment {
  return { id, title: id, date, start, end }
}

describe('overlaps', () => {
  it('detects overlapping ranges', () => {
    expect(overlaps(appt('a', '09:00', '10:00'), appt('b', '09:30', '10:30'))).toBe(true)
  })

  it('detects nested ranges', () => {
    expect(overlaps(appt('a', '09:00', '12:00'), appt('b', '10:00', '11:00'))).toBe(true)
  })

  it('detects identical ranges', () => {
    expect(overlaps(appt('a', '09:00', '10:00'), appt('b', '09:00', '10:00'))).toBe(true)
  })

  it('allows back-to-back ranges', () => {
    expect(overlaps(appt('a', '09:00', '10:00'), appt('b', '10:00', '11:00'))).toBe(false)
    expect(overlaps(appt('a', '10:00', '11:00'), appt('b', '09:00', '10:00'))).toBe(false)
  })

  it('ignores other dates', () => {
    expect(
      overlaps(appt('a', '09:00', '10:00'), appt('b', '09:00', '10:00', '2026-11-10')),
    ).toBe(false)
  })
})

describe('findConflicts', () => {
  const all = [
    appt('a', '09:00', '10:00'),
    appt('b', '09:30', '11:00'),
    appt('c', '12:00', '13:00'),
  ]

  it('returns every overlapping appointment', () => {
    const result = findConflicts(appt('new', '09:15', '09:45'), all)
    expect(result.map((item) => item.id)).toEqual(['a', 'b'])
  })

  it('excludes the ignored id', () => {
    const result = findConflicts(appt('a', '09:00', '10:00'), all, 'a')
    expect(result.map((item) => item.id)).toEqual(['b'])
  })
})

describe('fitsInDay', () => {
  it('accepts up to 24:00 and rejects past it', () => {
    expect(fitsInDay({ start: '23:00', end: '24:00' })).toBe(true)
    expect(fitsInDay({ start: '23:30', end: '24:30' })).toBe(false)
  })
})

describe('findNextFreeSlot', () => {
  it('finds the forward slot', () => {
    const all = [appt('a', '09:00', '10:00')]
    expect(findNextFreeSlot(appt('p', '09:00', '10:00'), all)).toEqual({
      start: '10:00',
      end: '11:00',
    })
  })

  it('finds the backward slot when forward has none', () => {
    const all = [appt('a', '09:00', '24:00')]
    expect(findNextFreeSlot(appt('p', '10:00', '11:00'), all)).toEqual({
      start: '08:00',
      end: '09:00',
    })
  })

  it('keeps the duration', () => {
    const all = [appt('a', '09:00', '10:00')]
    expect(findNextFreeSlot(appt('p', '09:30', '11:15'), all)).toEqual({
      start: '10:00',
      end: '11:45',
    })
  })

  it('ignores its own id', () => {
    const all = [appt('p', '09:00', '10:00')]
    expect(findNextFreeSlot(appt('p', '09:00', '10:00'), all, 'p')).toEqual({
      start: '09:00',
      end: '10:00',
    })
  })

  it('respects 24:00 for a proposal that runs past midnight', () => {
    expect(findNextFreeSlot(appt('p', '23:30', '25:00'), [])).toEqual({
      start: '22:30',
      end: '24:00',
    })
  })

  it('returns null when the day is full', () => {
    const all = [appt('a', '00:00', '12:00'), appt('b', '12:00', '24:00')]
    expect(findNextFreeSlot(appt('p', '09:00', '10:00'), all)).toBeNull()
  })

  it('returns null when the duration cannot fit between appointments', () => {
    const all = [appt('a', '00:00', '09:00'), appt('b', '09:30', '24:00')]
    expect(findNextFreeSlot(appt('p', '09:00', '10:00'), all)).toBeNull()
  })

  it('only considers appointments on the same date', () => {
    const all = [appt('a', '09:00', '10:00', '2026-11-10')]
    expect(findNextFreeSlot(appt('p', '09:00', '10:00'), all)).toEqual({
      start: '09:00',
      end: '10:00',
    })
  })
})

describe('layoutDay', () => {
  it('gives a lone appointment the full width', () => {
    expect(layoutDay([appt('a', '09:00', '10:00')]).get('a')).toEqual({
      column: 0,
      columns: 1,
    })
  })

  it('places overlapping appointments side by side', () => {
    const layout = layoutDay([appt('a', '09:00', '10:00'), appt('b', '09:30', '10:30')])
    expect(layout.get('a')).toEqual({ column: 0, columns: 2 })
    expect(layout.get('b')).toEqual({ column: 1, columns: 2 })
  })

  it('keeps separate clusters independent and reuses free columns', () => {
    const layout = layoutDay([
      appt('a', '09:00', '10:00'),
      appt('b', '09:30', '10:30'),
      appt('c', '10:00', '11:00'),
      appt('d', '14:00', '15:00'),
    ])
    expect(layout.get('c')).toEqual({ column: 0, columns: 2 })
    expect(layout.get('d')).toEqual({ column: 0, columns: 1 })
  })

  it('treats back-to-back appointments as separate', () => {
    const layout = layoutDay([appt('a', '09:00', '10:00'), appt('b', '10:00', '11:00')])
    expect(layout.get('b')).toEqual({ column: 0, columns: 1 })
  })
})
