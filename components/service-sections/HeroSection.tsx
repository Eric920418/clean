import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { IconByName } from '@/components/icon-by-name'
import type { SectionWithRelations, ServiceForSection } from './types'
import { configString } from './types'

type Props = {
  section: SectionWithRelations
  service: ServiceForSection
  phoneTel: string
}

export function HeroSection({ section, service, phoneTel }: Props) {
  // 允許 config 覆蓋；未填則 fallback 到 Service 欄位
  const heroImage = configString(section.config, 'heroImage') ?? service.heroImage
  const eyebrow = configString(section.config, 'eyebrow')
  const title = configString(section.config, 'title') ?? service.name
  const description = configString(section.config, 'description') ?? service.shortDesc
  const ctaText = configString(section.config, 'ctaText') ?? '立即來電預約'

  return (
    <section className="relative overflow-hidden bg-ink">
      {heroImage && (
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-transparent" />
        </div>
      )}
      <div className="container-narrow relative grid min-h-[340px] py-14 md:min-h-[420px] md:py-20">
        <div className="max-w-3xl text-white">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm">
            <IconByName name={service.icon ?? 'Sparkles'} className="h-5 w-5" />
          </span>
          {eyebrow && (
            <div className="mt-5 text-xs font-semibold tracking-[0.2em] text-white uppercase">
              {eyebrow}
            </div>
          )}
          <h1 className="mt-5 text-white! text-4xl font-medium tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-5 max-w-xl whitespace-pre-line text-base leading-relaxed text-white/85 md:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={phoneTel} className="btn-primary">
              {ctaText}
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="#works"
              className="btn-ghost bg-white! text-black! border-white/40 hover:bg-white/80! hover:border-white"
            >
              看實績對比
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
