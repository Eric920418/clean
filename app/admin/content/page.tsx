'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Field, inputClass } from '@/components/admin/form-field'
import { ImageUploader } from '@/components/admin/image-uploader'
import { RichTextEditor } from '@/components/admin/rich-text-editor-loader'
import { PageSectionsManager } from './_components/PageSectionsManager'

type FieldType = 'text' | 'richtext' | 'image'

// group：用於後台分組折疊；每個 key 對應一個前台頁面
// home / about / contact / faq / services / works / global
type BlockGroup = 'home' | 'about' | 'contact' | 'faq' | 'services' | 'works' | 'global'

type BlockDef = {
  title: string
  description: string
  group: BlockGroup
  fields: { name: string; label: string; type: FieldType; hint?: string; folder?: string }[]
}

// 所有可後台編輯的內容區塊；保留現有 'about' key（業主已編過）
const BLOCK_DEFS: Record<string, BlockDef> = {
  // === 首頁 ===
  'hero-home': {
    title: '首頁 Hero（主視覺）',
    description: '首頁最上方的標題、副標、按鈕文字、4 條 checklist、主視覺圖片',
    group: 'home',
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
    group: 'home',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
    ],
  },
  'section-works-home': {
    title: '首頁・精選作品區塊標題',
    description: 'Real Results 區塊的 eyebrow、標題與「查看全部」按鈕',
    group: 'home',
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
    group: 'home',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
    ],
  },
  'section-testimonials-home': {
    title: '首頁・客戶評價區塊標題',
    description: 'Customer Voices 區塊的 eyebrow 與標題（評價內容在「客人的好話」管理）',
    group: 'home',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
    ],
  },
  'cta-home': {
    title: '首頁・底部 CTA banner',
    description: '首頁最底部深色預約 banner',
    group: 'home',
    fields: [
      { name: 'backgroundImage', label: '背景圖', type: 'image', folder: 'home', hint: '深色濾鏡覆蓋（透明度 25%），建議用較亮或彩色的圖才看得出來。留空使用預設廚房照片。' },
      { name: 'overline', label: '上方小標', type: 'text', hint: '例：BOOK YOUR HOME CARE TODAY' },
      { name: 'titleLine1', label: '主標第一行', type: 'text' },
      { name: 'titleLine2', label: '主標第二行', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
      { name: 'primaryCta', label: '按鈕文字', type: 'text' },
      { name: 'lineUrl', label: 'LINE 加好友連結（選填）', type: 'text', hint: '填網址即會自動顯示官方「加入好友」按鈕；留空則不顯示。例：https://lin.ee/sjHybe1' },
    ],
  },
  // === About 頁 ===
  'hero-about': {
    title: '關於我們・Hero',
    description: 'About 頁最上方的標題段',
    group: 'about',
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
    group: 'about',
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
    group: 'about',
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
    group: 'contact',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
    ],
  },
  'hero-faq': {
    title: '常見問題・Hero 與區塊文字',
    description: 'FAQ 頁的 Hero、「一般服務」標題、底部聯絡卡片文案',
    group: 'faq',
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
    group: 'services',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
    ],
  },
  'hero-works': {
    title: '服務案例・Hero',
    description: 'Works 頁的標題段',
    group: 'works',
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
    group: 'global',
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
  // 一次只展開一個 block — 避免多個 CKEditor instance 同頁 mount 觸發 focus tracker
  // 衝突 bug（點 editable 會跑到別的 editor 的 toolbar 第一個 dropdown）。
  // 同場景額外好處：頁面不再一次載入 14 個 ~3MB 的 CKEditor bundle。
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [dirtyKey, setDirtyKey] = useState<string | null>(null)

  function handleToggle(key: string) {
    if (expandedKey === key) {
      // 點當前展開的 → 收合
      if (dirtyKey === key) {
        if (!confirm('有未儲存的變更，收合後會遺失。確定收合？')) return
      }
      setExpandedKey(null)
      setDirtyKey(null)
      return
    }
    // 切換到別的 block
    if (dirtyKey && dirtyKey === expandedKey) {
      if (!confirm('目前展開的區塊有未儲存的變更，切換後會遺失。確定切換？')) return
    }
    setExpandedKey(key)
    setDirtyKey(null)
  }

  return (
    <>
      <AdminPageHeader
        title="頁面內容"
        description="編輯網站所有頁面的標題、副標、按鈕文字（動態資料如服務、評價、流程在各自的管理頁）"
      />

      <section className="mb-10">
        <h2 className="text-base font-semibold text-ink">首頁・附加區塊（動態）</h2>
        <p className="mt-1 mb-4 text-xs text-ink-muted">
          可動態新增、排序、刪除。渲染位置：首頁「客戶評價」之後、底部 CTA banner 之前
        </p>
        <PageSectionsManager page="home" />
      </section>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-ink">關於我們・附加區塊（動態）</h2>
        <p className="mt-1 mb-4 text-xs text-ink-muted">
          可動態新增、排序、刪除。渲染位置：About 頁「品牌信念」之後、底部 CTA 之前
        </p>
        <PageSectionsManager page="about" />
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">頁面文案（固定欄位）</h2>
        <p className="mt-1 mb-4 text-xs text-ink-muted">
          各頁面預設區塊的標題、副標、按鈕文字、圖片。點頁面名稱展開該頁面的全部欄位。
        </p>
        <div className="space-y-3">
          {GROUPS.map((g) => {
            const keys = Object.keys(BLOCK_DEFS).filter((k) => BLOCK_DEFS[k].group === g.key)
            if (keys.length === 0) return null
            return (
              <details
                key={g.key}
                open={g.defaultOpen}
                className="group rounded-xl border border-hairline bg-white overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-3 cursor-pointer p-4 sm:p-5 hover:bg-bg-soft/60 transition select-none list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-3 min-w-0">
                    <ChevronRight className="h-5 w-5 text-ink-soft shrink-0 transition group-open:rotate-90" />
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-ink truncate">{g.label}</h3>
                      <p className="text-xs text-ink-muted mt-0.5 truncate">
                        {keys.length} 個欄位
                      </p>
                    </div>
                  </div>
                </summary>
                <div className="border-t border-hairline-soft p-3 sm:p-4 space-y-3 bg-bg-soft/30">
                  {keys.map((key) => (
                    <BlockEditor
                      key={key}
                      blockKey={key}
                      isExpanded={expandedKey === key}
                      onToggle={() => handleToggle(key)}
                      onDirtyChange={(dirty) => setDirtyKey(dirty ? key : null)}
                    />
                  ))}
                </div>
              </details>
            )
          })}
        </div>
      </section>
    </>
  )
}

