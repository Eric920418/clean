import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight, Sparkles } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { IconByName } from '@/components/icon-by-name'
import { getActiveServices, getContentBlock } from '@/lib/queries'

export const revalidate = 60

export const metadata: Metadata = {
  title: '服務項目',
  description:
    'invisible care 提供冷氣、洗衣機、水塔、防霾紗網、全戶濾水與精緻居家清潔等專業服務，由內而外守護家人的健康。',
}

export default async function ServicesIndexPage() {
  const [services, heroBlock] = await Promise.all([
    getActiveServices(),
    getContentBlock('hero-services').catch(() => null),
  ])
  const hero = heroBlock ?? {}
  return (
    <>
      <section className="bg-medical-glow pt-8 pb-8 md:pt-12 md:pb-12">
        <div className="container-narrow">
          <SectionHeading
            eyebrow={hero.eyebrow || "Our Services"}
            title={hero.title || "服務項目"}
            description={
              hero.description ||
              "點選下方服務查看完整介紹、清潔前後實績與常見問題。"
            }
          />
        </div>
      </section>

      <section className="section pt-8 md:pt-10">
        <div className="container-narrow space-y-8">
          {services.map((s, idx) => (
            <Link
              key={s.id}
              href={`/services/${s.slug}`}
              className="card-hover group grid grid-cols-1 overflow-hidden rounded-xl border border-hairline bg-white md:grid-cols-2"
            >
              <div className={idx % 2 === 1 ? "order-2 md:order-1" : ""}>
                <div className="relative aspect-[4/3] md:aspect-auto md:h-full bg-bg-soft">
                  {s.cardImage ? (
                    <Image
                      src={s.cardImage}
                      alt={s.name}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Sparkles className="h-10 w-10 text-ink-muted absolute inset-0 m-auto" />
                  )}
                </div>
              </div>
              <div
                className={`p-8 md:p-12 ${idx % 2 === 1 ? "order-1 md:order-2" : ""}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-bg-tint text-primary-deep">
                  <IconByName name={s.icon ?? "Sparkles"} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-2xl font-medium tracking-tight text-ink md:text-3xl">
                  {s.name}
                </h3>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft md:text-base">
                  {s.shortDesc}
                </p>
                <ul className="mt-6 space-y-2 text-sm text-ink-soft">
                  {s.features.slice(0, 3).map((f) => (
                    <li key={f.id} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-primary-deep">
                  查看完整服務內容
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
