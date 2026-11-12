import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ConflictState } from '@/context/CalendarContext'
import { ConflictDialog } from './ConflictDialog'
import { renderWithCalendar } from './testUtils'

const conflict: ConflictState = {
  proposed: {
    id: 'p1',
    title: 'Review',
    start: '2026-11-09T10:00',
    end: '2026-11-09T11:00',
    color: 'blue',
  },
  isNew: true,
  conflicts: [
    { id: 'a', title: 'Standup', start: '2026-11-09T09:30', end: '2026-11-09T10:30', color: 'red' },
    { id: 'b', title: 'Design sync', start: '2026-11-09T10:30', end: '2026-11-09T12:00', color: 'green' },
  ],
  suggestion: { start: '2026-11-09T12:00', end: '2026-11-09T13:00' },
}

describe('ConflictDialog', () => {
  it('renders nothing without a conflict', () => {
    renderWithCalendar(<ConflictDialog />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('explains the conflict and lists every overlapping appointment', () => {
    renderWithCalendar(<ConflictDialog />, { conflict })

    expect(
      screen.getByText("'Review' on Mon, Nov 9, 10:00 – 11:00 overlaps with:"),
    ).toBeInTheDocument()
    expect(screen.getByText('Standup')).toBeInTheDocument()
    expect(screen.getByText('09:30–10:30')).toBeInTheDocument()
    expect(screen.getByText('Design sync')).toBeInTheDocument()
    expect(screen.getByText('10:30–12:00')).toBeInTheDocument()
  })

  it('shows the dates of a multi-day proposal and conflicts on other days', () => {
    renderWithCalendar(<ConflictDialog />, {
      conflict: {
        ...conflict,
        proposed: {
          ...conflict.proposed,
          start: '2026-11-09T10:00',
          end: '2026-11-10T02:00',
        },
        conflicts: [
          {
            id: 'c',
            title: 'Night owl',
            start: '2026-11-10T01:00',
            end: '2026-11-10T03:00',
            color: 'red',
          },
          {
            id: 'd',
            title: 'Retreat',
            start: '2026-11-09T09:00',
            end: '2026-11-11T09:00',
            color: 'green',
          },
        ],
      },
    })

    expect(
      screen.getByText(
        "'Review' on Mon, Nov 9, 10:00 – Tue, Nov 10, 02:00 overlaps with:",
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Tue, Nov 10, 01:00 – 03:00')).toBeInTheDocument()
    expect(
      screen.getByText('Mon, Nov 9, 09:00 – Wed, Nov 11, 09:00'),
    ).toBeInTheDocument()
  })

  it('shows the date in the suggestion label when it is on another day', () => {
    renderWithCalendar(<ConflictDialog />, {
      conflict: {
        ...conflict,
        suggestion: { start: '2026-11-10T00:30', end: '2026-11-10T01:30' },
      },
    })

    expect(
      screen.getByRole('button', { name: 'Move to Tue, Nov 10, 00:30 – 01:30' }),
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
    expect(screen.getByText('No free slot nearby')).toBeInTheDocument()
  })
})
