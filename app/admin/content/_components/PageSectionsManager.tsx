'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Type,
  Megaphone,
  Images,
  FileText,
  Lock,
  LayoutTemplate,
  Grid3x3,
  Sparkles,
  ImageIcon,
  Workflow,
  MessageSquare,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminModal } from '@/components/admin/admin-modal'
import { ErrorBanner } from '@/components/admin/error-banner'
import { useConfirm } from '@/components/admin/confirm-dialog'
import { PageSectionConfigModal } from '@/components/admin/page-section-config-modal'
import {
  isFixedType,
  type AdminPageSection,
  type PageSectionPage,
  type DynamicPageSectionType,
} from '@/lib/admin-types'
import { swapOrderByIndex } from '@/lib/admin-reorder'

type FixedMeta = {
  label: string
  description: string
  Icon: typeof Type
  tone: string
  // 對應下方「頁面文案（固定欄位）」accordion 的 ContentBlock key（按下編輯時自動展開該 block）
  contentBlockKey?: string
  // 沒有對應 ContentBlock 時跳轉外部頁面（例如 why_us / beliefs 在 /admin/why-us-sections 管理）
  externalHref?: string
}

const FIXED_META_BY_PAGE: Record<PageSectionPage, Record<string, FixedMeta>> = {
  home: {
    hero: {
      label: '主視覺 Hero',
      description: '首頁最上方標題、副標、按鈕、checklist、主視覺圖',
      Icon: LayoutTemplate,
      tone: 'text-primary-deep bg-primary/10',
      contentBlockKey: 'hero-home',
    },
    services_grid: {
      label: '六大服務項目',
      description: '從「服務管理」自動帶入卡片；標題文案在固定欄位編輯',
      Icon: Grid3x3,
      tone: 'text-emerald-700 bg-emerald-50',
      contentBlockKey: 'section-services-home',
    },
    why_us: {
      label: '為何選我們',
      description: '由「為何選我們」CMS（多筆 location=home）組成；點編輯跳轉管理頁',
      Icon: Sparkles,
      tone: 'text-amber-700 bg-amber-50',
      externalHref: '/admin/why-us-sections',
    },
    featured_works: {
      label: '精選作品（前後對比）',
      description: '從各服務內 isFeatured 對比圖自動帶入；標題文案在固定欄位編輯',
      Icon: ImageIcon,
      tone: 'text-blue-700 bg-blue-50',
      contentBlockKey: 'section-works-home',
    },
    process: {
      label: '服務流程',
      description: '從「服務流程」管理；標題文案在固定欄位編輯',
      Icon: Workflow,
      tone: 'text-cyan-700 bg-cyan-50',
      contentBlockKey: 'section-process-home',
    },
    testimonials: {
      label: '客戶評價',
      description: '從「客人的好話」管理；標題文案在固定欄位編輯',
      Icon: MessageSquare,
      tone: 'text-yellow-700 bg-yellow-50',
      contentBlockKey: 'section-testimonials-home',
    },
    cta: {
      label: '底部 CTA banner',
      description: '深色底預約 banner（背景圖 + 按鈕 + LINE）',
      Icon: Megaphone,
      tone: 'text-rose-700 bg-rose-50',
      contentBlockKey: 'cta-home',
    },
  },
  about: {
    hero: {
      label: '主視覺 Hero',
      description: 'About 頁最上方標題段',
      Icon: LayoutTemplate,
      tone: 'text-primary-deep bg-primary/10',
      contentBlockKey: 'hero-about',
    },
    story: {
      label: '我們的故事',
      description: '中段「Our story」三段故事 + 圖片',
      Icon: BookOpen,
      tone: 'text-accent-deep bg-accent/10',
      contentBlockKey: 'about',
    },
    beliefs: {
      label: '品牌信念（Belief sections）',
      description: '由「為何選我們」CMS（多筆 location=about）組成；點編輯跳轉管理頁',
      Icon: Sparkles,
      tone: 'text-amber-700 bg-amber-50',
      externalHref: '/admin/why-us-sections',
    },
    cta: {
      label: '底部 CTA',
      description: '頁面底部呼籲區塊',
      Icon: Megaphone,
      tone: 'text-rose-700 bg-rose-50',
      contentBlockKey: 'cta-about',
    },
  },
}

