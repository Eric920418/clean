'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminModal } from '@/components/admin/admin-modal'
import { Field, inputClass } from '@/components/admin/form-field'
import { ErrorBanner } from '@/components/admin/error-banner'
import { useConfirm } from '@/components/admin/confirm-dialog'
import { RichTextEditor } from '@/components/admin/rich-text-editor-loader'
import { RichText } from '@/components/rich-text'
import type { AdminProcessStep } from '@/lib/admin-types'
import { swapOrderByIndex } from '@/lib/admin-reorder'

type FormState = { step: string; title: string; desc: string }
const emptyForm: FormState = { step: '', title: '', desc: '' }

export default function ProcessStepsPage() {
  const [items, setItems] = useState<AdminProcessStep[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProcessStep | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { confirm, node: confirmNode } = useConfirm()

  async function fetchAll() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/process-steps')
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

  function openCreate() {
    setEditing(null)
    const nextStepNum = String(items.length + 1).padStart(2, '0')
    setForm({ ...emptyForm, step: nextStepNum })
    setError(null)
    setOpen(true)
  }

  function openEdit(it: AdminProcessStep) {
    setEditing(it)
    setForm({ step: it.step, title: it.title, desc: it.desc })
    setError(null)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const url = editing ? `/api/admin/process-steps/${editing.id}` : '/api/admin/process-steps'
      const r = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

  function remove(it: AdminProcessStep) {
    confirm({
      title: `刪除步驟「${it.step} ${it.title}」？`,
      body: '刪除後此步驟不會出現在首頁。此動作無法還原。',
      destructive: true,
      onConfirm: async () => {
        try {
          const r = await fetch(`/api/admin/process-steps/${it.id}`, { method: 'DELETE' })
          const data = await r.json()
          if (!r.ok) throw new Error(data.error || '刪除失敗')
          toast.success('已刪除')
          fetchAll()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '刪除失敗')
        }
      },
    })
  }

  async function move(it: AdminProcessStep, dir: 'up' | 'down') {
    try {
      const moved = await swapOrderByIndex(
        items,
        it.id,
        dir,
        (pid) => `/api/admin/process-steps/${pid}`,
      )
      if (moved) fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? `排序失敗：${err.message}` : '排序失敗')
    }
  }

  return (
    <>
      <AdminPageHeader
        title="服務流程"
        description="首頁「四步驟」服務流程區塊，可新增刪除排序"
        actions={
          <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-sm">
            <Plus className="h-4 w-4" />
            新增步驟
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-primary-deep animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-bg-soft py-20 text-center text-ink-muted">
          尚未新增任何步驟
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it, idx) => (
            <article key={it.id} className="rounded-xl border border-hairline bg-white p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg-tint font-display text-base font-bold tracking-widest text-primary-deep">
                  {it.step}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-ink">{it.title}</h3>
                  <RichText
                    html={it.desc}
                    className="mt-1 text-sm text-ink-soft prose-sm"
                  />
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => move(it, 'up')}
                    disabled={idx === 0}
                    className="rounded-md p-1.5 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="上移"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => move(it, 'down')}
                    disabled={idx === items.length - 1}
                    className="rounded-md p-1.5 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="下移"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
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

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? '編輯步驟' : '新增步驟'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorBanner message={error} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr]">
            <Field label="步驟編號" required hint="例：01">
              <input
                value={form.step}
                onChange={(e) => setForm({ ...form, step: e.target.value })}
                className={inputClass}
                placeholder="01"
                required
              />
            </Field>
            <Field label="標題" required>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                placeholder="諮詢登記"
                required
              />
            </Field>
          </div>

          <Field label="描述" required hint="支援粗體、列表、超連結、HTML 嵌入等富文本">
            <RichTextEditor
              value={form.desc}
              onContentChange={(html) => setForm({ ...form, desc: html })}
              placeholder="Line 或表單填寫需求，30 分鐘內專人聯繫。"
              height="160px"
            />
          </Field>

          <div className="flex justify-end gap-2 pt-4 border-t border-hairline -mx-4 px-4 -mb-4 pb-4 sm:-mx-5 sm:px-5 sm:-mb-5 md:-mx-6 md:px-6 md:-mb-6 sticky bottom-0 bg-white">
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

      {confirmNode}
    </>
  )
}
