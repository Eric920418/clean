import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Star } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { BeforeAfterPair } from '@/components/before-after-pair'
import { IconByName } from '@/components/icon-by-name'
import {
  getActiveServices,
  getActiveTestimonials,
  getFeaturedBeforeAfters,
  getWhyUsSections,
  getProcessSteps,
  getSiteSettings,
  getAllContentBlocks,
} from '@/lib/queries'
import type { WhyUsCard } from '@/lib/why-us'
import { JsonLd } from '@/components/json-ld'
import { RichText } from '@/components/rich-text'
import { localBusinessJsonLd } from '@/lib/seo'

// ISR：每 60 秒 background revalidation；首次以外的訪客都讀 cache
export const revalidate = 60

export default async function HomePage() {
  const [services, testimonials, featured, whyUsSections, processSteps, settings, blocks] =
    await Promise.all([
      getActiveServices(),
      getActiveTestimonials(),
      getFeaturedBeforeAfters(),
      getWhyUsSections({ location: 'home' }),
      getProcessSteps(),
      getSiteSettings(),
      getAllContentBlocks(),
    ])
  const phoneTel = settings.phoneTel || ''
  const hero = blocks['hero-home'] ?? {}
  const sectServices = blocks['section-services-home'] ?? {}
  const sectWorks = blocks['section-works-home'] ?? {}
  const sectProcess = blocks['section-process-home'] ?? {}
  const sectTestimonials = blocks['section-testimonials-home'] ?? {}
  const cta = blocks['cta-home'] ?? {}

  const ratingAvg =
    testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      : undefined

  const businessJsonLd = localBusinessJsonLd(
    ratingAvg ? { rating: { average: ratingAvg, count: testimonials.length } } : undefined,
  )

  return (
    <>
      <JsonLd data={businessJsonLd} />
      <Hero featured={featured[0]} phoneTel={phoneTel} hero={hero} />
      <ServicesGrid services={services} block={sectServices} />
      <WhyUs sections={whyUsSections} />
      <FeaturedWorks featured={featured} block={sectWorks} />
      <Process steps={processSteps} block={sectProcess} />
      <Testimonials testimonials={testimonials} block={sectTestimonials} />
      <CtaBanner phoneTel={phoneTel} block={cta} />
    </>
  )
}

type Featured = Awaited<ReturnType<typeof getFeaturedBeforeAfters>>[number]
type Service = Awaited<ReturnType<typeof getActiveServices>>[number]
type Testimonial = Awaited<ReturnType<typeof getActiveTestimonials>>[number]
type WhyUsSectionData = Awaited<ReturnType<typeof getWhyUsSections>>[number]

/* ============================================================
 * Hero
 * ============================================================ */