const DYNAMIC_META: Record<
  DynamicPageSectionType,
  { label: string; description: string; Icon: typeof Type; tone: string }
> = {
  text_block: {
    label: '萬用文字塊',
    description: '小標籤 + 標題 + 富文本內文',
    Icon: Type,
    tone: 'text-slate-700 bg-slate-100',
  },
  cta_banner: {
    label: 'CTA 行動呼籲橫幅',
    description: '深色背景的預約 / 來電 banner',
    Icon: Megaphone,
    tone: 'text-rose-700 bg-rose-50',
  },
  image_text: {
    label: '圖文並陳',
    description: '左右兩欄：一邊圖、一邊文字 + CTA 按鈕',
    Icon: Images,
    tone: 'text-blue-700 bg-blue-50',
  },
  rich_content: {
    label: '自由富文本',
    description: '整段套 prose 樣式的富文本內容',
    Icon: FileText,
    tone: 'text-violet-700 bg-violet-50',
  },
}

const DYNAMIC_TYPE_ORDER: DynamicPageSectionType[] = [
  'text_block',
  'cta_banner',
  'image_text',
  'rich_content',
]

type Props = {
  page: PageSectionPage
  /**
   * 點固定區塊「編輯」時觸發 — 父層 ContentAdminPage 用此 callback
   * 把對應 ContentBlock accordion 展開 + scroll 到視窗中央
   */
  onEditFixed?: (contentBlockKey: string) => void
}

