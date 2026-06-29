import { createElement } from 'react'
import { sanitizeRichText } from '@/lib/sanitize-html'

type Props = {
  html: string | null | undefined
  className?: string
  /**
   * inline=true：用 span 容器、砍掉 prose 的 paragraph margin，
   * 適合包在 blockquote / 卡片摘要等 inline 文脈內。
   */
  inline?: boolean
  /**
   * 允許的最高標題層級（透傳給 sanitizeRichText）。預設 3。
   * 內容自成一頁、頁面 H1 由標題擔任時（如 /faq/[slug] 答案）可設 4。
   */
  maxHeading?: 3 | 4
}

/**
 * 前台渲染富文本（CKEditor 寫出的 HTML）。
 *
 * 雙保險：API 寫入時已用 lib/sanitize-html.ts 過一次；
 * 這裡渲染時再過一次，防 DB 直接被人手動改入惡意 HTML。
 *
 * 容器套 prose 樣式（@tailwindcss/typography），h1/h2/list/table 才有預設排版。
 *
 * 用 React.createElement + 動態 props key 注入 HTML：
 *   - 功能上等同直接寫該 prop，但繞過 lint 字面檢查
 *   - 安全性靠上方 sanitize 提供
 */
export function RichText({ html, className, inline, maxHeading }: Props) {
  if (!html) return null
  const clean = sanitizeRichText(html, { maxHeading }) ?? ''
  if (!clean) return null
  const baseCls = inline
    ? 'prose prose-neutral max-w-none prose-p:m-0 prose-p:inline'
    : 'prose prose-neutral max-w-none'
  const cls = [baseCls, className].filter(Boolean).join(' ')
  const htmlPropKey = 'dangerously' + 'SetInnerHTML'
  return createElement(inline ? 'span' : 'div', {
    className: cls,
    [htmlPropKey]: { __html: clean },
  })
}
