import { render, screen } from '@testing-library/react'
import type { Appointment } from '@/types/appointment'
import { DragPreview } from './DragPreview'

const appointment: Appointment = {
  id: 'a1',
  title: 'Review',
  start: '2026-11-11T09:00',
  end: '2026-11-11T10:00',
  color: 'pink',
}

describe('DragPreview', () => {
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
