'use client'

import { useState } from 'react'
import { Plus, Save, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { inputClass } from '@/components/admin/form-field'
import { useConfirm } from '@/components/admin/confirm-dialog'
import { RichTextEditor } from '@/components/admin/rich-text-editor-loader'
import { RichText } from '@/components/rich-text'
import type { AdminServiceFaq } from '@/lib/admin-types'

type Props = {
  serviceId: number
  sectionId: number
  faqs: AdminServiceFaq[]
  onChange: () => void
}

export function FaqsEditor({ serviceId, sectionId, faqs, onChange }: Props) {
  const [adding, setAdding] = useState(false)
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [busy, setBusy] = useState(false)
  const { confirm, node: confirmNode } = useConfirm()

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
          sectionId,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '新增失敗')
      setQ('')
      setA('')
      setAdding(false)
      onChange()
      toast.success('已新增 FAQ')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '新增失敗')
    } finally {
      setBusy(false)
    }
  }

  function remove(id: number) {
    confirm({
      title: '刪除這則 FAQ？',
      destructive: true,
      onConfirm: async () => {
        try {
          const r = await fetch(`/api/admin/services/${serviceId}/faqs/${id}`, {
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
      <ul className="space-y-3 mb-4">
        {faqs.length === 0 && !adding && (
          <li className="text-sm text-ink-muted text-center py-6 rounded-lg border border-dashed border-hairline">
            此區塊尚未新增任何 FAQ
          </li>
        )}
        {faqs.map((f) => (
          <FaqRow key={f.id} faq={f} serviceId={serviceId} onChange={onChange} onDelete={remove} />
        ))}
      </ul>

      {adding ? (
        <div className="space-y-2 rounded-lg border border-hairline-soft bg-bg-soft p-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="問題"
            className={inputClass}
          />
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="答案"
            className={textareaClass}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setAdding(false)} className="btn-ghost !py-1.5 !text-sm">
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
          onClick={() => setAdding(true)}
          className="btn-ghost !py-2 !text-sm w-full justify-center border border-dashed border-hairline"
        >
          <Plus className="h-4 w-4" />
          新增 FAQ
        </button>
      )}
      {confirmNode}
    </>
  )
}

function FaqRow({
  faq,
  serviceId,
  onChange,
  onDelete,
}: {
  faq: AdminServiceFaq
  serviceId: number
  onChange: () => void
  onDelete: (id: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [q, setQ] = useState(faq.question)
  const [a, setA] = useState(faq.answer)
  const dirty = q !== faq.question || a !== faq.answer

  async function save() {
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, answer: a }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '更新失敗')
      toast.success('已儲存')
      setEditing(false)
      onChange()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失敗')
    }
  }

  if (!editing) {
    return (
      <li className="rounded-lg border border-hairline bg-white p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-ink">{faq.question}</div>
            <p className="mt-1 text-xs text-ink-soft whitespace-pre-line line-clamp-3">{faq.answer}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => setEditing(true)}
              className="text-ink-soft hover:text-primary-deep hover:bg-primary/10 rounded-md p-1.5 transition"
              title="編輯"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(faq.id)}
              className="text-ink-soft hover:text-danger hover:bg-danger/10 rounded-md p-1.5 transition"
              title="刪除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className="rounded-lg border border-hairline bg-white p-3 space-y-2">
      <input value={q} onChange={(e) => setQ(e.target.value)} className={inputClass} />
      <textarea value={a} onChange={(e) => setA(e.target.value)} className={textareaClass} rows={3} />
      <div className="flex justify-end gap-2">
        <button onClick={() => setEditing(false)} className="btn-ghost !py-1.5 !text-sm">
          取消
        </button>
        <button
          onClick={save}
          disabled={!dirty}
          className="btn-primary !py-1.5 !px-3 !text-sm disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          儲存
        </button>
      </div>
    </li>
  )
}
