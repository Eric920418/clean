'use client'

import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ArrowLeftRight } from 'lucide-react'

type BeforeAfterSliderProps = {
  beforeUrl: string
  afterUrl: string
  caption?: string | null
  location?: string | null
  initialPosition?: number // 0–100，預設 50
  aspect?: 'video' | 'square' | 'photo' // 16/9 | 1/1 | 4/3
  className?: string
  priority?: boolean
}

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  caption,
  location,
  initialPosition = 50,
  aspect = 'photo',
  className,
  priority = false,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(initialPosition)
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const aspectClass =
    aspect === 'video' ? 'aspect-video' : aspect === 'square' ? 'aspect-square' : 'aspect-[4/3]'

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, pct)))
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    updateFromClientX(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    e.preventDefault()
    updateFromClientX(e.clientX)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 5))
    else if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 5))
  }

  return (
    <figure className={cn('group relative select-none', className)}>
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden rounded-xl bg-bg-soft',
          aspectClass,
          'cursor-ew-resize touch-none',
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label={`前後對比${caption ? `：${caption}` : ''}，目前顯示 After ${Math.round(position)}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {/* Before（底層，完整顯示） */}
        <Image
          src={beforeUrl}
          alt={`Before${caption ? ` · ${caption}` : ''}`}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority={priority}
          draggable={false}
        />
        <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-ink/80 px-2 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-sm">
          清洗前
        </span>

        {/* After（上層，clip-path 動態裁切） */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={afterUrl}
            alt={`After${caption ? ` · ${caption}` : ''}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority={priority}
            draggable={false}
          />
          <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-primary/95 px-2 py-1 text-xs font-medium tracking-wide text-white shadow-sm">
            清洗後
          </span>
        </div>

        {/* 分隔線與拖曳手柄 */}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.15)]"
          style={{ left: `calc(${position}% - 1px)` }}
        >
          <div className="pointer-events-none absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-hairline transition group-hover:scale-105">
            <ArrowLeftRight className="h-5 w-5 text-primary-deep" strokeWidth={2.4} />
          </div>
        </div>
      </div>

      {(caption || location) && (
        <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 text-sm text-ink-soft">
          {caption && <span>{caption}</span>}
          {location && (
            <span className="text-ink-muted before:mr-2 before:content-['·']">{location}</span>
          )}
        </figcaption>
      )}
    </figure>
  )
}
