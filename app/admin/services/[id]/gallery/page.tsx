'use client'

import { useEffect, useState, useRef, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Trash2, ArrowLeft, Loader2, Upload, Save } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ErrorBanner } from '@/components/admin/error-banner'
import { inputClass } from '@/components/admin/form-field'
import { cn } from '@/lib/utils'
import type { AdminGalleryImage, AdminService } from '@/lib/admin-types'

type PageProps = { params: Promise<{ id: string }> }

export default function GalleryPage({ params }: PageProps) {
  const { id } = use(params)
  const [service, setService] = useState<AdminService | null>(null)
  const [images, setImages] = useState<AdminGalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  async function fetchAll() {
    setLoading(true)
    try {
      const [srvRes, gRes] = await Promise.all([
        fetch(`/api/admin/services/${id}`),
        fetch(`/api/admin/services/${id}/gallery`),
      ])
      const srv = await srvRes.json()
      const g = await gRes.json()
      if (!srvRes.ok) throw new Error(srv.error || '讀取服務失敗')
      if (!gRes.ok) throw new Error(g.error || '讀取圖庫失敗')
      setService(srv)
      setImages(g)
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

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    let successCount = 0
    let nextOrder = images.length

    for (const file of files) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', 'gallery')
        const upRes = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const upData = await upRes.json()
        if (!upRes.ok) throw new Error(upData.error || '上傳失敗')

        const r = await fetch(`/api/admin/services/${id}/gallery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: upData.url,
            alt: file.name.replace(/\.[^/.]+$/, ''),
            order: nextOrder++,
          }),
        })
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || '建立失敗')
        successCount++
      } catch (err) {
        toast.error(`${file.name}：${err instanceof Error ? err.message : '上傳失敗'}`)
      }
    }

    if (successCount > 0) toast.success(`成功上傳 ${successCount} 張`)
    setUploading(false)
    if (fileInput.current) fileInput.current.value = ''
    fetchAll()
  }

  async function updateAlt(img: AdminGalleryImage, alt: string) {
    try {
      const r = await fetch(`/api/admin/services/${id}/gallery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: img.id, alt }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '更新失敗')
      toast.success('已儲存 alt')
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失敗')
    }
  }

  async function remove(img: AdminGalleryImage) {
    if (!confirm('刪除此圖片？R2 圖檔會一併刪除。')) return
    try {
      const r = await fetch(`/api/admin/services/${id}/gallery?imageId=${img.id}`, {
        method: 'DELETE',
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || '刪除失敗')
      toast.success('已刪除')
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '刪除失敗')
    }
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
          回列表
        </Link>
      </div>
    )
  }

  return (
    <>
      <AdminPageHeader
        title={`${service.name}・圖庫`}
        description="一般展示圖（非對比）。可一次上傳多張、調整 alt、排序"
        breadcrumb={[
          { label: '服務管理', href: '/admin/services' },
          { label: service.name, href: `/admin/services/${service.id}/edit` },
          { label: '圖庫' },
        ]}
        actions={
          <label className="btn-primary !py-2 !px-4 !text-sm cursor-pointer">
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                上傳中…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                批量上傳
              </>
            )}
          </label>
        }
      />

      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-bg-soft py-20 text-center text-ink-muted">
          尚未上傳任何圖庫照片
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <GalleryCard
              key={img.id}
              img={img}
              onUpdateAlt={updateAlt}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </>
  )
}

function GalleryCard({
  img,
  onUpdateAlt,
  onDelete,
}: {
  img: AdminGalleryImage
  onUpdateAlt: (img: AdminGalleryImage, alt: string) => void
  onDelete: (img: AdminGalleryImage) => void
}) {
  const [alt, setAlt] = useState(img.alt ?? '')
  const dirty = alt !== (img.alt ?? '')

  return (
    <article className="rounded-xl border border-hairline bg-white overflow-hidden">
      <div className="relative aspect-[4/3] bg-bg-soft">
        <Image
          src={img.url}
          alt={img.alt ?? ''}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          unoptimized
        />
        <button
          onClick={() => onDelete(img)}
          className="absolute right-2 top-2 rounded-md bg-white/90 p-1.5 text-danger shadow-sm hover:bg-white transition"
          title="刪除"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="p-3 flex gap-2">
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          className={inputClass}
          placeholder="alt 文字（SEO 與無障礙）"
        />
        {dirty && (
          <button
            onClick={() => onUpdateAlt(img, alt)}
            className="rounded-md bg-primary text-white p-2 hover:bg-primary-deep transition shrink-0"
            title="儲存"
          >
            <Save className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  )
}
