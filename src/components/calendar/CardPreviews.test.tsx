import { render, screen } from '@testing-library/react'
import type { DaySegment } from '@/lib/conflicts'
import type { Appointment } from '@/types/appointment'
import { DragPreview } from './DragPreview'
import { ResizeGhost } from './ResizeGhost'

const appointment: Appointment = {
  id: 'a1',
  title: 'Review',
  start: '2026-11-11T09:00',
  end: '2026-11-11T10:00',
  color: 'pink',
}

function segment(startMinutes: number, endMinutes: number): DaySegment {
  return { appointment, startMinutes, endMinutes, isFirst: true, isLast: true }
}

describe('DragPreview', () => {
  it('uses the appointment color, not bg-primary', () => {
    render(<DragPreview appointment={appointment} durationMinutes={60} />)
    const card = screen.getByText('Review').closest('.cursor-grabbing')
    expect(card).toHaveClass('bg-appointment-pink', 'text-appointment-pink-foreground')
    expect(card).not.toHaveClass('bg-primary')
  })

  it('shows the range for a long segment and only the title for a short one', () => {
    const { rerender } = render(
      <DragPreview appointment={appointment} durationMinutes={30} />,
    )
    expect(screen.getByText('09:00 – 10:00')).toBeInTheDocument()

    rerender(<DragPreview appointment={appointment} durationMinutes={15} />)
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.queryByText('09:00 – 10:00')).not.toBeInTheDocument()
  })
})

describe('ResizeGhost', () => {
  it('uses the appointment color, not bg-primary', () => {
    render(<ResizeGhost segment={segment(540, 600)} />)
    const card = screen.getByText('Review').closest('.rounded-md')
    expect(card).toHaveClass('bg-appointment-pink', 'text-appointment-pink-foreground')
    expect(card).not.toHaveClass('bg-primary')
  })

  it('goes compact from its drawn height', () => {
    const { rerender } = render(<ResizeGhost segment={segment(540, 570)} />)
    expect(screen.getByText('09:00 – 10:00')).toBeInTheDocument()

    rerender(<ResizeGhost segment={segment(540, 555)} />)
    expect(screen.queryByText('09:00 – 10:00')).not.toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })
})
