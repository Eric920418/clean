import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle, PhoneCall, ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { getActiveServices, getGeneralFaqs, getContentBlock, getSiteSettings } from '@/lib/queries'
import { JsonLd } from '@/components/json-ld'
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/seo'
import { stripHtml } from '@/lib/sanitize-html'

export const revalidate = 60

export const metadata: Metadata = {
  title: '常見問題',
  description: 'invisible care 居家服務常見問題，包含冷氣、洗衣機、水塔等服務的細節說明。',
  alternates: { canonical: '/faq' },
}

export default async function FaqPage() {
  const [services, generalFaqs, heroBlock, settings] = await Promise.all([
    getActiveServices(),
    getGeneralFaqs(),
    getContentBlock('hero-faq').catch(() => null),
    getSiteSettings(),
  ])
  const hero = heroBlock ?? {}
  const lineFriendUrl = settings.lineFriendUrl || ''
  const lineCallUrl = settings.lineCallUrl || ''

  // 一般 + 各服務 FAQ 都各有獨立頁 → 整頁是連結清單；答案交給各詳細頁的 QAPage（避免重複內容）
  const generalList = generalFaqs.filter((f) => f.slug)
  const serviceList = services
    .map((s) => ({ service: s, faqs: (s.faqs ?? []).filter((f) => f.slug) }))
    .filter((g) => g.faqs.length > 0)

  const listSchema = (() => {
    const links = [
      ...generalList.map((f) => ({
        name: f.question,
        url: `/faq/${f.slug}`,
        description: stripHtml(f.answer, 100),
      })),
      ...serviceList.flatMap((g) =>
        g.faqs.map((f) => ({
          name: `${g.service.name}：${f.question}`,
          url: `/services/${g.service.slug}/faq/${f.slug}`,
          description: stripHtml(f.answer, 100),
        })),
      ),
    ]
    return links.length > 0 ? itemListJsonLd(links) : null
  })()

  const breadcrumb = breadcrumbJsonLd([
    { name: '首頁', path: '/' },
    { name: '常見問題', path: '/faq' },
  ])

  return (
    <>
      <JsonLd data={breadcrumb} />
      {listSchema && <JsonLd data={listSchema} />}
      <section className="bg-medical-glow pt-8 pb-8 md:pt-12 md:pb-12">
        <div className="container-narrow max-w-3xl">
          <SectionHeading
            as="h1"
            eyebrow={hero.eyebrow || "FAQ"}
            title={hero.title || "常見問題"}
            description={hero.description || "找不到答案？歡迎直接聯繫我們。"}
          />
        </div>
      </section>

      <section className="section pt-8 md:pt-10">
        <div className="container-narrow max-w-3xl space-y-12">
          {generalList.length > 0 && (
            <div>
              <h2 className="text-xl font-medium text-ink">
                {hero.generalHeading || "一般服務"}
              </h2>
              <div className="mt-6 divide-y divide-hairline border-y border-hairline">
                {generalList.map((f) => (
                  <article key={f.id} className="group py-5">
                    <h3 className="text-base font-medium text-ink md:text-lg">
                      <Link
                        href={`/faq/${f.slug}`}
                        className="transition group-hover:text-primary-deep"
                      >
                        {f.question}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                      {stripHtml(f.answer, 90)}
                    </p>
                    <Link
                      href={`/faq/${f.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-deep transition-all group-hover:gap-2"
                    >
                      查看詳情
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          )}

          {serviceList.map(({ service: s, faqs }) => (
            <div key={s.id}>
              <h2 className="text-xl font-medium text-ink">{s.name}</h2>
              <div className="mt-6 divide-y divide-hairline border-y border-hairline">
                {faqs.map((f) => (
                  <article key={f.id} className="group py-5">
                    <h3 className="text-base font-medium text-ink md:text-lg">
                      <Link
                        href={`/services/${s.slug}/faq/${f.slug}`}
                        className="transition group-hover:text-primary-deep"
                      >
                        {f.question}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                      {stripHtml(f.answer, 90)}
                    </p>
                    <Link
                      href={`/services/${s.slug}/faq/${f.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-deep transition-all group-hover:gap-2"
                    >
                      查看詳情
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-hairline bg-bg-soft p-8 text-center">
            <p className="text-base text-ink-soft">
              {hero.contactBoxText || "還有其他疑問？"}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {lineFriendUrl && (
                <a
                  href={lineFriendUrl}
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
                  className="inline-flex items-center gap-2 rounded-md border border-[#06C755] px-4 py-2 text-sm font-medium text-[#06C755] hover:bg-[#06C755]/10 transition"
                >
                  <PhoneCall className="h-4 w-4" />
                  LINE 通話
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
