'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Field, inputClass, textareaClass } from '@/components/admin/form-field'
import { ImageUploader } from '@/components/admin/image-uploader'

type SettingField = {
  key: string
  label: string
  hint?: string
  multiline?: boolean
  /** 圖片上傳欄位：value 存上傳後的 R2 網址 */
  image?: boolean
}

const SETTING_GROUPS: { title: string; fields: SettingField[] }[] = [
  {
    title: '基本資訊',
    fields: [
      { key: 'siteName', label: '站台名稱', hint: '預設 invisible care' },
      { key: 'tagline', label: 'Tagline', hint: '預設「看不見的守護」' },
      {
        key: 'description',
        label: '站台介紹',
        hint: '頁尾與 SEO meta 會用到的站台簡介，建議 1–3 句話',
        multiline: true,
      },
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
      {
        key: 'ogImage',
        label: '社群分享縮圖（OG Image）',
        hint: '分享網址到 FB/LINE 時顯示的預覽圖，建議 1200×630。服務詳情頁優先用該服務的「主圖」，沒主圖才退到這張；其他頁面（首頁/關於/案例…）都用這張',
        image: true,
      },
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
                  <Field
                    key={f.key}
                    label={f.label}
                    hint={f.hint}
                    className={f.multiline || f.image ? 'md:col-span-2' : undefined}
                  >
                    {f.image ? (
                      // 預覽框用 1200:630 的 OG 比例，業主上傳後直接看得到裁切效果
                      <ImageUploader
                        value={values[f.key] || null}
                        onChange={(url) => setValues({ ...values, [f.key]: url })}
                        folder="settings"
                        hint="點擊上傳分享縮圖"
                        className="w-full max-w-sm aspect-[1200/630] h-auto"
                      />
                    ) : f.multiline ? (
                      <textarea
                        value={values[f.key] ?? ''}
                        onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                        rows={4}
                        className={textareaClass}
                      />
                    ) : (
                      <input
                        value={values[f.key] ?? ''}
                        onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                        className={inputClass}
                      />
                    )}
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