export function PageSectionsManager({ page, onEditFixed }: Props) {
  const [sections, setSections] = useState<AdminPageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<AdminPageSection | null>(null)
  const { confirm, node: confirmNode } = useConfirm()

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/page-sections?page=${encodeURIComponent(page)}`)
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '讀取區塊失敗')
      setSections(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function move(section: AdminPageSection, dir: 'up' | 'down') {
    try {
      const moved = await swapOrderByIndex(
        sections,
        section.id,
        dir,
        (sid) => `/api/admin/page-sections/${sid}`,
      )
      if (moved) fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? `排序失敗：${err.message}` : '排序失敗')
    }
  }

  async function toggleVisible(section: AdminPageSection) {
    try {
      const r = await fetch(`/api/admin/page-sections/${section.id}`, {
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

  async function createSection(type: DynamicPageSectionType) {
    try {
      const r = await fetch(`/api/admin/page-sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, type }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '新增失敗')
      toast.success(`已新增「${DYNAMIC_META[type].label}」`)
      setCreateOpen(false)
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '新增失敗')
    }
  }

  function remove(section: AdminPageSection) {
    if (isFixedType(page, section.type)) {
      toast.error('固定區塊不能刪除，請改用「隱藏」')
      return
    }
    const meta = DYNAMIC_META[section.type as DynamicPageSectionType]
    confirm({
      title: `刪除「${meta?.label ?? section.type}」？`,
      body: '此區塊與內含的圖片、文字內容都會一併刪除。',
      destructive: true,
      onConfirm: async () => {
        try {
          const r = await fetch(`/api/admin/page-sections/${section.id}`, { method: 'DELETE' })
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

  function handleEdit(section: AdminPageSection) {
    if (isFixedType(page, section.type)) {
      const fixedMeta = FIXED_META_BY_PAGE[page][section.type]
      if (fixedMeta?.contentBlockKey && onEditFixed) {
        onEditFixed(fixedMeta.contentBlockKey)
        return
      }
      if (fixedMeta?.externalHref) {
        window.location.href = fixedMeta.externalHref
        return
      }
      toast.info('此區塊無文案可編輯（由其他管理頁維護）')
      return
    }
    setEditingSection(section)
  }

  const sorted = sections.slice().sort((a, b) => a.order - b.order)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-ink-muted">
          固定 + 動態區塊統一排序。固定區塊（🔒 鎖頭）只能排序與隱藏，不能刪；動態區塊可新增、編輯、刪除。
        </p>
        <button
          onClick={() => setCreateOpen(true)}
          className="btn-primary !py-2 !px-4 !text-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          新增動態區塊
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 text-primary-deep animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-bg-soft py-12 text-center text-ink-muted text-sm">
          尚無區塊（首次載入會自動建立固定區塊）
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((section, idx) => {
            const fixed = isFixedType(page, section.type)
            const fixedMeta = fixed ? FIXED_META_BY_PAGE[page][section.type] : undefined
            const dynamicMeta = !fixed
              ? DYNAMIC_META[section.type as DynamicPageSectionType]
              : undefined
            const meta = fixedMeta ?? dynamicMeta
            if (!meta) return null
            const Icon = meta.Icon
            const summary = fixedMeta ? fixedMeta.description : dynamicSummary(section)
            const isExternalFixed =
              !!fixedMeta && !fixedMeta.contentBlockKey && !!fixedMeta.externalHref
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
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-ink">{meta.label}</h3>
                      {fixed && (
                        <span className="inline-flex items-center gap-1 text-[11px] rounded bg-primary/10 text-primary-deep px-1.5 py-0.5">
                          <Lock className="h-3 w-3" />
                          固定
                        </span>
                      )}
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
                      {section.isVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    {isExternalFixed && fixedMeta?.externalHref ? (
                      <Link
                        href={fixedMeta.externalHref}
                        className="rounded-md p-2 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition"
                        title="到對應管理頁編輯"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEdit(section)}
                        className="rounded-md p-2 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition"
                        title={fixed ? '編輯文案（會展開下方固定欄位）' : '編輯內容'}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {!fixed && (
                      <button
                        onClick={() => remove(section)}
                        className="rounded-md p-2 text-ink-soft hover:text-danger hover:bg-danger/10 transition"
                        title="刪除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        size="lg"
        title="選擇要新增的動態區塊類型"
        description="固定區塊由系統自動建立、不能新增；新區塊放在最後，可上下移調整位置"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DYNAMIC_TYPE_ORDER.map((type) => {
            const meta = DYNAMIC_META[type]
            const Icon = meta.Icon
            return (
              <button
                key={type}
                type="button"
                onClick={() => createSection(type)}
                className="card-hover flex items-start gap-3 rounded-xl border border-hairline bg-white p-4 text-left transition hover:border-primary-deep/40"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}
                >
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

      <PageSectionConfigModal
        key={editingSection?.id ?? 'closed'}
        open={!!editingSection}
        onClose={() => setEditingSection(null)}
        section={editingSection}
        onSaved={fetchAll}
      />

      {confirmNode}
    </div>
  )
}

function dynamicSummary(section: AdminPageSection): string {
  const cfg = section.config as Record<string, unknown>
  const title = typeof cfg.title === 'string' && cfg.title.trim() ? cfg.title : null
  const titleLine1 =
    typeof cfg.titleLine1 === 'string' && cfg.titleLine1.trim() ? cfg.titleLine1 : null
  const html = typeof cfg.html === 'string' && cfg.html.trim() ? cfg.html : null

  switch (section.type) {
    case 'text_block':
      return title ?? '尚未填寫標題'
    case 'cta_banner':
      return titleLine1 ?? '尚未填寫主標'
    case 'image_text':
      return title ?? '尚未填寫標題'
    case 'rich_content':
      if (!html) return '尚未填寫內容'
      return html.replace(/<[^>]+>/g, '').slice(0, 50)
    default:
      return ''
  }
}
