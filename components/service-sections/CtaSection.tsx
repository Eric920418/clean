import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { SectionWithRelations, ServiceForSection } from './types'
import { configString } from './types'

type Props = {
  section: SectionWithRelations
  service: ServiceForSection
  phoneTel: string
}

export function CtaSection({ section, service, phoneTel }: Props) {
  const title = configString(section.config, 'title') ?? `準備好讓 ${service.name} 上線了嗎？`
  const description =
    configString(section.config, 'description') ??
    '填寫預約表單或撥打專線，30 分鐘內專人聯繫，現場評估後給您完整透明報價。'

  return (
    <section className="container-narrow py-16 md:py-24">
      <div className="rounded-2xl border border-hairline bg-gradient-to-br from-bg-tint to-white p-8 text-center md:p-12">
        <h2 className="text-3xl font-medium tracking-tight text-ink md:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl whitespace-pre-line text-base leading-relaxed text-ink-soft">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={phoneTel} className="btn-primary">
            立即來電預約
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link href="/services" className="btn-ghost">
            看其他服務
          </Link>
        </div>
      </div>
    </section>
  )
}
