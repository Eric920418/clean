import { SectionHeading } from '@/components/section-heading'
import type { SectionWithRelations } from './types'
import { configString } from './types'

type Props = {
  section: SectionWithRelations
}

export function TextBlockSection({ section }: Props) {
  const eyebrow = configString(section.config, 'eyebrow')
  const title = configString(section.config, 'title')
  const body = configString(section.config, 'body')

  if (!title && !body) return null

  return (
    <section className="section">
      <div className="container-narrow max-w-3xl">
        {title && <SectionHeading eyebrow={eyebrow ?? undefined} title={title} align="center" />}
        {body && (
          <div className="mt-6 whitespace-pre-line text-center text-base leading-loose text-ink-soft">
            {body}
          </div>
        )}
      </div>
    </section>
  )
}
