import { useId, type ReactNode } from 'react'
import { Label } from '@/components/ui/label'

type FieldControlProps = {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

type FormFieldProps = {
  label: string
  error?: string
  children: (control: FieldControlProps) => ReactNode
}

export function FormField({ label, error, children }: FormFieldProps) {
  const baseId = useId()
  const controlId = `${baseId}-control`
  const errorId = `${baseId}-error`

  return (
    <div className="grid gap-2">
      <Label htmlFor={controlId}>{label}</Label>
      {children({
        id: controlId,
        'aria-invalid': error !== undefined,
        'aria-describedby': error !== undefined ? errorId : undefined,
      })}
      {error !== undefined && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
