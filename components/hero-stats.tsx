"use client"

export default function HeroStats({
  title,
  value,
  subtitle,
  color = "from-sky-500 to-fuchsia-500",
}: {
  title: string
  value: number
  subtitle?: string
  color?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="rounded-lg border bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-bold">{Math.round(value)}</span>
        <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
