import { SectionHeading } from '@/components/section-heading'
import { BeforeAfterPair } from '@/components/before-after-pair'
import type { SectionWithRelations, ServiceForSection } from './types'
import { configString } from './types'

type Props = {
  section: SectionWithRelations
  service: ServiceForSection
}

export function BeforeAfterSection({ section, service }: Props) {
  const pairs = section.beforeAfters
  if (pairs.length === 0) return null

  const eyebrow = configString(section.config, 'eyebrow') ?? 'Real Results'
  const title = configString(section.config, 'title') ?? `${service.name}・實際施作前後`
  const description =
    configString(section.config, 'description') ?? '所有照片均為實際施作案例，未經修飾濾鏡。'

  return (
    <section id="works" className="bg-bg-soft py-16 md:py-24">
      <div className="container-narrow">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="mx-auto mt-9 grid max-w-4xl grid-cols-1 gap-10">
          {pairs.map((p) => (
            <BeforeAfterPair
              key={p.id}
              beforeUrl={p.beforeUrl}
              afterUrl={p.afterUrl}
              caption={p.caption}
              location={p.location}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
