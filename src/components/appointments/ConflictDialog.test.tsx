import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ConflictState } from '@/context/CalendarContext'
import { ConflictDialog } from './ConflictDialog'
import { renderWithCalendar } from './testUtils'

const conflict: ConflictState = {
  proposed: {
    id: 'p1',
    title: 'Review',
    date: '2026-11-09',
    start: '10:00',
    end: '11:00',
  },
  isNew: true,
  conflicts: [
    { id: 'a', title: 'Standup', date: '2026-11-09', start: '09:30', end: '10:30' },
    { id: 'b', title: 'Design sync', date: '2026-11-09', start: '10:30', end: '12:00' },
  ],
  outOfDay: false,
  suggestion: { start: '12:00', end: '13:00' },
}

describe('ConflictDialog', () => {
  it('renders nothing without a conflict', () => {
    renderWithCalendar(<ConflictDialog />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('explains the conflict and lists every overlapping appointment', () => {
    renderWithCalendar(<ConflictDialog />, { conflict })

    expect(
      screen.getByText("'Review' on Monday, Nov 9 at 10:00–11:00 overlaps with:"),
    ).toBeInTheDocument()
    expect(screen.getByText('Standup')).toBeInTheDocument()
    expect(screen.getByText('09:30–10:30')).toBeInTheDocument()
    expect(screen.getByText('Design sync')).toBeInTheDocument()
    expect(screen.getByText('10:30–12:00')).toBeInTheDocument()
  })

  it('explains an appointment that does not fit in the day', () => {
    renderWithCalendar(<ConflictDialog />, {
      conflict: {
        ...conflict,
        proposed: { ...conflict.proposed, start: '23:00', end: '25:00' },
        conflicts: [],
        outOfDay: true,
      },
    })

    expect(
      screen.getByText(
        "'Review' on Monday, Nov 9 at 23:00–25:00 doesn't fit in the day.",
      ),
    ).toBeInTheDocument()
  })

  it('applies the suggestion', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<ConflictDialog />, { conflict })

    await user.click(screen.getByRole('button', { name: 'Move to 12:00–13:00' }))

    expect(value.applySuggestion).toHaveBeenCalledTimes(1)
  })

  it('lets the user edit the times', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<ConflictDialog />, { conflict })

    await user.click(screen.getByRole('button', { name: 'Edit times' }))

    expect(value.editConflict).toHaveBeenCalledTimes(1)
  })

  it('cancels from the button', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<ConflictDialog />, { conflict })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(value.cancelConflict).toHaveBeenCalledTimes(1)
  })

  it('cancels on Escape', async () => {
    const user = userEvent.setup()
    const value = renderWithCalendar(<ConflictDialog />, { conflict })

    await user.keyboard('{Escape}')

    expect(value.cancelConflict).toHaveBeenCalled()
  })

  it('disables the move button when there is no free slot', () => {
    renderWithCalendar(<ConflictDialog />, {
      conflict: { ...conflict, suggestion: null },
    })

    expect(screen.getByRole('button', { name: /move to/i })).toBeDisabled()
    expect(screen.getByText('No free slot on this day')).toBeInTheDocument()
  })
})
