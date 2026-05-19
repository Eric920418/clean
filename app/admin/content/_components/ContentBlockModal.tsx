'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { AdminModal } from '@/components/admin/admin-modal'
import { Field, inputClass } from '@/components/admin/form-field'
import { ImageUploader } from '@/components/admin/image-uploader'
import { RichTextEditor } from '@/components/admin/rich-text-editor-loader'
import { BLOCK_DEFS } from './content-block-defs'

type Props = {
  open: boolean
  blockKey: string | null
  onClose: () => void
  onSaved?: () => void
}

/**
 * 編輯單個 ContentBlock 的 modal。
 *
 * 取代舊的「下方 BlockEditor accordion」流程：
 * - fixed section 編輯按鈕點下去就開此 modal
 * - 「其他頁面文案」列表 button 也開此 modal
 *
 * 對應 ContentBlock 的 fields schema 從 BLOCK_DEFS 查；save 走 PUT /api/admin/content/[key]
 * （已有 sanitize + R2 孤兒清理 + ISR revalidate 邏輯）。
 */
export function ContentBlockModal({ open, blockKey, onClose, onSaved }: Props) {
  const def = blockKey ? BLOCK_DEFS[blockKey] : null
  const [values, setValues] = useState<Record<string, string>>({})
  const [original, setOriginal] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // 開啟時 fetch、關閉時清空 — key=blockKey 讓父層用 key 強制 remount，
  // 不必手動 reset state
  useEffect(() => {
    if (!open || !blockKey || !def) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/admin/content/${blockKey}`)
        const data = await r.json()
        if (cancelled) return
        const payload = (data?.payload as Record<string, string>) ?? {}
        const init: Record<string, string> = {}
        def.fields.forEach((f) => {
          init[f.name] = payload[f.name] ?? ''
        })
        setValues(init)
        setOriginal(init)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '讀取失敗')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, blockKey, def])

  if (!open || !blockKey || !def) return null

  const dirty = JSON.stringify(values) !== JSON.stringify(original)

  async function save() {
    if (!blockKey || !def) return
    setSaving(true)
    try {
      const richTextKeys = def.fields.filter((f) => f.type === 'richtext').map((f) => f.name)
      const r = await fetch(`/api/admin/content/${blockKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: values, richTextKeys }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '儲存失敗')
      toast.success(`「${def.title}」已儲存`)
      setOriginal(values)
      onSaved?.()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    if (dirty) {
      if (!confirm('有未儲存的變更，關閉後會遺失。確定關閉？')) return
    }
    onClose()
  }

  return (
    <AdminModal
      open={open}
      onClose={handleClose}
      size="xl"
      title={`編輯：${def.title}`}
      description={def.description}
    >
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 text-primary-deep animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {def.fields.map((f) => (
            <Field key={f.name} label={f.label} hint={f.hint}>
              {f.type === 'richtext' ? (
                <RichTextEditor
                  value={values[f.name] ?? ''}
                  onContentChange={(html) => setValues({ ...values, [f.name]: html })}
                  height="180px"
                />
              ) : f.type === 'image' ? (
                <ImageUploader
                  value={values[f.name] ?? ''}
                  onChange={(url) => setValues({ ...values, [f.name]: url })}
                  folder={f.folder ?? 'content'}
                />
              ) : (
                <input
                  value={values[f.name] ?? ''}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  className={inputClass}
                />
              )}
            </Field>
          ))}

          <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
            <button
              type="button"
              onClick={handleClose}
              className="btn-ghost !py-2 !text-sm"
            >
              取消
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="btn-primary !py-2 !px-4 !text-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              儲存
            </button>
          </div>
        </div>
      )}
    </AdminModal>
  )
}
