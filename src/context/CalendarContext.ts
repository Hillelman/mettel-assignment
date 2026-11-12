import { createContext } from 'react'
import type { Slot } from '@/lib/conflicts'
import type { Appointment, AppointmentInput } from '@/types/appointment'

export type FormState = {
  open: boolean
  editingId: string | null
  values: AppointmentInput
}

export type ConflictState = {
  proposed: Appointment
  isNew: boolean
  conflicts: Appointment[]
  outOfDay: boolean
  suggestion: Slot | null
}

export type CalendarContextValue = {
  appointments: Appointment[]
  /** ISO date of the first day of the visible week. */
  weekStart: string
  goToPreviousWeek: () => void
  goToNextWeek: () => void
  goToToday: () => void
  form: FormState
  openCreate: (prefill?: Partial<AppointmentInput>) => void
  openEdit: (id: string) => void
  closeForm: () => void
  /**
   * Upserts when the input fits in the day and has no conflicts, then returns
   * true. Otherwise sets `conflict`, saves nothing and returns false.
   */
  requestSave: (input: AppointmentInput, id?: string) => boolean
  deleteAppointment: (id: string) => void
  conflict: ConflictState | null
  applySuggestion: () => void
  editConflict: () => void
  cancelConflict: () => void
}

export const CalendarContext = createContext<CalendarContextValue | null>(null)
