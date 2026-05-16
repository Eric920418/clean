'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminModal } from '@/components/admin/admin-modal'
import { Field, inputClass } from '@/components/admin/form-field'
import { RichTextEditor } from '@/components/admin/rich-text-editor-loader'
import { ErrorBanner } from '@/components/admin/error-banner'
import { cn } from '@/lib/utils'
import type { AdminTestimonial, AdminService } from '@/lib/admin-types'

const empty = {
  authorName: '',
  authorMeta: '',
  rating: 5,
  content: '',
  serviceId: '' as string | number,
  isActive: true,
  order: 0,
}
type FormState = typeof empty

export default function TestimonialsPage() {
  const [items, setItems] = useState<AdminTestimonial[]>([])
  const [services, setServices] = useState<AdminService[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminTestimonial | null>(null)
  const [form, setForm] = useState<FormState>(empty)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function fetchAll() {
    setLoading(true)
    try {
      const [tRes, sRes] = await Promise.all([
        fetch('/api/admin/testimonials'),
        fetch('/api/admin/services'),
      ])
      const t = await tRes.json()
      const s = await sRes.json()
      if (!tRes.ok) throw new Error(t.error || '讀取失敗')
      if (!sRes.ok) throw new Error(s.error || '讀取服務失敗')
      setItems(t)
      setServices(s)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '讀取失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm({ ...empty, order: items.length })
    setError(null)
    setOpen(true)
  }

  function openEdit(it: AdminTestimonial) {
    setEditing(it)
    setForm({
      authorName: it.authorName,
      authorMeta: it.authorMeta ?? '',
      rating: it.rating,
      content: it.content,
      serviceId: it.serviceId ?? '',
      isActive: it.isActive,
      order: it.order,
    })
    setError(null)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const url = editing
        ? `/api/admin/testimonials/${editing.id}`
        : '/api/admin/testimonials'
      const r = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          serviceId: form.serviceId === '' ? null : form.serviceId,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '儲存失敗')
      toast.success(editing ? '已更新' : '已新增')
      setOpen(false)
      fetchAll()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '儲存失敗'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(it: AdminTestimonial) {
    if (!confirm(`刪除「${it.authorName}」的評價？`)) return
    try {
      const r = await fetch(`/api/admin/testimonials/${it.id}`, { method: 'DELETE' })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '刪除失敗')
      toast.success('已刪除')
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '刪除失敗')
    }
  }

  async function toggleActive(it: AdminTestimonial) {
    try {
      const r = await fetch(`/api/admin/testimonials/${it.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !it.isActive }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '切換失敗')
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '切換失敗')
    }
  }

  return (
    <>
      <AdminPageHeader
        title="客戶評價"
        description="顯示在首頁的客戶見證"
        actions={
          <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-sm">
            <Plus className="h-4 w-4" />
            新增評價
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-primary-deep animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-bg-soft py-20 text-center text-ink-muted">
          尚未新增任何客戶評價
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article
              key={it.id}
              className={cn(
                'rounded-xl border bg-white p-5 transition',
                it.isActive ? 'border-hairline' : 'border-hairline-soft opacity-60',
              )}
            >
              <div className="flex items-center gap-1 text-warn">
                {Array.from({ length: it.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-warn" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft line-clamp-4">
                「{it.content}」
              </p>
              <div className="mt-4 pt-3 border-t border-hairline-soft">
                <div className="text-sm font-medium text-ink">{it.authorName}</div>
                {it.authorMeta && (
                  <div className="text-xs text-ink-muted">{it.authorMeta}</div>
                )}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => toggleActive(it)}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium transition',
                    it.isActive
                      ? 'bg-primary/10 text-primary-deep hover:bg-primary/15'
                      : 'bg-bg-soft text-ink-muted hover:bg-hairline',
                  )}
                >
                  {it.isActive ? '上架中' : '已下架'}
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(it)}
                    className="rounded-md p-1.5 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition"
                    title="編輯"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(it)}
                    className="rounded-md p-1.5 text-ink-soft hover:text-danger hover:bg-danger/10 transition"
                    title="刪除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? '編輯評價' : '新增評價'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorBanner message={error} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="客戶署名" required>
              <input
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                className={inputClass}
                placeholder="林小姐"
                required
              />
            </Field>
            <Field label="補充資訊" hint="例：「台北・洗冷氣」">
              <input
                value={form.authorMeta}
                onChange={(e) => setForm({ ...form, authorMeta: e.target.value })}
                className={inputClass}
                placeholder="台北・洗冷氣 + 洗衣機"
              />
            </Field>
          </div>

          <Field label="評價內容" required>
            <RichTextEditor
              value={form.content}
              onContentChange={(html) => setForm({ ...form, content: html })}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="評分">
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}
                className={inputClass}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} 星
                  </option>
                ))}
              </select>
            </Field>
            <Field label="關聯服務" hint="可不填">
              <select
                value={form.serviceId}
                onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                className={inputClass}
              >
                <option value="">— 不指定 —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="排序">
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </Field>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary"
            />
            上架顯示
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-hairline -mx-6 px-6 -mb-6 pb-4 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-ghost !py-2 !px-4 !text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary !py-2 !px-4 !text-sm disabled:opacity-60"
            >
              {submitting ? '儲存中…' : editing ? '更新' : '新增'}
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  )
}
