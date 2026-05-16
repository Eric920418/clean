import { SectionHeading } from '@/components/section-heading'
import { LightboxImage } from '@/components/lightbox-image'
import { RichText } from '@/components/rich-text'
import type { SectionWithRelations, ServiceForSection } from './types'
import { configString } from './types'

type Props = {
  section: SectionWithRelations
  service: ServiceForSection
}

export function IntroSection({ section, service }: Props) {
  const eyebrow = configString(section.config, 'eyebrow')
  const title = configString(section.config, 'title')
  const image = configString(section.config, 'image')
  const paragraph1 = configString(section.config, 'paragraph1')
  const paragraph2 = configString(section.config, 'paragraph2')
  const paragraph3 = configString(section.config, 'paragraph3')

  if (!title && !image && !paragraph1 && !paragraph2 && !paragraph3) return null

  const paragraphs = [paragraph1, paragraph2, paragraph3].filter(
    (p): p is string => Boolean(p && p.trim()),
  )

  return (
    <section className="section pt-12 md:pt-16">
      <div className="container-narrow grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        {image && (
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <LightboxImage
              src={image}
              alt={title ?? service.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              unoptimized
              caption={title ?? service.name}
            />
          </div>
        )}
        <div>
          {title && <SectionHeading eyebrow={eyebrow ?? undefined} title={title} />}
          {paragraphs.length > 0 && (
            <div className="mt-6 space-y-4 text-base leading-loose text-ink-soft">
              {paragraphs.map((p, i) => (
                <RichText key={i} html={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
