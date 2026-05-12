import { cn } from '@/lib/utils'

type FieldProps = {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, required, hint, error, children, className }: FieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 inline-block text-base font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </span>
      {children}
      {hint && !error && (
        <p className="mt-2 text-base text-ink-soft leading-relaxed">{hint}</p>
      )}
      {error && (
        <p
          className="mt-2 rounded-md bg-danger px-4 py-2.5 text-base font-medium text-white"
          role="alert"
        >
          ⚠ {error}
        </p>
      )}
    </label>
  )
}

// 表單元素統一 class — min-height 48px 由 globals.css .admin-friendly 提供
export const inputClass =
  'w-full px-4 py-3 border border-hairline rounded-lg bg-white text-base focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition placeholder:text-ink-muted'

export const textareaClass = inputClass + ' resize-none leading-relaxed'
