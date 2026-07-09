'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminModal } from '@/components/admin/admin-modal'
import { Field, inputClass, textareaClass } from '@/components/admin/form-field'
import { RichTextEditor } from '@/components/admin/rich-text-editor-loader'
import { ErrorBanner } from '@/components/admin/error-banner'
import { useConfirm } from '@/components/admin/confirm-dialog'
import type { AdminGeneralFaq } from '@/lib/admin-types'
import { swapOrderByIndex } from '@/lib/admin-reorder'

type FormState = { question: string; answer: string; slug: string; metaDescription: string }
const emptyForm: FormState = { question: '', answer: '', slug: '', metaDescription: '' }

export default function GeneralFaqsPage() {
  const [items, setItems] = useState<AdminGeneralFaq[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminGeneralFaq | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { confirm, node: confirmNode } = useConfirm()

  // silent=true：重新抓取時不切回全頁 spinner，避免清單塌縮讓捲動位置跳回頂端。
  // 排序 / 存檔 / 新增 / 刪除都走 silent；只有首次載入顯示 spinner。詳見 README「列表操作後保留捲動位置」。
  async function fetchAll(opts?: { silent?: boolean }) {
    if (!opts?.silent) setLoading(true)
    try {
      const r = await fetch('/api/admin/general-faqs')
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '讀取失敗')
      setItems(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '讀取失敗')
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError(null)
    setOpen(true)
  }

  function openEdit(it: AdminGeneralFaq) {
    setEditing(it)
    setForm({
      question: it.question,
      answer: it.answer,
      slug: it.slug ?? '',
      metaDescription: it.metaDescription ?? '',
    })
    setError(null)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const url = editing ? `/api/admin/general-faqs/${editing.id}` : '/api/admin/general-faqs'
      const r = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '儲存失敗')
      toast.success(editing ? '已更新' : '已新增')
      setOpen(false)
      fetchAll({ silent: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '儲存失敗'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  function remove(it: AdminGeneralFaq) {
    confirm({
      title: `刪除這題 FAQ？`,
      body: `「${it.question}」刪除後不會出現在常見問題頁。此動作無法還原。`,
      destructive: true,
      onConfirm: async () => {
        try {
          const r = await fetch(`/api/admin/general-faqs/${it.id}`, { method: 'DELETE' })
          const data = await r.json()
          if (!r.ok) throw new Error(data.error || '刪除失敗')
          toast.success('已刪除')
          fetchAll({ silent: true })
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '刪除失敗')
        }
      },
    })
  }

  async function move(it: AdminGeneralFaq, dir: 'up' | 'down') {
    try {
      const moved = await swapOrderByIndex(
        items,
        it.id,
        dir,
        (fid) => `/api/admin/general-faqs/${fid}`,
      )
      if (moved) fetchAll({ silent: true })
    } catch (err) {
      toast.error(err instanceof Error ? `排序失敗：${err.message}` : '排序失敗')
    }
  }

  return (
    <>
      <AdminPageHeader
        title="常見問題（一般）"
        description="顯示在 /faq 頁上方「一般服務」區塊；不包含各服務專屬 FAQ"
        actions={
          <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-sm">
            <Plus className="h-4 w-4" />
            新增問題
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-primary-deep animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-bg-soft py-20 text-center text-ink-muted">
          尚未新增任何 FAQ
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it, idx) => (
            <article key={it.id} className="rounded-xl border border-hairline bg-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-ink">Q. {it.question}</h3>
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

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? '編輯 FAQ' : '新增 FAQ'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorBanner message={error} />

          <Field label="問題" required>
            <input
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className={inputClass}
              placeholder="預約後多久能安排施作？"
              required
            />
          </Field>

          <Field label="網址（slug）">
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={inputClass}
              placeholder="留空＝自動由問題產生；每題會有獨立網址 /faq/…"
            />
            {editing?.slug && (
              <a
                href={`/faq/${editing.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary-deep hover:underline"
              >
                前台預覽 /faq/{editing.slug} ↗
              </a>
            )}
          </Field>

          <Field
            label="SEO 描述（meta description）"
            hint={`顯示在 Google 搜尋結果的描述文字。留空＝自動擷取答案前 150 字；建議 60–90 字，過長會被搜尋引擎截斷。${
              form.metaDescription.trim() ? `（目前 ${form.metaDescription.trim().length} 字）` : ''
            }`}
          >
            <textarea
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              className={textareaClass}
              rows={2}
              placeholder="留空＝自動由答案產生。填寫可自訂搜尋結果顯示的描述。"
            />
          </Field>

          <Field label="回答" required>
            <RichTextEditor
              value={form.answer}
              onContentChange={(html) => setForm({ ...form, answer: html })}
              placeholder="一般情況下 1–3 天內可安排…"
              allowHeading4
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
