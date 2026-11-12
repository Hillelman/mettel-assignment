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
      values: {
        title: '',
        start: `${WEEK_START}T09:00`,
        end: `${WEEK_START}T10:00`,
      },
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
  start: '2026-11-11T09:30',
  end: '2026-11-11T11:00',
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

  it('renders 25 hour labels, 00:00 to 24:00, in the shared gutter', () => {
    renderGrid()
    const gutter = within(screen.getByTestId('week-hour-gutter'))
    const labels = gutter.getAllByText(/^\d{2}:00$/).map((el) => el.textContent)
    expect(labels).toHaveLength(25)
    expect(labels[0]).toBe('00:00')
    expect(labels[23]).toBe('23:00')
    expect(labels[24]).toBe('24:00')
  })

  it('renders a 24:00 label in every stacked day gutter', () => {
    renderGrid()
    for (const date of ['2026-11-09', '2026-11-15']) {
      const day = within(screen.getByRole('region', { name: date }))
      const labels = day.getAllByText(/^\d{2}:00$/).map((el) => el.textContent)
      expect(labels).toHaveLength(25)
      expect(labels[24]).toBe('24:00')
    }
  })

  it('renders an empty week as clickable slots', async () => {
    const calendar = renderGrid()
    expect(screen.getAllByRole('button')).toHaveLength(7 * 24)
    await userEvent.click(
      screen.getByRole('button', { name: 'New appointment on 2026-11-09 at 00:00' }),
    )
    expect(calendar.openCreate).toHaveBeenCalledWith({
      start: '2026-11-09T00:00',
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
      start: '2026-11-12T14:00',
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

  it('does not open edit when a resize handle is clicked', async () => {
    const calendar = renderGrid([review])
    await userEvent.click(
      screen.getByRole('button', { name: 'Resize start of Review' }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Resize end of Review' }),
    )
    expect(calendar.openEdit).not.toHaveBeenCalled()
  })

  it('offers a top and a bottom handle on a single-day card', () => {
    renderGrid([review])
    expect(
      screen.getByRole('button', { name: 'Resize start of Review' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Resize end of Review' }),
    ).toBeInTheDocument()
  })

  it('shows overlapping stored appointments side by side at half width', () => {
    renderGrid([
      review,
      {
        ...review,
        id: 'a2',
        title: 'Clash',
        start: '2026-11-11T10:00',
        end: '2026-11-11T10:30',
      },
    ])
    const first = screen.getByRole('button', { name: 'Review, 09:30 to 11:00' })
    const second = screen.getByRole('button', { name: 'Clash, 10:00 to 10:30' })
    expect(first.parentElement).toHaveStyle({ left: '0%', width: '50%' })
    expect(second.parentElement).toHaveStyle({ left: '50%', width: '50%' })
  })

  it('gives a 15 minute card a short height with a readable minimum', () => {
    renderGrid([
      { ...review, start: '2026-11-11T09:00', end: '2026-11-11T09:15' },
    ])
    const card = screen.getByRole('button', { name: 'Review, 09:00 to 09:15' })
    expect(card.parentElement).toHaveStyle({ height: `${HOUR_HEIGHT_PX / 4}px` })
    expect(card).toHaveClass('min-h-5')
  })

  describe('multi-day appointments', () => {
    const night: Appointment = {
      id: 'n1',
      title: 'Night shift',
      start: '2026-11-09T22:00',
      end: '2026-11-10T02:00',
    }
    const label = 'Night shift, Mon, Nov 9, 22:00 to Tue, Nov 10, 02:00'

    it('renders a segment in each day column with its top and height', () => {
      renderGrid([night])
      const monday = within(screen.getByRole('region', { name: '2026-11-09' }))
      const tuesday = within(screen.getByRole('region', { name: '2026-11-10' }))

      const first = monday.getByRole('button', { name: label })
      const last = tuesday.getByRole('button', { name: label })
      expect(first.parentElement).toHaveStyle({
        top: `${22 * HOUR_HEIGHT_PX}px`,
        height: `${2 * HOUR_HEIGHT_PX}px`,
      })
      expect(last.parentElement).toHaveStyle({
        top: '0px',
        height: `${2 * HOUR_HEIGHT_PX}px`,
      })
      expect(first).toHaveTextContent('Mon, Nov 9, 22:00 – Tue, Nov 10, 02:00')
      expect(
        within(screen.getByRole('region', { name: '2026-11-11' })).queryByText(
          'Night shift',
        ),
      ).not.toBeInTheDocument()
    })

    it('offers the top handle on the first segment and the bottom handle on the last', () => {
      renderGrid([night])
      const monday = within(screen.getByRole('region', { name: '2026-11-09' }))
      const tuesday = within(screen.getByRole('region', { name: '2026-11-10' }))
      const top = { name: 'Resize start of Night shift' }
      const bottom = { name: 'Resize end of Night shift' }

      expect(monday.getByRole('button', top)).toBeInTheDocument()
      expect(monday.queryByRole('button', bottom)).not.toBeInTheDocument()
      expect(tuesday.queryByRole('button', top)).not.toBeInTheDocument()
      expect(tuesday.getByRole('button', bottom)).toBeInTheDocument()
    })

    it('offers no handles on a middle segment', () => {
      renderGrid([{ ...night, end: '2026-11-11T02:00' }])
      const tuesday = within(screen.getByRole('region', { name: '2026-11-10' }))
      expect(
        tuesday.queryByRole('button', { name: /^Resize/ }),
      ).not.toBeInTheDocument()
    })

    it('renders only the start day when the end is the next 00:00', () => {
      renderGrid([{ ...night, end: '2026-11-10T00:00' }])
      const monday = within(screen.getByRole('region', { name: '2026-11-09' }))
      const tuesday = within(screen.getByRole('region', { name: '2026-11-10' }))

      expect(monday.getByText('Night shift')).toBeInTheDocument()
      expect(tuesday.queryByText('Night shift')).not.toBeInTheDocument()
    })

    it('renders a full-height segment on every day of a long span', () => {
      renderGrid([{ ...night, start: '2026-11-08T12:00', end: '2026-11-20T12:00' }])
      const wednesday = within(screen.getByRole('region', { name: '2026-11-11' }))
      const card = wednesday.getByText('Night shift').closest('[aria-label]')
      expect(card?.parentElement).toHaveStyle({
        top: '0px',
        height: `${24 * HOUR_HEIGHT_PX}px`,
      })
    })
  })
})
