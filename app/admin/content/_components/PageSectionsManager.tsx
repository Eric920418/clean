'use client'

import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminModal } from '@/components/admin/admin-modal'
import { ErrorBanner } from '@/components/admin/error-banner'
import { useConfirm } from '@/components/admin/confirm-dialog'
import { PageSectionConfigModal } from '@/components/admin/page-section-config-modal'
import type {
  AdminPageSection,
  PageSectionPage,
  PageSectionType,
} from '@/lib/admin-types'
import { swapOrderByIndex } from '@/lib/admin-reorder'

const TYPE_META: Record<
  PageSectionType,
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
    description: '深色背景的預約 / 來電 banner（背景圖、按鈕、LINE）',
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

const TYPE_ORDER: PageSectionType[] = ['text_block', 'cta_banner', 'image_text', 'rich_content']

type Props = {
  page: PageSectionPage
}

export function PageSectionsManager({ page }: Props) {
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

  async function createSection(type: PageSectionType) {
    try {
      const r = await fetch(`/api/admin/page-sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, type }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '新增失敗')
      toast.success(`已新增「${TYPE_META[type].label}」`)
      setCreateOpen(false)
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '新增失敗')
    }
  }

  function remove(section: AdminPageSection) {
    const meta = TYPE_META[section.type]
    confirm({
      title: `刪除「${meta.label}」？`,
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

  const sorted = sections.slice().sort((a, b) => a.order - b.order)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-ink-muted">
          這些區塊會渲染在固定區塊（Hero、故事段、Belief 等）之後、CTA 之前。可上下調順序、隱藏、刪除。
        </p>
        <button
          onClick={() => setCreateOpen(true)}
          className="btn-primary !py-2 !px-4 !text-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          新增區塊
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 text-primary-deep animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-bg-soft py-12 text-center text-ink-muted text-sm">
          尚未建立任何附加區塊，點上方「新增區塊」開始
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((section, idx) => {
            const meta = TYPE_META[section.type] ?? TYPE_META.text_block
            const Icon = meta.Icon
            const summary = sectionSummary(section)
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
                      onClick={() => setEditingSection(section)}
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

      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        size="lg"
        title="選擇要新增的區塊類型"
        description="新區塊放在最後，可上下移調整順序"
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

function sectionSummary(section: AdminPageSection): string {
  const cfg = section.config as Record<string, unknown>
  const title = typeof cfg.title === 'string' && cfg.title.trim() ? cfg.title : null
  const titleLine1 = typeof cfg.titleLine1 === 'string' && cfg.titleLine1.trim() ? cfg.titleLine1 : null
  const html = typeof cfg.html === 'string' && cfg.html.trim() ? cfg.html : null

  switch (section.type) {
    case 'text_block':
      return title ?? '尚未填寫標題'
    case 'cta_banner':
      return titleLine1 ?? '尚未填寫主標'
    case 'image_text':
      return title ?? '尚未填寫標題'
    case 'rich_content':
      // 從 HTML 取 50 字摘要
      if (!html) return '尚未填寫內容'
      return html.replace(/<[^>]+>/g, '').slice(0, 50)
  }
}
