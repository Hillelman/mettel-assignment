import { formatCardRange } from '@/lib/format'

type CardContentProps = {
  title: string
  /** YYYY-MM-DDTHH:mm */
  start: string
  /** YYYY-MM-DDTHH:mm */
  end: string
}

export function CardContent({ title, start, end }: CardContentProps) {
  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden text-xs leading-tight">
      <span className="truncate font-medium">{title}</span>
      <span className="truncate opacity-80">{formatCardRange(start, end)}</span>
    </div>
  )
}
