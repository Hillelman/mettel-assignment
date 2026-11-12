import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCalendar } from '@/context/useCalendar'
import { AppointmentForm } from './AppointmentForm'

export function AppointmentFormDialog() {
  const { form, closeForm } = useCalendar()

  return (
    <Dialog
      open={form.open}
      onOpenChange={(open) => {
        if (!open) closeForm()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {form.editingId === null ? 'New appointment' : 'Edit appointment'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enter the title, date and times of the appointment.
          </DialogDescription>
        </DialogHeader>
        <AppointmentForm />
      </DialogContent>
    </Dialog>
  )
}
