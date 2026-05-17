'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ErrorBanner } from '@/components/admin/error-banner'
import { Field } from '@/components/admin/form-field'
import { RichTextEditor } from '@/components/admin/rich-text-editor-loader'
import { FeaturesEditor } from '@/components/admin/section-editors/FeaturesEditor'
import { FaqsEditor } from '@/components/admin/section-editors/FaqsEditor'
import { GalleryEditor } from '@/components/admin/section-editors/GalleryEditor'
import { BeforeAfterEditor } from '@/components/admin/section-editors/BeforeAfterEditor'
import { SectionConfigInline } from '@/components/admin/section-editors/SectionConfigInline'
import type {
  AdminServiceFeature,
  AdminServiceFaq,
  AdminGalleryImage,
  AdminBeforeAfter,
} from '@/lib/admin-types'

type PageProps = { params: Promise<{ id: string; sectionId: string }> }

type SectionDetail = {
  id: number
  serviceId: number
  type: string
  order: number
  isVisible: boolean
  config: Record<string, unknown>
  service: { id: number; name: string; slug: string; longDesc: string }
  features: AdminServiceFeature[]
  faqs: AdminServiceFaq[]
  beforeAfters: AdminBeforeAfter[]
  galleryImgs: AdminGalleryImage[]
}

const TYPE_LABEL: Record<string, string> = {
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

const EDITOR_TYPES = new Set(['why_with_features', 'faq', 'before_after', 'gallery'])

export default function SectionItemsPage({ params }: PageProps) {
  const { id, sectionId } = use(params)
  const [section, setSection] = useState<SectionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchSection() {
    try {
      const r = await fetch(`/api/admin/sections/${sectionId}`)
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '讀取失敗')
      setSection(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-primary-deep animate-spin" />
      </div>
    )
  }

  if (error || !section) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error ?? '區塊不存在'} />
        <Link href={`/admin/services/${id}/sections`} className="btn-ghost !py-2 !text-sm">
          <ArrowLeft className="h-4 w-4" />
          回區塊管理
        </Link>
      </div>
    )
  }

  const serviceId = section.service.id
  const sectionIdNum = section.id
  const typeLabel = TYPE_LABEL[section.type] ?? section.type

  if (!EDITOR_TYPES.has(section.type)) {
    return (
      <>
        <AdminPageHeader
          title={`${typeLabel} · 內容管理`}
          breadcrumb={[
            { label: '服務管理', href: '/admin/services' },
            { label: section.service.name, href: `/admin/services/${id}/sections` },
            { label: typeLabel },
          ]}
        />
        <div className="rounded-xl border border-hairline bg-bg-soft p-10 text-center text-ink-soft">
          此類型區塊沒有「列表型」內容可管理。
          <br />
          請回上一頁，用 ✏️ 按鈕編輯這個區塊的設定（標題、圖片、文字等）。
        </div>
      </>
    )
  }

  return (
    <>
      <AdminPageHeader
        title={`${typeLabel} · 內容管理`}
        description={`管理本區塊的內容；同 service 下的其他「${typeLabel}」區塊各自獨立`}
        breadcrumb={[
          { label: '服務管理', href: '/admin/services' },
          { label: section.service.name, href: `/admin/services/${id}/sections` },
          { label: typeLabel },
        ]}
        actions={
          <Link
            href={`/services/${section.service.slug}`}
            target="_blank"
            className="btn-ghost !py-2 !text-sm"
          >
            前台預覽
          </Link>
        }
      />

      <SectionConfigInline
        serviceId={serviceId}
        sectionId={sectionIdNum}
        initialConfig={section.config}
        fields={
          section.type === 'before_after'
            ? [
                { key: 'eyebrow', label: '小標籤', kind: 'text' },
                { key: 'title', label: '標題', kind: 'text' },
                { key: 'description', label: '副標說明', kind: 'textarea' },
              ]
            : [
                { key: 'eyebrow', label: '小標籤', kind: 'text' },
                { key: 'title', label: '標題', kind: 'text' },
              ]
        }
        onSaved={fetchSection}
      />

      {section.type === 'why_with_features' && (
        <WhyMainDescEditor
          serviceId={serviceId}
          initialLongDesc={section.service.longDesc}
          onSaved={fetchSection}
        />
      )}

      <section className="rounded-xl border border-hairline bg-white p-5">
        {section.type === 'why_with_features' && (
          <FeaturesEditor
            serviceId={serviceId}
            sectionId={sectionIdNum}
            features={section.features}
            onChange={fetchSection}
          />
        )}
        {section.type === 'faq' && (
          <FaqsEditor
            serviceId={serviceId}
            sectionId={sectionIdNum}
            faqs={section.faqs}
            onChange={fetchSection}
          />
        )}
        {section.type === 'gallery' && (
          <GalleryEditor
            serviceId={serviceId}
            sectionId={sectionIdNum}
            images={section.galleryImgs}
            onChange={fetchSection}
          />
        )}
        {section.type === 'before_after' && (
          <BeforeAfterEditor
            serviceId={serviceId}
            sectionId={sectionIdNum}
            pairs={section.beforeAfters}
            onChange={fetchSection}
          />
        )}
      </section>
    </>
  )
}

/**
 * 「為什麼這項服務重要？」主文編輯區。
 * 資料源是 `Service.longDesc`（不是 section.config），所以走 PUT /api/admin/services/[id]。
 */
function WhyMainDescEditor({
  serviceId,
  initialLongDesc,
  onSaved,
}: {
  serviceId: number
  initialLongDesc: string
  onSaved: () => void
}) {
  const [longDesc, setLongDesc] = useState(initialLongDesc)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty = longDesc !== initialLongDesc

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longDesc }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '儲存失敗')
      toast.success('已儲存詳細描述')
      onSaved()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '儲存失敗'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mb-4 rounded-xl border border-hairline bg-white p-5">
      <header className="mb-4 flex items-center justify-between border-b border-hairline-soft pb-3">
        <div>
          <h2 className="text-base font-semibold text-ink">詳細描述（主文）</h2>
          <p className="text-xs text-ink-muted mt-0.5">顯示在服務詳情頁「為什麼這項服務重要？」區塊的主文</p>
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
      <ErrorBanner message={error} />
      <Field label="主文" hint="支援富文本（標題、列表、粗體等）">
        <RichTextEditor value={longDesc} onContentChange={setLongDesc} />
      </Field>
    </section>
  )
}
