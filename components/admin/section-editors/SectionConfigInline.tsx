'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { inputClass, textareaClass } from '@/components/admin/form-field'

type Props = {
  serviceId: number
  sectionId: number
  initialConfig: Record<string, unknown>
  /** 該 type 需要編輯的 config 欄位 */
  fields: { key: string; label: string; kind: 'text' | 'textarea' }[]
  onSaved?: () => void
}

/**
 * List-type section 子頁上方的「區塊設定」inline 編輯區。
 * onBlur 自動 PUT 一次；不需「儲存」按鈕。
 */
export function SectionConfigInline({ serviceId, sectionId, initialConfig, fields, onSaved }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    for (const f of fields) {
      const v = initialConfig[f.key]
      m[f.key] = typeof v === 'string' ? v : ''
    }
    return m
  })
  const [saved, setSaved] = useState<Record<string, string>>(values)

  useEffect(() => {
    // 父頁 refetch 後 initialConfig 變動 → 同步 local state
    const m: Record<string, string> = {}
    for (const f of fields) {
      const v = initialConfig[f.key]
      m[f.key] = typeof v === 'string' ? v : ''
    }
    setValues(m)
    setSaved(m)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig, sectionId])

  async function commit(key: string) {
    const newVal = values[key]?.trim() ?? ''
    if (newVal === (saved[key]?.trim() ?? '')) return
    try {
      const nextConfig = { ...initialConfig }
      for (const f of fields) {
        const v = (key === f.key ? newVal : values[f.key]?.trim() ?? '')
        nextConfig[f.key] = v === '' ? null : v
      }
      const r = await fetch(`/api/admin/services/${serviceId}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: nextConfig }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '儲存失敗')
      setSaved(values)
      toast.success('已儲存', { duration: 1500 })
      onSaved?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '儲存失敗')
    }
  }

  return (
    <details className="mb-5 rounded-lg border border-hairline bg-bg-soft" open>
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-ink">
        區塊設定（標題、小標籤）
      </summary>
      <div className="space-y-3 border-t border-hairline px-4 py-4">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="block text-xs font-medium text-ink-soft mb-1">{f.label}</span>
            {f.kind === 'text' ? (
              <input
                value={values[f.key] ?? ''}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                onBlur={() => commit(f.key)}
                className={inputClass}
              />
            ) : (
              <textarea
                value={values[f.key] ?? ''}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                onBlur={() => commit(f.key)}
                className={textareaClass}
                rows={2}
              />
            )}
          </label>
        ))}
        <p className="text-xs text-ink-muted">變更會在離開欄位（失焦）時自動儲存。留空使用前台預設值。</p>
      </div>
    </details>
  )
}