// 後台分組顯示順序（依前台頁面）— defaultOpen=true 的進頁面就展開，其他要點才看
const GROUPS: { key: BlockGroup; label: string; defaultOpen?: boolean }[] = [
  { key: 'home', label: '首頁', defaultOpen: true },
  { key: 'about', label: '關於我們' },
  { key: 'contact', label: '預約諮詢' },
  { key: 'faq', label: '常見問題' },
  { key: 'services', label: '服務列表' },
  { key: 'works', label: '服務案例' },
  { key: 'global', label: '全站導覽 / Footer' },
]

function BlockEditor({
  blockKey,
  isExpanded,
  onToggle,
  onDirtyChange,
}: {
  blockKey: string
  isExpanded: boolean
  onToggle: () => void
  onDirtyChange: (dirty: boolean) => void
}) {
  const def = BLOCK_DEFS[blockKey]
  const [values, setValues] = useState<Record<string, string>>({})
  const [original, setOriginal] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

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
      setHasFetched(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '讀取失敗')
    } finally {
      setLoading(false)
    }
  }

  // Lazy fetch — 展開時才 fetch、避免 14 個 block 並發打 API
  useEffect(() => {
    if (isExpanded && !hasFetched) fetchOne()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded])

  const dirty = hasFetched && JSON.stringify(values) !== JSON.stringify(original)

  // 通知父組件 dirty 狀態，切換時可提示
  useEffect(() => {
    if (isExpanded) onDirtyChange(dirty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, isExpanded])

  async function save() {
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
      onDirtyChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-xl border border-hairline bg-white">
      <header
        onClick={onToggle}
        className="flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer hover:bg-bg-soft/60 transition rounded-xl"
      >
        <div className="flex items-center gap-3 min-w-0">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-ink-soft shrink-0" />
          ) : (
            <ChevronRight className="h-5 w-5 text-ink-soft shrink-0" />
          )}
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink truncate">{def.title}</h2>
            <p className="text-xs text-ink-muted mt-0.5 truncate">{def.description}</p>
          </div>
        </div>
        {dirty && (
          <span className="text-xs font-medium text-warn shrink-0">● 未儲存</span>
        )}
      </header>

      {isExpanded && (
        <div className="border-t border-hairline-soft px-4 sm:px-5 md:px-6 pb-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 text-primary-deep animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-4 pt-5">
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
              <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-hairline-soft">
                <button
                  onClick={save}
                  disabled={!dirty || saving}
                  className="btn-primary !py-2 !px-4 !text-sm disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  儲存
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
