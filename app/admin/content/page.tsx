'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Field, inputClass } from '@/components/admin/form-field'
import { ImageUploader } from '@/components/admin/image-uploader'
import { RichTextEditor } from '@/components/admin/rich-text-editor-loader'

type FieldType = 'text' | 'richtext' | 'image'

type BlockDef = {
  title: string
  description: string
  fields: { name: string; label: string; type: FieldType; hint?: string; folder?: string }[]
}

// 所有可後台編輯的內容區塊；保留現有 'about' key（業主已編過）
const BLOCK_DEFS: Record<string, BlockDef> = {
  // === 首頁 ===
  'hero-home': {
    title: '首頁 Hero（主視覺）',
    description: '首頁最上方的標題、副標、按鈕文字、4 條 checklist、主視覺圖片',
    fields: [
      { name: 'heroImage', label: '主視覺圖片', type: 'image', folder: 'home', hint: '建議 4:5 比例、800×1000px 以上。未填則使用首頁精選對比圖' },
      { name: 'eyebrow', label: 'Eyebrow', type: 'text', hint: '例：Invisible Care · 居家健康守護' },
      { name: 'titleLine1', label: '主標第一行', type: 'text' },
      { name: 'titleLine2', label: '主標第二行（強調色）', type: 'text' },
      { name: 'description', label: '副標說明', type: 'richtext' },
      { name: 'primaryCta', label: '主 CTA 按鈕文字', type: 'text', hint: '例：立即來電預約' },
      { name: 'secondaryCta', label: '副 CTA 按鈕文字', type: 'text', hint: '例：看服務案例' },
      { name: 'checklist1', label: 'Checklist 1', type: 'text' },
      { name: 'checklist2', label: 'Checklist 2', type: 'text' },
      { name: 'checklist3', label: 'Checklist 3', type: 'text' },
      { name: 'checklist4', label: 'Checklist 4', type: 'text' },
    ],
  },
  'section-services-home': {
    title: '首頁・服務項目區塊標題',
    description: 'Our Services 區塊的 eyebrow 與標題',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
    ],
  },
  'section-works-home': {
    title: '首頁・精選作品區塊標題',
    description: 'Real Results 區塊的 eyebrow、標題與「查看全部」按鈕',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
      { name: 'viewAllLabel', label: '「查看全部實績」按鈕文字', type: 'text' },
    ],
  },
  'section-process-home': {
    title: '首頁・服務流程區塊標題',
    description: 'How it works 區塊的 eyebrow 與標題（流程步驟在「服務流程」管理）',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
    ],
  },
  'section-testimonials-home': {
    title: '首頁・客戶評價區塊標題',
    description: 'Customer Voices 區塊的 eyebrow 與標題（評價內容在「客人的好話」管理）',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
    ],
  },
  'cta-home': {
    title: '首頁・底部 CTA banner',
    description: '首頁最底部深色預約 banner',
    fields: [
      { name: 'overline', label: '上方小標', type: 'text', hint: '例：BOOK YOUR HOME CARE TODAY' },
      { name: 'titleLine1', label: '主標第一行', type: 'text' },
      { name: 'titleLine2', label: '主標第二行', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
      { name: 'primaryCta', label: '按鈕文字', type: 'text' },
    ],
  },
  // === About 頁 ===
  'hero-about': {
    title: '關於我們・Hero',
    description: 'About 頁最上方的標題段',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text', hint: '例：About invisible care' },
      { name: 'titleLine1', label: '主標第一行', type: 'text' },
      { name: 'titleLine2', label: '主標第二行（強調色）', type: 'text' },
      { name: 'lead', label: '右側說明文', type: 'richtext' },
    ],
  },
  about: {
    title: '關於我們・故事段',
    description: 'About 頁中段的「Our story」與三段故事',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'paragraph1', label: '段落 1', type: 'richtext' },
      { name: 'paragraph2', label: '段落 2', type: 'richtext' },
      { name: 'paragraph3', label: '段落 3', type: 'richtext' },
      { name: 'image', label: '故事區圖片', type: 'image', folder: 'about' },
    ],
  },
  'cta-about': {
    title: '關於我們・底部 CTA',
    description: 'About 頁底部的呼籲區塊',
    fields: [
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
      { name: 'primaryCta', label: '按鈕文字', type: 'text' },
    ],
  },
  // === 其他頁面 Hero ===
  'hero-contact': {
    title: '預約諮詢・Hero',
    description: 'Contact 頁最上方標題段',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
    ],
  },
  'hero-faq': {
    title: '常見問題・Hero 與區塊文字',
    description: 'FAQ 頁的 Hero、「一般服務」標題、底部聯絡卡片文案',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Hero 標題', type: 'text' },
      { name: 'description', label: 'Hero 副標', type: 'richtext' },
      { name: 'generalHeading', label: '一般服務區塊標題', type: 'text' },
      { name: 'contactBoxText', label: '底部聯絡卡片文字', type: 'text' },
      { name: 'contactBoxButton', label: '底部聯絡按鈕文字', type: 'text' },
    ],
  },
  'hero-services': {
    title: '服務項目列表・Hero',
    description: 'Services 列表頁的標題段',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
    ],
  },
  'hero-works': {
    title: '服務案例・Hero',
    description: 'Works 頁的標題段',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
    ],
  },
  // === 全站導覽（Header / Footer 文字） ===
  navigation: {
    title: '導覽列與 Footer 文字',
    description: '導覽列的 5 個分頁 label、主要按鈕文字、Footer 法律聲明',
    fields: [
      { name: 'navServicesLabel', label: '導覽：服務項目', type: 'text' },
      { name: 'navWorksLabel', label: '導覽：服務案例', type: 'text' },
      { name: 'navAboutLabel', label: '導覽：關於我們', type: 'text' },
      { name: 'navFaqLabel', label: '導覽：常見問題', type: 'text' },
      { name: 'navContactLabel', label: '導覽：預約諮詢', type: 'text' },
      { name: 'navPrimaryCtaLabel', label: '導覽列主按鈕文字', type: 'text', hint: '例：立即來電預約' },
      { name: 'footerLegalNote', label: 'Footer 法律聲明', type: 'richtext' },
    ],
  },
}

export default function ContentAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="頁面內容"
        description="編輯網站所有頁面的標題、副標、按鈕文字（動態資料如服務、評價、流程在各自的管理頁）"
      />
      <div className="space-y-6">
        {Object.keys(BLOCK_DEFS).map((key) => (
          <BlockEditor key={key} blockKey={key} />
        ))}
      </div>
    </>
  )
}

function BlockEditor({ blockKey }: { blockKey: string }) {
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
      // 告訴 API 哪些 key 是富文本，需 sanitize（其他純 text / image URL 不動）
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  const dirty = JSON.stringify(values) !== JSON.stringify(original)

  return (
    <section className="rounded-xl border border-hairline bg-white p-4 sm:p-5 md:p-6">
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
        </div>
      )}
    </section>
  )
}
