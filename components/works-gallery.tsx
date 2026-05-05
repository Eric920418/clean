'use client'

import { useState } from 'react'
import { BeforeAfterPair } from '@/components/before-after-pair'
import { cn } from '@/lib/utils'

type GalleryItem = {
  id: number
  beforeUrl: string
  afterUrl: string
  caption: string
  location: string | null
  serviceSlug: string
  serviceName: string
}

type Filter = { slug: string; name: string; count: number }

type Props = {
  items: GalleryItem[]
  filters: Filter[]
}

export function WorksGallery({ items, filters }: Props) {
  const [active, setActive] = useState<string>('all')

  const filtered = active === 'all' ? items : items.filter((i) => i.serviceSlug === active)

  return (
    <>
      <div className="flex flex-wrap gap-2 border-b border-hairline pb-6">
        {filters.map((f) => (
          <button
            key={f.slug}
            onClick={() => setActive(f.slug)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition',
              active === f.slug
                ? 'border-primary bg-primary text-white'
                : 'border-hairline bg-white text-ink-soft hover:border-primary-soft hover:text-primary-deep',
            )}
          >
            <span>{f.name}</span>
            <span
              className={cn(
                'rounded-full px-1.5 text-xs',
                active === f.slug ? 'bg-white/20 text-white' : 'bg-bg-soft text-ink-muted',
              )}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-10">
        {filtered.map((p) => (
          <div key={p.id} className="space-y-3">
            <BeforeAfterPair
              beforeUrl={p.beforeUrl}
              afterUrl={p.afterUrl}
              caption={p.caption}
              location={p.location}
            />
            <span className="inline-flex rounded-full bg-bg-tint px-3 py-1 text-xs font-medium text-primary-deep">
              {p.serviceName}
            </span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-hairline bg-bg-soft p-16 text-center text-ink-muted">
          這個分類目前還沒有實績照片
        </div>
      )}
    </>
  )
}
