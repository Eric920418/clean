import { SectionHeading } from '@/components/section-heading'
import { Faq } from '@/components/faq'
import type { SectionWithRelations } from './types'
import { configString } from './types'

type Props = {
  section: SectionWithRelations
}

export function FaqSection({ section }: Props) {
  const faqs = section.faqs
  if (faqs.length === 0) return null

  const eyebrow = configString(section.config, 'eyebrow') ?? 'FAQ'
  const title = configString(section.config, 'title') ?? '常見問題'

  return (
    <section className="bg-bg-soft py-16 md:py-24">
      <div className="container-narrow max-w-3xl">
        <SectionHeading eyebrow={eyebrow} title={title} align="center" />
        <div className="mt-9">
          <Faq items={faqs} />
        </div>
      </div>
    </section>
  )
}
