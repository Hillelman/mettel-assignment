import { Button } from '@/components/ui/button'

type DeleteConfirmProps = {
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirm({ onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium">Delete this appointment?</p>
      <div className="flex gap-2 sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </div>
  )
}
