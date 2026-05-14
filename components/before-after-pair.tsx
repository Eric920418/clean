import { LightboxImage } from './lightbox-image'
import { cn } from '@/lib/utils'

type BeforeAfterPairProps = {
  beforeUrl: string
  afterUrl: string
  caption?: string | null
  location?: string | null
  /** 4/3 (default) | 1/1 | 16/9 */
  aspect?: 'photo' | 'square' | 'video'
  className?: string
  priority?: boolean
}

/**
 * 傳統並排式對比：左 Before、右 After（手機自動上下堆疊）。
 * 純 server component — 無 client state，無 JS bundle。
 */
export function BeforeAfterPair({
  beforeUrl,
  afterUrl,
  caption,
  location,
  aspect = 'photo',
  className,
  priority = false,
}: BeforeAfterPairProps) {
  const aspectClass =
    aspect === 'video' ? 'aspect-video' : aspect === 'square' ? 'aspect-square' : 'aspect-[4/3]'

  return (
    <figure className={cn('group', className)}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <Pane url={beforeUrl} label="清洗前" tone="ink" aspectClass={aspectClass} priority={priority} caption={caption} />
        <Pane url={afterUrl} label="清洗後" tone="primary" aspectClass={aspectClass} priority={priority} caption={caption} />
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

function Pane({
  url,
  label,
  tone,
  aspectClass,
  priority,
  caption,
}: {
  url: string
  label: '清洗前' | '清洗後'
  tone: 'ink' | 'primary'
  aspectClass: string
  priority: boolean
  caption?: string | null
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-hairline bg-bg-soft',
        aspectClass,
      )}
    >
      <LightboxImage
        src={url}
        alt={`${label}${caption ? ` · ${caption}` : ''}`}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover transition duration-500 group-hover:scale-[1.02]"
        priority={priority}
        caption={caption ? `${label} · ${caption}` : label}
      />
      <span
        className={cn(
          'pointer-events-none absolute left-3 top-3 z-10 rounded-md px-2.5 py-1 text-xs font-medium tracking-wide text-white shadow-sm',
          tone === 'ink' ? 'bg-ink/80 backdrop-blur-sm' : 'bg-primary/95',
        )}
      >
        {label}
      </span>
    </div>
  )
}
