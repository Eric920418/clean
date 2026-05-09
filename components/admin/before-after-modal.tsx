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
      title={editing ? '編輯對比圖' : '新增一組對比'}
      description="左邊上傳清洗前、右邊上傳清洗後，並填寫案件資訊"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <ErrorBanner message={error} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="清洗前（Before）" required>
            <ImageUploader
              value={form.beforeUrl}
              onChange={(url) => setForm({ ...form, beforeUrl: url })}
              folder="before-afters"
              hint="點擊上傳 Before 照片"
              className="w-full aspect-[4/3]"
            />
          </Field>
          <Field label="清洗後（After）" required>
            <ImageUploader
              value={form.afterUrl}
              onChange={(url) => setForm({ ...form, afterUrl: url })}
              folder="before-afters"
              hint="點擊上傳 After 照片"
              className="w-full aspect-[4/3]"
            />
          </Field>
        </div>

        <Field label="案件描述（Caption）" hint="會顯示在對比圖下方，例：「8 年未深度清洗的冷氣風輪」">
          <input
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
            className={inputClass}
            placeholder="8 年未深度清洗的冷氣風輪"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="服務區域" hint="只到區、不留具體地址（隱私保護）">
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={inputClass}
              placeholder="台北市信義區"
            />
          </Field>
          <Field label="施作日期">
            <input
              type="date"
              value={form.takenAt}
              onChange={(e) => setForm({ ...form, takenAt: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-4 pt-2 border-t border-hairline-soft">
          <label className="inline-flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary"
            />
            設為首頁精選（首頁作品牆會顯示）
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary"
            />
            上架顯示
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-hairline -mx-6 px-6 -mb-6 pb-4 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost !py-2 !px-4 !text-sm"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary !py-2 !px-4 !text-sm disabled:opacity-60"
          >
            {submitting ? '儲存中…' : editing ? '更新' : '新增對比'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
