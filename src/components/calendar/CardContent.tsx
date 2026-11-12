type CardContentProps = {
  title: string
  start: string
  end: string
}

export function CardContent({ title, start, end }: CardContentProps) {
  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden text-xs leading-tight">
      <span className="truncate font-medium">{title}</span>
      <span className="truncate opacity-80">
        {start} – {end}
      </span>
    </div>
  )
}
