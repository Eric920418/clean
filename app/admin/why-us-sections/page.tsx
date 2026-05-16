'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminModal } from '@/components/admin/admin-modal'
import { Field, inputClass, textareaClass } from '@/components/admin/form-field'
import { ErrorBanner } from '@/components/admin/error-banner'
import { useConfirm } from '@/components/admin/confirm-dialog'
import { cn } from '@/lib/utils'
import { emptyCards, WHY_US_CARD_COUNT, type WhyUsCard } from '@/lib/why-us'
import type { AdminWhyUsSection } from '@/lib/admin-types'
import { swapOrderByIndex } from '@/lib/admin-reorder'

type Location = 'home' | 'about'
const LOCATION_LABEL: Record<Location, string> = {
  home: '首頁「為何選我們」',
  about: '關於頁「三項職人信仰」',
}

type FormState = {
  location: Location
  eyebrow: string
  title: string
  description: string
  cards: WhyUsCard[]
}

const emptyForm: FormState = {
  location: 'home',
  eyebrow: '',
  title: '',
  description: '',
  cards: emptyCards(),
}

export default function WhyUsSectionsPage() {
  const [items, setItems] = useState<AdminWhyUsSection[]>([])
  const [activeLocation, setActiveLocation] = useState<Location>('home')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminWhyUsSection | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { confirm, node: confirmNode } = useConfirm()

  const visibleItems = items.filter((it) => it.location === activeLocation)

  async function fetchAll() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/why-us-sections')
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '讀取失敗')
      setItems(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '讀取失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, location: activeLocation, cards: emptyCards() })
    setError(null)
    setOpen(true)
  }

  function openEdit(it: AdminWhyUsSection) {
    setEditing(it)
    setForm({
      location: (it.location === 'about' ? 'about' : 'home') as Location,
      eyebrow: it.eyebrow ?? '',
      title: it.title,
      description: it.description ?? '',
      cards: it.cards.length === WHY_US_CARD_COUNT ? it.cards : emptyCards(),
    })
    setError(null)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const url = editing
        ? `/api/admin/why-us-sections/${editing.id}`
        : '/api/admin/why-us-sections'
      const r = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '儲存失敗')
      toast.success(editing ? '已更新' : '已新增')
      setOpen(false)
      fetchAll()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '儲存失敗'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  function remove(it: AdminWhyUsSection) {
    confirm({
      title: `刪除「${it.title}」這一組？`,
      body: '刪除後此區塊不會出現在首頁。此動作無法還原。',
      destructive: true,
      onConfirm: async () => {
        try {
          const r = await fetch(`/api/admin/why-us-sections/${it.id}`, {
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

  // 上下移動：在同 location 內互換（visibleItems 已 filter by activeLocation；DB 的 order 也按 location 分組從 0 起算）
  async function move(section: AdminWhyUsSection, dir: 'up' | 'down') {
    try {
      const moved = await swapOrderByIndex(
        visibleItems,
        section.id,
        dir,
        (sid) => `/api/admin/why-us-sections/${sid}`,
      )
      if (moved) fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? `排序失敗：${err.message}` : '排序失敗')
    }
  }

  function updateCard(idx: number, patch: Partial<WhyUsCard>) {
    setForm((prev) => ({
      ...prev,
      cards: prev.cards.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }))
  }

  return (
    <>
      <AdminPageHeader
        title="為何選我們"
        description="可在首頁或關於頁顯示，每組固定三張卡片"
        actions={
          <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-sm">
            <Plus className="h-4 w-4" />
            新增區塊
          </button>
        }
      />

      <div className="mb-4 inline-flex rounded-lg border border-hairline bg-white p-1">
        {(Object.keys(LOCATION_LABEL) as Location[]).map((loc) => (
          <button
            key={loc}
            onClick={() => setActiveLocation(loc)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition',
              activeLocation === loc
                ? 'bg-primary text-white shadow-sm'
                : 'text-ink-soft hover:text-ink',
            )}
          >
            {LOCATION_LABEL[loc]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-primary-deep animate-spin" />
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-bg-soft py-20 text-center text-ink-muted">
          {LOCATION_LABEL[activeLocation]} 尚未新增任何區塊
        </div>
      ) : (
        <div className="space-y-4">
          {visibleItems.map((it, idx) => (
            <article
              key={it.id}
              className="rounded-xl border border-hairline bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {it.eyebrow && (
                    <div className="text-xs font-semibold tracking-[0.2em] text-primary-deep uppercase">
                      {it.eyebrow}
                    </div>
                  )}
                  <h3 className="mt-1 text-base font-semibold text-ink">{it.title}</h3>
                  {it.description && (
                    <p className="mt-1 text-sm text-ink-soft line-clamp-2">{it.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => move(it, 'up')}
                    disabled={idx === 0}
                    className="rounded-md p-1.5 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="上移"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => move(it, 'down')}
                    disabled={idx === visibleItems.length - 1}
                    className="rounded-md p-1.5 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="下移"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEdit(it)}
                    className="rounded-md p-1.5 text-ink-soft hover:text-primary-deep hover:bg-primary/10 transition"
                    title="編輯"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(it)}
                    className="rounded-md p-1.5 text-ink-soft hover:text-danger hover:bg-danger/10 transition"
                    title="刪除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {it.cards.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-hairline-soft bg-bg-soft p-3"
                  >
                    <div className="text-xs font-semibold text-primary-deep">0{i + 1}</div>
                    <div className="mt-1 text-sm font-medium text-ink line-clamp-1">
                      {c.title}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-muted line-clamp-2">{c.desc}</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? '編輯區塊' : '新增區塊'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorBanner message={error} />

          <Field label="顯示位置" required>
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value as Location })}
              className={inputClass}
            >
              {(Object.keys(LOCATION_LABEL) as Location[]).map((loc) => (
                <option key={loc} value={loc}>
                  {LOCATION_LABEL[loc]}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Eyebrow（小標籤）" hint="例：Why invisible care">
              <input
                value={form.eyebrow}
                onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                className={inputClass}
                placeholder="Why invisible care"
              />
            </Field>
            <Field label="標題" required>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                placeholder="三項堅持，讓家人安心"
                required
              />
            </Field>
          </div>

          <Field label="副標說明" hint="可不填">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={textareaClass}
              rows={2}
              placeholder="我們不追求低價競爭，追求的是「品質的極致」與「客戶的安心」。"
            />
          </Field>

          <div className="border-t border-hairline pt-4">
            <div className="mb-3 text-sm font-semibold text-ink">三張卡片</div>
            <div className="space-y-3">
              {form.cards.map((card, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-hairline-soft bg-bg-soft p-3"
                >
                  <div className="mb-2 text-xs font-semibold tracking-widest text-primary-deep">
                    卡片 0{idx + 1}
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr]">
                    <Field label="標題">
                      <input
                        value={card.title}
                        onChange={(e) => updateCard(idx, { title: e.target.value })}
                        className={inputClass}
                        placeholder="專業技術領先"
                        required
                      />
                    </Field>
                    <Field label="描述">
                      <textarea
                        value={card.desc}
                        onChange={(e) => updateCard(idx, { desc: e.target.value })}
                        className={textareaClass}
                        rows={2}
                        placeholder="師傅皆通過內訓與實戰考核，標準化流程，絕不趕工犧牲品質。"
                        required
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-hairline -mx-4 px-4 -mb-4 pb-4 sm:-mx-5 sm:px-5 sm:-mb-5 md:-mx-6 md:px-6 md:-mb-6 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-ghost !py-2 !px-4 !text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary !py-2 !px-4 !text-sm disabled:opacity-60"
            >
              {submitting ? '儲存中…' : editing ? '更新' : '新增'}
            </button>
          </div>
        </form>
      </AdminModal>

      {confirmNode}
    </>
  )
}
