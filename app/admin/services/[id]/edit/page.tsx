'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { Plus, Trash2, ImageIcon, MessageSquare, ArrowLeft, Loader2, Save, LayoutTemplate } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Field, inputClass, textareaClass } from '@/components/admin/form-field'
import { ErrorBanner } from '@/components/admin/error-banner'
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
        description="維護服務的特色 bullet、常見問題、對比圖與圖庫"
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
          features={service.features ?? []}
          onChange={fetchService}
        />
        <FaqsPanel
          serviceId={service.id}
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
  features,
  onChange,
}: {
  serviceId: number
  features: AdminServiceFeature[]
  onChange: () => void
}) {
  const [newText, setNewText] = useState('')
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!newText.trim()) return
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText.trim(), order: features.length }),
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
  faqs,
  onChange,
}: {
  serviceId: number
  faqs: AdminServiceFaq[]
  onChange: () => void
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!q.trim() || !a.trim()) return
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.trim(),
          answer: a.trim(),
          order: faqs.length,
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

      {open ? (
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
            <textarea
              value={a}
              onChange={(e) => setA(e.target.value)}
              className={textareaClass}
              rows={3}
              placeholder="一般家庭建議每年清洗一次..."
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
            <p className="mt-1.5 text-xs text-ink-soft leading-relaxed pl-5">
              {faq.answer}
            </p>
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
      <textarea
        value={a}
        onChange={(e) => setA(e.target.value)}
        className={textareaClass}
        rows={3}
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
