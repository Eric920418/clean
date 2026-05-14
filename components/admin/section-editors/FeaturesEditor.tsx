'use client'

import { useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { inputClass } from '@/components/admin/form-field'
import { useConfirm } from '@/components/admin/confirm-dialog'
import type { AdminServiceFeature } from '@/lib/admin-types'

type Props = {
  serviceId: number
  sectionId: number
  features: AdminServiceFeature[]
  onChange: () => void
}

export function FeaturesEditor({ serviceId, sectionId, features, onChange }: Props) {
  const [newText, setNewText] = useState('')
  const [busy, setBusy] = useState(false)
  const { confirm, node: confirmNode } = useConfirm()

  async function add() {
    if (!newText.trim()) return
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newText.trim(),
          order: features.length,
          sectionId,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '新增失敗')
      setNewText('')
      onChange()
      toast.success('已新增重點')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '新增失敗')
    } finally {
      setBusy(false)
    }
  }

  async function update(id: number, text: string) {
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/features/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '更新失敗')
      toast.success('已儲存')
      onChange()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失敗')
    }
  }

  function remove(id: number) {
    confirm({
      title: '刪除這條重點？',
      destructive: true,
      onConfirm: async () => {
        try {
          const r = await fetch(`/api/admin/services/${serviceId}/features/${id}`, {
            method: 'DELETE',
          })
          const data = await r.json()
          if (!r.ok) throw new Error(data.error || '刪除失敗')
          onChange()
          toast.success('已刪除')
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '刪除失敗')
        }
      },
    })
  }

  return (
    <>
      <ul className="space-y-2 mb-4">
        {features.length === 0 && (
          <li className="text-sm text-ink-muted text-center py-6 rounded-lg border border-dashed border-hairline">
            此區塊尚未新增任何重點
          </li>
        )}
        {features.map((f) => (
          <FeatureRow key={f.id} feature={f} onUpdate={update} onDelete={remove} />
        ))}
      </ul>

      <div className="flex gap-2 pt-3 border-t border-hairline-soft">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          className={inputClass}
          placeholder="新增重點，如：全拆解清洗風輪、鋁片、排水盤"
        />
        <button
          onClick={add}
          disabled={busy || !newText.trim()}
          className="btn-primary !py-2 !px-3 !text-sm disabled:opacity-60 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {confirmNode}
    </>
  )
}

function FeatureRow({
  feature,
  onUpdate,
  onDelete,
}: {
  feature: AdminServiceFeature
  onUpdate: (id: number, text: string) => void
  onDelete: (id: number) => void
}) {
  const [text, setText] = useState(feature.text)
  const dirty = text !== feature.text

  return (
    <li className="flex items-center gap-2 group">
      <input value={text} onChange={(e) => setText(e.target.value)} className={inputClass} />
      {dirty && (
        <button
          onClick={() => onUpdate(feature.id, text)}
          className="text-primary-deep hover:bg-primary/10 rounded-md p-1.5 transition shrink-0"
          title="儲存"
        >
          <Save className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => onDelete(feature.id)}
        className="text-ink-soft hover:text-danger hover:bg-danger/10 rounded-md p-1.5 transition shrink-0"
        title="刪除"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}
