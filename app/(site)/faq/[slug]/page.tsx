import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MessageCircle, PhoneCall } from 'lucide-react'
import { getGeneralFaqBySlug, getSiteSettings } from '@/lib/queries'
import { RichText } from '@/components/rich-text'
import { JsonLd } from '@/components/json-ld'
import { breadcrumbJsonLd, qaPageJsonLd } from '@/lib/seo'
import { stripHtml } from '@/lib/sanitize-html'

type Params = { slug: string }

// CMS 內容隨時可改 — ISR 每 60 秒重生成
export const revalidate = 60

/**
 * 防禦性 decode：FAQ slug 多為中文，production 的 Edge proxy 偶爾把 percent-encoded
 * 中文原樣帶進 params.slug，導致對不上 DB。decodeURIComponent 對已 decode / 純 ASCII 為冪等。
 * 與 services/[slug] 的 safeDecodeSlug 相同策略。
 */
function safeDecodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const faq = await getGeneralFaqBySlug(safeDecodeSlug(rawSlug))
  if (!faq) return { title: '找不到問題' }
  const desc = stripHtml(faq.answer, 150)
  return {
    title: faq.question,
    description: desc,
    alternates: { canonical: `/faq/${faq.slug}` },
    openGraph: {
      title: faq.question,
      description: desc,
      type: 'article',
    },
  }
}

export default async function FaqDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug: rawSlug } = await params
  const slug = safeDecodeSlug(rawSlug)
  const [faq, settings] = await Promise.all([
    getGeneralFaqBySlug(slug),
    getSiteSettings().catch(() => ({}) as Record<string, string>),
  ])
  if (!faq) notFound()

  const lineFriendUrl = settings.lineFriendUrl || ''
  const lineCallUrl = settings.lineCallUrl || ''

  const breadcrumb = breadcrumbJsonLd([
    { name: '首頁', path: '/' },
    { name: '常見問題', path: '/faq' },
    { name: faq.question, path: `/faq/${faq.slug}` },
  ])
  const qa = qaPageJsonLd({
    question: faq.question,
    answer: stripHtml(faq.answer),
    path: `/faq/${faq.slug}`,
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
            <span className="text-ink-soft">問題詳情</span>
          </nav>
          <span className="eyebrow">FAQ</span>
          <h1 className="mt-4 text-3xl font-medium tracking-tight text-ink md:text-4xl">
            {faq.question}
          </h1>
        </div>
      </section>

      <section className="section pt-8 md:pt-10">
        <div className="container-narrow max-w-3xl">
          <RichText
            html={faq.answer}
            maxHeading={4}
            className="text-ink-soft"
          />

          <div className="mt-12 rounded-xl border border-hairline bg-bg-soft p-8 text-center">
            <p className="text-base text-ink-soft">還有其他疑問？歡迎直接聯繫我們。</p>
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
