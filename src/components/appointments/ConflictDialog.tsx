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
import { formatRangeFrom, formatRangeWithDates } from '@/lib/format'
import { splitDateTime } from '@/lib/time'
import { ConflictList } from './ConflictList'

export function ConflictDialog() {
  const { conflict, applySuggestion, editConflict, cancelConflict } =
    useCalendar()
  const proposedDate = conflict ? splitDateTime(conflict.proposed.start).date : ''

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
              {`'${conflict.proposed.title}' on ${formatRangeWithDates(conflict.proposed.start, conflict.proposed.end)} overlaps with:`}
            </DialogDescription>
          </DialogHeader>
          <ConflictList
            conflicts={conflict.conflicts}
            referenceDate={proposedDate}
          />
          <DialogFooter className="sm:items-center">
            {conflict.suggestion === null && (
              <p className="text-sm text-muted-foreground sm:mr-auto">
                No free slot nearby
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
                : `Move to ${formatRangeFrom(conflict.suggestion.start, conflict.suggestion.end, proposedDate)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
