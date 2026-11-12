import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { STEP_MINUTES } from '@/config'
import { useCalendar } from '@/context/useCalendar'
import { appointmentRules } from '@/lib/validation'
import type { AppointmentInput } from '@/types/appointment'
import { DeleteConfirm } from './DeleteConfirm'
import { FormField } from './FormField'

const STEP_SECONDS = STEP_MINUTES * 60

function toFormValues(values: AppointmentInput): AppointmentInput {
  return { ...values, notes: values.notes ?? '' }
}

export function AppointmentForm() {
  const { form, requestSave, deleteAppointment, closeForm } = useCalendar()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, touchedFields },
  } = useForm<AppointmentInput>({
    mode: 'onBlur',
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
        ...values,
        title: values.title.trim(),
        notes: (values.notes ?? '').trim(),
      },
      editingId ?? undefined,
    )
  })

  /**
   * Like `register`, but a field that is showing an error re-validates as the
   * user types, so the error clears as soon as the value is valid.
   */
  function field(
    name: keyof AppointmentInput,
    registration: UseFormRegisterReturn,
  ) {
    return {
      ...registration,
      onChange: async (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        await registration.onChange(event)
        if (errors[name]) await trigger(name)
        if (name === 'start' && (touchedFields.end || errors.end)) {
          await trigger('end')
        }
      },
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <FormField label="Title" error={errors.title?.message}>
        {(control) => (
          <Input
            type="text"
            autoComplete="off"
            {...control}
            {...field('title', register('title', appointmentRules.title))}
          />
        )}
      </FormField>
      <FormField label="Date" error={errors.date?.message}>
        {(control) => (
          <Input
            type="date"
            {...control}
            {...field('date', register('date', appointmentRules.date))}
          />
        )}
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start" error={errors.start?.message}>
          {(control) => (
            <Input
              type="time"
              step={STEP_SECONDS}
              {...control}
              {...field('start', register('start', appointmentRules.start))}
            />
          )}
        </FormField>
        <FormField label="End" error={errors.end?.message}>
          {(control) => (
            <Input
              type="time"
              step={STEP_SECONDS}
              {...control}
              {...field('end', register('end', appointmentRules.end))}
            />
          )}
        </FormField>
      </div>
      <FormField label="Notes" error={errors.notes?.message}>
        {(control) => (
          <Textarea
            rows={3}
            {...control}
            {...field('notes', register('notes', appointmentRules.notes))}
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
