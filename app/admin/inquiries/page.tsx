'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone, MessageCircle, Inbox, Loader2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { StatusBadge } from '@/components/admin/status-badge'
import { cn } from '@/lib/utils'
import type { AdminInquiry } from '@/lib/admin-types'
import { INQUIRY_STATUS, INQUIRY_STATUS_ORDER, MODULES } from '@/lib/i18n/admin-zh'

type Filter = 'all' | 'unread' | AdminInquiry['status']

export default function InquiriesPage() {
  const [items, setItems] = useState<AdminInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  async function fetchAll() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/inquiries')
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '讀取失敗')
      setItems(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '讀取失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const filtered = items.filter((it) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !it.isRead
    return it.status === filter
  })

  const unreadCount = items.filter((it) => !it.isRead).length

  const filterChips: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: '全部', count: items.length },
    { value: 'unread', label: '沒讀過', count: unreadCount },
    ...INQUIRY_STATUS_ORDER.map((s) => ({
      value: s,
      label: INQUIRY_STATUS[s].label,
      count: items.filter((x) => x.status === s).length,
    })),
  ]

  return (
    <>
      <AdminPageHeader
        title={MODULES.inquiries.title}
        description={MODULES.inquiries.description}
      />

      {/* 篩選 chips — 大尺寸方便老人點 */}
      <div className="mb-5 flex flex-wrap gap-2">
        {filterChips.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-base font-medium transition',
              filter === c.value
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-hairline bg-white text-ink-soft hover:border-primary-soft hover:text-primary-deep',
            )}
            style={{ minHeight: 44 }}
          >
            <span>{c.label}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-sm font-semibold',
                filter === c.value ? 'bg-white/20 text-white' : 'bg-bg-soft text-ink-muted',
              )}
            >
              {c.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-primary-deep animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-hairline bg-bg-soft py-20 text-center">
          <Inbox className="h-12 w-12 text-ink-muted mx-auto mb-3" />
          <div className="text-lg text-ink-soft">
            {filter === 'all' ? MODULES.inquiries.emptyText : '這個分類沒有資料'}
          </div>
        </div>
      ) : (
        <>
          {/* 手機版：卡片列表 */}
          <ul className="space-y-3 md:hidden">
            {filtered.map((it) => (
              <InquiryCard key={it.id} inquiry={it} />
            ))}
          </ul>

          {/* 桌機版：保留表格，但字級拉大 */}
          <div className="hidden overflow-x-auto rounded-xl border border-hairline bg-white md:block">
            <table className="w-full text-base">
              <thead className="bg-bg-soft text-left text-ink-soft">
                <tr>
                  <th className="px-5 py-4 font-medium">時間</th>
                  <th className="px-5 py-4 font-medium">客人</th>
                  <th className="px-5 py-4 font-medium">電話 / LINE ID</th>
                  <th className="px-5 py-4 font-medium">問題摘要</th>
                  <th className="px-5 py-4 font-medium text-center">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map((it) => (
                  <tr
                    key={it.id}
                    className={cn(
                      'cursor-pointer hover:bg-bg-soft/60 transition',
                      !it.isRead && 'bg-warn/5',
                    )}
                  >
                    <td className="px-5 py-4 align-top">
                      <Link
                        href={`/admin/inquiries/${it.id}`}
                        className="block whitespace-nowrap text-base text-ink-soft"
                      >
                        {new Date(it.createdAt).toLocaleString('zh-TW', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Link>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <Link href={`/admin/inquiries/${it.id}`} className="block">
                        <span className="font-medium text-ink inline-flex items-center gap-2">
                          {!it.isRead && (
                            <span className="inline-flex items-center rounded-full bg-warn/15 px-2 py-0.5 text-sm text-amber-700">
                              ● 新的
                            </span>
                          )}
                          {it.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-1">
                        <a
                          href={`tel:${it.phone}`}
                          className="inline-flex items-center gap-1.5 text-base text-ink hover:text-primary-deep"
                        >
                          <Phone className="h-4 w-4" /> {it.phone}
                        </a>
                        {it.lineId && (
                          <div className="flex items-center gap-1.5 text-base text-ink-soft">
                            <MessageCircle className="h-4 w-4" />
                            <span className="break-all">{it.lineId}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top max-w-md">
                      <Link
                        href={`/admin/inquiries/${it.id}`}
                        className="block text-base text-ink-soft line-clamp-2"
                      >
                        {it.message || <span className="text-ink-muted">（沒留下補充說明）</span>}
                      </Link>
                    </td>
                    <td className="px-5 py-4 align-top text-center">
                      <StatusBadge status={it.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

// 手機卡片
function InquiryCard({ inquiry }: { inquiry: AdminInquiry }) {
  return (
    <li
      className={cn(
        'rounded-2xl border-2 bg-white p-4 transition',
        inquiry.isRead ? 'border-hairline' : 'border-warn/30 bg-warn/5',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {!inquiry.isRead && (
          <span className="inline-flex items-center gap-1 rounded-full bg-warn px-3 py-1 text-sm font-semibold text-white">
            新的問題
          </span>
        )}
        <StatusBadge status={inquiry.status} size="sm" />
        <span className="ml-auto text-base text-ink-muted">
          {new Date(inquiry.createdAt).toLocaleDateString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
          })}
        </span>
      </div>

      <div className="text-xl font-semibold text-ink">{inquiry.name}</div>
      {inquiry.message && (
        <p className="mt-2 text-base text-ink-soft line-clamp-3 leading-relaxed">
          {inquiry.message}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={`tel:${inquiry.phone}`}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-medium text-white hover:bg-primary-deep transition"
          style={{ minHeight: 48 }}
        >
          <Phone className="h-5 w-5" />
          打電話
        </a>
        <Link
          href={`/admin/inquiries/${inquiry.id}`}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-hairline bg-white px-4 py-3 text-base font-medium text-ink hover:border-primary-soft hover:text-primary-deep transition"
          style={{ minHeight: 48 }}
        >
          看詳情
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
    </li>
  )
}
