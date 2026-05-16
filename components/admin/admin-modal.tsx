'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  /** modal 寬度級別（預設 lg） */
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap: Record<NonNullable<Props['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'lg',
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl border border-hairline',
          sizeMap[size],
        )}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-hairline bg-white/95 backdrop-blur-sm px-4 py-3 sm:px-5 sm:py-4 md:px-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-ink-soft">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-soft hover:text-ink transition rounded-md p-1 -m-1"
            aria-label="關閉"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-5 md:p-6">{children}</div>
      </div>
    </div>
  )
}
