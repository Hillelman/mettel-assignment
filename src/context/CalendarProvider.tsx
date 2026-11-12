import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_DURATION_MINUTES, MIN_DURATION_MINUTES } from '@/config'
import { addWeeks, parseISODate, startOfWeek, toISODate } from '@/lib/dates'
import { findConflicts, findNextFreeSlot, fitsInDay } from '@/lib/conflicts'
import { createId } from '@/lib/id'
import { loadAppointments, saveAppointments } from '@/lib/storage'
import { MINUTES_PER_DAY, fromMinutes, toMinutes } from '@/lib/time'
import type { Appointment, AppointmentInput } from '@/types/appointment'
import {
  CalendarContext,
  type CalendarContextValue,
  type ConflictState,
  type FormState,
} from './CalendarContext'

function currentWeekStart(): string {
  return toISODate(startOfWeek(new Date()))
}

function toInput(appointment: Appointment): AppointmentInput {
  return {
    title: appointment.title,
    date: appointment.date,
    start: appointment.start,
    end: appointment.end,
    notes: appointment.notes,
  }
}

/** Defaults: today, the next full hour, DEFAULT_DURATION; ends by 24:00. */
function createDefaults(prefill: Partial<AppointmentInput> = {}): AppointmentInput {
  const now = new Date()
  const nextHour = (now.getHours() + 1) * 60
  const startMinutes = Math.min(
    prefill.start !== undefined ? toMinutes(prefill.start) : nextHour,
    MINUTES_PER_DAY - MIN_DURATION_MINUTES,
  )
  const endMinutes = Math.min(
    prefill.end !== undefined
      ? toMinutes(prefill.end)
      : startMinutes + DEFAULT_DURATION_MINUTES,
    MINUTES_PER_DAY,
  )
  return {
    title: prefill.title ?? '',
    date: prefill.date ?? toISODate(now),
    start: fromMinutes(startMinutes),
    end: fromMinutes(endMinutes),
    notes: prefill.notes ?? '',
  }
}

function upsert(list: Appointment[], appointment: Appointment): Appointment[] {
  return list.some((item) => item.id === appointment.id)
    ? list.map((item) => (item.id === appointment.id ? appointment : item))
    : [...list, appointment]
}

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(loadAppointments)
  const [weekStart, setWeekStart] = useState<string>(currentWeekStart)
  const [form, setForm] = useState<FormState>(() => ({
    open: false,
    editingId: null,
    values: createDefaults(),
  }))
  const [conflict, setConflict] = useState<ConflictState | null>(null)

  const commit = useCallback((next: Appointment[]) => {
    setAppointments(next)
    saveAppointments(next)
  }, [])

  const shiftWeek = useCallback((weeks: number) => {
    setWeekStart((current) =>
      toISODate(addWeeks(parseISODate(current), weeks)),
    )
  }, [])
  const goToPreviousWeek = useCallback(() => shiftWeek(-1), [shiftWeek])
  const goToNextWeek = useCallback(() => shiftWeek(1), [shiftWeek])
  const goToToday = useCallback(() => setWeekStart(currentWeekStart()), [])

  const openCreate = useCallback((prefill?: Partial<AppointmentInput>) => {
    setForm({ open: true, editingId: null, values: createDefaults(prefill) })
  }, [])

  const openEdit = useCallback(
    (id: string) => {
      const existing = appointments.find((item) => item.id === id)
      if (!existing) return
      setForm({ open: true, editingId: id, values: toInput(existing) })
    },
    [appointments],
  )

  const closeForm = useCallback(() => {
    setForm((current) => ({ ...current, open: false }))
  }, [])

  const requestSave = useCallback(
    (input: AppointmentInput, id?: string): boolean => {
      const notes = input.notes?.trim() ? input.notes : undefined
      const proposed: Appointment = {
        ...input,
        title: input.title.trim(),
        notes,
        id: id ?? createId(),
      }
      const isNew = !appointments.some((item) => item.id === proposed.id)
      const conflicts = findConflicts(proposed, appointments, proposed.id)
      const outOfDay = !fitsInDay(proposed)

      if (!outOfDay && conflicts.length === 0) {
        commit(upsert(appointments, proposed))
        setConflict(null)
        setForm((current) => ({ ...current, open: false }))
        return true
      }

      setConflict({
        proposed,
        isNew,
        conflicts,
        outOfDay,
        suggestion: findNextFreeSlot(proposed, appointments, proposed.id),
      })
      setForm((current) => ({ ...current, open: false }))
      return false
    },
    [appointments, commit],
  )

  const deleteAppointment = useCallback(
    (id: string) => {
      commit(appointments.filter((item) => item.id !== id))
      setForm((current) =>
        current.editingId === id
          ? { ...current, open: false, editingId: null }
          : current,
      )
    },
    [appointments, commit],
  )

  const applySuggestion = useCallback(() => {
    if (!conflict || !conflict.suggestion) return
    commit(upsert(appointments, { ...conflict.proposed, ...conflict.suggestion }))
    setConflict(null)
    setForm((current) => ({ ...current, open: false }))
  }, [appointments, commit, conflict])

  const editConflict = useCallback(() => {
    if (!conflict) return
    setForm({
      open: true,
      editingId: conflict.isNew ? null : conflict.proposed.id,
      values: toInput(conflict.proposed),
    })
    setConflict(null)
  }, [conflict])

  const cancelConflict = useCallback(() => setConflict(null), [])

  const value = useMemo<CalendarContextValue>(
    () => ({
      appointments,
      weekStart,
      goToPreviousWeek,
      goToNextWeek,
      goToToday,
      form,
      openCreate,
      openEdit,
      closeForm,
      requestSave,
      deleteAppointment,
      conflict,
      applySuggestion,
      editConflict,
      cancelConflict,
    }),
    [
      appointments,
      weekStart,
      goToPreviousWeek,
      goToNextWeek,
      goToToday,
      form,
      openCreate,
      openEdit,
      closeForm,
      requestSave,
      deleteAppointment,
      conflict,
      applySuggestion,
      editConflict,
      cancelConflict,
    ],
  )

  return <CalendarContext value={value}>{children}</CalendarContext>
}

export default CalendarProvider
