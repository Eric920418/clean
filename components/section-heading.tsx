import { createElement } from 'react'
import { cn } from '@/lib/utils'
import { RichText } from '@/components/rich-text'

type Props = {
  eyebrow?: string
  title: string
  description?: string  // 可以是純文字或富文本 HTML — RichText 會 sanitize 後渲染
  align?: 'left' | 'center'
  className?: string
  /**
   * 標題的語意層級（h1/h2/h3），預設 h2。視覺字級固定不變（由下方 className 控制），
   * 只切換語意標籤 — 頁面主標題請傳 'h1' 以符合 SEO 標題階級（每頁唯一 H1）。
   */
  as?: 'h1' | 'h2' | 'h3'
}

export function SectionHeading({ eyebrow, title, description, align = 'left', className, as = 'h2' }: Props) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      {createElement(
        as,
        { className: 'mt-4 text-3xl font-medium tracking-tight text-ink md:text-4xl' },
        title,
      )}
      {description && (
        <RichText
          html={description}
          className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base"
        />
      )}
    </div>
  )
}
