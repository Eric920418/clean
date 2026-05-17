'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Field, inputClass, textareaClass } from '@/components/admin/form-field'
import { ErrorBanner } from '@/components/admin/error-banner'
import { ImageUploader } from '@/components/admin/image-uploader'
import type { AdminService } from '@/lib/admin-types'

export function ServiceMainFieldsPanel({
  service,
  onChange,
}: {
  service: AdminService
  onChange: () => void
}) {
  const [form, setForm] = useState({
    name: service.name,
    slug: service.slug,
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

        <Field
          label="網址（URL slug）"
          required
          hint="顯示在瀏覽器網址列：/services/這裡。支援中文。空白會轉成 hyphen、特殊符號會被清掉"
        >
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className={`${inputClass} font-mono`}
            placeholder="冷氣清洗"
            required
          />
          <p className="mt-2 text-xs leading-relaxed rounded-md border border-danger/30 bg-danger/5 px-2.5 py-2 text-danger-deep">
            ⚠️ 改網址 = 改對外公開 URL。如果這個服務的舊網址（<span className="font-mono">/services/{service.slug}</span>
            ）已經被貼到 LINE、Google 商家、傳單、QR Code 等地方，<strong>改完後舊連結會立刻 404</strong>、Google 搜尋排名也可能掉。確定要改才存。
          </p>
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
          詳細描述（「為什麼這項服務重要？」主文）已移至 sections 子頁。請到下方「頁面區塊」點「重點說明 + 特色清單」進入內容管理頁編輯。
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
              詳情頁頂部 Hero 區塊的大圖請至下方「頁面區塊」找 Hero 區塊點 ✏️ 設定，避免兩個入口設定不一致。
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
