import { HOUR_HEIGHT_PX } from '@/config'
import type { Appointment } from '@/types/appointment'
import { applyDragEnd, moveTarget, resizeTarget } from './dragActions'
import { dayId, moveId, resizeId } from './dragIds'

/** Pixels from a column's top for a time of day. */
function px(hours: number, minutes = 0): number {
  return ((hours * 60 + minutes) / 60) * HOUR_HEIGHT_PX
}

const meeting: Appointment = {
  id: 'a1',
  title: 'Meeting',
  start: '2026-11-09T09:30',
  end: '2026-11-09T11:00',
  color: 'blue',
}

const night: Appointment = {
  id: 'n1',
  title: 'Night',
  start: '2026-11-09T22:00',
  end: '2026-11-10T02:00',
  color: 'blue',
}

describe('moveTarget', () => {
  const nine: Appointment = {
    ...meeting,
    start: '2026-11-09T09:00',
    end: '2026-11-09T10:00',
  }

  it('snaps the offset to 15 minutes', () => {
    expect(moveTarget(nine, '2026-11-09', '2026-11-09', px(9, 52))).toEqual({
      start: '2026-11-09T09:45',
      end: '2026-11-09T10:45',
    })
    expect(moveTarget(nine, '2026-11-09', '2026-11-09', px(9, 53))).toEqual({
      start: '2026-11-09T10:00',
      end: '2026-11-09T11:00',
    })
  })

  it('changes the date when dropped in another column', () => {
    expect(moveTarget(nine, '2026-11-09', '2026-11-11', px(9))).toEqual({
      start: '2026-11-11T09:00',
      end: '2026-11-11T10:00',
    })
  })

  it('returns null when the start does not change', () => {
    expect(moveTarget(nine, '2026-11-09', '2026-11-09', px(9, 5))).toBeNull()
  })

  it('keeps the wall-clock duration of a multi-day appointment', () => {
    expect(moveTarget(night, '2026-11-09', '2026-11-11', px(23))).toEqual({
      start: '2026-11-11T23:00',
      end: '2026-11-12T03:00',
    })
  })

  it('moves a multi-day appointment grabbed by its second segment', () => {
    expect(moveTarget(night, '2026-11-10', '2026-11-12', px(1))).toEqual({
      start: '2026-11-11T23:00',
      end: '2026-11-12T03:00',
    })
  })

  it('keeps the card within its column when dragged above the top', () => {
    expect(moveTarget(nine, '2026-11-09', '2026-11-10', -40)).toEqual({
      start: '2026-11-10T00:00',
      end: '2026-11-10T01:00',
    })
  })
})

describe('resizeTarget', () => {
  it('snaps both edges to 15 minutes', () => {
    expect(resizeTarget(meeting, 'start', '2026-11-09', px(8, 22))).toEqual({
      start: '2026-11-09T08:15',
      end: meeting.end,
    })
    expect(resizeTarget(meeting, 'end', '2026-11-09', px(12, 8))).toEqual({
      start: meeting.start,
      end: '2026-11-09T12:15',
    })
  })

  it('clamps the top edge to 15 minutes before the end', () => {
    expect(resizeTarget(meeting, 'start', '2026-11-09', px(15))).toEqual({
      start: '2026-11-09T10:45',
      end: meeting.end,
    })
  })

  it('clamps the bottom edge to 15 minutes after the start', () => {
    expect(resizeTarget(meeting, 'end', '2026-11-09', px(7))).toEqual({
      start: meeting.start,
      end: '2026-11-09T09:45',
    })
  })

  it('gives a next-day end for the bottom edge in the next column', () => {
    expect(resizeTarget(meeting, 'end', '2026-11-10', px(2))).toEqual({
      start: meeting.start,
      end: '2026-11-10T02:00',
    })
  })

  it('treats the very bottom of a column as 24:00', () => {
    expect(resizeTarget(meeting, 'end', '2026-11-09', px(30))).toEqual({
      start: meeting.start,
      end: '2026-11-10T00:00',
    })
  })
})

describe('applyDragEnd', () => {
  it('saves a move to the dropped column and time', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: moveId('a1'), overId: dayId('2026-11-11'), offsetPx: px(14) },
      [meeting],
      requestSave,
    )
    expect(requestSave).toHaveBeenCalledWith(
      { ...meeting, start: '2026-11-11T14:00', end: '2026-11-11T15:30' },
      'a1',
    )
  })

  it('moves a multi-day appointment by the grabbed segment', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      {
        activeId: moveId('n1', '2026-11-10'),
        overId: dayId('2026-11-12'),
        offsetPx: px(1),
      },
      [night],
      requestSave,
    )
    expect(requestSave).toHaveBeenCalledWith(
      { ...night, start: '2026-11-11T23:00', end: '2026-11-12T03:00' },
      'n1',
    )
  })

  it('does nothing when a move keeps the same start', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: moveId('a1'), overId: dayId('2026-11-09'), offsetPx: px(9, 30) },
      [meeting],
      requestSave,
    )
    expect(requestSave).not.toHaveBeenCalled()
  })

  it('does nothing when dropped outside any column', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: moveId('a1'), overId: null, offsetPx: px(14) },
      [meeting],
      requestSave,
    )
    applyDragEnd(
      { activeId: resizeId('a1', 'end'), overId: null, offsetPx: px(14) },
      [meeting],
      requestSave,
    )
    expect(requestSave).not.toHaveBeenCalled()
  })

  it('does nothing when dropped on something that is not a column', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: moveId('a1'), overId: 'other', offsetPx: px(14) },
      [meeting],
      requestSave,
    )
    expect(requestSave).not.toHaveBeenCalled()
  })

  it('does nothing for an unknown appointment', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: moveId('missing'), overId: dayId('2026-11-10'), offsetPx: px(9) },
      [meeting],
      requestSave,
    )
    expect(requestSave).not.toHaveBeenCalled()
  })

  it('saves only the end for the bottom handle', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      {
        activeId: resizeId('a1', 'end'),
        overId: dayId('2026-11-09'),
        offsetPx: px(11, 30),
      },
      [meeting],
      requestSave,
    )
    expect(requestSave).toHaveBeenCalledWith(
      { ...meeting, end: '2026-11-09T11:30' },
      'a1',
    )
  })

  it('does not save a resize that leaves the edge unchanged', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      {
        activeId: resizeId('a1', 'end'),
        overId: dayId('2026-11-09'),
        offsetPx: px(11, 3),
      },
      [meeting],
      requestSave,
    )
    applyDragEnd(
      {
        activeId: resizeId('a1', 'start'),
        overId: dayId('2026-11-09'),
        offsetPx: px(9, 28),
      },
      [meeting],
      requestSave,
    )
    expect(requestSave).not.toHaveBeenCalled()
  })
})
