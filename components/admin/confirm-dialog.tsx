'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ACTIONS } from '@/lib/i18n/admin-zh'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  title: string
  body?: string
  /** 確認按鈕文字（預設「確定刪掉」） */
  confirmLabel?: string
  /** 取消按鈕文字（預設「不要了」） */
  cancelLabel?: string
  /** 是否為破壞性動作 — 確認按鈕會變紅色 */
  destructive?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

/**
 * 危險動作二次確認對話框（老人友善版）
 * - 大字、大按鈕（min-height 56px）
 * - 取消在左，確認在右；取消為主視覺、確認需用力點（防誤觸）
 * - body 用口語化解釋後果
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = ACTIONS.confirmDelete,
  cancelLabel = ACTIONS.cancel,
  destructive = true,
  onConfirm,
  onCancel,
}: Props) {
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, busy, onCancel])

  if (!open) return null

  async function handleConfirm() {
    try {
      setBusy(true)
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/60 p-4 sm:items-center"
      onClick={() => !busy && onCancel()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-hairline overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full shrink-0',
                destructive ? 'bg-danger/10 text-danger' : 'bg-warn/15 text-warn',
              )}
            >
              <AlertTriangle className="h-6 w-6" strokeWidth={2.2} />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-ink leading-snug">{title}</h3>
              {body && (
                <p className="mt-2 text-base text-ink-soft leading-relaxed">{body}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-hairline bg-bg-soft p-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-lg border border-hairline bg-white px-5 py-4 text-lg font-medium text-ink hover:bg-bg-soft transition disabled:opacity-50"
            style={{ minHeight: 56 }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className={cn(
              'flex-1 rounded-lg px-5 py-4 text-lg font-semibold text-white transition disabled:opacity-50',
              destructive
                ? 'bg-danger hover:bg-danger/90'
                : 'bg-primary hover:bg-primary-deep',
            )}
            style={{ minHeight: 56 }}
          >
            {busy ? '處理中…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// === Hook 包裝：避免每個頁面都要管 open 狀態 ===
type ConfirmOptions = Omit<Props, 'open' | 'onCancel' | 'onConfirm'> & {
  onConfirm: () => void | Promise<void>
}

export function useConfirm() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)

  const confirm = (options: ConfirmOptions) => setOpts(options)
  const close = () => setOpts(null)

  const node = opts ? (
    <ConfirmDialog
      open={true}
      {...opts}
      onCancel={close}
      onConfirm={async () => {
        await opts.onConfirm()
        close()
      }}
    />
  ) : null

  return { confirm, node }
}
