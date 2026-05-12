import Link from 'next/link'
import {
  Sparkles,
  Image as ImageIcon,
  Inbox,
  Phone,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { StatusBadge } from '@/components/admin/status-badge'
import { QuickActions } from '@/components/admin/quick-actions'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic' // 即時統計

export default async function DashboardPage() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    serviceCount,
    activeBeforeAfterCount,
    unreadInquiryCount,
    weekInquiryCount,
    recentInquiries,
    firstService,
  ] = await Promise.all([
    prisma.service.count({ where: { isActive: true } }),
    prisma.beforeAfterPair.count({ where: { isActive: true } }),
    prisma.bookingInquiry.count({ where: { isRead: false } }),
    prisma.bookingInquiry.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.bookingInquiry.findMany({
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
      take: 5,
    }),
    prisma.service.findFirst({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: { id: true },
    }),
  ])

  const stats = [
    {
      label: '上架中的服務',
      value: serviceCount,
      icon: Sparkles,
      tone: 'primary',
      href: '/admin/services',
    },
    {
      label: '清潔前後照片',
      value: activeBeforeAfterCount,
      icon: ImageIcon,
      tone: 'accent',
      href: '/admin/services',
    },
    {
      label: '沒讀過的問題',
      value: unreadInquiryCount,
      icon: Inbox,
      tone: unreadInquiryCount > 0 ? 'warn' : 'neutral',
      href: '/admin/inquiries',
    },
    {
      label: '這週新來的問題',
      value: weekInquiryCount,
      icon: TrendingUp,
      tone: 'neutral',
      href: '/admin/inquiries',
    },
  ] as const

  return (
    <>
      <AdminPageHeader title="首頁" description="今天有什麼客人需要處理？" />

      <QuickActions
        unreadInquiries={unreadInquiryCount}
        firstServiceId={firstService?.id ?? null}
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="card-hover rounded-xl border border-hairline bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  s.tone === 'primary' && 'bg-bg-tint text-primary-deep',
                  s.tone === 'accent' && 'bg-accent/10 text-accent-deep',
                  s.tone === 'warn' && 'bg-warn/15 text-amber-700',
                  s.tone === 'neutral' && 'bg-bg-soft text-ink-soft',
                )}
              >
                <s.icon className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-ink-muted" />
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-ink-soft">{s.label}</div>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-hairline bg-white">
        <header className="flex items-center justify-between border-b border-hairline px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">最近的客人問問題</h2>
            <p className="text-base text-ink-soft mt-0.5">沒讀過的會排在最上面</p>
          </div>
          <Link
            href="/admin/inquiries"
            className="text-base font-medium text-primary-deep hover:underline whitespace-nowrap"
          >
            看全部 →
          </Link>
        </header>

        {recentInquiries.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="h-12 w-12 mx-auto mb-3 text-ink-muted" />
            <p className="text-base text-ink-soft">目前還沒有客人問問題</p>
          </div>
        ) : (
          <ul className="divide-y divide-hairline-soft">
            {recentInquiries.map((it) => (
              <li key={it.id}>
                <Link
                  href={`/admin/inquiries/${it.id}`}
                  className={cn(
                    'flex flex-col gap-2 px-5 py-4 hover:bg-bg-soft/60 transition sm:flex-row sm:items-center sm:gap-4 sm:px-6',
                    !it.isRead && 'bg-warn/5',
                  )}
                  style={{ minHeight: 72 }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {!it.isRead && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-warn/15 px-2 py-0.5 text-sm font-medium text-amber-700"
                          aria-label="未讀"
                        >
                          ● 新的
                        </span>
                      )}
                      <span className="text-lg font-medium text-ink">{it.name}</span>
                      <span className="inline-flex items-center gap-1 text-base text-ink-soft">
                        <Phone className="h-4 w-4" /> {it.phone}
                      </span>
                    </div>
                    <p className="mt-1.5 text-base text-ink-soft line-clamp-2">
                      {it.message || <span className="text-ink-muted">（沒留下補充說明）</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={it.status} size="sm" />
                    <span className="text-base text-ink-muted whitespace-nowrap">
                      {new Date(it.createdAt).toLocaleDateString('zh-TW', {
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
