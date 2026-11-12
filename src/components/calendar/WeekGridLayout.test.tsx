import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { DEFAULT_SCROLL_HOUR, HOUR_HEIGHT_PX } from '@/config'
import {
  CalendarContext,
  type CalendarContextValue,
} from '@/context/CalendarContext'
import { WeekGrid } from './WeekGrid'

const WEEK_START = '2026-11-09'

function renderGrid() {
  const value: CalendarContextValue = {
    appointments: [],
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
  return render(<WeekGrid />, { wrapper })
}

describe('WeekGrid layout', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('highlights only the header of today', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 11, 12, 0, 0))
    renderGrid()
    const headings = screen.getAllByRole('heading', { level: 2 })
    const current = headings.filter((h) => h.getAttribute('aria-current') === 'date')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('Wed')
    expect(current[0]).toHaveClass('bg-primary')
  })

  it('opens scrolled to the default scroll hour', () => {
    const { container } = renderGrid()
    const scroller = container.querySelector<HTMLElement>('.overflow-auto')
    expect(scroller?.scrollTop).toBe(DEFAULT_SCROLL_HOUR * HOUR_HEIGHT_PX)
  })

  it('uses the responsive grid classes', () => {
    renderGrid()
    const grid = screen.getByTestId('week-hour-gutter').parentElement
    expect(grid).toHaveClass('grid-cols-1', 'gap-1')
    expect(grid).toHaveClass('md:grid-cols-[auto_repeat(7,minmax(0,1fr))]')
  })
})
