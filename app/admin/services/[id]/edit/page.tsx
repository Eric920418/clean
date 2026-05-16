'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { Plus, Trash2, ImageIcon, MessageSquare, ArrowLeft, Loader2, Save, LayoutTemplate } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Field, inputClass, textareaClass } from '@/components/admin/form-field'
import { RichTextEditor } from '@/components/admin/rich-text-editor-loader'
import { RichText } from '@/components/rich-text'
import { ErrorBanner } from '@/components/admin/error-banner'
import { ImageUploader } from '@/components/admin/image-uploader'
import type { AdminService, AdminServiceFeature, AdminServiceFaq } from '@/lib/admin-types'

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
        description="維護服務的主欄位、特色 bullet、常見問題，以及對比圖與圖庫子頁連結"
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FeaturesPanel
          serviceId={service.id}
          sectionId={service.sections?.find((s) => s.type === 'why_with_features')?.id ?? null}
          features={service.features ?? []}
          onChange={fetchService}
        />
        <FaqsPanel
          serviceId={service.id}
          sectionId={service.sections?.find((s) => s.type === 'faq')?.id ?? null}
          faqs={service.faqs ?? []}
          onChange={fetchService}
        />
      </div>
    </>
  )
}

/* ================================================================ */
function FeaturesPanel({
  serviceId,
  sectionId,
  features,
  onChange,
}: {
  serviceId: number
  sectionId: number | null
  features: AdminServiceFeature[]
  onChange: () => void
}) {
  const [newText, setNewText] = useState('')
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!newText.trim()) return
    if (sectionId === null) {
      toast.error('此服務尚無「服務重點」區塊，請先到「頁面區塊管理」新增 why_with_features 區塊')
      return
    }
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText.trim(), order: features.length, sectionId }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '新增失敗')
      setNewText('')
      onChange()
      toast.success('已新增特色')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '新增失敗')
    } finally {
      setBusy(false)
    }
  }

  async function update(id: number, text: string) {
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/features/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '更新失敗')
      toast.success('已儲存')
      onChange()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失敗')
    }
  }

  async function remove(id: number) {
    if (!confirm('確定刪除這條特色？')) return
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/features/${id}`, {
        method: 'DELETE',
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '刪除失敗')
      onChange()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '刪除失敗')
    }
  }

  return (
    <section className="rounded-xl border border-hairline bg-white p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">服務特色</h2>
          <p className="text-xs text-ink-muted mt-0.5">顯示在詳情頁的「服務重點」清單</p>
        </div>
        <span className="text-xs text-ink-muted">{features.length} 條</span>
      </header>

      <ul className="space-y-2 mb-4">
        {features.length === 0 && (
          <li className="text-sm text-ink-muted text-center py-6">尚未新增特色</li>
        )}
        {features.map((f) => (
          <FeatureRow key={f.id} feature={f} onUpdate={update} onDelete={remove} />
        ))}
      </ul>

      {sectionId === null ? (
        <div className="pt-3 border-t border-hairline-soft text-sm leading-relaxed text-ink-soft">
          此服務尚未建立「服務重點」區塊（why_with_features），請先到{' '}
          <Link
            href={`/admin/services/${serviceId}/sections`}
            className="text-primary-deep underline underline-offset-2 hover:no-underline"
          >
            頁面區塊管理
          </Link>{' '}
          新增該區塊才能加特色。
        </div>
      ) : (
        <div className="flex gap-2 pt-3 border-t border-hairline-soft">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            className={inputClass}
            placeholder="新增特色，如：全拆解清洗風輪、鋁片、排水盤"
          />
          <button
            onClick={add}
            disabled={busy || !newText.trim()}
            className="btn-primary !py-2 !px-3 !text-sm disabled:opacity-60 shrink-0"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  )
}

function FeatureRow({
  feature,
  onUpdate,
  onDelete,
}: {
  feature: AdminServiceFeature
  onUpdate: (id: number, text: string) => void
  onDelete: (id: number) => void
}) {
  const [text, setText] = useState(feature.text)
  const dirty = text !== feature.text

  return (
    <li className="flex items-center gap-2 group">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={inputClass}
      />
      {dirty && (
        <button
          onClick={() => onUpdate(feature.id, text)}
          className="text-primary-deep hover:bg-primary/10 rounded-md p-1.5 transition shrink-0"
          title="儲存"
        >
          <Save className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => onDelete(feature.id)}
        className="text-ink-muted hover:text-danger hover:bg-danger/10 rounded-md p-1.5 transition shrink-0"
        title="刪除"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}

/* ================================================================ */
function FaqsPanel({
  serviceId,
  sectionId,
  faqs,
  onChange,
}: {
  serviceId: number
  sectionId: number | null
  faqs: AdminServiceFaq[]
  onChange: () => void
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!q.trim() || !a.trim()) return
    if (sectionId === null) {
      toast.error('此服務尚無「常見問題」區塊，請先到「頁面區塊管理」新增 faq 區塊')
      return
    }
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.trim(),
          answer: a.trim(),
          order: faqs.length,
          sectionId,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '新增失敗')
      setQ('')
      setA('')
      setOpen(false)
      onChange()
      toast.success('已新增 FAQ')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '新增失敗')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: number) {
    if (!confirm('確定刪除這條 FAQ？')) return
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/faqs/${id}`, {
        method: 'DELETE',
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '刪除失敗')
      onChange()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '刪除失敗')
    }
  }

  async function update(faq: AdminServiceFaq, patch: Partial<AdminServiceFaq>) {
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '更新失敗')
      toast.success('已儲存')
      onChange()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失敗')
    }
  }

  return (
    <section className="rounded-xl border border-hairline bg-white p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">常見問題</h2>
          <p className="text-xs text-ink-muted mt-0.5">顯示在詳情頁底部 FAQ 區塊</p>
        </div>
        <span className="text-xs text-ink-muted">{faqs.length} 條</span>
      </header>

      <ul className="space-y-3 mb-4">
        {faqs.length === 0 && (
          <li className="text-sm text-ink-muted text-center py-6">尚未新增 FAQ</li>
        )}
        {faqs.map((f) => (
          <FaqRow key={f.id} faq={f} onUpdate={update} onDelete={remove} />
        ))}
      </ul>

      {sectionId === null ? (
        <div className="pt-3 border-t border-hairline-soft text-sm leading-relaxed text-ink-soft">
          此服務尚未建立「常見問題」區塊（faq），請先到{' '}
          <Link
            href={`/admin/services/${serviceId}/sections`}
            className="text-primary-deep underline underline-offset-2 hover:no-underline"
          >
            頁面區塊管理
          </Link>{' '}
          新增該區塊才能加 FAQ。
        </div>
      ) : open ? (
        <div className="space-y-2 pt-3 border-t border-hairline-soft">
          <Field label="問題">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={inputClass}
              placeholder="多久應該洗一次冷氣？"
            />
          </Field>
          <Field label="答案">
            <RichTextEditor
              value={a}
              onContentChange={(html) => setA(html)}
              placeholder="一般家庭建議每年清洗一次..."
              height="180px"
            />
          </Field>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setOpen(false)
                setQ('')
                setA('')
              }}
              className="btn-ghost !py-1.5 !px-3 !text-sm"
            >
              取消
            </button>
            <button
              onClick={add}
              disabled={busy || !q.trim() || !a.trim()}
              className="btn-primary !py-1.5 !px-3 !text-sm disabled:opacity-60"
            >
              新增
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-hairline py-3 text-sm text-ink-soft hover:border-primary hover:bg-bg-tint/40 hover:text-primary-deep transition"
        >
          <Plus className="h-4 w-4" />
          新增一條 FAQ
        </button>
      )}
    </section>
  )
}

