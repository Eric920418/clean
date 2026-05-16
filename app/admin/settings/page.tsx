'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Field, inputClass } from '@/components/admin/form-field'

const SETTING_GROUPS: { title: string; fields: { key: string; label: string; hint?: string }[] }[] = [
  {
    title: '基本資訊',
    fields: [
      { key: 'siteName', label: '站台名稱', hint: '預設 invisible care' },
      { key: 'tagline', label: 'Tagline', hint: '預設「看不見的守護」' },
    ],
  },
  {
    title: '聯絡方式',
    fields: [
      { key: 'phone', label: '服務專線（顯示用）', hint: '例：0916-998036' },
      { key: 'phoneTel', label: 'tel: 連結', hint: '例：tel:+886916998036（國際格式撥號相容性最佳）' },
      { key: 'email', label: 'Email' },
      { key: 'lineId', label: 'LINE 好友 ID', hint: '例：@invisible-care 或數字 ID' },
      { key: 'lineFriendUrl', label: '加 LINE 好友連結', hint: '例：https://line.me/R/ti/p/@xxx' },
      { key: 'lineCallUrl', label: 'LINE 通話連結', hint: '例：https://line.me/R/call/...' },
      { key: 'address', label: '地址' },
      { key: 'serviceArea', label: '服務區域', hint: '例：雙北・桃園・新竹' },
      { key: 'hours', label: '服務時間', hint: '例：週一至週六 09:00–19:00' },
    ],
  },
  {
    title: '社群',
    fields: [
      { key: 'fbUrl', label: 'Facebook 網址' },
      { key: 'igUrl', label: 'Instagram 網址' },
    ],
  },
]

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [original, setOriginal] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function fetchAll() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/settings')
      const data: { id: number; key: string; value: string }[] = await r.json()
      if (!r.ok) throw new Error('讀取失敗')
      const map: Record<string, string> = {}
      data.forEach((s) => (map[s.key] = s.value))
      setValues(map)
      setOriginal(map)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '讀取失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  async function save() {
    setSaving(true)
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: values }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '儲存失敗')
      toast.success('已儲存所有設定')
      setOriginal(values)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  const dirty = JSON.stringify(values) !== JSON.stringify(original)

  return (
    <>
      <AdminPageHeader
        title="站台設定"
        description="基本資訊、聯絡方式與社群連結"
        actions={
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="btn-primary !py-2 !px-4 !text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            儲存全部
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-primary-deep animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {SETTING_GROUPS.map((group) => (
            <section key={group.title} className="rounded-xl border border-hairline bg-white p-4 sm:p-5 md:p-6">
              <h2 className="text-base font-semibold text-ink mb-4 border-b border-hairline-soft pb-3">
                {group.title}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {group.fields.map((f) => (
                  <Field key={f.key} label={f.label} hint={f.hint}>
                    <input
                      value={values[f.key] ?? ''}
                      onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
