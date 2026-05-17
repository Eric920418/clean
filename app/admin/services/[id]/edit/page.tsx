'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ImageIcon, ArrowLeft, Loader2, Save, LayoutTemplate } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Field, inputClass, textareaClass } from '@/components/admin/form-field'
import { ErrorBanner } from '@/components/admin/error-banner'
import { ImageUploader } from '@/components/admin/image-uploader'
import type { AdminService } from '@/lib/admin-types'

type PageProps = { params: Promise<{ id: string }> }

export default function ServiceEditPage({ params }: PageProps) {
  const { id } = use(params)
  const [service, setService] = useState<AdminService | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchService() {
    setLoading(true)
    try {
      const r = await fetch(`/api/admin/services/${id}`)
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '讀取失敗')
      setService(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchService()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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
        title={service.name}
        description="維護服務主欄位，以及對比圖與圖庫子頁連結；FAQ、Hero、特色清單等內容請至「頁面區塊管理」對應區塊編輯"
        breadcrumb={[
          { label: '服務管理', href: '/admin/services' },
          { label: service.name },
        ]}
        actions={
          <Link
            href={`/services/${service.slug}`}
            target="_blank"
            className="btn-ghost !py-2 !text-sm"
          >
            前台預覽
          </Link>
        }
      />

      <MainFieldsPanel service={service} onChange={fetchService} />

      {/* 子頁面快速連結 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-8">
        <Link
          href={`/admin/services/${id}/sections`}
          className="card-hover flex items-center gap-3 rounded-xl border border-primary-deep/30 bg-primary/5 p-5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
            <LayoutTemplate className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-ink">頁面區塊管理</div>
            <div className="text-xs text-ink-muted">調整顯示順序、新增同類型區塊</div>
          </div>
          <span className="text-primary-deep text-sm">前往 →</span>
        </Link>
        <Link
          href={`/admin/services/${id}/before-afters`}
          className="card-hover flex items-center gap-3 rounded-xl border border-hairline bg-white p-5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-bg-tint text-primary-deep">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-ink">前後對比圖管理</div>
            <div className="text-xs text-ink-muted">
              {service._count?.beforeAfters ?? 0} 組對比圖
            </div>
          </div>
          <span className="text-primary-deep text-sm">前往 →</span>
        </Link>
        <Link
          href={`/admin/services/${id}/gallery`}
          className="card-hover flex items-center gap-3 rounded-xl border border-hairline bg-white p-5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent-deep">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-ink">服務圖庫</div>
            <div className="text-xs text-ink-muted">
              {service._count?.galleryImgs ?? 0} 張展示圖
            </div>
          </div>
          <span className="text-primary-deep text-sm">前往 →</span>
        </Link>
      </div>

    </>
  )
}

/* ================================================================ */
function MainFieldsPanel({
  service,
  onChange,
}: {
  service: AdminService
  onChange: () => void
}) {
  const [form, setForm] = useState({
    name: service.name,
    shortDesc: service.shortDesc,
    cardImage: service.cardImage ?? '',
    isActive: service.isActive,
    isFeatured: service.isFeatured,
    seoTitle: service.seoTitle ?? '',
    seoDesc: service.seoDesc ?? '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const r = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '儲存失敗')
      toast.success('已更新')
      onChange()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '儲存失敗'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mb-8 rounded-xl border border-hairline bg-white p-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">主欄位</h2>
          <p className="text-xs text-ink-muted mt-0.5">服務名稱、描述、圖片、SEO、上下架</p>
        </div>
        <span className="text-xs text-ink-muted font-mono">slug: {service.slug}</span>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorBanner message={error} />

        <Field label="服務名稱" required>
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

        <div className="rounded-md border border-hairline-soft bg-bg-soft px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
          詳細描述（「為什麼這項服務重要？」主文）已移至 sections 子頁。請到{' '}
          <Link
            href={`/admin/services/${service.id}/sections`}
            className="text-primary-deep underline underline-offset-2 hover:no-underline"
          >
            頁面區塊管理
          </Link>{' '}
          → 點「重點說明 + 特色清單」進入內容管理頁編輯。
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="卡片圖（首頁/列表用）">
            <ImageUploader
              value={form.cardImage}
              onChange={(url) => setForm({ ...form, cardImage: url })}
              folder="services"
            />
          </Field>
          <div className="rounded-lg border border-dashed border-hairline bg-bg-soft p-4 text-sm leading-relaxed">
            <div className="font-medium text-ink mb-1">Hero 背景圖在哪改？</div>
            <p className="text-ink-soft">
              詳情頁頂部 Hero 區塊的大圖請至{' '}
              <Link
                href={`/admin/services/${service.id}/sections`}
                className="text-primary-deep underline underline-offset-2 hover:no-underline"
              >
                頁面區塊管理 → Hero 區塊 ✏️
              </Link>{' '}
              設定，避免兩個入口設定不一致。
            </p>
          </div>
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
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary"
            />
            首頁精選
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-hairline-soft">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary !py-2 !px-4 !text-sm disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {submitting ? '儲存中…' : '儲存主欄位'}
          </button>
        </div>
      </form>
    </section>
  )
}
