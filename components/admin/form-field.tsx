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
      <span className="mb-1.5 inline-block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </span>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </label>
  )
}

export const inputClass =
  'w-full px-3.5 py-2 border border-hairline rounded-md bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition placeholder:text-ink-muted'

export const textareaClass = inputClass + ' resize-none leading-relaxed'
