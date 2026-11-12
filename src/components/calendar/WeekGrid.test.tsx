import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { HOUR_HEIGHT_PX } from '@/config'
import {
  CalendarContext,
  type CalendarContextValue,
} from '@/context/CalendarContext'
import type { Appointment } from '@/types/appointment'
import { WeekGrid } from './WeekGrid'

const WEEK_START = '2026-11-09'

function renderGrid(appointments: Appointment[] = []) {
  const value: CalendarContextValue = {
    appointments,
    weekStart: WEEK_START,
    goToPreviousWeek: vi.fn(),
    goToNextWeek: vi.fn(),
    goToToday: vi.fn(),
    form: {
      open: false,
      editingId: null,
      values: { title: '', date: WEEK_START, start: '09:00', end: '10:00' },
    },
    openCreate: vi.fn(),
    openEdit: vi.fn(),
    closeForm: vi.fn(),
    requestSave: vi.fn(() => true),
    deleteAppointment: vi.fn(),
    conflict: null,
    applySuggestion: vi.fn(),
    editConflict: vi.fn(),
    cancelConflict: vi.fn(),
  }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CalendarContext value={value}>{children}</CalendarContext>
  )
  render(<WeekGrid />, { wrapper })
  return value
}

const review: Appointment = {
  id: 'a1',
  title: 'Review',
  date: '2026-11-11',
  start: '09:30',
  end: '11:00',
}

describe('WeekGrid', () => {
  it('renders 7 day headers for the context week', () => {
    renderGrid()
    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings).toHaveLength(7)
    expect(headings[0]).toHaveTextContent('Mon')
    expect(headings[0]).toHaveTextContent('9')
    expect(headings[6]).toHaveTextContent('Sun')
    expect(headings[6]).toHaveTextContent('15')
  })

  it('renders 24 hour labels in the shared gutter', () => {
    renderGrid()
    const gutter = within(screen.getByTestId('week-hour-gutter'))
    const labels = gutter.getAllByText(/^\d{2}:00$/).map((el) => el.textContent)
    expect(labels).toHaveLength(24)
    expect(labels[0]).toBe('00:00')
    expect(labels[23]).toBe('23:00')
  })

  it('renders an empty week as clickable slots', async () => {
    const calendar = renderGrid()
    expect(screen.getAllByRole('button')).toHaveLength(7 * 24)
    await userEvent.click(
      screen.getByRole('button', { name: 'New appointment on 2026-11-09 at 00:00' }),
    )
    expect(calendar.openCreate).toHaveBeenCalledWith({
      date: '2026-11-09',
      start: '00:00',
    })
  })

  it('places a card in its day column with top and height from its times', () => {
    renderGrid([review])
    const card = screen.getByRole('button', { name: 'Review, 09:30 to 11:00' })
    const wrapper = card.parentElement
    expect(wrapper).toHaveStyle({
      top: `${9.5 * HOUR_HEIGHT_PX}px`,
      height: `${1.5 * HOUR_HEIGHT_PX}px`,
    })
    const column = within(screen.getByRole('region', { name: '2026-11-11' }))
    expect(column.getByText('Review')).toBeInTheDocument()
    expect(card).toHaveTextContent('09:30 – 11:00')
  })

  it('opens create for the clicked empty slot', async () => {
    const calendar = renderGrid([review])
    await userEvent.click(
      screen.getByRole('button', { name: 'New appointment on 2026-11-12 at 14:00' }),
    )
    expect(calendar.openCreate).toHaveBeenCalledWith({
      date: '2026-11-12',
      start: '14:00',
    })
    expect(calendar.openEdit).not.toHaveBeenCalled()
  })

  it('opens edit when a card is clicked', async () => {
    const calendar = renderGrid([review])
    await userEvent.click(
      screen.getByRole('button', { name: 'Review, 09:30 to 11:00' }),
    )
    expect(calendar.openEdit).toHaveBeenCalledWith('a1')
    expect(calendar.openCreate).not.toHaveBeenCalled()
  })

  it('does not open edit when the resize handle is clicked', async () => {
    const calendar = renderGrid([review])
    await userEvent.click(screen.getByRole('button', { name: 'Resize Review' }))
    expect(calendar.openEdit).not.toHaveBeenCalled()
  })

  it('shows overlapping stored appointments side by side at half width', () => {
    renderGrid([
      review,
      { ...review, id: 'a2', title: 'Clash', start: '10:00', end: '10:30' },
    ])
    const first = screen.getByRole('button', { name: 'Review, 09:30 to 11:00' })
    const second = screen.getByRole('button', { name: 'Clash, 10:00 to 10:30' })
    expect(first.parentElement).toHaveStyle({ left: '0%', width: '50%' })
    expect(second.parentElement).toHaveStyle({ left: '50%', width: '50%' })
  })

  it('gives a 15 minute card a short height with a readable minimum', () => {
    renderGrid([{ ...review, start: '09:00', end: '09:15' }])
    const card = screen.getByRole('button', { name: 'Review, 09:00 to 09:15' })
    expect(card.parentElement).toHaveStyle({ height: `${HOUR_HEIGHT_PX / 4}px` })
    expect(card).toHaveClass('min-h-5')
  })
})
