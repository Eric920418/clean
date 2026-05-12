type Props = {
  title: string
  description?: string
  breadcrumb?: { label: string; href?: string }[]
  actions?: React.ReactNode
}

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function AdminPageHeader({ title, description, breadcrumb, actions }: Props) {
  return (
    <header className="mb-6 border-b border-hairline pb-5">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="mb-3 flex flex-wrap items-center gap-1 text-base text-ink-soft">
          {breadcrumb.map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {b.href ? (
                <Link
                  href={b.href}
                  className="rounded px-1.5 py-1 hover:bg-bg-tint hover:text-primary-deep transition"
                >
                  {b.label}
                </Link>
              ) : (
                <span className="px-1.5 py-1 text-ink">{b.label}</span>
              )}
              {i < breadcrumb.length - 1 && (
                <ChevronRight className="h-4 w-4 text-ink-muted" />
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-base text-ink-soft leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
