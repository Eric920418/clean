'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2, ExternalLink, Sparkles, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminModal } from '@/components/admin/admin-modal'
import { Field, inputClass, textareaClass } from '@/components/admin/form-field'
import { ErrorBanner } from '@/components/admin/error-banner'
import { ImageUploader } from '@/components/admin/image-uploader'
import { cn } from '@/lib/utils'
import type { AdminService } from '@/lib/admin-types'

const emptyForm = {
  name: '',
  shortDesc: '',
  longDesc: '',
  icon: '',
  heroImage: '',
  cardImage: '',
  isActive: true,
  isFeatured: false,
  order: 0,
  seoTitle: '',
  seoDesc: '',
}

type FormState = typeof emptyForm

export default function ServicesAdminPage() {
  const [services, setServices] = useState<AdminService[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchServices() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/services')
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '讀取失敗')
      setServices(data)
    } catch (err) {
      toast.error(`讀取失敗：${err instanceof Error ? err.message : err}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  function openCreate() {
    setForm(emptyForm)
    setError(null)
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const r = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '建立失敗')

      toast.success('已新增')
      setModalOpen(false)
      fetchServices()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '建立失敗'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(s: AdminService) {
    const beforeCount = s._count?.beforeAfters ?? 0
    const galleryCount = s._count?.galleryImgs ?? 0
    const warning =
      beforeCount + galleryCount > 0
        ? `這個服務底下有 ${beforeCount} 組對比圖、${galleryCount} 張圖庫，刪除後一併消失。`
        : ''
    if (!confirm(`確定刪除「${s.name}」？\n${warning}\n此動作無法還原。`)) return

    try {
      const r = await fetch(`/api/admin/services/${s.id}`, { method: 'DELETE' })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '刪除失敗')
      toast.success('已刪除')
      fetchServices()
    } catch (err) {
      toast.error(`刪除失敗：${err instanceof Error ? err.message : err}`)
    }
  }

  async function move(service: AdminService, dir: 'up' | 'down') {
    const sorted = [...services].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((s) => s.id === service.id)
    const swap = dir === 'up' ? sorted[idx - 1] : sorted[idx + 1]
    if (!swap) return

    try {
      await Promise.all([
        fetch(`/api/admin/services/${service.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: swap.order }),
        }),
        fetch(`/api/admin/services/${swap.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: service.order }),
        }),
      ])
      fetchServices()
    } catch (err) {
      toast.error('排序失敗')
    }
  }

  async function toggleActive(s: AdminService) {
    try {
      const r = await fetch(`/api/admin/services/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !s.isActive }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '切換失敗')
      fetchServices()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '切換失敗')
    }
  }

  return (
    <>
      <AdminPageHeader
        title="服務管理"
        description="維護服務項目的基本資料、卡片圖、SEO 與排序"
        actions={
          <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-sm">
            <Plus className="h-4 w-4" />
            新增服務
          </button>
        }
      />

      <div className="overflow-x-auto rounded-xl border border-hairline bg-white">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium w-20">排序</th>
              <th className="px-4 py-3 font-medium">服務</th>
              <th className="px-4 py-3 font-medium text-center">狀態</th>
              <th className="px-4 py-3 font-medium text-center">內容</th>
              <th className="px-4 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-ink-muted">
                  載入中…
                </td>
              </tr>
            )}
            {!loading && services.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-ink-muted">
                  尚未建立任何服務 — 點右上「新增服務」開始
                </td>
              </tr>
            )}
            {!loading &&
              services.map((s, i) => (
                <tr key={s.id} className="hover:bg-bg-soft/60 transition">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => move(s, 'up')}
                        disabled={i === 0}
                        className="text-ink-muted hover:text-primary-deep disabled:opacity-30"
                        aria-label="上移"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => move(s, 'down')}
                        disabled={i === services.length - 1}
                        className="text-ink-muted hover:text-primary-deep disabled:opacity-30"
                        aria-label="下移"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md border border-hairline bg-bg-soft shrink-0">
                        {s.cardImage ? (
                          <Image
                            src={s.cardImage}
                            alt={s.name}
                            fill
                            className="object-cover"
                            unoptimized
                            sizes="48px"
                          />
                        ) : (
                          <Sparkles className="h-5 w-5 text-ink-muted absolute inset-0 m-auto" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-ink">{s.name}</div>
                        <div className="text-xs text-ink-muted line-clamp-1 max-w-md">
                          {s.shortDesc}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(s)}
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium transition',
                        s.isActive
                          ? 'bg-primary/10 text-primary-deep hover:bg-primary/15'
                          : 'bg-bg-soft text-ink-muted hover:bg-hairline',
                      )}
                    >
                      {s.isActive ? '上架中' : '已下架'}
                    </button>
                    {s.isFeatured && (
                      <span className="ml-1 inline-block rounded-full bg-accent/10 text-accent-deep px-2 py-0.5 text-xs">
                        精選
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-ink-soft">
                    <span className="inline-flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {s._count?.beforeAfters ?? 0} 組對比 ・ {s._count?.galleryImgs ?? 0} 圖庫
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/services/${s.id}/edit`}
                        className="rounded-md p-1.5 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition"
                        title="編輯主欄位、特色、FAQ"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/services/${s.slug}`}
                        target="_blank"
                        className="rounded-md p-1.5 text-ink-soft hover:text-accent-deep hover:bg-accent/10 transition"
                        title="前台預覽"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(s)}
                        className="rounded-md p-1.5 text-ink-soft hover:text-danger hover:bg-danger/10 transition"
                        title="刪除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="xl"
        title="新增服務"
        description="建立後點列表上的 ✏️ 進入編輯頁，繼續維護圖片、特色、FAQ、對比圖與頁面區塊"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorBanner message={error} />

          <Field
            label="服務名稱"
            required
            hint="存檔後系統會自動依名稱產生網址（之後不可改）"
          >
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="冷氣機深度清洗"
              required
            />
          </Field>

          <Field label="卡片摘要" required hint="顯示在首頁與列表卡片，建議 80 字內">
            <textarea
              value={form.shortDesc}
              onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
              className={textareaClass}
              rows={2}
              required
            />
          </Field>

          <Field label="詳細描述" required hint="顯示在服務詳情頁「為什麼這項服務重要？」區塊主文">
            <textarea
              value={form.longDesc}
              onChange={(e) => setForm({ ...form, longDesc: e.target.value })}
              className={textareaClass}
              rows={5}
              required
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Lucide icon 名稱" hint="如 Wind / Droplets / Sparkles / ShieldCheck">
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className={inputClass}
                placeholder="Wind"
              />
            </Field>
            <Field label="排序" hint="數字越小越前面">
              <input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: parseInt(e.target.value) || 0 })
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="卡片圖（首頁/列表用）">
              <ImageUploader
                value={form.cardImage}
                onChange={(url) => setForm({ ...form, cardImage: url })}
                folder="services"
              />
            </Field>
            <Field label="Hero 大圖（詳情頁頂部）">
              <ImageUploader
                value={form.heroImage}
                onChange={(url) => setForm({ ...form, heroImage: url })}
                folder="services"
              />
            </Field>
          </div>

          <div className="rounded-md bg-bg-soft border border-hairline p-3 space-y-2">
            <p className="text-xs font-medium text-ink-soft">SEO（選填）</p>
            <Field label="SEO 標題">
              <input
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                className={inputClass}
                placeholder="冷氣機深度清洗 | invisible care"
              />
            </Field>
            <Field label="SEO 描述">
              <input
                value={form.seoDesc}
                onChange={(e) => setForm({ ...form, seoDesc: e.target.value })}
                className={inputClass}
                placeholder="專業冷氣拆洗，提升 30% 冷房效能..."
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary"
              />
              上架
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm({ ...form, isFeatured: e.target.checked })
                }
                className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary"
              />
              首頁精選
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-hairline -mx-6 px-6 -mb-6 pb-4 mt-6 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-ghost !py-2 !px-4 !text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary !py-2 !px-4 !text-sm disabled:opacity-60"
            >
              {submitting ? '建立中…' : '建立'}
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  )
}
