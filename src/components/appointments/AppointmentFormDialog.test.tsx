import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentFormDialog } from './AppointmentFormDialog'
import { renderWithCalendar } from './testUtils'

const editing = {
  open: true,
  editingId: 'a1',
  values: {
    title: 'Standup',
    date: '2026-11-09',
    start: '09:00',
    end: '09:30',
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

  it('shows the title error after blur and clears it when valid', async () => {
    const user = userEvent.setup()
    renderWithCalendar(<AppointmentFormDialog />)
    const title = screen.getByLabelText('Title')

    await user.click(title)
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
    await user.tab()

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveAccessibleDescription('Title is required')

    await user.type(title, 'Lunch')
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
    expect(title).toHaveAttribute('aria-invalid', 'false')
  })

  it('treats a whitespace-only title as missing', async () => {
    const user = userEvent.setup()
    renderWithCalendar(<AppointmentFormDialog />)

    await user.type(screen.getByLabelText('Title'), '   ')
    await user.tab()

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
  })

  it('shows the end error and blocks saving while End is not after Start', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<AppointmentFormDialog />)

    await user.type(screen.getByLabelText('Title'), 'Lunch')
    const end = screen.getByLabelText('End')
    fireEvent.change(end, { target: { value: '09:00' } })
    fireEvent.blur(end)

    expect(
      await screen.findByText('End time must be after the start time'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(value.requestSave).not.toHaveBeenCalled()
  })

  it('re-validates End when Start changes', async () => {
    renderWithCalendar(<AppointmentFormDialog />)
    const end = screen.getByLabelText('End')
    fireEvent.change(end, { target: { value: '09:00' } })
    fireEvent.blur(end)
    expect(
      await screen.findByText('End time must be after the start time'),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Start'), {
      target: { value: '08:00' },
    })

    await vi.waitFor(() =>
      expect(
        screen.queryByText('End time must be after the start time'),
      ).not.toBeInTheDocument(),
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
        date: '2026-11-09',
        start: '09:00',
        end: '09:30',
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
