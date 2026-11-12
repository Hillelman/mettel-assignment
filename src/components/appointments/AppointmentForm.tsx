import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { STEP_MINUTES } from '@/config'
import { useCalendar } from '@/context/useCalendar'
import { splitDateTime, toDateTime } from '@/lib/time'
import { appointmentRules } from '@/lib/validation'
import type { AppointmentFormValues, AppointmentInput } from '@/types/appointment'
import { DeleteConfirm } from './DeleteConfirm'
import { FormField } from './FormField'

const STEP_SECONDS = STEP_MINUTES * 60

function toFormValues(values: AppointmentInput): AppointmentFormValues {
  const start = splitDateTime(values.start)
  const end = splitDateTime(values.end)
  return {
    title: values.title,
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    notes: values.notes ?? '',
  }
}

export function AppointmentForm() {
  const { form, requestSave, deleteAppointment, closeForm } = useCalendar()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: toFormValues(form.values),
  })

  useEffect(() => {
    reset(toFormValues(form.values))
  }, [form.values, reset])

  const editingId = form.editingId

  const submit = handleSubmit((values) => {
    requestSave(
      {
        title: values.title.trim(),
        start: toDateTime(values.startDate, values.startTime),
        end: toDateTime(values.endDate, values.endTime),
        notes: (values.notes ?? '').trim(),
      },
      editingId ?? undefined,
    )
  })

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <FormField label="Title" error={errors.title?.message}>
        {(control) => (
          <Input
            type="text"
            autoComplete="off"
            {...control}
            {...register('title', appointmentRules.title)}
          />
        )}
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start date" error={errors.startDate?.message}>
          {(control) => (
            <Input
              type="date"
              {...control}
              {...register('startDate', appointmentRules.startDate)}
            />
          )}
        </FormField>
        <FormField label="Start time" error={errors.startTime?.message}>
          {(control) => (
            <Input
              type="time"
              step={STEP_SECONDS}
              {...control}
              {...register('startTime', appointmentRules.startTime)}
            />
          )}
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="End date" error={errors.endDate?.message}>
          {(control) => (
            <Input
              type="date"
              {...control}
              {...register('endDate', appointmentRules.endDate)}
            />
          )}
        </FormField>
        <FormField label="End time" error={errors.endTime?.message}>
          {(control) => (
            <Input
              type="time"
              step={STEP_SECONDS}
              {...control}
              {...register('endTime', appointmentRules.endTime)}
            />
          )}
        </FormField>
      </div>
      <FormField label="Notes" error={errors.notes?.message}>
        {(control) => (
          <Textarea
            rows={3}
            {...control}
            {...register('notes', appointmentRules.notes)}
          />
        )}
      </FormField>

      {confirmingDelete && editingId !== null ? (
        <DeleteConfirm
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            deleteAppointment(editingId)
            closeForm()
          }}
        />
      ) : (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          {editingId !== null && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive sm:mr-auto"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 />
              Delete
            </Button>
          )}
          <Button type="button" variant="outline" onClick={closeForm}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      )}
    </form>
  )
}
