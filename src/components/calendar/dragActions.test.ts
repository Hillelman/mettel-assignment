import type { Appointment } from '@/types/appointment'
import { applyDragEnd } from './dragActions'
import { moveId, resizeId, slotId } from './dragIds'

const meeting: Appointment = {
  id: 'a1',
  title: 'Meeting',
  date: '2026-11-09',
  start: '09:30',
  end: '11:00',
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
      { ...meeting, date: '2026-11-11', start: '14:00', end: '15:30' },
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
      { ...meeting, date: '2026-11-10', start: '09:00', end: '10:30' },
      'a1',
    )
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
    expect(requestSave).toHaveBeenCalledWith({ ...meeting, end: '11:30' }, 'a1')
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
    expect(requestSave).toHaveBeenCalledWith({ ...meeting, end: '09:45' }, 'a1')
  })
})