function Hero({
  featured,
  phoneTel,
  hero,
}: {
  featured?: Featured
  phoneTel: string
  hero: Record<string, string>
}) {
  const checklist = [hero.checklist1, hero.checklist2, hero.checklist3, hero.checklist4].filter(
    (s): s is string => Boolean(s && s.trim()),
  )
  return (
    <section className="relative overflow-hidden bg-medical-glow">
      <div className="container-narrow grid grid-cols-1 items-center gap-10 pt-6 pb-6 md:grid-cols-2 md:gap-14 md:pt-10 md:pb-10">
        <div>
          <span className="eyebrow">
            {hero.eyebrow || "Invisible Care · 居家健康守護"}
          </span>
          <h1 className="mt-5 text-3xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
            {hero.titleLine1 || "看不見的守護，"}
            <br />
            <span className="text-primary-deep">
              {hero.titleLine2 || "才是家最頂級的豪華"}
            </span>
          </h1>
          <RichText
            html={
              hero.description ||
              '從空氣、水源到家電，我們用職人精神拆解每一處被忽略的細節。讓家，回歸最純粹、最令人安心的模樣。'
            }
            className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-soft md:text-base"
          />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={phoneTel} className="btn-primary">
              {hero.primaryCta || "立即來電預約"}
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/works" className="btn-ghost">
              {hero.secondaryCta || "看服務案例"}
            </Link>
          </div>

          {checklist.length > 0 && (
            <ul className="mt-10 grid grid-cols-1 gap-3 text-sm text-ink-soft sm:grid-cols-2">
              {checklist.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-deep" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-hairline bg-bg-soft shadow-sm">
            {(() => {
              const heroImageSrc = hero.heroImage || featured?.afterUrl
              const heroImageAlt = hero.heroImage ? '首頁主視覺' : (featured?.caption ?? '清洗後實況')
              return heroImageSrc ? (
                <Image
                  src={heroImageSrc}
                  alt={heroImageAlt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-muted text-sm">
                  尚未上傳對比圖
                </div>
              )
            })()}
            <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary/95 px-3 py-1 text-xs font-medium tracking-wide text-white shadow-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
              服務後實況
            </span>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -left-6 hidden h-24 w-24 rounded-full bg-primary-soft/40 blur-2xl md:block" />
          <div className="pointer-events-none absolute -top-8 -right-8 hidden h-32 w-32 rounded-full bg-accent-soft/40 blur-3xl md:block" />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
 * 服務項目
 * ============================================================ */
function ServicesGrid({
  services,
  block,
}: {
  services: Service[]
  block: Record<string, string>
}) {
  return (
    <section className="section">
      <div className="container-narrow">
        <SectionHeading
          eyebrow={block.eyebrow || 'Our Services'}
          title={block.title || '服務項目，一站式守護'}
          description={
            block.description ||
            '從窗戶上的紗網，到家中每一滴用水，我們整合全方位居家維護技術，由內而外照顧您與家人的健康。'
          }
        />
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.id}
              href={`/services/${s.slug}`}
              className="card-hover group flex flex-col rounded-xl border border-hairline bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-bg-tint text-primary-deep">
                  <IconByName name={s.icon ?? 'Sparkles'} className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-medium text-ink">{s.name}</h3>
              </div>
              <p className="mt-4 flex-1 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{s.shortDesc}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary-deep">
                了解詳情
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
 * 為何選我們（後台多區塊，每組標題 + 三張卡片）
 * ============================================================ */
function WhyUs({ sections }: { sections: WhyUsSectionData[] }) {
  if (sections.length === 0) return null
  return (
    <>
      {sections.map((section) => {
        const cards = (section.cards as unknown as WhyUsCard[]) ?? []
        return (
          <section key={section.id} className="bg-bg-soft py-6 md:py-10">
            <div className="container-narrow">
              <SectionHeading
                align="center"
                eyebrow={section.eyebrow ?? undefined}
                title={section.title}
                description={section.description ?? undefined}
              />
              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                {cards.map((card, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-hairline bg-white p-8 text-center"
                  >
                    <span className="inline-flex h-10 w-20 items-center justify-center rounded-full bg-bg-tint font-display text-sm font-semibold tracking-widest text-primary-deep">
                      0{idx + 1}
                    </span>
                    <h3 className="mt-5 text-lg font-medium text-ink">{card.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* ============================================================
 * 精選作品牆
 * ============================================================ */
function FeaturedWorks({
  featured,
  block,
}: {
  featured: Featured[]
  block: Record<string, string>
}) {
  if (featured.length === 0) return null
  return (
    <section className="section">
      <div className="container-narrow">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={block.eyebrow || 'Real Results'}
            title={block.title || '親眼見證的反差'}
            description={
              block.description ||
              '所有清洗前後對比圖均為實際施作案例，未經修飾濾鏡，已取得客戶授權。'
            }
          />
          <Link href="/works" className="btn-ghost shrink-0">
            {block.viewAllLabel || '查看全部實績'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-10">
          {featured.slice(0, 3).map((p) => (
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
  )
}

/* ============================================================
 * 服務流程
 * ============================================================ */
type ProcessStepData = Awaited<ReturnType<typeof getProcessSteps>>[number]

function Process({
  steps,
  block,
}: {
  steps: ProcessStepData[]
  block: Record<string, string>
}) {
  if (steps.length === 0) return null
  // 自動依 step 數量決定 grid 欄數，避免硬寫死 4 欄
  const gridClass =
    steps.length >= 4
      ? 'md:grid-cols-4'
      : steps.length === 3
        ? 'md:grid-cols-3'
        : steps.length === 2
          ? 'md:grid-cols-2'
          : 'md:grid-cols-1'
  return (
    <section className="bg-gradient-to-b from-white to-bg-tint/40 py-6 md:py-10">
      <div className="container-narrow">
        <SectionHeading
          align="center"
          eyebrow={block.eyebrow || 'How it works'}
          title={block.title || '四步驟・讓您安心交付'}
        />
        <div className={`mt-10 grid grid-cols-1 gap-6 ${gridClass}`}>
          {steps.map((p, idx) => (
            <div key={p.id} className="relative rounded-xl border border-hairline bg-white p-6">
              <span className="font-display text-3xl font-semibold tracking-tight text-primary">
                {p.step}
              </span>
              <h3 className="mt-3 text-base font-medium text-ink">{p.title}</h3>
              <RichText
                html={p.desc}
                className="mt-2 text-sm leading-relaxed text-ink-soft prose-sm"
              />

              {idx < steps.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-primary-soft md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
 * 客戶評價
 * ============================================================ */
function Testimonials({
  testimonials,
  block,
}: {
  testimonials: Testimonial[]
  block: Record<string, string>
}) {
  if (testimonials.length === 0) return null
  return (
    <section className="section">
      <div className="container-narrow">
        <SectionHeading
          eyebrow={block.eyebrow || 'Customer Voices'}
          title={block.title || '他們選擇了 invisible care'}
        />
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="flex h-full flex-col rounded-xl border border-hairline bg-white p-7"
            >
              <div className="flex items-center gap-1 text-warn">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warn text-warn" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                「<RichText html={t.content} inline />」
              </blockquote>
              <figcaption className="mt-6 border-t border-hairline-soft pt-4">
                <div className="text-sm font-medium text-ink">{t.authorName}</div>
                <div className="text-xs text-ink-muted">{t.authorMeta}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
 * CTA Banner
 * ============================================================ */
function CtaBanner({ phoneTel, block }: { phoneTel: string; block: Record<string, string> }) {
  return (
    <section className="container-narrow pb-16 md:pb-24">
      <div className="relative overflow-hidden rounded-2xl bg-ink px-8 py-12 text-white md:px-14 md:py-16">
        <div className="absolute inset-0 opacity-25">
          <Image
            src={
              block.backgroundImage ||
              'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80'
            }
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="relative max-w-2xl">
          <span className="text-xs font-medium tracking-[0.2em] text-primary-soft">
            {block.overline || 'BOOK YOUR HOME CARE TODAY'}
          </span>
          <h2 className="mt-4 text-3xl font-medium leading-tight md:text-4xl">
            {block.titleLine1 || '把專業交給我們，'}
            <br />
            {block.titleLine2 || '把時間留給家人。'}
          </h2>
          <RichText
            html={block.description || '一通電話，專人為您現場評估，給您完整透明的報價。'}
            className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base"
          />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={phoneTel} className="btn-primary">
              {block.primaryCta || '立即來電預約'}
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/contact"
              className="btn-ghost border-white/40 bg-white/10 text-white hover:bg-white/15 hover:border-white"
            >
              填寫表單
            </Link>
            {block.lineUrl && (
              <a
                href={block.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="加入 LINE 好友"
                className="inline-flex items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://scdn.line-apps.com/n/line_add_friends/btn/zh-Hant.png"
                  alt="加入 LINE 好友"
                  height={36}
                  className="h-9 w-auto"
                />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
