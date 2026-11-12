import type { Appointment } from '@/types/appointment'
import { applyDragEnd } from './dragActions'
import { moveId, resizeId, slotId } from './dragIds'

const meeting: Appointment = {
  id: 'a1',
  title: 'Meeting',
  start: '2026-11-09T09:30',
  end: '2026-11-09T11:00',
}

describe('applyDragEnd', () => {
  it('moves to the dropped slot keeping the duration', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: moveId('a1'), overId: slotId('2026-11-11', 14), deltaY: 0 },
      [meeting],
      requestSave,
    )
    expect(requestSave).toHaveBeenCalledWith(
      { ...meeting, start: '2026-11-11T14:00', end: '2026-11-11T15:30' },
      'a1',
    )
  })

  it('does nothing when dropped on the original slot', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: moveId('a1'), overId: slotId('2026-11-09', 9), deltaY: 0 },
      [meeting],
      requestSave,
    )
    expect(requestSave).not.toHaveBeenCalled()
  })

  it('moves to another day at the same hour', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: moveId('a1'), overId: slotId('2026-11-10', 9), deltaY: 0 },
      [meeting],
      requestSave,
    )
    expect(requestSave).toHaveBeenCalledWith(
      { ...meeting, start: '2026-11-10T09:00', end: '2026-11-10T10:30' },
      'a1',
    )
  })

  it('keeps a multi-day duration when moving', () => {
    const requestSave = vi.fn(() => true)
    const night: Appointment = {
      id: 'n1',
      title: 'Night',
      start: '2026-11-09T22:00',
      end: '2026-11-10T02:00',
    }
    applyDragEnd(
      { activeId: moveId('n1', '2026-11-10'), overId: slotId('2026-11-11', 23), deltaY: 0 },
      [night],
      requestSave,
    )
    expect(requestSave).toHaveBeenCalledWith(
      { ...night, start: '2026-11-11T23:00', end: '2026-11-12T03:00' },
      'n1',
    )
  })

  it('resizes the end of a multi-day appointment on its last day', () => {
    const requestSave = vi.fn(() => true)
    const night: Appointment = {
      id: 'n1',
      title: 'Night',
      start: '2026-11-09T22:00',
      end: '2026-11-10T02:00',
    }
    applyDragEnd(
      { activeId: resizeId('n1'), overId: null, deltaY: 48 },
      [night],
      requestSave,
    )
    expect(requestSave).toHaveBeenCalledWith({ ...night, end: '2026-11-10T03:00' }, 'n1')
  })

  it('does nothing when dropped outside any slot', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: moveId('a1'), overId: null, deltaY: 0 },
      [meeting],
      requestSave,
    )
    expect(requestSave).not.toHaveBeenCalled()
  })

  it('does nothing for an unknown appointment', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: moveId('missing'), overId: slotId('2026-11-10', 9), deltaY: 0 },
      [meeting],
      requestSave,
    )
    expect(requestSave).not.toHaveBeenCalled()
  })

  it('resizes to the snapped end', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: resizeId('a1'), overId: null, deltaY: 24 },
      [meeting],
      requestSave,
    )
    expect(requestSave).toHaveBeenCalledWith({ ...meeting, end: '2026-11-09T11:30' }, 'a1')
  })

  it('does not save a resize that snaps back to the same end', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: resizeId('a1'), overId: null, deltaY: 3 },
      [meeting],
      requestSave,
    )
    expect(requestSave).not.toHaveBeenCalled()
  })

  it('never shrinks a resize below the minimum duration', () => {
    const requestSave = vi.fn(() => true)
    applyDragEnd(
      { activeId: resizeId('a1'), overId: null, deltaY: -500 },
      [meeting],
      requestSave,
    )
    expect(requestSave).toHaveBeenCalledWith({ ...meeting, end: '2026-11-09T09:45' }, 'a1')
  })
})
