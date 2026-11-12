import type { RegisterOptions } from 'react-hook-form'
import {
  NOTES_MAX_LENGTH,
  STEP_MINUTES,
  TITLE_MAX_LENGTH,
} from '@/config'
import type { Appointment, AppointmentFormValues } from '@/types/appointment'
import { isAppointmentColor } from './colors'
import { isValidISODate } from './dates'
import { isDateTime, isTime, toDateTime, toMinutes } from './time'

const TITLE_REQUIRED = 'Title is required'
const START_DATE_REQUIRED = 'Start date is required'
const END_DATE_REQUIRED = 'End date is required'
const START_TIME_REQUIRED = 'Start time is required'
const END_TIME_REQUIRED = 'End time is required'
const DATE_INVALID = 'Enter a valid date'
const TIME_INVALID = 'Enter a time as HH:mm'
const STEP_INVALID = `Use ${STEP_MINUTES}-minute steps`
const END_BEFORE_START = 'End must be after the start'
const COLOR_REQUIRED = 'Color is required'
const COLOR_INVALID = 'Choose a color from the list'
const TITLE_TOO_LONG = `Title must be ${TITLE_MAX_LENGTH} characters or fewer`
const NOTES_TOO_LONG = `Notes must be ${NOTES_MAX_LENGTH} characters or fewer`

type Rules<Name extends keyof AppointmentFormValues> = RegisterOptions<
  AppointmentFormValues,
  Name
>

function onStep(time: string): boolean {
  return toMinutes(time) % STEP_MINUTES === 0
}

function dateRules(required: string): Rules<'startDate' | 'endDate'> {
  return {
    required,
    validate: (value) => isValidISODate(value) || DATE_INVALID,
    deps: 'endTime',
  }
}

function timeRules(required: string): Rules<'startTime'> {
  return {
    required,
    validate: (value) => {
      if (!isTime(value)) return TIME_INVALID
      if (!onStep(value)) return STEP_INVALID
      return true
    },
    deps: 'endTime',
  }
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

const endTimeRules: Rules<'endTime'> = {
  required: END_TIME_REQUIRED,
  validate: (value, values) => {
    if (!isTime(value)) return TIME_INVALID
    if (!onStep(value)) return STEP_INVALID
    const start = toDateTime(values.startDate, values.startTime)
    const end = toDateTime(values.endDate, value)
    if (isDateTime(start) && isDateTime(end) && end <= start) {
      return END_BEFORE_START
    }
    return true
  },
}

const notesRules: Rules<'notes'> = {
  validate: (value) => (value ?? '').length <= NOTES_MAX_LENGTH || NOTES_TOO_LONG,
}

const colorRules: Rules<'color'> = {
  required: COLOR_REQUIRED,
  validate: (value) => isAppointmentColor(value) || COLOR_INVALID,
}

/**
 * react-hook-form rules for each form field, for use with `register`. The
 * start and end date and the start time re-check the end time, whose rule
 * compares the combined date-times.
 */
export const appointmentRules = {
  title: titleRules,
  startDate: dateRules(START_DATE_REQUIRED),
  startTime: timeRules(START_TIME_REQUIRED),
  endDate: dateRules(END_DATE_REQUIRED),
  endTime: endTimeRules,
  notes: notesRules,
  color: colorRules,
}

/** Strict shape and format check for data read from storage. */
export function isAppointment(value: unknown): value is Appointment {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>

  const { id, title, start, end, notes, color } = candidate
  if (typeof id !== 'string' || id.length === 0) return false
  if (typeof title !== 'string') return false
  const trimmedLength = title.trim().length
  if (trimmedLength === 0 || trimmedLength > TITLE_MAX_LENGTH) return false
  if (typeof start !== 'string' || !isDateTime(start)) return false
  if (typeof end !== 'string' || !isDateTime(end)) return false
  if (end <= start) return false
  if (!isAppointmentColor(color)) return false
  if (notes !== undefined) {
    if (typeof notes !== 'string' || notes.length > NOTES_MAX_LENGTH) return false
  }
  return true
}
