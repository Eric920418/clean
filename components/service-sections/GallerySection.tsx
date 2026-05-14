import { SectionHeading } from '@/components/section-heading'
import { LightboxImage } from '@/components/lightbox-image'
import type { SectionWithRelations, ServiceForSection } from './types'
import { configString } from './types'

type Props = {
  section: SectionWithRelations
  service: ServiceForSection
}

export function GallerySection({ section, service }: Props) {
  const images = section.galleryImgs
  if (images.length === 0) return null

  const eyebrow = configString(section.config, 'eyebrow') ?? 'Gallery'
  const title = configString(section.config, 'title') ?? '施作過程'

  return (
    <section className="section">
      <div className="container-narrow">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-hairline"
            >
              <LightboxImage
                src={img.url}
                alt={img.alt ?? service.name}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
                unoptimized
                caption={img.alt ?? service.name}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
