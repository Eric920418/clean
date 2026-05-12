import { cn } from '@/lib/utils'
import type { AdminInquiry } from '@/lib/admin-types'
import { INQUIRY_STATUS } from '@/lib/i18n/admin-zh'

const TONE_CLASS: Record<string, string> = {
  warn: 'bg-warn/15 text-amber-700 border-warn/30',
  accent: 'bg-accent/10 text-accent-deep border-accent/30',
  primary: 'bg-primary/10 text-primary-deep border-primary/30',
  success: 'bg-bg-tint text-primary-deep border-primary-soft/40',
  neutral: 'bg-bg-soft text-ink-muted border-hairline',
}

type StatusBadgeProps = {
  status: AdminInquiry['status']
  /** size: 'sm' 用於密集表格、'md' 用於卡片、'lg' 用於詳情頁標題 */
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = INQUIRY_STATUS[status]
  const sizeClass = {
    sm: 'px-2.5 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2 text-lg',
  }[size]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        sizeClass,
        TONE_CLASS[cfg.tone] ?? TONE_CLASS.neutral,
      )}
    >
      <span aria-hidden>{cfg.emoji}</span>
      <span>{cfg.label}</span>
    </span>
  )
}

// 維持向後相容（其他元件用得到）
export const STATUS_LABELS: Record<AdminInquiry['status'], string> = {
  NEW: INQUIRY_STATUS.NEW.label,
  CONTACTED: INQUIRY_STATUS.CONTACTED.label,
  QUOTED: INQUIRY_STATUS.QUOTED.label,
  DONE: INQUIRY_STATUS.DONE.label,
  CLOSED: INQUIRY_STATUS.CLOSED.label,
}
