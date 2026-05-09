import { AlertCircle } from 'lucide-react'

export function ErrorBanner({ message }: { message: string | null | undefined }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="leading-relaxed whitespace-pre-line">{message}</span>
    </div>
  )
}
