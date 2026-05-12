import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { BeforeAfterPair } from '@/components/before-after-pair'
import { IconByName } from '@/components/icon-by-name'
import { Faq } from '@/components/faq'
import { getServiceBySlugFull, getActiveServices } from '@/lib/queries'
import { JsonLd } from '@/components/json-ld'
import { serviceJsonLd } from '@/lib/seo'
import { siteConfig } from '@/lib/site-config'

type Params = { slug: string }

// CMS 內容隨時可被業主在後台修改 — 不做 build-time 預渲染
// 改 ISR：每 60 秒重新生成一次，期間用 cache（速度近似靜態，業主編輯最慢 1 分鐘可見）
export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlugFull(slug)
  if (!service) return { title: '找不到服務' }
  return {
    title: service.seoTitle ?? service.name,
    description: service.seoDesc ?? service.shortDesc,
    openGraph: {
      title: service.name,
      description: service.shortDesc,
      images: service.heroImage ? [{ url: service.heroImage }] : undefined,
    },
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const [service, allServices] = await Promise.all([
    getServiceBySlugFull(slug),
    getActiveServices(),
  ])
  if (!service) notFound()

  const others = allServices.filter((s) => s.id !== service.id).slice(0, 3)

  return (
    <>
      <JsonLd
        data={serviceJsonLd({ name: service.name, shortDesc: service.shortDesc, slug: service.slug })}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        {service.heroImage && (
          <div className="absolute inset-0">
            <Image
              src={service.heroImage}
              alt={service.name}
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
          <div className="max-w-2xl text-white">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm">
              <IconByName name={service.icon ?? 'Sparkles'} className="h-5 w-5" />
            </span>
            <h1 className="mt-5 text-4xl font-medium tracking-tight md:text-5xl">{service.name}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              {service.shortDesc}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={siteConfig.contact.phoneTel} className="btn-primary">
                立即來電預約
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="#works"
                className="btn-ghost border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white"
              >
                看實績對比
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 故事區（hero 下方圖文並排介紹） */}
      {(service.introTitle || service.introImage) && (() => {
        const paragraphs = [
          service.introParagraph1,
          service.introParagraph2,
          service.introParagraph3,
        ].filter((p): p is string => Boolean(p && p.trim()))
        return (
          <section className="section pt-12 md:pt-16">
            <div className="container-narrow grid grid-cols-1 items-center gap-12 md:grid-cols-2">
              {service.introImage && (
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <Image
                    src={service.introImage}
                    alt={service.introTitle ?? service.name}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div>
                {service.introTitle && (
                  <SectionHeading
                    eyebrow={service.introEyebrow ?? undefined}
                    title={service.introTitle}
                  />
                )}
                {paragraphs.length > 0 && (
                  <div className="mt-6 space-y-4 text-base leading-loose text-ink-soft">
                    {paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )
      })()}

      {/* 詳細介紹 + 特色 */}
      <section className="section">
        <div className="container-narrow grid grid-cols-1 gap-14 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeading
              eyebrow={service.whyEyebrow ?? 'Why this matters'}
              title={service.whyTitle ?? '為什麼這項服務重要？'}
            />
            <p className="mt-6 whitespace-pre-line text-base leading-loose text-ink-soft md:text-lg">
              {service.longDesc}
            </p>
          </div>
          <aside className="rounded-xl border border-hairline bg-bg-soft p-7">
            <h3 className="text-base font-medium text-ink">服務重點</h3>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-soft">
              {service.features.map((f) => (
                <li key={f.id} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-deep" />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* 前後對比牆 */}
      {service.beforeAfters.length > 0 && (
        <section id="works" className="bg-bg-soft py-16 md:py-24">
          <div className="container-narrow">
            <SectionHeading
              eyebrow="Real Results"
              title={`${service.name}・實際施作前後`}
              description="所有照片均為實際施作案例，未經修飾濾鏡。"
            />
            <div className="mx-auto mt-9 grid max-w-4xl grid-cols-1 gap-10">
              {service.beforeAfters.map((p) => (
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
      )}

      {/* Gallery */}
      {service.galleryImgs.length > 0 && (
        <section className="section">
          <div className="container-narrow">
            <SectionHeading eyebrow="Gallery" title="施作過程" />
            <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {service.galleryImgs.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-lg border border-hairline"
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? service.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {service.faqs.length > 0 && (
        <section className="bg-bg-soft py-16 md:py-24">
          <div className="container-narrow max-w-3xl">
            <SectionHeading eyebrow="FAQ" title="常見問題" align="center" />
            <div className="mt-9">
              <Faq items={service.faqs} />
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-narrow py-16 md:py-24">
        <div className="rounded-2xl border border-hairline bg-gradient-to-br from-bg-tint to-white p-8 text-center md:p-12">
          <h2 className="text-3xl font-medium tracking-tight text-ink md:text-4xl">
            準備好讓 {service.name} 上線了嗎？
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            填寫預約表單或撥打專線，30 分鐘內專人聯繫，現場評估後給您完整透明報價。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={siteConfig.contact.phoneTel} className="btn-primary">
              立即來電預約
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/services" className="btn-ghost">
              看其他服務
            </Link>
          </div>
        </div>
      </section>

      {/* 推薦其他服務 */}
      <section className="container-narrow pb-16 md:pb-24">
        <SectionHeading eyebrow="More services" title="您可能也需要" />
        <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-3">
          {others.map((s) => (
            <Link
              key={s.id}
              href={`/services/${s.slug}`}
              className="card-hover group rounded-xl border border-hairline bg-white p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-tint text-primary-deep">
                <IconByName name={s.icon ?? 'Sparkles'} className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-ink">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.shortDesc}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
