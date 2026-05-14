'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminModal } from './admin-modal'
import { Field, inputClass, textareaClass } from './form-field'
import { ErrorBanner } from './error-banner'
import { ImageUploader } from './image-uploader'
import type { AdminServiceSection, ServiceSectionType } from '@/lib/admin-types'

type Props = {
  open: boolean
  onClose: () => void
  serviceId: number
  section: AdminServiceSection | null
  onSaved: () => void
}

type ConfigState = Record<string, string>

// 每種 type 要編輯的欄位
const FIELDS_BY_TYPE: Record<
  ServiceSectionType,
  { key: string; label: string; hint?: string; kind: 'text' | 'textarea' | 'image' }[]
> = {
  hero: [
    { key: 'heroImage', label: 'Hero 背景圖（可選）', hint: '若留空則使用「服務主圖」', kind: 'image' },
    { key: 'eyebrow', label: '小標籤（可選）', kind: 'text' },
    { key: 'title', label: '標題（留空使用服務名稱）', kind: 'text' },
    { key: 'description', label: '副標（留空使用卡片摘要）', kind: 'textarea' },
    { key: 'ctaText', label: 'CTA 按鈕文字', hint: '預設「立即來電預約」', kind: 'text' },
  ],
  intro: [
    { key: 'eyebrow', label: '小標籤', hint: '例：Our Story', kind: 'text' },
    { key: 'title', label: '標題', kind: 'text' },
    { key: 'image', label: '故事圖', kind: 'image' },
    { key: 'paragraph1', label: '段落 1', kind: 'textarea' },
    { key: 'paragraph2', label: '段落 2', kind: 'textarea' },
    { key: 'paragraph3', label: '段落 3', kind: 'textarea' },
  ],
  why_with_features: [
    { key: 'eyebrow', label: '小標籤', hint: '預設：Why this matters', kind: 'text' },
    { key: 'title', label: '標題', hint: '預設：為什麼這項服務重要？', kind: 'text' },
  ],
  cta: [
    {
      key: 'title',
      label: '標題',
      hint: '留空則自動使用「準備好讓 ${服務名} 上線了嗎？」',
      kind: 'text',
    },
    { key: 'description', label: '描述', kind: 'textarea' },
  ],
  text_block: [
    { key: 'eyebrow', label: '小標籤（可選）', kind: 'text' },
    { key: 'title', label: '標題', kind: 'text' },
    { key: 'body', label: '內文', hint: '支援多行；用於優惠公告、最新消息等', kind: 'textarea' },
  ],
  // 以下三種屬於「複雜 type」，本 modal 不支援；sections 管理頁應另外導向子頁
  before_after: [],
  gallery: [],
  faq: [],
  more_services: [],
}

export function SectionConfigModal({ open, onClose, serviceId, section, onSaved }: Props) {
  const [form, setForm] = useState<ConfigState>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !section) return
    const cfg = (section.config ?? {}) as Record<string, unknown>
    const initial: ConfigState = {}
    for (const field of FIELDS_BY_TYPE[section.type]) {
      const v = cfg[field.key]
      initial[field.key] = typeof v === 'string' ? v : ''
    }
    setForm(initial)
    setError(null)
  }, [open, section])

  if (!section) return null
  const fields = FIELDS_BY_TYPE[section.type] ?? []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!section) return
    setSubmitting(true)
    setError(null)
    try {
      // 把空字串轉成 null，避免 fallback 邏輯誤判
      const config: Record<string, string | null> = {}
      for (const field of fields) {
        const v = form[field.key]?.trim() ?? ''
        config[field.key] = v === '' ? null : v
      }
      const r = await fetch(`/api/admin/services/${serviceId}/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '儲存失敗')
      toast.success('已儲存')
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

  const titleMap: Record<ServiceSectionType, string> = {
    hero: 'Hero 主視覺',
    intro: 'Intro 故事區',
    why_with_features: '重點說明 + 特色清單',
    before_after: '前後對比圖',
    gallery: '施作過程相簿',
    faq: '常見問題',
    cta: 'CTA 號召區',
    more_services: '推薦其他服務',
    text_block: '萬用文字塊',
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      size="xl"
      title={`編輯：${titleMap[section.type]}`}
      description="留空欄位代表使用預設值或服務主表的資料"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <ErrorBanner message={error} />

        {fields.map((field) => (
          <Field key={field.key} label={field.label} hint={field.hint}>
            {field.kind === 'text' && (
              <input
                value={form[field.key] ?? ''}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className={inputClass}
              />
            )}
            {field.kind === 'textarea' && (
              <textarea
                value={form[field.key] ?? ''}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className={textareaClass}
                rows={3}
              />
            )}
            {field.kind === 'image' && (
              <ImageUploader
                value={form[field.key] ?? ''}
                onChange={(url) => setForm({ ...form, [field.key]: url })}
                folder={`service-section-${section.id}`}
              />
            )}
          </Field>
        ))}

        <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
          <button type="button" onClick={onClose} className="btn-ghost !py-2 !text-sm">
            取消
          </button>
          <button type="submit" disabled={submitting} className="btn-primary !py-2 !px-4 !text-sm">
            {submitting ? '儲存中…' : '儲存'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
