import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCalendar } from '@/context/useCalendar'
import { formatWeekLabel } from '@/lib/dates'

export function NavBar() {
  const { weekStart, goToPreviousWeek, goToNextWeek, goToToday, openCreate } =
    useCalendar()

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b bg-background px-3 py-2">
      <h1 className="mr-2 text-lg font-semibold">Weekly Calendar</h1>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous week"
          onClick={goToPreviousWeek}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next week"
          onClick={goToNextWeek}
        >
          <ChevronRight />
        </Button>
        <Button variant="outline" onClick={goToToday}>
          Today
        </Button>
      </div>
      <p aria-live="polite" className="text-sm font-medium">
        {formatWeekLabel(weekStart)}
      </p>
      <Button className="ml-auto" onClick={() => openCreate()}>
        <Plus />
        New appointment
      </Button>
    </header>
  )
}
