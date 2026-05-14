import { SectionHeading } from '@/components/section-heading'
import { CheckCircle2 } from 'lucide-react'
import type { SectionWithRelations, ServiceForSection } from './types'
import { configString } from './types'

type Props = {
  section: SectionWithRelations
  service: ServiceForSection
}

export function WhyWithFeaturesSection({ section, service }: Props) {
  const eyebrow = configString(section.config, 'eyebrow') ?? 'Why this matters'
  const title = configString(section.config, 'title') ?? '為什麼這項服務重要？'
  const features = section.features

  return (
    <section className="section">
      <div className="container-narrow grid grid-cols-1 gap-14 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeading eyebrow={eyebrow} title={title} />
          <p className="mt-6 whitespace-pre-line text-base leading-loose text-ink-soft md:text-lg">
            {service.longDesc}
          </p>
        </div>
        <aside className="rounded-xl border border-hairline bg-bg-soft p-7">
          <h3 className="text-base font-medium text-ink">服務重點</h3>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-soft">
            {features.map((f) => (
              <li key={f.id} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-deep" />
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}
