'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Image as ImageIcon,
  LayoutTemplate,
  BookOpen,
  Sparkles,
  GalleryHorizontal,
  HelpCircle,
  Megaphone,
  Compass,
  Type,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminModal } from '@/components/admin/admin-modal'
import { ErrorBanner } from '@/components/admin/error-banner'
import { useConfirm } from '@/components/admin/confirm-dialog'
import { SectionConfigModal } from '@/components/admin/section-config-modal'
import type { AdminService, AdminServiceSection, ServiceSectionType } from '@/lib/admin-types'
import { swapOrderByIndex } from '@/lib/admin-reorder'

// 可在 modal 內編輯純 config 的「簡單 type」
const SIMPLE_TYPES = new Set<ServiceSectionType>(['hero', 'intro', 'cta', 'text_block'])

// 有列表型內容（features / faqs / pairs / images），編輯需走獨立子頁
const LIST_TYPES = new Set<ServiceSectionType>([
  'why_with_features',
  'faq',
  'before_after',
  'gallery',
])

type PageProps = { params: Promise<{ id: string }> }

const TYPE_META: Record<
  ServiceSectionType,
  { label: string; description: string; Icon: typeof LayoutTemplate; tone: string }
> = {
  hero: {
    label: 'Hero 主視覺',
    description: '頁面最上方的大圖 + 標題',
    Icon: LayoutTemplate,
    tone: 'text-primary-deep bg-primary/10',
  },
  intro: {
    label: 'Intro 故事區',
    description: '圖文並排，介紹服務背景',
    Icon: BookOpen,
    tone: 'text-accent-deep bg-accent/10',
  },
  why_with_features: {
    label: '重點說明 + 特色清單',
    description: '為什麼這項服務重要、列出特色 bullet',
    Icon: Sparkles,
    tone: 'text-amber-700 bg-amber-50',
  },
  before_after: {
    label: '前後對比圖',
    description: '清潔前 / 清潔後並排對比',
    Icon: ImageIcon,
    tone: 'text-blue-700 bg-blue-50',
  },
  gallery: {
    label: '施作過程相簿',
    description: '展示施作過程的圖片格子',
    Icon: GalleryHorizontal,
    tone: 'text-violet-700 bg-violet-50',
  },
  faq: {
    label: '常見問題',
    description: '可展開的 FAQ 列表',
    Icon: HelpCircle,
    tone: 'text-emerald-700 bg-emerald-50',
  },
  cta: {
    label: 'CTA 號召區',
    description: '預約 / 來電的行動呼籲',
    Icon: Megaphone,
    tone: 'text-rose-700 bg-rose-50',
  },
  more_services: {
    label: '推薦其他服務',
    description: '自動列出其他可選服務卡片',
    Icon: Compass,
    tone: 'text-cyan-700 bg-cyan-50',
  },
  text_block: {
    label: '萬用文字塊',
    description: '優惠公告、最新消息等純文字內容',
    Icon: Type,
    tone: 'text-slate-700 bg-slate-100',
  },
}

const TYPE_ORDER: ServiceSectionType[] = [
  'hero',
  'intro',
  'why_with_features',
  'before_after',
  'gallery',
  'faq',
  'cta',
  'more_services',
  'text_block',
]

