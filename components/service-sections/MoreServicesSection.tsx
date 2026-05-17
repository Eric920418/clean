import Link from 'next/link'
import { SectionHeading } from '@/components/section-heading'
import { IconByName } from '@/components/icon-by-name'
import type { Service } from '@prisma/client'

type Props = {
  others: Service[]
}

export function MoreServicesSection({ others }: Props) {
  if (others.length === 0) return null
  return (
    <section className="container-narrow pb-16 md:pb-24">
      <SectionHeading eyebrow="More services" title="您可能也需要" />
      <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-3">
        {others.map((s) => (
          <Link
            key={s.id}
            href={`/services/${s.slug}`}
            className="card-hover group rounded-xl border border-hairline bg-white p-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-tint text-primary-deep">
              <IconByName name={s.icon ?? 'Sparkles'} className="h-4 w-4" />
            </span>
            <h3 className="mt-4 text-lg font-medium text-ink">{s.name}</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{s.shortDesc}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
