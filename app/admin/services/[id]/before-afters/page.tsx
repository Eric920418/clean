'use client'

import { useEffect, useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, ArrowLeft, Loader2, ChevronUp, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ErrorBanner } from '@/components/admin/error-banner'
import { BeforeAfterModal } from '@/components/admin/before-after-modal'
import { cn } from '@/lib/utils'
import type { AdminBeforeAfter, AdminService } from '@/lib/admin-types'

type PageProps = { params: Promise<{ id: string }> }

export default function BeforeAftersPage({ params }: PageProps) {
  const { id } = use(params)
  const [service, setService] = useState<AdminService | null>(null)
  const [items, setItems] = useState<AdminBeforeAfter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminBeforeAfter | null>(null)

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
      if (!baRes.ok) throw new Error(ba.error || '讀取對比圖失敗')
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

  async function remove(b: AdminBeforeAfter) {
    if (!confirm(`刪除這組對比？\nR2 上的兩張圖也會一併刪除。\n此動作無法還原。`)) return
    try {
      const r = await fetch(`/api/admin/services/${id}/before-afters/${b.id}`, {
        method: 'DELETE',
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '刪除失敗')
      toast.success('已刪除')
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '刪除失敗')
    }
  }

  async function move(b: AdminBeforeAfter, dir: 'up' | 'down') {
    const sorted = [...items].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((x) => x.id === b.id)
    const swap = dir === 'up' ? sorted[idx - 1] : sorted[idx + 1]
    if (!swap) return
    await patch(b, { order: swap.order })
    await patch(swap, { order: b.order })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-primary-deep animate-spin" />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error ?? '服務不存在'} />
        <Link href="/admin/services" className="btn-ghost !py-2 !text-sm">
          <ArrowLeft className="h-4 w-4" />
          回服務列表
        </Link>
      </div>
    )
  }

  return (
    <>
      <AdminPageHeader
        title={`${service.name}・前後對比`}
        description="每組對比 = 一張清洗前 + 一張清洗後。可標記首頁精選、調整排序"
        breadcrumb={[
          { label: '服務管理', href: '/admin/services' },
          { label: service.name, href: `/admin/services/${service.id}/edit` },
          { label: '前後對比' },
        ]}
        actions={
          <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-sm">
            <Plus className="h-4 w-4" />
            新增一組對比
          </button>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-bg-soft py-20 text-center">
          <div className="text-ink-muted mb-4">這個服務還沒有任何對比圖</div>
          <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-sm">
            <Plus className="h-4 w-4" />
            上傳第一組對比
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((b, i) => (
            <li
              key={b.id}
              className={cn(
                'rounded-xl border bg-white p-4 transition',
                b.isActive ? 'border-hairline' : 'border-hairline-soft opacity-60',
              )}
            >
              <div className="flex flex-col gap-4 md:flex-row">
                {/* 縮圖：並排 Before / After */}
                <div className="flex gap-2 shrink-0">
                  <div className="relative w-32 aspect-[4/3] rounded-md overflow-hidden border border-hairline bg-bg-soft">
                    <Image
                      src={b.beforeUrl}
                      alt="Before"
                      fill
                      sizes="128px"
                      className="object-cover"
                      unoptimized
                    />
                    <span className="absolute left-1.5 top-1.5 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] text-white">
                      Before
                    </span>
                  </div>
                  <div className="relative w-32 aspect-[4/3] rounded-md overflow-hidden border border-hairline bg-bg-soft">
                    <Image
                      src={b.afterUrl}
                      alt="After"
                      fill
                      sizes="128px"
                      className="object-cover"
                      unoptimized
                    />
                    <span className="absolute left-1.5 top-1.5 rounded bg-primary/95 px-1.5 py-0.5 text-[10px] text-white">
                      After
                    </span>
                  </div>
                </div>

                {/* 資訊 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink">
                    {b.caption || <span className="text-ink-muted">（未填描述）</span>}
                  </div>
                  <div className="mt-1 text-xs text-ink-muted flex flex-wrap gap-x-3 gap-y-1">
                    {b.location && <span>📍 {b.location}</span>}
                    {b.takenAt && <span>🗓 {b.takenAt.slice(0, 10)}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => patch(b, { isFeatured: !b.isFeatured })}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition',
                        b.isFeatured
                          ? 'bg-warn/15 text-warn hover:bg-warn/25'
                          : 'bg-bg-soft text-ink-muted hover:bg-hairline',
                      )}
                    >
                      <Star
                        className={cn('h-3 w-3', b.isFeatured && 'fill-warn')}
                      />
                      {b.isFeatured ? '首頁精選' : '一般'}
                    </button>
                    <button
                      onClick={() => patch(b, { isActive: !b.isActive })}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition',
                        b.isActive
                          ? 'bg-primary/10 text-primary-deep hover:bg-primary/15'
                          : 'bg-bg-soft text-ink-muted hover:bg-hairline',
                      )}
                    >
                      {b.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {b.isActive ? '上架中' : '已下架'}
                    </button>
                  </div>
                </div>

                {/* 動作 */}
                <div className="flex md:flex-col items-center md:items-end gap-1 shrink-0">
                  <div className="flex md:flex-col gap-0.5">
                    <button
                      onClick={() => move(b, 'up')}
                      disabled={i === 0}
                      className="text-ink-muted hover:text-primary-deep disabled:opacity-30 p-1"
                      aria-label="上移"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => move(b, 'down')}
                      disabled={i === items.length - 1}
                      className="text-ink-muted hover:text-primary-deep disabled:opacity-30 p-1"
                      aria-label="下移"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => openEdit(b)}
                    className="rounded-md p-1.5 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition"
                    title="編輯"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(b)}
                    className="rounded-md p-1.5 text-ink-soft hover:text-danger hover:bg-danger/10 transition"
                    title="刪除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
    </>
  )
}
