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
  ] = await Promise.all([
    prisma.service.count({ where: { isActive: true } }),
    prisma.beforeAfterPair.count({ where: { isActive: true } }),
    prisma.bookingInquiry.count({ where: { isRead: false } }),
    prisma.bookingInquiry.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.bookingInquiry.findMany({
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
      take: 5,
    }),
  ])

  const stats = [
    {
      label: '上架中服務',
      value: serviceCount,
      icon: Sparkles,
      tone: 'primary',
      href: '/admin/services',
    },
    {
      label: '對比圖總數',
      value: activeBeforeAfterCount,
      icon: ImageIcon,
      tone: 'accent',
      href: '/admin/services',
    },
    {
      label: '未讀詢問單',
      value: unreadInquiryCount,
      icon: Inbox,
      tone: unreadInquiryCount > 0 ? 'warn' : 'neutral',
      href: '/admin/inquiries',
    },
    {
      label: '本週新增詢問',
      value: weekInquiryCount,
      icon: TrendingUp,
      tone: 'neutral',
      href: '/admin/inquiries',
    },
  ] as const

  return (
    <>
      <AdminPageHeader title="儀表板" description="快速查看站台關鍵指標與最新詢問單" />

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
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">最新詢問單</h2>
            <p className="text-xs text-ink-muted mt-0.5">最近 5 筆，未讀優先</p>
          </div>
          <Link
            href="/admin/inquiries"
            className="text-sm text-primary-deep hover:underline"
          >
            查看全部 →
          </Link>
        </header>

        {recentInquiries.length === 0 ? (
          <div className="py-16 text-center text-ink-muted">
            <Inbox className="h-10 w-10 mx-auto mb-3 text-ink-muted" />
            <p>尚無詢問單</p>
          </div>
        ) : (
          <ul className="divide-y divide-hairline-soft">
            {recentInquiries.map((it) => (
              <li key={it.id}>
                <Link
                  href={`/admin/inquiries/${it.id}`}
                  className={cn(
                    'flex items-center gap-4 px-6 py-4 hover:bg-bg-soft/60 transition',
                    !it.isRead && 'bg-warn/5',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!it.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-warn shrink-0" />
                      )}
                      <span className="text-sm font-medium text-ink">{it.name}</span>
                      <span className="text-xs text-ink-muted inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {it.phone}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-soft line-clamp-1">
                      {it.message ?? <span className="text-ink-muted">（未填補充說明）</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={it.status} />
                    <span className="text-xs text-ink-muted whitespace-nowrap">
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
