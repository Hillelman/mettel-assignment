import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import {
  CalendarContext,
  type CalendarContextValue,
} from '@/context/CalendarContext'

export function createCalendarValue(
  overrides: Partial<CalendarContextValue> = {},
): CalendarContextValue {
  return {
    appointments: [],
    weekStart: '2026-11-09',
    goToPreviousWeek: vi.fn(),
    goToNextWeek: vi.fn(),
    goToToday: vi.fn(),
    form: {
      open: true,
      editingId: null,
      values: {
        title: '',
        start: '2026-11-09T10:00',
        end: '2026-11-09T11:00',
        notes: '',
      },
    },
    openCreate: vi.fn(),
    openEdit: vi.fn(),
    closeForm: vi.fn(),
    requestSave: vi.fn(() => true),
    deleteAppointment: vi.fn(),
    conflict: null,
    applySuggestion: vi.fn(),
    editConflict: vi.fn(),
    cancelConflict: vi.fn(),
    ...overrides,
  }
}

export function renderWithCalendar(
  ui: ReactNode,
  overrides: Partial<CalendarContextValue> = {},
) {
  const value = createCalendarValue(overrides)
  render(<CalendarContext value={value}>{ui}</CalendarContext>)
  return value
}