export default function ServiceSectionsPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [service, setService] = useState<AdminService | null>(null)
  const [sections, setSections] = useState<AdminServiceSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<AdminServiceSection | null>(null)
  const { confirm, node: confirmNode } = useConfirm()

  async function fetchAll() {
    setLoading(true)
    try {
      const [serviceRes, sectionsRes] = await Promise.all([
        fetch(`/api/admin/services/${id}`),
        fetch(`/api/admin/services/${id}/sections`),
      ])
      const serviceData = await serviceRes.json()
      const sectionsData = await sectionsRes.json()
      if (!serviceRes.ok) throw new Error(serviceData.error || '讀取服務失敗')
      if (!sectionsRes.ok) throw new Error(sectionsData.error || '讀取區塊失敗')
      setService(serviceData)
      setSections(sectionsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function move(section: AdminServiceSection, dir: 'up' | 'down') {
    try {
      const moved = await swapOrderByIndex(
        sections,
        section.id,
        dir,
        (sid) => `/api/admin/services/${id}/sections/${sid}`,
      )
      if (moved) fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? `排序失敗：${err.message}` : '排序失敗')
    }
  }

  async function toggleVisible(section: AdminServiceSection) {
    try {
      const r = await fetch(`/api/admin/services/${id}/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !section.isVisible }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '更新失敗')
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, isVisible: !s.isVisible } : s)),
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失敗')
    }
  }

  async function createSection(type: ServiceSectionType) {
    try {
      const r = await fetch(`/api/admin/services/${id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '新增失敗')
      toast.success(`已新增「${TYPE_META[type].label}」區塊`)
      setCreateOpen(false)
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '新增失敗')
    }
  }

  function openEdit(section: AdminServiceSection) {
    if (SIMPLE_TYPES.has(section.type)) {
      setEditingSection(section)
      return
    }
    if (LIST_TYPES.has(section.type)) {
      router.push(`/admin/services/${id}/sections/${section.id}/items`)
      return
    }
    if (section.type === 'more_services') {
      toast.info('「推薦其他服務」會自動從其他在架服務帶入，無需手動編輯。', { duration: 4000 })
      return
    }
    toast.info('此區塊類型暫無編輯介面')
  }

  function remove(section: AdminServiceSection) {
    const meta = TYPE_META[section.type]
    confirm({
      title: `刪除「${meta.label}」區塊？`,
      body: '此區塊與其底下所有內容（如該區塊內的圖片、FAQ 條目等）都會一併刪除。',
      destructive: true,
      onConfirm: async () => {
        try {
          const r = await fetch(`/api/admin/services/${id}/sections/${section.id}`, {
            method: 'DELETE',
          })
          const data = await r.json()
          if (!r.ok) throw new Error(data.error || '刪除失敗')
          toast.success('已刪除')
          fetchAll()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '刪除失敗')
        }
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-primary-deep animate-spin" />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error ?? '服務不存在'} />
        <Link href="/admin/services" className="btn-ghost !py-2 !text-sm">
          <ArrowLeft className="h-4 w-4" />
          回服務列表
        </Link>
      </div>
    )
  }

  const sorted = sections.slice().sort((a, b) => a.order - b.order)

  return (
    <>
      <AdminPageHeader
        title={`${service.name} · 區塊管理`}
        description="拖拉上下調整顯示順序，可隱藏不需要的區塊，或新增同類型多個區塊"
        breadcrumb={[
          { label: '服務管理', href: '/admin/services' },
          { label: service.name, href: `/admin/services/${id}/edit` },
          { label: '區塊管理' },
        ]}
        actions={
          <>
            <Link href={`/services/${service.slug}`} target="_blank" className="btn-ghost !py-2 !text-sm">
              前台預覽
            </Link>
            <button onClick={() => setCreateOpen(true)} className="btn-primary !py-2 !px-4 !text-sm">
              <Plus className="h-4 w-4" />
              新增區塊
            </button>
          </>
        }
      />

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-bg-soft py-20 text-center text-ink-muted">
          尚未建立任何區塊，點右上「新增區塊」開始
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((section, idx) => {
            const meta = TYPE_META[section.type] ?? TYPE_META.text_block
            const Icon = meta.Icon
            const counts = section._count ?? { features: 0, faqs: 0, beforeAfters: 0, galleryImgs: 0 }
            const summary = sectionSummary(section, counts)
            return (
              <article
                key={section.id}
                className={`rounded-xl border bg-white p-4 transition ${
                  section.isVisible ? 'border-hairline' : 'border-hairline/60 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-ink-muted w-6 text-right">{idx + 1}</span>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-sm font-semibold text-ink">{meta.label}</h3>
                      {!section.isVisible && (
                        <span className="text-[11px] rounded bg-ink/10 text-ink-soft px-1.5 py-0.5">
                          已隱藏
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted line-clamp-1">{summary}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => move(section, 'up')}
                      disabled={idx === 0}
                      className="rounded-md p-2 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title="上移"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => move(section, 'down')}
                      disabled={idx === sorted.length - 1}
                      className="rounded-md p-2 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title="下移"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleVisible(section)}
                      className="rounded-md p-2 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition"
                      title={section.isVisible ? '隱藏' : '顯示'}
                    >
                      {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(section)}
                      className="rounded-md p-2 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition"
                      title="編輯內容"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(section)}
                      className="rounded-md p-2 text-ink-soft hover:text-danger hover:bg-danger/10 transition"
                      title="刪除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-ink-muted">
        提示：簡單區塊（Hero / Intro / CTA / 文字塊）的 ✏️ 開 modal 直接編；列表型區塊（特色清單、FAQ、對比圖、相簿）的 ✏️ 會跳到該區塊獨立的內容管理頁，可加自己的條目而不影響其他同類型區塊。
      </p>

      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        size="xl"
        title="選擇要新增的區塊類型"
        description="九種預設模板，點一下立刻新增；新區塊會放在最後，可上下移調整順序"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TYPE_ORDER.map((type) => {
            const meta = TYPE_META[type]
            const Icon = meta.Icon
            return (
              <button
                key={type}
                type="button"
                onClick={() => createSection(type)}
                className="card-hover flex items-start gap-3 rounded-xl border border-hairline bg-white p-4 text-left transition hover:border-primary-deep/40"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink">{meta.label}</div>
                  <p className="mt-0.5 text-xs text-ink-soft">{meta.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </AdminModal>

      <SectionConfigModal
        open={!!editingSection}
        onClose={() => setEditingSection(null)}
        serviceId={parseInt(id, 10)}
        section={editingSection}
        onSaved={fetchAll}
      />

      {confirmNode}
    </>
  )
}

function sectionSummary(
  section: AdminServiceSection,
  counts: { features: number; faqs: number; beforeAfters: number; galleryImgs: number },
): string {
  const cfg = section.config as Record<string, unknown>
  const title = typeof cfg.title === 'string' && cfg.title.trim() ? cfg.title : null
  switch (section.type) {
    case 'before_after':
      return title ?? `${counts.beforeAfters} 組對比圖`
    case 'gallery':
      return title ?? `${counts.galleryImgs} 張圖`
    case 'faq':
      return title ?? `${counts.faqs} 則 FAQ`
    case 'why_with_features':
      return title ?? `${counts.features} 個重點`
    case 'intro': {
      const eyebrow = typeof cfg.eyebrow === 'string' ? cfg.eyebrow : null
      return title ?? eyebrow ?? '尚未填寫故事'
    }
    case 'hero':
      return '頁首主視覺（自動使用服務主圖與名稱）'
    case 'cta':
      return '預約 / 來電行動呼籲'
    case 'more_services':
      return '自動列出其他在架服務'
    case 'text_block':
      return title ?? '空的文字塊（待 C3 編輯功能）'
  }
}
