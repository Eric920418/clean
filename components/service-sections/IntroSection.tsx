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
  // 'left' = 圖在左、文字在右；其餘（含未設定）一律當預設 'right'
  const imagePosition = configString(section.config, 'imagePosition') === 'left' ? 'left' : 'right'
  // 舊資料相容：尚未經過後台重存的 intro section 仍保有 paragraph1/2/3
  const paragraph1 = configString(section.config, 'paragraph1')
  const paragraph2 = configString(section.config, 'paragraph2')
  const paragraph3 = configString(section.config, 'paragraph3')

  if (!title && !image && !body && !paragraph1 && !paragraph2 && !paragraph3) return null

  const legacyParagraphs = [paragraph1, paragraph2, paragraph3].filter(
    (p): p is string => Boolean(p && p.trim()),
  )
  const hasContent = Boolean(body) || legacyParagraphs.length > 0

  const textBlock = (
    <div key="text">
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
  )

  const imageBlock = image && (
    <div key="image" className="relative aspect-[4/5] overflow-hidden rounded-2xl">
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
  )

  // 圖在左 → image 先、text 後；圖在右（預設）→ text 先、image 後
  // 手機 1 欄時也跟著切換（圖優先 / 文優先），保留版主在桌機選擇的閱讀意圖
  const ordered = imagePosition === 'left' && imageBlock
    ? [imageBlock, textBlock]
    : [textBlock, imageBlock]

  return (
    <section className="section pt-12 md:pt-16">
      <div className="container-narrow grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        {ordered}
      </div>
    </section>
  );
}
