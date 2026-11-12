import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_SCROLL_HOUR,
  HOUR_HEIGHT_PX,
  TOUCH_DRAG_DELAY_MS,
} from '@/config'
import { useCalendar } from '@/context/useCalendar'
import { segmentsForDay, type DaySegment } from '@/lib/conflicts'
import { weekDays } from '@/lib/dates'
import { splitDateTime } from '@/lib/time'
import type { Appointment } from '@/types/appointment'
import { DayColumn, type ResizeState } from './DayColumn'
import { DAY_HEADER_HEIGHT_CLASS } from './grid'
import { DragPreview } from './DragPreview'
import { HourGutter } from './HourGutter'
import { applyDragEnd, resizeTarget } from './dragActions'
import { parseDayId, parseDragId } from './dragIds'
import {
  dayUnderDraggedEdge,
  keyboardCoordinates,
  toDragInput,
} from './dragSupport'

const KEYBOARD_CODES = {
  start: ['Space'],
  cancel: ['Escape'],
  end: ['Space', 'Enter'],
}

type MovingDrag = {
  id: string
  /** ISO date of the grabbed segment, when the card passed it. */
  day: string | null
}

/** Minutes the grabbed day of the appointment is drawn for. */
function movingDuration(appointment: Appointment, day: string | null): number {
  const date = day ?? splitDateTime(appointment.start).date
  const [segment] = segmentsForDay([appointment], date)
  return segment ? segment.endMinutes - segment.startMinutes : Infinity
}

export function WeekGrid() {
  const { appointments, weekStart, requestSave } = useCalendar()
  const days = useMemo(() => weekDays(weekStart), [weekStart])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [movingDrag, setMovingDrag] = useState<MovingDrag | null>(null)
  const [resizing, setResizing] = useState<ResizeState | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = DEFAULT_SCROLL_HOUR * HOUR_HEIGHT_PX
    }
  }, [])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: TOUCH_DRAG_DELAY_MS, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      keyboardCodes: KEYBOARD_CODES,
      coordinateGetter: keyboardCoordinates,
    }),
  )

  const byDay = useMemo(() => {
    return new Map<string, DaySegment[]>(
      days.map((date) => [date, segmentsForDay(appointments, date)]),
    )
  }, [appointments, days])

  const moving = appointments.find((item) => item.id === movingDrag?.id) ?? null

  const handleDragStart = ({ active }: DragStartEvent) => {
    const drag = parseDragId(String(active.id))
    if (drag?.kind === 'move') setMovingDrag({ id: drag.appointmentId, day: drag.day })
    if (drag?.kind === 'resize') {
      setResizing({ id: drag.appointmentId, preview: null })
    }
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const drag = parseDragId(String(event.active.id))
    if (drag?.kind !== 'resize') return
    const appointment = appointments.find((item) => item.id === drag.appointmentId)
    const { overId, offsetPx } = toDragInput(event)
    const date = overId === null ? null : parseDayId(overId)
    setResizing({
      id: drag.appointmentId,
      preview:
        appointment && date
          ? { ...appointment, ...resizeTarget(appointment, drag.edge, date, offsetPx) }
          : null,
    })
  }

  const clearDrag = () => {
    setMovingDrag(null)
    setResizing(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    clearDrag()
    applyDragEnd(toDragInput(event), appointments, requestSave)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={dayUnderDraggedEdge}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={clearDrag}
    >
      <div ref={scrollRef} className="h-full min-h-0 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-[auto_repeat(7,minmax(0,1fr))] md:divide-x md:divide-border">
          <div className="hidden md:block" data-testid="week-hour-gutter">
            <div
              className={`${DAY_HEADER_HEIGHT_CLASS} sticky top-0 z-20 bg-background`}
            />
            <HourGutter />
          </div>
          {days.map((date) => (
            <DayColumn
              key={date}
              date={date}
              segments={byDay.get(date) ?? []}
              resizing={resizing}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {moving ? (
          <DragPreview
            appointment={moving}
            durationMinutes={movingDuration(moving, movingDrag?.day ?? null)}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
