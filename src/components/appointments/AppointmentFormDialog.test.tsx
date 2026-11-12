import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentFormDialog } from './AppointmentFormDialog'
import { renderWithCalendar } from './testUtils'

const editing = {
  open: true,
  editingId: 'a1',
  values: {
    title: 'Standup',
    start: '2026-11-09T09:00',
    end: '2026-11-09T09:30',
    notes: '',
  },
}

describe('AppointmentFormDialog', () => {
  it('titles the dialog for create and edit', () => {
    renderWithCalendar(<AppointmentFormDialog />)
    expect(screen.getByText('New appointment')).toBeInTheDocument()
  })

  it('titles the dialog for edit', () => {
    renderWithCalendar(<AppointmentFormDialog />, { form: editing })
    expect(screen.getByText('Edit appointment')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    renderWithCalendar(<AppointmentFormDialog />, {
      form: { ...editing, open: false },
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows no error when an empty title is blurred', async () => {
    const user = userEvent.setup()
    renderWithCalendar(<AppointmentFormDialog />)
    const title = screen.getByLabelText('Title')

    await user.click(title)
    await user.tab()

    expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
    expect(title).toHaveAttribute('aria-invalid', 'false')
  })

  it('shows the title error on Save without saving, and clears it when typing', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentFormDialog />)
    const title = screen.getByLabelText('Title')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveAccessibleDescription('Title is required')
    expect(value.requestSave).not.toHaveBeenCalled()

    await user.type(title, 'Lunch')
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
    expect(title).toHaveAttribute('aria-invalid', 'false')
  })

  it('treats a whitespace-only title as missing', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentFormDialog />)

    await user.type(screen.getByLabelText('Title'), '   ')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(value.requestSave).not.toHaveBeenCalled()
  })

  it('shows the end error on Save when the end is not after the start', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentFormDialog />)

    await user.type(screen.getByLabelText('Title'), 'Lunch')
    fireEvent.change(screen.getByLabelText('End time'), {
      target: { value: '09:00' },
    })
    expect(screen.queryByText('End must be after the start')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('End must be after the start')).toBeInTheDocument()
    expect(screen.getByLabelText('End time')).toHaveAccessibleDescription(
      'End must be after the start',
    )
    expect(value.requestSave).not.toHaveBeenCalled()
  })

  it('rejects an end date before the start date', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentFormDialog />)

    await user.type(screen.getByLabelText('Title'), 'Lunch')
    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2026-11-08' },
    })
    fireEvent.change(screen.getByLabelText('End time'), {
      target: { value: '12:00' },
    })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('End must be after the start')).toBeInTheDocument()
    expect(value.requestSave).not.toHaveBeenCalled()
  })

  it('clears the end error once the end date moves to a later day', async () => {
    const user = userEvent.setup()
    renderWithCalendar(<AppointmentFormDialog />)

    await user.type(screen.getByLabelText('Title'), 'Lunch')
    fireEvent.change(screen.getByLabelText('End time'), {
      target: { value: '09:00' },
    })
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('End must be after the start')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2026-11-10' },
    })

    await vi.waitFor(() =>
      expect(
        screen.queryByText('End must be after the start'),
      ).not.toBeInTheDocument(),
    )
  })

  it('re-validates the end time when the start time changes after a failed Save', async () => {
    const user = userEvent.setup()
    renderWithCalendar(<AppointmentFormDialog />)

    await user.type(screen.getByLabelText('Title'), 'Lunch')
    fireEvent.change(screen.getByLabelText('End time'), {
      target: { value: '09:00' },
    })
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('End must be after the start')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Start time'), {
      target: { value: '08:00' },
    })

    await vi.waitFor(() =>
      expect(
        screen.queryByText('End must be after the start'),
      ).not.toBeInTheDocument(),
    )
  })

  it('submits the combined date-times of a multi-day appointment', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentFormDialog />)

    await user.type(screen.getByLabelText('Title'), 'Night shift')
    fireEvent.change(screen.getByLabelText('Start time'), {
      target: { value: '22:00' },
    })
    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2026-11-10' },
    })
    fireEvent.change(screen.getByLabelText('End time'), {
      target: { value: '02:00' },
    })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(value.requestSave).toHaveBeenCalledWith(
      {
        title: 'Night shift',
        start: '2026-11-09T22:00',
        end: '2026-11-10T02:00',
        notes: '',
      },
      undefined,
    )
  })

  it('accepts empty notes', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentFormDialog />)

    await user.type(screen.getByLabelText('Title'), 'Lunch')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(value.requestSave).toHaveBeenCalledTimes(1)
  })

  it('submits trimmed values with the editing id', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentFormDialog />, {
      form: editing,
    })

    const title = screen.getByLabelText('Title')
    await user.clear(title)
    await user.type(title, '  Planning  ')
    await user.type(screen.getByLabelText('Notes'), ' agenda ')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(value.requestSave).toHaveBeenCalledWith(
      {
        title: 'Planning',
        start: '2026-11-09T09:00',
        end: '2026-11-09T09:30',
        notes: 'agenda',
      },
      'a1',
    )
  })

  it('submits without an id when creating', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentFormDialog />)

    await user.type(screen.getByLabelText('Title'), 'Lunch')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(value.requestSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Lunch' }),
      undefined,
    )
  })

  it('only offers delete when editing', () => {
    renderWithCalendar(<AppointmentFormDialog />)
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument()
  })

  it('requires confirmation before deleting', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentFormDialog />, {
      form: editing,
    })

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText('Delete this appointment?')).toBeInTheDocument()
    expect(value.deleteAppointment).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(value.deleteAppointment).toHaveBeenCalledWith('a1')
    expect(value.closeForm).toHaveBeenCalled()
  })

  it('backs out of the delete confirmation', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentFormDialog />, {
      form: editing,
    })

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(
      screen.queryByText('Delete this appointment?'),
    ).not.toBeInTheDocument()
    expect(value.deleteAppointment).not.toHaveBeenCalled()
  })

  it('closes the form on Escape', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentFormDialog />)

    await user.keyboard('{Escape}')

    expect(value.closeForm).toHaveBeenCalled()
  })
})
