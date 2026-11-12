import { render, screen } from '@testing-library/react'
import { CalendarContext } from '@/context/CalendarContext'
import { AppointmentForm } from './AppointmentForm'
import { createCalendarValue, renderWithCalendar } from './testUtils'

describe('AppointmentForm', () => {
  it('uses a 15 minute step for the time fields', () => {
    renderWithCalendar(<AppointmentForm />)
    expect(screen.getByLabelText('Start time')).toHaveAttribute('step', '900')
    expect(screen.getByLabelText('End time')).toHaveAttribute('step', '900')
  })

  it('puts start date and time on one row and end date and time on the next', () => {
    renderWithCalendar(<AppointmentForm />)
    const startRow = screen.getByLabelText('Start date').closest('.grid-cols-2')
    const endRow = screen.getByLabelText('End date').closest('.grid-cols-2')

    expect(startRow).not.toBeNull()
    expect(endRow).not.toBeNull()
    expect(startRow).not.toBe(endRow)
    expect(startRow).toContainElement(screen.getByLabelText('Start time'))
    expect(endRow).toContainElement(screen.getByLabelText('End time'))
  })

  it('prefills equal start and end dates for a new appointment', () => {
    renderWithCalendar(<AppointmentForm />)
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-11-09')
    expect(screen.getByLabelText('End date')).toHaveValue('2026-11-09')
    expect(screen.getByLabelText('Start time')).toHaveValue('10:00')
    expect(screen.getByLabelText('End time')).toHaveValue('11:00')
  })

  it('resets to the new values when form.values changes', () => {
    const first = createCalendarValue()
    const { rerender } = render(
      <CalendarContext value={first}>
        <AppointmentForm />
      </CalendarContext>,
    )
    expect(screen.getByLabelText('Title')).toHaveValue('')

    const second = createCalendarValue({
      form: {
        open: true,
        editingId: 'x',
        values: {
          title: 'Retro',
          start: '2026-11-10T14:00',
          end: '2026-11-11T15:00',
          notes: 'bring notes',
          color: 'teal',
        },
      },
    })
    rerender(
      <CalendarContext value={second}>
        <AppointmentForm />
      </CalendarContext>,
    )

    expect(screen.getByLabelText('Title')).toHaveValue('Retro')
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-11-10')
    expect(screen.getByLabelText('Start time')).toHaveValue('14:00')
    expect(screen.getByLabelText('End date')).toHaveValue('2026-11-11')
    expect(screen.getByLabelText('End time')).toHaveValue('15:00')
    expect(screen.getByLabelText('Notes')).toHaveValue('bring notes')
  })
})
