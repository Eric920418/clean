import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MessageCircle, PhoneCall } from 'lucide-react'
import { getServiceFaqBySlug, getSiteSettings } from '@/lib/queries'
import { RichText } from '@/components/rich-text'
import { JsonLd } from '@/components/json-ld'
import { breadcrumbJsonLd, qaPageJsonLd } from '@/lib/seo'
import { stripHtml } from '@/lib/sanitize-html'

type Params = { slug: string; faqSlug: string }

// CMS 內容隨時可改 — ISR 每 60 秒重生成
export const revalidate = 60

/** 防禦性 decode：服務/FAQ slug 多為中文，prod proxy 偶爾原樣帶 percent-encoded 進來 */
function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug, faqSlug } = await params
  const data = await getServiceFaqBySlug(safeDecode(slug), safeDecode(faqSlug))
  if (!data) return { title: '找不到問題' }
  const desc = stripHtml(data.faq.answer, 150)
  return {
    title: `${data.faq.question}｜${data.service.name}`,
    description: desc,
    // canonical 指自己：此獨立頁為該問答的正本，服務頁手風琴只是現場呈現
    alternates: { canonical: `/services/${data.service.slug}/faq/${data.faq.slug}` },
    openGraph: {
      title: data.faq.question,
      description: desc,
      type: 'article',
    },
  }
}

export default async function ServiceFaqDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug, faqSlug } = await params
  const [data, settings] = await Promise.all([
    getServiceFaqBySlug(safeDecode(slug), safeDecode(faqSlug)),
    getSiteSettings().catch(() => ({}) as Record<string, string>),
  ])
  if (!data) notFound()
  const { service, faq } = data

  const lineFriendUrl = settings.lineFriendUrl || ''
  const lineCallUrl = settings.lineCallUrl || ''

  const breadcrumb = breadcrumbJsonLd([
    { name: '首頁', path: '/' },
    { name: '服務項目', path: '/services' },
    { name: service.name, path: `/services/${service.slug}` },
    { name: faq.question, path: `/services/${service.slug}/faq/${faq.slug}` },
  ])
  const qa = qaPageJsonLd({
    question: faq.question,
    answer: stripHtml(faq.answer),
    path: `/services/${service.slug}/faq/${faq.slug}`,
  })

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={qa} />

      <section className="bg-medical-glow pt-8 pb-8 md:pt-12 md:pb-12">
        <div className="container-narrow max-w-3xl">
          <nav className="mb-4 text-sm text-ink-muted" aria-label="麵包屑">
            <Link href="/faq" className="hover:text-primary-deep">常見問題</Link>
            <span className="mx-2">/</span>
            <Link href={`/services/${service.slug}`} className="hover:text-primary-deep">
              {service.name}
            </Link>
          </nav>
          <span className="eyebrow">{service.name}・FAQ</span>
          <h1 className="mt-4 text-3xl font-medium tracking-tight text-ink md:text-4xl">
            {faq.question}
          </h1>
        </div>
      </section>

      <section className="section pt-8 md:pt-10">
        <div className="container-narrow max-w-3xl">
          <RichText html={faq.answer} maxHeading={4} className="text-ink-soft" />

          <div className="mt-12 rounded-xl border border-hairline bg-bg-soft p-8 text-center">
            <p className="text-base text-ink-soft">
              想了解更多關於「{service.name}」的服務內容？
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/services/${service.slug}`}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-deep transition"
              >
                查看完整服務介紹
              </Link>
              {lineFriendUrl && (
                <a
                  href={lineFriendUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-[#06C755] px-4 py-2 text-sm font-medium text-[#06C755] hover:bg-[#06C755]/10 transition"
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

          <div className="mt-8">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-deep hover:gap-2.5 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              返回所有常見問題
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
