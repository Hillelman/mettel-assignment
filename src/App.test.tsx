import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { formatWeekLabel, startOfWeek, toISODate } from '@/lib/dates'
import App from './App'

const today = toISODate(new Date())
const currentLabel = formatWeekLabel(toISODate(startOfWeek(new Date())))

async function createAppointment(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
  start: string,
  end: string,
) {
  await user.click(screen.getByRole('button', { name: 'New appointment' }))
  await screen.findByRole('dialog')
  await user.type(screen.getByLabelText('Title'), title)
  fireEvent.change(screen.getByLabelText('Start date'), { target: { value: today } })
  fireEvent.change(screen.getByLabelText('Start time'), { target: { value: start } })
  fireEvent.change(screen.getByLabelText('End date'), { target: { value: today } })
  fireEvent.change(screen.getByLabelText('End time'), { target: { value: end } })
  await user.click(screen.getByRole('button', { name: 'Save' }))
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the current week label and 7 day headers', () => {
    render(<App />)
    expect(screen.getByText(currentLabel)).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(7)
  })

  it('changes and restores the week label with the navigation buttons', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Next week' }))
    expect(screen.queryByText(currentLabel)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(screen.getByText(currentLabel)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Previous week' }))
    expect(screen.queryByText(currentLabel)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(screen.getByText(currentLabel)).toBeInTheDocument()
  })

  it('creates an appointment and restores it after a remount', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    await createAppointment(user, 'Standup', '09:00', '09:30')
    expect(
      await screen.findByRole('button', { name: 'Standup, 09:00 to 09:30' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    unmount()
    render(<App />)
    expect(
      screen.getByRole('button', { name: 'Standup, 09:00 to 09:30' }),
    ).toBeInTheDocument()
  })

  it('lists the conflict, keeps one card on Cancel and moves on suggestion', async () => {
    const user = userEvent.setup()
    render(<App />)
    await createAppointment(user, 'First', '10:00', '11:00')
    await screen.findByRole('button', { name: 'First, 10:00 to 11:00' })

    await createAppointment(user, 'Second', '10:30', '11:30')
    const dialog = await screen.findByRole('dialog', {
      name: 'Scheduling conflict',
    })
    expect(dialog).toHaveTextContent('First')
    expect(dialog).toHaveTextContent('10:00–11:00')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^Second/ }),
    ).not.toBeInTheDocument()

    await createAppointment(user, 'Second', '10:30', '11:30')
    await user.click(
      await screen.findByRole('button', { name: 'Move to 11:00–12:00' }),
    )
    expect(
      await screen.findByRole('button', { name: 'Second, 11:00 to 12:00' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'First, 10:00 to 11:00' }),
    ).toBeInTheDocument()
  })
})
