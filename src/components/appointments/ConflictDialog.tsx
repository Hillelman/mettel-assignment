import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCalendar } from '@/context/useCalendar'
import { parseISODate } from '@/lib/dates'
import { ConflictList } from './ConflictList'

function formatLongDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function ConflictDialog() {
  const { conflict, applySuggestion, editConflict, cancelConflict } =
    useCalendar()

  return (
    <Dialog
      open={conflict !== null}
      onOpenChange={(open) => {
        if (!open) cancelConflict()
      }}
    >
      {conflict !== null && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" aria-hidden />
              Scheduling conflict
            </DialogTitle>
            <DialogDescription>
              {`'${conflict.proposed.title}' on ${formatLongDate(conflict.proposed.date)} at ${conflict.proposed.start}–${conflict.proposed.end} ${conflict.outOfDay ? "doesn't fit in the day." : 'overlaps with:'}`}
            </DialogDescription>
          </DialogHeader>
          {!conflict.outOfDay && <ConflictList conflicts={conflict.conflicts} />}
          <DialogFooter className="sm:items-center">
            {conflict.suggestion === null && (
              <p className="text-sm text-muted-foreground sm:mr-auto">
                No free slot on this day
              </p>
            )}
            <Button variant="outline" onClick={cancelConflict}>
              Cancel
            </Button>
            <Button variant="outline" onClick={editConflict}>
              Edit times
            </Button>
            <Button
              onClick={applySuggestion}
              disabled={conflict.suggestion === null}
            >
              {conflict.suggestion === null
                ? 'Move to a free slot'
                : `Move to ${conflict.suggestion.start}–${conflict.suggestion.end}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
