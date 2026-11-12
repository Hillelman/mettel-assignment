import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CalendarContext } from '@/context/CalendarContext'
import { AppointmentForm } from './AppointmentForm'
import { createCalendarValue, renderWithCalendar } from './testUtils'

describe('AppointmentForm', () => {
  it('uses a 15 minute step for the time fields', () => {
    renderWithCalendar(<AppointmentForm />)
    expect(screen.getByLabelText('Start')).toHaveAttribute('step', '900')
    expect(screen.getByLabelText('End')).toHaveAttribute('step', '900')
  })

  it('shows required errors on submit without calling requestSave', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentForm />)

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'true')
    expect(value.requestSave).not.toHaveBeenCalled()
  })

  it('does not flag fields before they are left', () => {
    renderWithCalendar(<AppointmentForm />)
    for (const label of ['Title', 'Date', 'Start', 'End', 'Notes']) {
      expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'false')
    }
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
          date: '2026-11-10',
          start: '14:00',
          end: '15:00',
          notes: 'bring notes',
        },
      },
    })
    rerender(
      <CalendarContext value={second}>
        <AppointmentForm />
      </CalendarContext>,
    )

    expect(screen.getByLabelText('Title')).toHaveValue('Retro')
    expect(screen.getByLabelText('Date')).toHaveValue('2026-11-10')
    expect(screen.getByLabelText('Start')).toHaveValue('14:00')
    expect(screen.getByLabelText('Notes')).toHaveValue('bring notes')
  })
})
