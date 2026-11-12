import { AppointmentFormDialog } from '@/components/appointments/AppointmentFormDialog'
import { ConflictDialog } from '@/components/appointments/ConflictDialog'
import { WeekGrid } from '@/components/calendar/WeekGrid'
import { AppShell } from '@/components/layout/AppShell'
import { CalendarProvider } from '@/context/CalendarProvider'

function App() {
  return (
    <CalendarProvider>
      <AppShell>
        <WeekGrid />
      </AppShell>
      <AppointmentFormDialog />
      <ConflictDialog />
    </CalendarProvider>
  )
}

export default App
