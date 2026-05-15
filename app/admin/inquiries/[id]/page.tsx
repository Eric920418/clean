'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone, Mail, MessageCircle, MapPin, Calendar, Trash2, Loader2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ErrorBanner } from '@/components/admin/error-banner'
import { StatusBadge, STATUS_LABELS } from '@/components/admin/status-badge'
import { cn } from '@/lib/utils'
import type { AdminInquiry } from '@/lib/admin-types'

type PageProps = { params: Promise<{ id: string }> }

export default function InquiryDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [inquiry, setInquiry] = useState<AdminInquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAll() {
    setLoading(true)
    try {
      const inqRes = await fetch(`/api/admin/inquiries/${id}`)
      const inq = await inqRes.json()
      if (!inqRes.ok) throw new Error(inq.error || '讀取失敗')
      setInquiry(inq)

      // 自動標記為已讀
      if (!inq.isRead) {
        await fetch(`/api/admin/inquiries/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取失敗')
    } finally {
      setLoading(false)
    }
  }

  async function copyLineId() {
    if (!inquiry?.lineId) return
    try {
      await navigator.clipboard.writeText(inquiry.lineId)
      toast.success('LINE ID 已複製')
    } catch {
      toast.error('複製失敗')
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function changeStatus(status: AdminInquiry['status']) {
    if (!inquiry) return
    try {
      const r = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '更新失敗')
      setInquiry({ ...inquiry, status })
      toast.success(`狀態已改為「${STATUS_LABELS[status]}」`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失敗')
    }
  }

  async function remove() {
    if (!confirm('確定刪除此詢問單？此動作無法還原。')) return
    try {
      const r = await fetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '刪除失敗')
      toast.success('已刪除')
      router.push('/admin/inquiries')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '刪除失敗')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-primary-deep animate-spin" />
      </div>
    )
  }

  if (error || !inquiry) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error ?? '詢問單不存在'} />
        <Link href="/admin/inquiries" className="btn-ghost !py-2 !text-sm">
          <ArrowLeft className="h-4 w-4" />
          回列表
        </Link>
      </div>
    )
  }

  return (
    <>
      <AdminPageHeader
        title={`詢問單 #${inquiry.id}`}
        description={`提交時間：${new Date(inquiry.createdAt).toLocaleString('zh-TW')}`}
        breadcrumb={[{ label: '詢問單', href: '/admin/inquiries' }, { label: `#${inquiry.id}` }]}
        actions={
          <button
            onClick={remove}
            className="btn-ghost !py-2 !text-sm !text-danger hover:!border-danger/40"
          >
            <Trash2 className="h-4 w-4" />
            刪除
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-hairline bg-white p-6">
            <h2 className="text-base font-semibold text-ink mb-4">客戶資訊</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs text-ink-muted">姓名</dt>
                <dd className="mt-0.5 font-medium text-ink">{inquiry.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted flex items-center gap-1">
                  <Phone className="h-3 w-3" /> 電話
                </dt>
                <dd className="mt-0.5">
                  <a href={`tel:${inquiry.phone}`} className="font-medium text-primary-deep hover:underline">
                    {inquiry.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> LINE ID
                </dt>
                <dd className="mt-0.5 flex items-center gap-2">
                  {inquiry.lineId ? (
                    <>
                      <span className="font-medium text-ink break-all">{inquiry.lineId}</span>
                      <button
                        type="button"
                        onClick={copyLineId}
                        className="inline-flex items-center gap-1 rounded-md border border-hairline px-2 py-0.5 text-xs text-ink-soft hover:border-primary-soft hover:text-primary-deep transition"
                        title="複製 LINE ID"
                      >
                        <Copy className="h-3 w-3" />
                        複製
                      </button>
                    </>
                  ) : (
                    <span className="text-ink-muted">（舊資料未填）</span>
                  )}
                </dd>
              </div>
              {inquiry.email && (
                <div>
                  <dt className="text-xs text-ink-muted flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </dt>
                  <dd className="mt-0.5">
                    <a href={`mailto:${inquiry.email}`} className="font-medium text-primary-deep hover:underline">
                      {inquiry.email}
                    </a>
                  </dd>
                </div>
              )}
              {inquiry.address && (
                <div>
                  <dt className="text-xs text-ink-muted flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> 服務區域
                  </dt>
                  <dd className="mt-0.5 font-medium text-ink">{inquiry.address}</dd>
                </div>
              )}
              {inquiry.preferDate && (
                <div>
                  <dt className="text-xs text-ink-muted flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> 希望日期
                  </dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {inquiry.preferDate.slice(0, 10)}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-xl border border-hairline bg-white p-6">
            <h2 className="text-base font-semibold text-ink mb-4">補充說明</h2>
            <p className="whitespace-pre-line text-sm text-ink-soft leading-relaxed">
              {inquiry.message || (
                <span className="text-ink-muted">（客戶未填補充說明）</span>
              )}
            </p>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-hairline bg-white p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">處理狀態</h2>
            <div className="flex items-center gap-2 mb-4">
              <StatusBadge status={inquiry.status} />
            </div>
            <div className="space-y-1">
              {(['NEW', 'CONTACTED', 'QUOTED', 'DONE', 'CLOSED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  className={cn(
                    'block w-full rounded-md px-3 py-2 text-left text-sm transition',
                    inquiry.status === s
                      ? 'bg-primary text-white'
                      : 'text-ink-soft hover:bg-bg-soft hover:text-ink',
                  )}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-hairline bg-white p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">快速行動</h2>
            <div className="space-y-2">
              <a
                href={`tel:${inquiry.phone}`}
                className="btn-primary w-full !py-2 !text-sm"
              >
                <Phone className="h-4 w-4" />
                立即撥電
              </a>
              {inquiry.email && (
                <a
                  href={`mailto:${inquiry.email}`}
                  className="btn-ghost w-full !py-2 !text-sm"
                >
                  <Mail className="h-4 w-4" />
                  寄信
                </a>
              )}
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}
