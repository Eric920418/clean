'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { AdminModal } from './admin-modal'
import { Field, inputClass, textareaClass } from './form-field'
import { ErrorBanner } from './error-banner'
import { ImageUploader } from './image-uploader'
import { RichTextEditor } from './rich-text-editor-loader'
import type {
  AdminPageSection,
  DynamicPageSectionType,
} from '@/lib/admin-types'

type Props = {
  open: boolean
  onClose: () => void
  section: AdminPageSection | null
  onSaved: () => void
}

type FieldKind = 'text' | 'textarea' | 'richtext' | 'image' | 'select'
type FieldDef = {
  key: string
  label: string
  hint?: string
  kind: FieldKind
  options?: { value: string; label: string }[]  // select only
}

// 每種 dynamic type 要編輯的欄位（fixed type 不走此 modal，由 onEditFixed 跳轉到 ContentBlock）
const FIELDS_BY_TYPE: Record<DynamicPageSectionType, FieldDef[]> = {
  text_block: [
    { key: 'eyebrow', label: '小標籤（可選）', hint: '例：Latest News', kind: 'text' },
    { key: 'title', label: '標題', kind: 'text' },
    { key: 'body', label: '內文', hint: '支援富文本', kind: 'richtext' },
  ],
  cta_banner: [
    {
      key: 'backgroundImage',
      label: '背景圖（可選）',
      hint: '深色濾鏡覆蓋（透明度 25%），建議用較亮或彩色的圖',
      kind: 'image',
    },
    { key: 'overline', label: '上方小標', hint: '例：BOOK YOUR HOME CARE TODAY', kind: 'text' },
    { key: 'titleLine1', label: '主標第一行', kind: 'text' },
    { key: 'titleLine2', label: '主標第二行', kind: 'text' },
    { key: 'description', label: '副標', kind: 'richtext' },
    { key: 'primaryCta', label: '主按鈕文字', hint: '例：立即來電預約', kind: 'text' },
    {
      key: 'lineUrl',
      label: 'LINE 加好友連結（選填）',
      hint: '填網址會顯示 LINE 官方按鈕；留空不顯示',
      kind: 'text',
    },
  ],
  image_text: [
    {
      key: 'layout',
      label: '版面',
      kind: 'select',
      options: [
        { value: 'image-left', label: '左圖右文' },
        { value: 'image-right', label: '左文右圖' },
      ],
    },
    { key: 'image', label: '圖片', kind: 'image' },
    { key: 'eyebrow', label: '小標籤（可選）', kind: 'text' },
    { key: 'title', label: '標題', kind: 'text' },
    { key: 'body', label: '內文', kind: 'richtext' },
    { key: 'ctaText', label: 'CTA 按鈕文字（可選）', kind: 'text' },
    { key: 'ctaUrl', label: 'CTA 按鈕連結', hint: '例：/contact 或 https://...', kind: 'text' },
  ],
  rich_content: [
    {
      key: 'html',
      label: '內容',
      hint: '純富文本，整段套 prose 樣式渲染；什麼都可以塞但要謹慎',
      kind: 'richtext',
    },
  ],
}

const TITLE_BY_TYPE: Record<DynamicPageSectionType, string> = {
  text_block: '萬用文字塊',
  cta_banner: 'CTA 行動呼籲橫幅',
  image_text: '圖文並陳',
  rich_content: '自由富文本',
}

type ConfigState = Record<string, string>

export function PageSectionConfigModal({ open, onClose, section, onSaved }: Props) {
  // caller (PageSectionsManager) 已保證只有 dynamic section 會進來 — fixed 走另一條跳轉到 ContentBlock
  const dynamicType = section?.type as DynamicPageSectionType | undefined
  const [form, setForm] = useState<ConfigState>(() => {
    if (!section || !dynamicType || !FIELDS_BY_TYPE[dynamicType]) return {}
    const cfg = (section.config ?? {}) as Record<string, unknown>
    const initial: ConfigState = {}
    for (const field of FIELDS_BY_TYPE[dynamicType]) {
      const v = cfg[field.key]
      // select 欄位若 cfg 沒值，用第一個 option 當預設
      if (field.kind === 'select' && (v === undefined || v === null || v === '')) {
        initial[field.key] = field.options?.[0]?.value ?? ''
      } else {
        initial[field.key] = typeof v === 'string' ? v : ''
      }
    }
    return initial
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!section || !dynamicType || !FIELDS_BY_TYPE[dynamicType]) return null
  const fields = FIELDS_BY_TYPE[dynamicType] ?? []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!section) return
    setSubmitting(true)
    setError(null)
    try {
      const config: Record<string, string | null> = {}
      for (const field of fields) {
        const v = (form[field.key] ?? '').trim()
        // select 一律保留值（layout 之類需要明確選項）；其他空字串轉 null
        if (field.kind === 'select') {
          config[field.key] = v === '' ? null : v
        } else {
          config[field.key] = v === '' ? null : v
        }
      }
      const r = await fetch(`/api/admin/page-sections/${section.id}`, {
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

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      size="xl"
      title={`編輯：${TITLE_BY_TYPE[dynamicType]}`}
      description="留空欄位代表不顯示；可隨時新增、刪除、調順序"
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
            {field.kind === 'richtext' && (
              <RichTextEditor
                value={form[field.key] ?? ''}
                onContentChange={(html) => setForm({ ...form, [field.key]: html })}
              />
            )}
            {field.kind === 'image' && (
              <ImageUploader
                value={form[field.key] ?? ''}
                onChange={(url) => setForm({ ...form, [field.key]: url })}
                folder={`page-section-${section.id}`}
              />
            )}
            {field.kind === 'select' && (
              <select
                value={form[field.key] ?? ''}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className={inputClass}
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
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
