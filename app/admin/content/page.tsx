'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Field, inputClass, textareaClass } from '@/components/admin/form-field'
import { ImageUploader } from '@/components/admin/image-uploader'

type BlockKey = 'hero' | 'about' | 'why-us' | 'process' | 'cta'

type FieldType = 'text' | 'textarea' | 'image'

const BLOCK_DEFS: Record<
  BlockKey,
  { title: string; description: string; fields: { name: string; label: string; type: FieldType; hint?: string; folder?: string }[] }
> = {
  hero: {
    title: 'Hero（首頁主視覺）',
    description: '首屏的標題、副標、按鈕文字',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow（小標籤）', type: 'text', hint: '例：Invisible Care · 居家健康守護' },
      { name: 'titleLine1', label: '主標第一行', type: 'text' },
      { name: 'titleLine2', label: '主標第二行（強調色）', type: 'text' },
      { name: 'description', label: '副標說明', type: 'textarea' },
      { name: 'primaryCta', label: '主 CTA 文字', type: 'text' },
      { name: 'secondaryCta', label: '副 CTA 文字', type: 'text' },
    ],
  },
  about: {
    title: 'About（關於我們區塊）',
    description: '關於頁的故事與品牌主張',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'paragraph1', label: '段落 1', type: 'textarea' },
      { name: 'paragraph2', label: '段落 2', type: 'textarea' },
      { name: 'paragraph3', label: '段落 3', type: 'textarea' },
      { name: 'image', label: '故事區圖片', type: 'image', folder: 'about' },
    ],
  },
  'why-us': {
    title: 'Why Us（為何選我們）',
    description: '首頁的「三項堅持」標題與副標',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'textarea' },
    ],
  },
  process: {
    title: 'Process（服務流程）',
    description: '首頁四步驟區塊的標題',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
    ],
  },
  cta: {
    title: 'CTA（首頁底部呼籲）',
    description: '首頁最底部的深色預約 banner',
    fields: [
      { name: 'overline', label: '上方小標', type: 'text' },
      { name: 'titleLine1', label: '主標第一行', type: 'text' },
      { name: 'titleLine2', label: '主標第二行', type: 'text' },
      { name: 'description', label: '副標', type: 'textarea' },
    ],
  },
}

export default function ContentAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="頁面內容"
        description="編輯首頁與關於頁的文案區塊（標題、描述、按鈕文字）"
      />
      <div className="space-y-6">
        {(Object.keys(BLOCK_DEFS) as BlockKey[]).map((key) => (
          <BlockEditor key={key} blockKey={key} />
        ))}
      </div>
    </>
  )
}

function BlockEditor({ blockKey }: { blockKey: BlockKey }) {
  const def = BLOCK_DEFS[blockKey]
  const [values, setValues] = useState<Record<string, string>>({})
  const [original, setOriginal] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function fetchOne() {
    setLoading(true)
    try {
      const r = await fetch(`/api/admin/content/${blockKey}`)
      const data = await r.json()
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
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOne()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockKey])

  async function save() {
    setSaving(true)
    try {
      const r = await fetch(`/api/admin/content/${blockKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: values }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '儲存失敗')
      toast.success(`「${def.title}」已儲存`)
      setOriginal(values)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  const dirty = JSON.stringify(values) !== JSON.stringify(original)

  return (
    <section className="rounded-xl border border-hairline bg-white p-6">
      <header className="mb-4 flex items-center justify-between border-b border-hairline-soft pb-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{def.title}</h2>
          <p className="text-xs text-ink-muted mt-0.5">{def.description}</p>
        </div>
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="btn-primary !py-2 !px-3 !text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          儲存
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 text-primary-deep animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {def.fields.map((f) => (
            <Field key={f.name} label={f.label} hint={f.hint}>
              {f.type === 'textarea' ? (
                <textarea
                  value={values[f.name] ?? ''}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  className={textareaClass}
                  rows={3}
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
        </div>
      )}
    </section>
  )
}
