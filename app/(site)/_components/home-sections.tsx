import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, MessageCircle, PhoneCall, Star } from 'lucide-react'
import type { PageSection } from '@prisma/client'
import { SectionHeading } from '@/components/section-heading'
import { BeforeAfterPair } from '@/components/before-after-pair'
import { IconByName } from '@/components/icon-by-name'
import { RichText } from '@/components/rich-text'
import type { WhyUsCard } from '@/lib/why-us'
import { DynamicSection } from './page-custom-sections'

// ─── 從 server component caller 拿的資料 props（所有 fixed sections 共享）
export type HomeSectionsData = {
  services: HomeService[]
  testimonials: HomeTestimonial[]
  featured: HomeFeatured[]
  whyUsSections: HomeWhyUs[]
  processSteps: HomeProcessStep[]
  blocks: Record<string, Record<string, string>>
  phoneTel: string
  lineFriendUrl: string
  lineCallUrl: string
}

// 對應 lib/queries 各函數的回傳形狀（避免循環 import，這裡定義最小必要欄位）
type HomeFeatured = {
  id: number
  beforeUrl: string
  afterUrl: string
  caption: string | null
  location: string | null
  serviceSlug: string
  serviceName: string
}
type HomeService = {
  id: number
  slug: string
  name: string
  shortDesc: string
  icon: string | null
}
type HomeTestimonial = {
  id: number
  rating: number
  content: string
  authorName: string
  authorMeta: string | null
}
type HomeWhyUs = {
  id: number
  eyebrow: string | null
  title: string
  description: string | null
  cards: unknown
}
type HomeProcessStep = {
  id: number
  step: string
  title: string
  desc: string
}

/**
 * 首頁 layout dispatcher — 依 PageSection.order 排序依 type 分派。
 *
 * fixed types（hero / services_grid / why_us / featured_works / process / testimonials / cta）
 * 直接 render 對應 component；dynamic types（text_block / cta_banner / image_text / rich_content）
 * 委派給 <DynamicSection>。
 */
export function HomeSections({
  sections,
  ...data
}: { sections: PageSection[] } & HomeSectionsData) {
  return (
    <>
      {sections.map((s) => {
        switch (s.type) {
          case 'hero':
            return (
              <Hero
                key={s.id}
                hero={data.blocks['hero-home'] ?? {}}
                featured={data.featured[0]}
                phoneTel={data.phoneTel}
              />
            )
          case 'services_grid':
            return (
              <ServicesGrid
                key={s.id}
                services={data.services}
                block={data.blocks['section-services-home'] ?? {}}
              />
            )
          case 'why_us':
            return <WhyUs key={s.id} sections={data.whyUsSections} />
          case 'featured_works':
            return (
              <FeaturedWorks
                key={s.id}
                featured={data.featured}
                block={data.blocks['section-works-home'] ?? {}}
              />
            )
          case 'process':
            return (
              <Process
                key={s.id}
                steps={data.processSteps}
                block={data.blocks['section-process-home'] ?? {}}
              />
            )
          case 'testimonials':
            return (
              <Testimonials
                key={s.id}
                testimonials={data.testimonials}
                block={data.blocks['section-testimonials-home'] ?? {}}
              />
            )
          case 'cta':
            return (
              <CtaBanner
                key={s.id}
                block={data.blocks['cta-home'] ?? {}}
                phoneTel={data.phoneTel}
                lineFriendUrl={data.lineFriendUrl}
                lineCallUrl={data.lineCallUrl}
              />
            )
          default:
            return <DynamicSection key={s.id} section={s} phoneTel={data.phoneTel} />
        }
      })}
    </>
  )
}

/* ============================================================
 * Hero
 * ============================================================ */
function Hero({
  featured,
  phoneTel,
  hero,
}: {
  featured?: HomeFeatured
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
          <span className="eyebrow">{hero.eyebrow || 'Invisible Care · 居家健康守護'}</span>
          <h1 className="mt-5 text-3xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
            {hero.titleLine1 || '看不見的守護，'}
            <br />
            <span className="text-primary-deep">
              {hero.titleLine2 || '才是家最頂級的豪華'}
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
              {hero.primaryCta || '立即來電預約'}
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/works" className="btn-ghost">
              {hero.secondaryCta || '看服務案例'}
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
              const heroImageAlt = hero.heroImage
                ? '首頁主視覺'
                : (featured?.caption ?? '清洗後實況')
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
  )
}

/* ============================================================
 * 服務項目
 * ============================================================ */
function ServicesGrid({
  services,
  block,
}: {
  services: HomeService[]
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
              <p className="mt-4 flex-1 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {s.shortDesc}
              </p>
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
 * 為何選我們（後台多區塊）
 * ============================================================ */
function WhyUs({ sections }: { sections: HomeWhyUs[] }) {
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
  featured: HomeFeatured[]
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
function Process({
  steps,
  block,
}: {
  steps: HomeProcessStep[]
  block: Record<string, string>
}) {
  if (steps.length === 0) return null
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
  testimonials: HomeTestimonial[]
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
function CtaBanner({
  phoneTel,
  block,
  lineFriendUrl,
  lineCallUrl,
}: {
  phoneTel: string
  block: Record<string, string>
  lineFriendUrl: string
  lineCallUrl: string
}) {
  const lineBookUrl = block.lineUrl || lineFriendUrl
  return (
    <section className="container-narrow pb-16 md:pb-24">
      <div className="relative overflow-hidden rounded-2xl bg-ink px-8 py-12 text-white md:px-14 md:py-16">
        {block.backgroundImage && (
          <div className="absolute inset-0 opacity-60">
            <Image
              src={block.backgroundImage}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="relative max-w-2xl">
          <span className="text-xs text-white! font-medium tracking-[0.2em] ">
            {block.overline || 'BOOK YOUR HOME CARE TODAY'}
          </span>
          <h2 className="mt-4 text-white! text-3xl font-medium leading-tight md:text-4xl">
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
            {lineBookUrl && (
              <a
                href={lineBookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-[#06C755] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
              >
                <MessageCircle className="h-4 w-4" />
                加 LINE 預約
              </a>
            )}
            {lineCallUrl && (
              <a
                href={lineCallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-[#06C755] bg-white/5 px-4 py-2 text-sm font-medium text-[#06C755] hover:bg-[#06C755]/15 transition"
              >
                <PhoneCall className="h-4 w-4" />
                LINE 通話
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
