import Link from 'next/link'
import { Camera, MessageCircle, ChevronRight } from 'lucide-react'

type Props = {
  unreadInquiries: number
  /** 顯示用：第一個有效服務的 id（提供「新增清潔前後照片」直達連結） */
  firstServiceId: number | null
}

/**
 * 首頁兩個大按鈕 — 老闆 80% 高頻動作的捷徑
 * 1. 新增清潔前後照片（直達某個服務的 before-afters 頁）
 * 2. 看新問問題（連到詢問單，badge 顯示未讀數）
 *
 * 大按鈕高 80px+、icon 24px、文字兩行（標題 + 副標）
 */
export function QuickActions({ unreadInquiries, firstServiceId }: Props) {
  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2">
      <Link
        href={
          firstServiceId
            ? `/admin/services/${firstServiceId}/before-afters`
            : '/admin/services'
        }
        className="group flex items-center gap-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-bg-tint to-white p-5 transition hover:border-primary hover:shadow-md"
        style={{ minHeight: 96 }}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white shrink-0 transition group-hover:scale-105">
          <Camera className="h-7 w-7" strokeWidth={2.2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-xl font-semibold text-ink">新增清潔前後照片</div>
          <div className="text-base text-ink-soft mt-1">
            {firstServiceId ? '點這裡上傳今天的成果' : '請先新增服務'}
          </div>
        </div>
        <ChevronRight className="h-6 w-6 text-primary-deep shrink-0 transition group-hover:translate-x-1" />
      </Link>

      <Link
        href="/admin/inquiries"
        className="group relative flex items-center gap-4 rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-bg-sky-tint to-white p-5 transition hover:border-accent hover:shadow-md"
        style={{ minHeight: 96 }}
      >
        <span className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white shrink-0 transition group-hover:scale-105">
          <MessageCircle className="h-7 w-7" strokeWidth={2.2} />
          {unreadInquiries > 0 && (
            <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-danger px-1.5 text-sm font-bold text-white border-2 border-white">
              {unreadInquiries > 99 ? '99+' : unreadInquiries}
            </span>
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-xl font-semibold text-ink">看新問問題</div>
          <div className="text-base text-ink-soft mt-1">
            {unreadInquiries > 0
              ? `有 ${unreadInquiries} 個客人在等回覆`
              : '目前都已經回覆了'}
          </div>
        </div>
        <ChevronRight className="h-6 w-6 text-accent-deep shrink-0 transition group-hover:translate-x-1" />
      </Link>
    </section>
  )
}
