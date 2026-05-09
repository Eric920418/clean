import { cn } from '@/lib/utils'
import type { AdminInquiry } from '@/lib/admin-types'

const STATUS_CONFIG: Record<
  AdminInquiry['status'],
  { label: string; className: string }
> = {
  NEW: { label: '新進', className: 'bg-warn/15 text-amber-700 border-warn/30' },
  CONTACTED: { label: '已聯繫', className: 'bg-accent/10 text-accent-deep border-accent/30' },
  QUOTED: { label: '已報價', className: 'bg-primary/10 text-primary-deep border-primary/30' },
  DONE: { label: '已完成', className: 'bg-bg-tint text-primary-deep border-primary-soft/40' },
  CLOSED: { label: '已關閉', className: 'bg-bg-soft text-ink-muted border-hairline' },
}

export function StatusBadge({ status }: { status: AdminInquiry['status'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  )
}

export const STATUS_LABELS: Record<AdminInquiry['status'], string> = {
  NEW: '新進',
  CONTACTED: '已聯繫',
  QUOTED: '已報價',
  DONE: '已完成',
  CLOSED: '已關閉',
}
