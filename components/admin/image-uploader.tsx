'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  value?: string | null
  onChange: (url: string) => void
  folder?: string
  /** 提示文字（預設「點擊上傳圖片」） */
  hint?: string
  /** 容器尺寸（預設 w-40 h-40） */
  className?: string
}

export function ImageUploader({
  value,
  onChange,
  folder = 'images',
  hint = '點擊上傳圖片',
  className,
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '上傳失敗')
      }

      onChange(data.url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '上傳失敗'
      setError(msg)
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleRemove() {
    onChange('')
    setError('')
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className={cn('relative', className ?? 'w-40 h-40')}>
          <div className="relative w-full h-full overflow-hidden rounded-lg border border-hairline bg-bg-soft">
            <Image
              src={value}
              alt="已上傳圖片"
              fill
              className="object-cover"
              unoptimized
              sizes="320px"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center hover:bg-danger/85 transition-colors shadow-sm"
            aria-label="移除圖片"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            'flex flex-col items-center justify-center border-2 border-dashed border-hairline rounded-lg cursor-pointer hover:border-primary hover:bg-bg-tint/40 transition-colors',
            className ?? 'w-40 h-40',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleUpload}
            className="hidden"
            disabled={loading}
          />
          {loading ? (
            <Loader2 className="w-7 h-7 text-primary-deep animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-7 h-7 text-ink-muted mb-2" />
              <span className="text-sm text-ink-soft">{hint}</span>
              <span className="text-[11px] text-ink-muted mt-1">
                <Upload className="w-3 h-3 inline mr-0.5" />
                JPG/PNG/WebP，最大 5MB
              </span>
            </>
          )}
        </label>
      )}

      {error && (
        <p className="text-danger text-sm leading-snug max-w-md">{error}</p>
      )}
    </div>
  )
}
