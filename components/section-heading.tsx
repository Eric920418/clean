import { cn } from '@/lib/utils'
import { RichText } from '@/components/rich-text'

type Props = {
  eyebrow?: string
  title: string
  description?: string  // 可以是純文字或富文本 HTML — RichText 會 sanitize 後渲染
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
        <RichText
          html={description}
          className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base"
        />
      )}
    </div>
  )
}
