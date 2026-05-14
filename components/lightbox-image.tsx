'use client'

import { useEffect, useId, useRef } from 'react'
import Image from 'next/image'
import { Maximize2 } from 'lucide-react'
import { useLightboxRegister } from './lightbox-provider'
import { cn } from '@/lib/utils'

type LightboxImageProps = {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  className?: string
  priority?: boolean
  unoptimized?: boolean
  caption?: string
}

export function LightboxImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  className,
  priority,
  unoptimized,
  caption,
}: LightboxImageProps) {
  const id = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const lb = useLightboxRegister()

  useEffect(() => {
    if (!lb) return
    return lb.register(id, { src, alt, caption, unoptimized }, buttonRef.current)
  }, [lb, id, src, alt, caption, unoptimized])

  const triggerClass = fill
    ? 'group/lightbox absolute inset-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
    : 'group/lightbox relative inline-block cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => lb?.open(id)}
      aria-label={`放大檢視：${alt}`}
      className={triggerClass}
    >
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={unoptimized}
          className={cn(className)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width ?? 1200}
          height={height ?? 800}
          sizes={sizes}
          priority={priority}
          unoptimized={unoptimized}
          className={cn(className)}
        />
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-200 group-hover/lightbox:bg-ink/10"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 right-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white shadow-sm backdrop-blur-sm transition group-hover/lightbox:bg-black/65"
      >
        <Maximize2 className="h-3.5 w-3.5" strokeWidth={2.25} />
      </span>
    </button>
  )
}
