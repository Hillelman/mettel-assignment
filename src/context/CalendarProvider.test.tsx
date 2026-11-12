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
  date: '2026-11-09',
  start: '12:00',
  end: '13:00',
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
        start: '12:30',
        end: '13:30',
      })
    })

    expect(saved).toBe(false)
    expect(result.current.appointments).toBe(before)
    expect(stored()).toEqual(before)
    expect(result.current.conflict).toMatchObject({
      isNew: true,
      outOfDay: false,
      suggestion: { start: '13:00', end: '14:00' },
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
      saved = result.current.requestSave({ ...lunch, start: '13:00', end: '14:00' })
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

  it('flags an appointment that ends after 24:00', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => {
      result.current.requestSave({ ...lunch, start: '23:30', end: '24:30' })
    })
    expect(result.current.appointments).toHaveLength(0)
    expect(result.current.conflict).toMatchObject({
      outOfDay: true,
      conflicts: [],
      suggestion: { start: '23:00', end: '24:00' },
    })
  })

  it('applySuggestion saves the suggested time', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => {
      result.current.requestSave(lunch)
    })
    act(() => {
      result.current.requestSave({ ...lunch, title: 'Meeting', start: '12:30', end: '13:30' })
    })
    act(() => result.current.applySuggestion())

    expect(result.current.conflict).toBeNull()
    expect(result.current.appointments).toHaveLength(2)
    expect(result.current.appointments[1]).toMatchObject({
      title: 'Meeting',
      start: '13:00',
      end: '14:00',
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
      result.current.requestSave({ ...lunch, start: '15:00', end: '16:00' })
    })
    const moving = result.current.appointments.find((item) => item.start === '15:00')
    expect(moving).toBeDefined()
    act(() => {
      result.current.requestSave({ ...lunch, start: '12:30', end: '13:30' }, moving?.id)
    })
    act(() => result.current.editConflict())

    expect(result.current.conflict).toBeNull()
    expect(result.current.form).toMatchObject({
      open: true,
      editingId: moving?.id,
      values: { start: '12:30', end: '13:30' },
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
      values: { date: '2026-11-12', start: '11:00', end: '12:00' },
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

  it('clamps the create defaults so they end by 24:00', () => {
    vi.setSystemTime(new Date(2026, 10, 12, 23, 30))
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => result.current.openCreate())
    expect(result.current.form.values).toMatchObject({ start: '23:45', end: '24:00' })

    act(() => result.current.openCreate({ date: '2026-11-10', start: '23:00' }))
    expect(result.current.form.values).toMatchObject({
      date: '2026-11-10',
      start: '23:00',
      end: '24:00',
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
