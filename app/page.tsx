import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Star } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { BeforeAfterSlider } from '@/components/before-after-slider'
import { IconByName } from '@/components/icon-by-name'
import { mockServices, mockTestimonials, featuredBeforeAfters } from '@/lib/mock-data'
import { siteConfig } from '@/lib/site-config'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <WhyUs />
      <FeaturedWorks />
      <Process />
      <Testimonials />
      <CtaBanner />
    </>
  )
}

/* ============================================================
 * Hero
 * ============================================================ */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-medical-glow">
      <div className="container-narrow grid grid-cols-1 items-center gap-12 pt-20 pb-24 md:grid-cols-2 md:gap-16 md:pt-28 md:pb-36">
        <div>
          <span className="eyebrow">Invisible Care · 居家健康守護</span>
          <h1 className="mt-5 text-4xl font-medium leading-tight tracking-tight text-ink md:text-6xl">
            看不見的守護，<br />
            <span className="text-primary-deep">才是家最頂級的豪華</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            從空氣、水源到家電，我們用職人精神拆解每一處被忽略的細節。讓家，回歸最純粹、最令人安心的模樣。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/contact" className="btn-primary">
              立即預約諮詢
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/works" className="btn-ghost">
              看清潔實績
            </Link>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-3 text-sm text-ink-soft sm:grid-cols-2">
            {['歐盟認證環保洗劑', '透明報價・絕不增項', '30 天無憂保固', '雙北・桃園・新竹到府'].map(
              (t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-deep" />
                  <span>{t}</span>
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="relative">
          <BeforeAfterSlider
            beforeUrl={featuredBeforeAfters[0].beforeUrl}
            afterUrl={featuredBeforeAfters[0].afterUrl}
            caption={featuredBeforeAfters[0].caption}
            location={featuredBeforeAfters[0].location}
            aspect="photo"
            priority
          />
          <div className="pointer-events-none absolute -bottom-6 -left-6 hidden h-24 w-24 rounded-full bg-primary-soft/40 blur-2xl md:block" />
          <div className="pointer-events-none absolute -top-8 -right-8 hidden h-32 w-32 rounded-full bg-accent-soft/40 blur-3xl md:block" />
        </div>
      </div>
    </section>
  )
}

/* ============================================================
 * 六大服務
 * ============================================================ */
function ServicesGrid() {
  return (
    <section className="section">
      <div className="container-narrow">
        <SectionHeading
          eyebrow="Six Services"
          title="六大專業服務，一站式守護"
          description="從窗戶上的紗網，到家中每一滴用水，我們整合全方位居家維護技術，由內而外照顧您與家人的健康。"
        />
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockServices.map((s) => (
            <Link
              key={s.id}
              href={`/services/${s.slug}`}
              className="card-hover group flex flex-col rounded-xl border border-hairline bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-bg-tint text-primary-deep">
                  <IconByName name={s.icon} className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-medium text-ink">{s.name}</h3>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">{s.shortDesc}</p>
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
 * 為何選我們
 * ============================================================ */
function WhyUs() {
  return (
    <section className="bg-bg-soft py-24 md:py-32">
      <div className="container-narrow">
        <SectionHeading
          align="center"
          eyebrow="Why invisible care"
          title="三項堅持，讓家人安心"
          description="我們不追求低價競爭，追求的是「品質的極致」與「客戶的安心」。"
        />
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {siteConfig.promises.map((p, idx) => (
            <div
              key={p.title}
              className="rounded-xl border border-hairline bg-white p-8 text-center"
            >
              <span className="inline-flex h-10 w-20 items-center justify-center rounded-full bg-bg-tint font-display text-sm font-semibold tracking-widest text-primary-deep">
                0{idx + 1}
              </span>
              <h3 className="mt-5 text-lg font-medium text-ink">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
 * 精選作品牆
 * ============================================================ */
function FeaturedWorks() {
  return (
    <section className="section">
      <div className="container-narrow">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Real Results"
            title="親眼見證的反差"
            description="所有清洗前後對比圖均為實際施作案例，未經修飾濾鏡，已取得客戶授權。"
          />
          <Link href="/works" className="btn-ghost shrink-0">
            查看全部實績
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {featuredBeforeAfters.slice(0, 4).map((p) => (
            <BeforeAfterSlider
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
function Process() {
  return (
    <section className="bg-gradient-to-b from-white to-bg-tint/40 py-24 md:py-32">
      <div className="container-narrow">
        <SectionHeading
          align="center"
          eyebrow="How it works"
          title="四步驟・讓您安心交付"
        />
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-4">
          {siteConfig.process.map((p, idx) => (
            <div key={p.step} className="relative rounded-xl border border-hairline bg-white p-6">
              <span className="font-display text-3xl font-semibold tracking-tight text-primary">
                {p.step}
              </span>
              <h3 className="mt-3 text-base font-medium text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.desc}</p>
              {idx < siteConfig.process.length - 1 && (
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
function Testimonials() {
  return (
    <section className="section">
      <div className="container-narrow">
        <SectionHeading
          eyebrow="Customer Voices"
          title="他們選擇了 invisible care"
        />
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {mockTestimonials.map((t) => (
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
                「{t.content}」
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
function CtaBanner() {
  return (
    <section className="container-narrow pb-24 md:pb-32">
      <div className="relative overflow-hidden rounded-2xl bg-ink px-8 py-14 text-white md:px-16 md:py-20">
        <div className="absolute inset-0 opacity-25">
          <Image
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="relative max-w-2xl">
          <span className="text-xs font-medium tracking-[0.2em] text-primary-soft">
            BOOK YOUR HOME CARE TODAY
          </span>
          <h2 className="mt-4 text-3xl font-medium leading-tight md:text-4xl">
            把專業交給我們，<br />把時間留給家人。
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
            填寫您的需求，30 分鐘內專人聯繫，現場評估後給您完整透明的報價。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              立即預約
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`tel:${siteConfig.contact.phone}`}
              className="btn-ghost border-white/40 bg-white/10 text-white hover:bg-white/15 hover:border-white"
            >
              {siteConfig.contact.phone}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