function FaqRow({
  faq,
  onUpdate,
  onDelete,
}: {
  faq: AdminServiceFaq
  onUpdate: (faq: AdminServiceFaq, patch: Partial<AdminServiceFaq>) => void
  onDelete: (id: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [q, setQ] = useState(faq.question)
  const [a, setA] = useState(faq.answer)

  if (!editing) {
    return (
      <li className="rounded-lg border border-hairline-soft bg-bg-soft/40 p-3 group">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink flex items-start gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 mt-1 text-primary-deep shrink-0" />
              {faq.question}
            </p>
            <RichText
              html={faq.answer}
              className="mt-1.5 text-xs text-ink-soft leading-relaxed pl-5 prose-sm"
            />
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-primary-deep hover:underline"
            >
              編輯
            </button>
            <span className="text-ink-muted">·</span>
            <button
              onClick={() => onDelete(faq.id)}
              className="text-xs text-danger hover:underline"
            >
              刪除
            </button>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
      <input value={q} onChange={(e) => setQ(e.target.value)} className={inputClass} />
      <RichTextEditor
        value={a}
        onContentChange={(html) => setA(html)}
        height="180px"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setEditing(false)
            setQ(faq.question)
            setA(faq.answer)
          }}
          className="btn-ghost !py-1 !px-2 !text-xs"
        >
          取消
        </button>
        <button
          onClick={() => {
            onUpdate(faq, { question: q, answer: a })
            setEditing(false)
          }}
          className="btn-primary !py-1 !px-2 !text-xs"
        >
          儲存
        </button>
      </div>
    </li>
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
    longDesc: service.longDesc,
    icon: service.icon ?? '',
    cardImage: service.cardImage ?? '',
    isActive: service.isActive,
    isFeatured: service.isFeatured,
    order: service.order,
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

        <Field label="詳細描述" required hint="顯示在服務詳情頁「為什麼這項服務重要？」區塊主文">
          <RichTextEditor
            value={form.longDesc}
            onContentChange={(html) => setForm({ ...form, longDesc: html })}
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
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
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
