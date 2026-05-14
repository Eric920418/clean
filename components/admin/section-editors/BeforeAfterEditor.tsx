'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Pencil, Star, StarOff } from 'lucide-react'
import { toast } from 'sonner'
import { useConfirm } from '@/components/admin/confirm-dialog'
import { BeforeAfterModal } from '@/components/admin/before-after-modal'
import type { AdminBeforeAfter } from '@/lib/admin-types'

type Props = {
  serviceId: number
  sectionId: number
  pairs: AdminBeforeAfter[]
  onChange: () => void
}

export function BeforeAfterEditor({ serviceId, sectionId, pairs, onChange }: Props) {
  const [editing, setEditing] = useState<AdminBeforeAfter | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const { confirm, node: confirmNode } = useConfirm()

  async function toggleFeatured(p: AdminBeforeAfter) {
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/before-afters/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !p.isFeatured }),
      })
      if (!r.ok) throw new Error('更新失敗')
      onChange()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失敗')
    }
  }

  function remove(p: AdminBeforeAfter) {
    confirm({
      title: '刪除這組對比圖？',
      body: 'Before 與 After 兩張圖會一併從 R2 移除。',
      destructive: true,
      onConfirm: async () => {
        try {
          const r = await fetch(`/api/admin/services/${serviceId}/before-afters/${p.id}`, {
            method: 'DELETE',
          })
          const data = await r.json()
          if (!r.ok) throw new Error(data.error || '刪除失敗')
          onChange()
          toast.success('已刪除')
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '刪除失敗')
        }
      },
    })
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm text-ink-soft">{pairs.length} 組對比</span>
        <button onClick={() => setCreateOpen(true)} className="btn-primary !py-2 !px-4 !text-sm">
          <Plus className="h-4 w-4" />
          新增對比
        </button>
      </div>

      {pairs.length === 0 ? (
        <div className="text-sm text-ink-muted text-center py-10 rounded-lg border border-dashed border-hairline">
          此區塊尚未新增任何對比圖
        </div>
      ) : (
        <ul className="space-y-3">
          {pairs.map((p) => (
            <li key={p.id} className="rounded-lg border border-hairline bg-white p-3">
              <div className="flex items-start gap-3">
                <div className="grid grid-cols-2 gap-1.5 shrink-0 w-44">
                  <Pane url={p.beforeUrl} label="前" />
                  <Pane url={p.afterUrl} label="後" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ink line-clamp-1">
                    {p.caption ?? '（未填說明）'}
                  </div>
                  {p.location && (
                    <div className="mt-0.5 text-xs text-ink-muted">{p.location}</div>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => toggleFeatured(p)}
                    className={
                      p.isFeatured
                        ? 'text-amber-500 hover:bg-amber-50 rounded-md p-1.5 transition'
                        : 'text-ink-soft hover:text-amber-500 hover:bg-amber-50 rounded-md p-1.5 transition'
                    }
                    title={p.isFeatured ? '取消首頁精選' : '設為首頁精選'}
                  >
                    {p.isFeatured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setEditing(p)}
                    className="text-ink-soft hover:text-primary-deep hover:bg-primary/10 rounded-md p-1.5 transition"
                    title="編輯"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="text-ink-soft hover:text-danger hover:bg-danger/10 rounded-md p-1.5 transition"
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
        open={createOpen || editing !== null}
        onClose={() => {
          setCreateOpen(false)
          setEditing(null)
        }}
        serviceId={serviceId}
        sectionId={sectionId}
        editing={editing}
        defaultOrder={pairs.length}
        onSaved={onChange}
      />

      {confirmNode}
    </>
  )
}

function Pane({ url, label }: { url: string; label: string }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded bg-bg-soft">
      <Image src={url} alt={label} fill className="object-cover" unoptimized sizes="100px" />
      <span className="absolute left-1 top-1 rounded bg-ink/70 px-1 text-[10px] text-white">
        {label}
      </span>
    </div>
  )
}
