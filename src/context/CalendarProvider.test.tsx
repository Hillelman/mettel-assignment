import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { STORAGE_KEY } from '@/config'
import type { AppointmentInput } from '@/types/appointment'
import { CalendarProvider } from './CalendarProvider'
import { useCalendar } from './useCalendar'

function wrapper({ children }: { children: ReactNode }) {
  return <CalendarProvider>{children}</CalendarProvider>
}

const lunch: AppointmentInput = {
  title: 'Lunch',
  start: '2026-11-09T12:00',
  end: '2026-11-09T13:00',
}

function stored() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
}

describe('CalendarProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 12, 10, 30))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('throws outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useCalendar())).toThrow(/CalendarProvider/)
    vi.restoreAllMocks()
  })

  it('loads from storage once', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: 'x', ...lunch }, { id: 'bad' }]),
    )
    const { result } = renderHook(() => useCalendar(), { wrapper })
    expect(result.current.appointments).toEqual([{ id: 'x', ...lunch }])
  })

  it('persists a save to localStorage and closes the form', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => result.current.openCreate())
    expect(result.current.form.open).toBe(true)

    let saved = false
    act(() => {
      saved = result.current.requestSave(lunch)
    })

    expect(saved).toBe(true)
    expect(result.current.form.open).toBe(false)
    expect(result.current.conflict).toBeNull()
    expect(result.current.appointments).toHaveLength(1)
    expect(stored()).toEqual(result.current.appointments)
  })

  it('sets a conflict and leaves appointments unchanged', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => {
      result.current.requestSave(lunch)
    })
    const before = result.current.appointments

    let saved = true
    act(() => {
      saved = result.current.requestSave({
        ...lunch,
        title: 'Meeting',
        start: '2026-11-09T12:30',
        end: '2026-11-09T13:30',
      })
    })

    expect(saved).toBe(false)
    expect(result.current.appointments).toBe(before)
    expect(stored()).toEqual(before)
    expect(result.current.conflict).toMatchObject({
      isNew: true,
      suggestion: { start: '2026-11-09T13:00', end: '2026-11-09T14:00' },
    })
    expect(result.current.conflict?.conflicts).toEqual(before)
  })

  it('allows back-to-back appointments', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => {
      result.current.requestSave(lunch)
    })
    let saved = false
    act(() => {
      saved = result.current.requestSave({
        ...lunch,
        start: '2026-11-09T13:00',
        end: '2026-11-09T14:00',
      })
    })
    expect(saved).toBe(true)
    expect(result.current.appointments).toHaveLength(2)
  })

  it('saves an unchanged existing appointment without a conflict', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => {
      result.current.requestSave(lunch)
    })
    const [existing] = result.current.appointments
    let saved = false
    act(() => {
      saved = result.current.requestSave(lunch, existing.id)
    })
    expect(saved).toBe(true)
    expect(result.current.appointments).toHaveLength(1)
  })

  it('persists a multi-day appointment', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    const night = {
      title: 'Night shift',
      start: '2026-11-09T22:00',
      end: '2026-11-10T02:00',
    }
    let saved = false
    act(() => {
      saved = result.current.requestSave(night)
    })

    expect(saved).toBe(true)
    expect(result.current.appointments).toMatchObject([night])
    expect(stored()).toMatchObject([night])
  })

  it('rejects an overlap with a multi-day appointment and leaves the data unchanged', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => {
      result.current.requestSave({
        title: 'Night shift',
        start: '2026-11-09T22:00',
        end: '2026-11-10T02:00',
      })
    })
    const before = result.current.appointments

    let saved = true
    act(() => {
      saved = result.current.requestSave({
        title: 'Early call',
        start: '2026-11-10T01:00',
        end: '2026-11-10T03:00',
      })
    })

    expect(saved).toBe(false)
    expect(result.current.appointments).toBe(before)
    expect(stored()).toEqual(before)
    expect(result.current.conflict?.conflicts).toEqual(before)
    expect(result.current.conflict?.suggestion).toEqual({
      start: '2026-11-10T02:00',
      end: '2026-11-10T04:00',
    })
  })

  it('allows back-to-back appointments across midnight', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => {
      result.current.requestSave({
        title: 'Night shift',
        start: '2026-11-09T22:00',
        end: '2026-11-10T00:00',
      })
    })
    let saved = false
    act(() => {
      saved = result.current.requestSave({
        title: 'Early call',
        start: '2026-11-10T00:00',
        end: '2026-11-10T01:00',
      })
    })
    expect(saved).toBe(true)
  })

  it('applySuggestion saves the suggested time', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => {
      result.current.requestSave(lunch)
    })
    act(() => {
      result.current.requestSave({
        ...lunch,
        title: 'Meeting',
        start: '2026-11-09T12:30',
        end: '2026-11-09T13:30',
      })
    })
    act(() => result.current.applySuggestion())

    expect(result.current.conflict).toBeNull()
    expect(result.current.appointments).toHaveLength(2)
    expect(result.current.appointments[1]).toMatchObject({
      title: 'Meeting',
      start: '2026-11-09T13:00',
      end: '2026-11-09T14:00',
    })
    expect(stored()).toEqual(result.current.appointments)
  })

  it('cancelConflict leaves the data unchanged', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => {
      result.current.requestSave(lunch)
    })
    const before = result.current.appointments
    act(() => {
      result.current.requestSave({ ...lunch, title: 'Meeting' })
    })
    act(() => result.current.cancelConflict())

    expect(result.current.conflict).toBeNull()
    expect(result.current.appointments).toBe(before)
    expect(stored()).toEqual(before)
  })

  it('editConflict reopens the form with the proposed values and id', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => {
      result.current.requestSave(lunch)
    })
    act(() => {
      result.current.requestSave({
        ...lunch,
        start: '2026-11-09T15:00',
        end: '2026-11-09T16:00',
      })
    })
    const moving = result.current.appointments.find(
      (item) => item.start === '2026-11-09T15:00',
    )
    expect(moving).toBeDefined()
    act(() => {
      result.current.requestSave(
        { ...lunch, start: '2026-11-09T12:30', end: '2026-11-09T13:30' },
        moving?.id,
      )
    })
    act(() => result.current.editConflict())

    expect(result.current.conflict).toBeNull()
    expect(result.current.form).toMatchObject({
      open: true,
      editingId: moving?.id,
      values: { start: '2026-11-09T12:30', end: '2026-11-09T13:30' },
    })
  })

  it('deletes an appointment and persists', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => {
      result.current.requestSave(lunch)
    })
    const [existing] = result.current.appointments
    act(() => result.current.deleteAppointment(existing.id))
    expect(result.current.appointments).toEqual([])
    expect(stored()).toEqual([])
  })

  it('opens the form for editing and for creation with defaults', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => result.current.openCreate())
    expect(result.current.form).toMatchObject({
      open: true,
      editingId: null,
      values: { start: '2026-11-12T11:00', end: '2026-11-12T12:00' },
    })

    act(() => {
      result.current.requestSave(lunch)
    })
    const [existing] = result.current.appointments
    act(() => result.current.openEdit(existing.id))
    expect(result.current.form).toMatchObject({
      open: true,
      editingId: existing.id,
      values: lunch,
    })
  })

  it('lets the create defaults cross midnight', () => {
    vi.setSystemTime(new Date(2026, 10, 12, 22, 30))
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => result.current.openCreate())
    expect(result.current.form.values).toMatchObject({
      start: '2026-11-12T23:00',
      end: '2026-11-13T00:00',
    })

    vi.setSystemTime(new Date(2026, 10, 12, 23, 30))
    act(() => result.current.openCreate())
    expect(result.current.form.values).toMatchObject({
      start: '2026-11-13T00:00',
      end: '2026-11-13T01:00',
    })
  })

  it('prefills a date-time and ends an hour later by default', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => result.current.openCreate({ start: '2026-11-10T23:00' }))
    expect(result.current.form.values).toMatchObject({
      start: '2026-11-10T23:00',
      end: '2026-11-11T00:00',
    })

    act(() =>
      result.current.openCreate({
        start: '2026-11-10T09:00',
        end: '2026-11-12T09:00',
      }),
    )
    expect(result.current.form.values).toMatchObject({
      start: '2026-11-10T09:00',
      end: '2026-11-12T09:00',
    })
  })

  it('navigates weeks by 7 days', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    expect(result.current.weekStart).toBe('2026-11-09')
    act(() => result.current.goToNextWeek())
    expect(result.current.weekStart).toBe('2026-11-16')
    act(() => result.current.goToPreviousWeek())
    act(() => result.current.goToPreviousWeek())
    expect(result.current.weekStart).toBe('2026-11-02')
    act(() => result.current.goToToday())
    expect(result.current.weekStart).toBe('2026-11-09')
  })
})
