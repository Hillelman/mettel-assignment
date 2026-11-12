import { useContext } from 'react'
import { CalendarContext, type CalendarContextValue } from './CalendarContext'

export function useCalendar(): CalendarContextValue {
  const context = useContext(CalendarContext)
  if (context === null) {
    throw new Error('useCalendar must be used within a CalendarProvider')
  }
  return context
}
