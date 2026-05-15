import { cn } from '@/lib/utils'

type Props = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = 'left', className }: Props) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-4 text-3xl font-medium tracking-tight text-ink md:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft md:text-base">{description}</p>
      )}
    </div>
  )
}
