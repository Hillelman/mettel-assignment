import type { Appointment } from '@/types/appointment'
import {
  findConflicts,
  findNextFreeSlot,
  layoutDay,
  overlaps,
  segmentsForDay,
} from './conflicts'

function appt(
  id: string,
  start: string,
  end: string,
  date = '2026-11-09',
  endDate = date,
): Appointment {
  return { id, title: id, start: `${date}T${start}`, end: `${endDate}T${end}` }
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

  it('detects an overlap across midnight', () => {
    const night = appt('a', '22:00', '02:00', '2026-11-09', '2026-11-10')
    expect(overlaps(night, appt('b', '01:00', '03:00', '2026-11-10'))).toBe(true)
    expect(overlaps(appt('b', '23:00', '23:30'), night)).toBe(true)
  })

  it('allows back-to-back appointments at midnight', () => {
    const night = appt('a', '22:00', '00:00', '2026-11-09', '2026-11-10')
    expect(overlaps(night, appt('b', '00:00', '01:00', '2026-11-10'))).toBe(false)
    expect(overlaps(appt('b', '00:00', '01:00', '2026-11-10'), night)).toBe(false)
  })

  it('detects nested multi-day ranges', () => {
    const outer = appt('a', '09:00', '09:00', '2026-11-09', '2026-11-13')
    const inner = appt('b', '12:00', '12:00', '2026-11-10', '2026-11-11')
    expect(overlaps(outer, inner)).toBe(true)
    expect(overlaps(inner, outer)).toBe(true)
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

describe('findNextFreeSlot', () => {
  it('finds the forward slot', () => {
    const all = [appt('a', '09:00', '10:00')]
    expect(findNextFreeSlot(appt('p', '09:00', '10:00'), all)).toEqual({
      start: '2026-11-09T10:00',
      end: '2026-11-09T11:00',
    })
  })

  it('finds the backward slot when it is nearer than the forward one', () => {
    const all = [appt('a', '09:00', '09:00', '2026-11-09', '2026-11-12')]
    expect(
      findNextFreeSlot(appt('p', '10:00', '11:00', '2026-11-10'), all),
    ).toEqual({
      start: '2026-11-09T08:00',
      end: '2026-11-09T09:00',
    })
  })

  it('searches forward across midnight and prefers forward on a tie', () => {
    const all = [appt('a', '22:00', '00:30', '2026-11-09', '2026-11-10')]
    expect(findNextFreeSlot(appt('p', '23:00', '23:30'), all)).toEqual({
      start: '2026-11-10T00:30',
      end: '2026-11-10T01:00',
    })
  })

  it('keeps a multi-day duration', () => {
    const all = [appt('a', '09:00', '10:00')]
    const proposed = appt('p', '09:00', '10:00', '2026-11-09', '2026-11-11')
    expect(findNextFreeSlot(proposed, all)).toEqual({
      start: '2026-11-09T10:00',
      end: '2026-11-11T11:00',
    })
  })

  it('ignores its own id', () => {
    const all = [appt('p', '09:00', '10:00')]
    expect(findNextFreeSlot(appt('p', '09:00', '10:00'), all, 'p')).toEqual({
      start: '2026-11-09T09:00',
      end: '2026-11-09T10:00',
    })
  })

  it('returns null when nothing is free within 7 days either way', () => {
    const all = [appt('a', '00:00', '00:00', '2026-10-25', '2026-11-30')]
    expect(findNextFreeSlot(appt('p', '09:00', '10:00'), all)).toBeNull()
  })

  it('finds a slot at the edge of the search window', () => {
    const all = [appt('a', '00:00', '00:00', '2026-11-02', '2026-11-16')]
    expect(findNextFreeSlot(appt('p', '09:00', '10:00'), all)).toEqual({
      start: '2026-11-16T00:00',
      end: '2026-11-16T01:00',
    })
  })
})

describe('segmentsForDay', () => {
  it('returns one segment for a single-day appointment', () => {
    const a = appt('a', '09:30', '11:00')
    expect(segmentsForDay([a], '2026-11-09')).toEqual([
      { appointment: a, startMinutes: 570, endMinutes: 660, isFirst: true, isLast: true },
    ])
    expect(segmentsForDay([a], '2026-11-10')).toEqual([])
  })

  it('splits a two-day appointment into a first and a last segment', () => {
    const a = appt('a', '22:00', '02:00', '2026-11-09', '2026-11-10')
    expect(segmentsForDay([a], '2026-11-09')).toEqual([
      { appointment: a, startMinutes: 1320, endMinutes: 1440, isFirst: true, isLast: false },
    ])
    expect(segmentsForDay([a], '2026-11-10')).toEqual([
      { appointment: a, startMinutes: 0, endMinutes: 120, isFirst: false, isLast: true },
    ])
    expect(segmentsForDay([a], '2026-11-11')).toEqual([])
  })

  it('has only a start-day segment when the end is the next 00:00', () => {
    const a = appt('a', '22:00', '00:00', '2026-11-09', '2026-11-10')
    expect(segmentsForDay([a], '2026-11-09')).toEqual([
      { appointment: a, startMinutes: 1320, endMinutes: 1440, isFirst: true, isLast: true },
    ])
    expect(segmentsForDay([a], '2026-11-10')).toEqual([])
  })

  it('gives a span longer than a week a full segment on every middle day', () => {
    const a = appt('a', '12:00', '12:00', '2026-11-01', '2026-11-15')
    for (const date of ['2026-11-02', '2026-11-08', '2026-11-14']) {
      expect(segmentsForDay([a], date)).toEqual([
        { appointment: a, startMinutes: 0, endMinutes: 1440, isFirst: false, isLast: false },
      ])
    }
  })
})

describe('layoutDay', () => {
  function layout(...appointments: Appointment[]) {
    return layoutDay(
      appointments.flatMap((item) => segmentsForDay([item], '2026-11-09')),
    )
  }

  it('gives a lone appointment the full width', () => {
    expect(layout(appt('a', '09:00', '10:00')).get('a')).toEqual({
      column: 0,
      columns: 1,
    })
  })

  it('places overlapping appointments side by side', () => {
    const result = layout(appt('a', '09:00', '10:00'), appt('b', '09:30', '10:30'))
    expect(result.get('a')).toEqual({ column: 0, columns: 2 })
    expect(result.get('b')).toEqual({ column: 1, columns: 2 })
  })

  it('keeps separate clusters independent and reuses free columns', () => {
    const result = layout(
      appt('a', '09:00', '10:00'),
      appt('b', '09:30', '10:30'),
      appt('c', '10:00', '11:00'),
      appt('d', '14:00', '15:00'),
    )
    expect(result.get('c')).toEqual({ column: 0, columns: 2 })
    expect(result.get('d')).toEqual({ column: 0, columns: 1 })
  })

  it('treats back-to-back appointments as separate', () => {
    const result = layout(appt('a', '09:00', '10:00'), appt('b', '10:00', '11:00'))
    expect(result.get('b')).toEqual({ column: 0, columns: 1 })
  })

  it('lays out the segment of a multi-day appointment on its day', () => {
    const result = layoutDay(
      segmentsForDay(
        [
          appt('a', '22:00', '02:00', '2026-11-09', '2026-11-10'),
          appt('b', '01:00', '03:00', '2026-11-10'),
        ],
        '2026-11-10',
      ),
    )
    expect(result.get('a')).toEqual({ column: 0, columns: 2 })
    expect(result.get('b')).toEqual({ column: 1, columns: 2 })
  })
})
