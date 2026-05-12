'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { AdminModal } from './admin-modal'
import { Field, inputClass, textareaClass } from './form-field'
import { ErrorBanner } from './error-banner'
import { ImageUploader } from './image-uploader'
import type { AdminBeforeAfter } from '@/lib/admin-types'

type Props = {
  open: boolean
  onClose: () => void
  serviceId: number
  /** 編輯既有 pair（null 為新增） */
  editing: AdminBeforeAfter | null
  onSaved: () => void
  /** 新建時帶入 order */
  defaultOrder?: number
}

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = {
  beforeUrl: '',
  afterUrl: '',
  caption: '',
  location: '',
  takenAt: today(),
  isFeatured: false,
  isActive: true,
}

export function BeforeAfterModal({
  open,
  onClose,
  serviceId,
  editing,
  onSaved,
  defaultOrder = 0,
}: Props) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (editing) {
      setForm({
        beforeUrl: editing.beforeUrl,
        afterUrl: editing.afterUrl,
        caption: editing.caption ?? '',
        location: editing.location ?? '',
        takenAt: editing.takenAt ? editing.takenAt.slice(0, 10) : today(),
        isFeatured: editing.isFeatured,
        isActive: editing.isActive,
      })
    } else {
      setForm({ ...emptyForm })
    }
  }, [open, editing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.beforeUrl || !form.afterUrl) {
      setError('請上傳 Before 與 After 兩張圖')
      return
    }

    setSubmitting(true)
    try {
      const url = editing
        ? `/api/admin/services/${serviceId}/before-afters/${editing.id}`
        : `/api/admin/services/${serviceId}/before-afters`
      const method = editing ? 'PUT' : 'POST'

      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          order: editing?.order ?? defaultOrder,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '儲存失敗')

      toast.success(editing ? '已更新' : '已新增一組對比')
      onSaved()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '儲存失敗'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={editing ? '修改這組照片' : '新增清潔前後照片'}
      description="左邊上傳「清潔前」、右邊上傳「清潔後」，下面可以填日期跟區域"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <ErrorBanner message={error} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="清潔前的照片" required>
            <ImageUploader
              value={form.beforeUrl}
              onChange={(url) => setForm({ ...form, beforeUrl: url })}
              folder="before-afters"
              hint="點這裡上傳「還沒清潔」的照片"
              className="w-full aspect-[4/3]"
            />
          </Field>
          <Field label="清潔後的照片" required>
            <ImageUploader
              value={form.afterUrl}
              onChange={(url) => setForm({ ...form, afterUrl: url })}
              folder="before-afters"
              hint="點這裡上傳「清潔完成」的照片"
              className="w-full aspect-[4/3]"
            />
          </Field>
        </div>

        <Field label="說明（給客人看的描述）" hint="可不填。網站上會顯示在照片下方">
          <input
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
            className={inputClass}
            placeholder="例如：8 年沒洗的冷氣"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="服務地區" hint="只寫到「區」就好，保護客人隱私">
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={inputClass}
              placeholder="台北市信義區"
            />
          </Field>
          <Field label="清潔的日期">
            <input
              type="date"
              value={form.takenAt}
              onChange={(e) => setForm({ ...form, takenAt: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-3 pt-3 border-t border-hairline-soft sm:flex-row sm:gap-4">
          <label className="inline-flex items-center gap-3 text-base text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="h-5 w-5 rounded border-hairline text-primary focus:ring-primary"
            />
            設為首頁精選（會顯示在首頁）
          </label>
          <label className="inline-flex items-center gap-3 text-base text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-5 w-5 rounded border-hairline text-primary focus:ring-primary"
            />
            上架顯示
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-4 border-t border-hairline -mx-6 px-6 -mb-6 pb-4 sticky bottom-0 bg-white sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
          >
            不要了
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-60"
          >
            {submitting ? '儲存中…' : editing ? '儲存修改' : '存好這組照片'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
