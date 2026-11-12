import { formatDateLabel } from './dates'
import { splitDateTime } from './time'

/**
 * A range with its dates: "Mon, Nov 9, 10:00 – 11:00" within one day, or
 * "Mon, Nov 9, 10:00 – Tue, Nov 10, 02:00" across days.
 */
export function formatRangeWithDates(
  start: string,
  end: string,
  separator = ' – ',
): string {
  const from = splitDateTime(start)
  const to = splitDateTime(end)
  const startLabel = `${formatDateLabel(from.date)}, ${from.time}`
  const endLabel =
    from.date === to.date
      ? to.time
      : `${formatDateLabel(to.date)}, ${to.time}`
  return `${startLabel}${separator}${endLabel}`
}

/**
 * Times only ("10:00–11:00") for a range inside `referenceDate`; otherwise
 * the range with its dates.
 */
export function formatRangeFrom(
  start: string,
  end: string,
  referenceDate: string,
): string {
  const from = splitDateTime(start)
  const to = splitDateTime(end)
  if (from.date === referenceDate && to.date === referenceDate) {
    return `${from.time}–${to.time}`
  }
  return formatRangeWithDates(start, end)
}

/** Card text: "09:30 – 11:00" within one day, with dates across days. */
export function formatCardRange(
  start: string,
  end: string,
  separator = ' – ',
): string {
  const from = splitDateTime(start)
  const to = splitDateTime(end)
  if (from.date === to.date) return `${from.time}${separator}${to.time}`
  return formatRangeWithDates(start, end, separator)
}
