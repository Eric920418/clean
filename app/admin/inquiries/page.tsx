'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, Inbox, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { StatusBadge, STATUS_LABELS } from '@/components/admin/status-badge'
import { cn } from '@/lib/utils'
import type { AdminInquiry } from '@/lib/admin-types'

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
    { value: 'unread', label: '未讀', count: unreadCount },
    { value: 'NEW', label: STATUS_LABELS.NEW, count: items.filter((x) => x.status === 'NEW').length },
    { value: 'CONTACTED', label: STATUS_LABELS.CONTACTED, count: items.filter((x) => x.status === 'CONTACTED').length },
    { value: 'QUOTED', label: STATUS_LABELS.QUOTED, count: items.filter((x) => x.status === 'QUOTED').length },
    { value: 'DONE', label: STATUS_LABELS.DONE, count: items.filter((x) => x.status === 'DONE').length },
    { value: 'CLOSED', label: STATUS_LABELS.CLOSED, count: items.filter((x) => x.status === 'CLOSED').length },
  ]

  return (
    <>
      <AdminPageHeader
        title="詢問單"
        description="客戶從前台預約諮詢的訊息，依進度切換狀態追蹤"
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {filterChips.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition',
              filter === c.value
                ? 'border-primary bg-primary text-white'
                : 'border-hairline bg-white text-ink-soft hover:border-primary-soft hover:text-primary-deep',
            )}
          >
            <span>{c.label}</span>
            <span
              className={cn(
                'rounded-full px-1.5 text-xs',
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
          <Loader2 className="h-6 w-6 text-primary-deep animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-bg-soft py-20 text-center">
          <Inbox className="h-10 w-10 text-ink-muted mx-auto mb-3" />
          <div className="text-ink-muted">尚無詢問單</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-hairline bg-white">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft text-left text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">時間</th>
                <th className="px-4 py-3 font-medium">客戶</th>
                <th className="px-4 py-3 font-medium">聯絡方式</th>
                <th className="px-4 py-3 font-medium">摘要</th>
                <th className="px-4 py-3 font-medium text-center">狀態</th>
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
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/inquiries/${it.id}`}
                      className="block whitespace-nowrap text-ink-soft text-xs"
                    >
                      {new Date(it.createdAt).toLocaleString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Link>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link href={`/admin/inquiries/${it.id}`} className="block">
                      <span className="font-medium text-ink flex items-center gap-1.5">
                        {!it.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-warn" title="未讀" />
                        )}
                        {it.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/inquiries/${it.id}`}
                      className="block text-xs text-ink-soft space-y-0.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {it.phone}
                      </div>
                      {it.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3" /> {it.email}
                        </div>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 align-top max-w-md">
                    <Link
                      href={`/admin/inquiries/${it.id}`}
                      className="block text-xs text-ink-soft line-clamp-2"
                    >
                      {it.message || <span className="text-ink-muted">（未填補充說明）</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-3 align-top text-center">
                    <StatusBadge status={it.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
