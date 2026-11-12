import type { RegisterOptions } from 'react-hook-form'
import {
  NOTES_MAX_LENGTH,
  STEP_MINUTES,
  TITLE_MAX_LENGTH,
} from '@/config'
import type { Appointment, AppointmentInput } from '@/types/appointment'
import { isValidISODate } from './dates'
import { isEndTime, isTime, toMinutes } from './time'

const TITLE_REQUIRED = 'Title is required'
const DATE_REQUIRED = 'Date is required'
const DATE_INVALID = 'Enter a valid date'
const START_REQUIRED = 'Start time is required'
const END_REQUIRED = 'End time is required'
const TIME_INVALID = 'Enter a time as HH:mm'
const STEP_INVALID = `Use ${STEP_MINUTES}-minute steps`
const END_BEFORE_START = 'End time must be after the start time'
const TITLE_TOO_LONG = `Title must be ${TITLE_MAX_LENGTH} characters or fewer`
const NOTES_TOO_LONG = `Notes must be ${NOTES_MAX_LENGTH} characters or fewer`

type Rules<Name extends keyof AppointmentInput> = RegisterOptions<
  AppointmentInput,
  Name
>

function onStep(time: string): boolean {
  return toMinutes(time) % STEP_MINUTES === 0
}

const titleRules: Rules<'title'> = {
  required: TITLE_REQUIRED,
  validate: (value) => {
    const trimmed = value.trim()
    if (trimmed.length === 0) return TITLE_REQUIRED
    if (trimmed.length > TITLE_MAX_LENGTH) return TITLE_TOO_LONG
    return true
  },
}

const dateRules: Rules<'date'> = {
  required: DATE_REQUIRED,
  validate: (value) => isValidISODate(value) || DATE_INVALID,
}

const startRules: Rules<'start'> = {
  required: START_REQUIRED,
  validate: (value) => {
    if (!isTime(value)) return TIME_INVALID
    if (!onStep(value)) return STEP_INVALID
    return true
  },
}

const endRules: Rules<'end'> = {
  required: END_REQUIRED,
  validate: (value, values) => {
    if (!isEndTime(value)) return TIME_INVALID
    if (!onStep(value)) return STEP_INVALID
    if (isTime(values.start) && toMinutes(value) <= toMinutes(values.start)) {
      return END_BEFORE_START
    }
    return true
  },
}

const notesRules: Rules<'notes'> = {
  validate: (value) => (value ?? '').length <= NOTES_MAX_LENGTH || NOTES_TOO_LONG,
}

/** react-hook-form rules for each appointment field, for use with `register`. */
export const appointmentRules = {
  title: titleRules,
  date: dateRules,
  start: startRules,
  end: endRules,
  notes: notesRules,
}

/** Strict shape and format check for data read from storage. */
export function isAppointment(value: unknown): value is Appointment {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>

  const { id, title, date, start, end, notes } = candidate
  if (typeof id !== 'string' || id.length === 0) return false
  if (typeof title !== 'string') return false
  const trimmedLength = title.trim().length
  if (trimmedLength === 0 || trimmedLength > TITLE_MAX_LENGTH) return false
  if (typeof date !== 'string' || !isValidISODate(date)) return false
  if (typeof start !== 'string' || !isTime(start)) return false
  if (typeof end !== 'string' || !isEndTime(end)) return false
  if (toMinutes(end) <= toMinutes(start)) return false
  if (notes !== undefined) {
    if (typeof notes !== 'string' || notes.length > NOTES_MAX_LENGTH) return false
  }
  return true
}
