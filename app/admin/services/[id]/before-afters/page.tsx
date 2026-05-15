'use client'

import { useEffect, useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ErrorBanner } from '@/components/admin/error-banner'
import { BeforeAfterModal } from '@/components/admin/before-after-modal'
import { useConfirm } from '@/components/admin/confirm-dialog'
import { cn } from '@/lib/utils'
import type { AdminBeforeAfter, AdminService } from '@/lib/admin-types'
import { swapOrderByIndex } from '@/lib/admin-reorder'
import { CONFIRM_MESSAGES, MODULES, NAV_LABELS } from '@/lib/i18n/admin-zh'

type PageProps = { params: Promise<{ id: string }> }

export default function BeforeAftersPage({ params }: PageProps) {
  const { id } = use(params)
  const [service, setService] = useState<AdminService | null>(null)
  const [items, setItems] = useState<AdminBeforeAfter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminBeforeAfter | null>(null)
  const { confirm, node: confirmNode } = useConfirm()

  async function fetchAll() {
    setLoading(true)
    try {
      const [srvRes, baRes] = await Promise.all([
        fetch(`/api/admin/services/${id}`),
        fetch(`/api/admin/services/${id}/before-afters`),
      ])
      const srv = await srvRes.json()
      const ba = await baRes.json()
      if (!srvRes.ok) throw new Error(srv.error || '讀取服務失敗')
      if (!baRes.ok) throw new Error(ba.error || '讀取照片失敗')
      setService(srv)
      setItems(ba)
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }
  function openEdit(b: AdminBeforeAfter) {
    setEditing(b)
    setModalOpen(true)
  }

  async function patch(b: AdminBeforeAfter, body: Partial<AdminBeforeAfter>) {
    try {
      const r = await fetch(`/api/admin/services/${id}/before-afters/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '更新失敗')
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失敗')
    }
  }

  function askRemove(b: AdminBeforeAfter) {
    confirm({
      title: CONFIRM_MESSAGES.deleteBeforeAfter.title,
      body: CONFIRM_MESSAGES.deleteBeforeAfter.body,
      destructive: true,
      onConfirm: async () => {
        try {
          const r = await fetch(
            `/api/admin/services/${id}/before-afters/${b.id}`,
            { method: 'DELETE' },
          )
          const data = await r.json()
          if (!r.ok) throw new Error(data.error || '刪除失敗')
          toast.success('已刪掉')
          fetchAll()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '刪除失敗')
        }
      },
    })
  }

  async function move(b: AdminBeforeAfter, dir: 'up' | 'down') {
    try {
      const moved = await swapOrderByIndex(
        items,
        b.id,
        dir,
        (bid) => `/api/admin/services/${id}/before-afters/${bid}`,
      )
      if (moved) fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? `排序失敗：${err.message}` : '排序失敗')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-primary-deep animate-spin" />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error ?? '服務不存在'} />
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-2 btn-ghost"
        >
          <ArrowLeft className="h-5 w-5" />
          {NAV_LABELS.services}
        </Link>
      </div>
    )
  }

  return (
    <>
      <AdminPageHeader
        title={`${service.name}・清潔前後照片`}
        description={MODULES.beforeAfters.description}
        breadcrumb={[
          { label: NAV_LABELS.services, href: '/admin/services' },
          { label: service.name, href: `/admin/services/${service.id}/edit` },
          { label: '清潔前後照片' },
        ]}
        actions={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-5 w-5" />
            新增照片
          </button>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-hairline bg-bg-soft py-16 text-center">
          <div className="text-lg text-ink-soft mb-4">{MODULES.beforeAfters.emptyText}</div>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-5 w-5" />
            上傳第一組
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((b, i) => (
            <li
              key={b.id}
              className={cn(
                'rounded-2xl border-2 bg-white p-4 transition',
                b.isActive ? 'border-hairline' : 'border-hairline-soft opacity-60',
              )}
            >
              <div className="flex flex-col gap-4 md:flex-row">
                {/* 縮圖：並排清潔前/清潔後 */}
                <div className="grid grid-cols-2 gap-2 shrink-0 md:flex">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-hairline bg-bg-soft md:w-40">
                    <Image
                      src={b.beforeUrl}
                      alt="清潔前"
                      fill
                      sizes="(max-width: 768px) 50vw, 160px"
                      className="object-cover"
                      unoptimized
                    />
                    <span className="absolute left-2 top-2 rounded bg-ink/85 px-2 py-1 text-sm font-medium text-white">
                      清潔前
                    </span>
                  </div>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-hairline bg-bg-soft md:w-40">
                    <Image
                      src={b.afterUrl}
                      alt="清潔後"
                      fill
                      sizes="(max-width: 768px) 50vw, 160px"
                      className="object-cover"
                      unoptimized
                    />
                    <span className="absolute left-2 top-2 rounded bg-primary/95 px-2 py-1 text-sm font-medium text-white">
                      清潔後
                    </span>
                  </div>
                </div>

                {/* 資訊 */}
                <div className="flex-1 min-w-0">
                  <div className="text-lg text-ink">
                    {b.caption || <span className="text-ink-muted">（沒寫說明）</span>}
                  </div>
                  <div className="mt-1 text-base text-ink-muted flex flex-wrap gap-x-4 gap-y-1">
                    {b.location && <span>📍 {b.location}</span>}
                    {b.takenAt && <span>🗓 {b.takenAt.slice(0, 10)}</span>}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => patch(b, { isFeatured: !b.isFeatured })}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-base font-medium transition',
                        b.isFeatured
                          ? 'bg-warn/15 text-warn hover:bg-warn/25'
                          : 'bg-bg-soft text-ink-muted hover:bg-hairline',
                      )}
                      style={{ minHeight: 40 }}
                    >
                      <Star className={cn('h-4 w-4', b.isFeatured && 'fill-warn')} />
                      {b.isFeatured ? '首頁精選' : '一般'}
                    </button>
                    <button
                      onClick={() => patch(b, { isActive: !b.isActive })}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-base font-medium transition',
                        b.isActive
                          ? 'bg-primary/10 text-primary-deep hover:bg-primary/15'
                          : 'bg-bg-soft text-ink-muted hover:bg-hairline',
                      )}
                      style={{ minHeight: 40 }}
                    >
                      {b.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {b.isActive ? '有上架' : '沒上架'}
                    </button>
                  </div>
                </div>

                {/* 動作（手機在底、桌機在右） */}
                <div className="flex items-center justify-between gap-2 border-t border-hairline-soft pt-3 md:flex-col md:border-t-0 md:pt-0 md:items-end shrink-0">
                  <div className="flex gap-1 md:flex-col">
                    <button
                      onClick={() => move(b, 'up')}
                      disabled={i === 0}
                      className="rounded-md p-2.5 text-ink-soft hover:bg-bg-soft disabled:opacity-30"
                      aria-label="上移"
                      style={{ minHeight: 44, minWidth: 44 }}
                    >
                      <ChevronUp className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => move(b, 'down')}
                      disabled={i === items.length - 1}
                      className="rounded-md p-2.5 text-ink-soft hover:bg-bg-soft disabled:opacity-30"
                      aria-label="下移"
                      style={{ minHeight: 44, minWidth: 44 }}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex gap-1 md:flex-col">
                    <button
                      onClick={() => openEdit(b)}
                      className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-base text-ink hover:border-primary-soft hover:text-primary-deep transition"
                      style={{ minHeight: 44 }}
                    >
                      <Pencil className="h-4 w-4" />
                      修改
                    </button>
                    <button
                      onClick={() => askRemove(b)}
                      className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-base text-ink-soft hover:border-danger hover:text-danger transition"
                      style={{ minHeight: 44 }}
                    >
                      <Trash2 className="h-4 w-4" />
                      刪掉
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <BeforeAfterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceId={service.id}
        editing={editing}
        onSaved={fetchAll}
        defaultOrder={items.length}
      />

      {confirmNode}
    </>
  )
}
