'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Trash2, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useConfirm } from '@/components/admin/confirm-dialog'
import { inputClass } from '@/components/admin/form-field'
import type { AdminGalleryImage } from '@/lib/admin-types'

type Props = {
  serviceId: number
  sectionId: number
  images: AdminGalleryImage[]
  onChange: () => void
}

export function GalleryEditor({ serviceId, sectionId, images, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { confirm, node: confirmNode } = useConfirm()

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const startOrder = images.length
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // 上 R2
        const form = new FormData()
        form.append('file', file)
        form.append('folder', `service-section-${sectionId}`)
        const upR = await fetch('/api/admin/upload', { method: 'POST', body: form })
        const upData = await upR.json()
        if (!upR.ok) throw new Error(upData.error || `${file.name} 上傳失敗`)

        // 寫 DB
        const r = await fetch(`/api/admin/services/${serviceId}/gallery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: upData.data?.url ?? upData.url,
            alt: '',
            order: startOrder + i,
            sectionId,
          }),
        })
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || `${file.name} 寫入失敗`)
      }
      onChange()
      toast.success(`已上傳 ${files.length} 張`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '上傳失敗')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function updateAlt(id: number, alt: string) {
    try {
      const r = await fetch(`/api/admin/services/${serviceId}/gallery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: id, alt }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '更新失敗')
      onChange()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失敗')
    }
  }

  function remove(id: number) {
    confirm({
      title: '刪除這張圖？',
      body: '此圖會從本區塊與 R2 同時移除。',
      destructive: true,
      onConfirm: async () => {
        try {
          const r = await fetch(`/api/admin/services/${serviceId}/gallery?imageId=${id}`, {
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
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm text-ink-soft">{images.length} 張圖</span>
        <label className="btn-primary !py-2 !px-4 !text-sm cursor-pointer">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? '上傳中…' : '上傳圖片（可多選）'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="text-sm text-ink-muted text-center py-10 rounded-lg border border-dashed border-hairline">
          此區塊尚未上傳任何圖片
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {images.map((img) => (
            <li key={img.id} className="rounded-lg border border-hairline bg-white p-2 space-y-2">
              <div className="relative aspect-square overflow-hidden rounded-md bg-bg-soft">
                <Image
                  src={img.url}
                  alt={img.alt ?? ''}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(min-width: 768px) 33vw, 50vw"
                />
              </div>
              <input
                defaultValue={img.alt ?? ''}
                onBlur={(e) => {
                  if (e.target.value !== (img.alt ?? '')) updateAlt(img.id, e.target.value)
                }}
                className={`${inputClass} !text-xs !py-1.5`}
                placeholder="圖片說明（alt 文字，SEO 用）"
              />
              <button
                onClick={() => remove(img.id)}
                className="w-full text-xs text-ink-soft hover:text-danger transition flex items-center justify-center gap-1 py-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                刪除
              </button>
            </li>
          ))}
        </ul>
      )}
      {confirmNode}
    </>
  )
}
