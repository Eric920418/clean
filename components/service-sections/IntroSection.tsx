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
  const body = configString(section.config, 'body')
  // 舊資料相容：尚未經過後台重存的 intro section 仍保有 paragraph1/2/3
  const paragraph1 = configString(section.config, 'paragraph1')
  const paragraph2 = configString(section.config, 'paragraph2')
  const paragraph3 = configString(section.config, 'paragraph3')

  if (!title && !image && !body && !paragraph1 && !paragraph2 && !paragraph3) return null

  const legacyParagraphs = [paragraph1, paragraph2, paragraph3].filter(
    (p): p is string => Boolean(p && p.trim()),
  )
  const hasContent = Boolean(body) || legacyParagraphs.length > 0

  return (
    <section className="section pt-12 md:pt-16">
      <div className="container-narrow grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div>
          {title && (
            <SectionHeading eyebrow={eyebrow ?? undefined} title={title} />
          )}
          {hasContent && (
            <div className="mt-6 space-y-4 text-base leading-loose text-ink-soft">
              {body ? (
                <RichText html={body} />
              ) : (
                legacyParagraphs.map((p, i) => <RichText key={i} html={p} />)
              )}
            </div>
          )}
        </div>
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
      </div>
    </section>
  );
}
