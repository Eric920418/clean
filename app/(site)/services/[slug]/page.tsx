import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServiceBySlugFull, getActiveServices, getSiteSettings } from '@/lib/queries'
import { JsonLd } from '@/components/json-ld'
import {
  serviceJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  reviewListJsonLd,
} from '@/lib/seo'
import { SectionRenderer } from '@/components/service-sections/SectionRenderer'
import { configString } from '@/components/service-sections/types'

type Params = { slug: string }

// CMS 內容隨時可被業主在後台修改 — 不做 build-time 預渲染
// ISR：每 60 秒重新生成一次（業主編輯最慢 1 分鐘可見）
export const revalidate = 60

/**
 * 防禦性 decode：production 環境 Vercel 偶爾把 percent-encoded 中文 path 原樣帶進
 * `params.slug`（dev server decode、prod 沒，疑似 Edge proxy → Lambda 沒有再解一次），
 * 結果 `findUnique({ where: { slug: '%E9%98%B2...' } })` 對不上 DB 裡的 `防霾紗網安裝` 而 404。
 * `decodeURIComponent` 對純 ASCII / 已 decode 的中文字串是 idempotent、套上零副作用。
 * 包 try/catch 因為 decodeURIComponent 對 malformed `%xx` 序列會 throw。
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
  const slug = safeDecodeSlug(rawSlug)
  const [service, settings] = await Promise.all([
    getServiceBySlugFull(slug),
    getSiteSettings().catch(() => ({}) as Record<string, string>),
  ])
  if (!service) return { title: '找不到服務' }
  // Next.js metadata 不深度合併：子頁定義 openGraph 會「整包」覆蓋根 layout 的設定，
  // images 給 undefined 就等於該頁完全沒有 og:image（社群分享無縮圖）。
  //
  // 縮圖跟頁面 Hero 同源：業主在「頁面區塊 → Hero」換圖存在 section config，
  // 不會寫回 Service.heroImage，只讀後者會讓分享縮圖跟畫面脫鉤。
  // fallback 鏈：Hero 區塊圖 → 服務 Hero 大圖 → 服務卡片圖 → 全站 ogImage → logo.jpg
  const heroSection = service.sections.find((s) => s.type === 'hero')
  const ogImage =
    (heroSection ? configString(heroSection.config, 'heroImage') : null) ||
    service.heroImage ||
    service.cardImage ||
    settings.ogImage ||
    '/logo.jpg'
  return {
    title: service.seoTitle ?? service.name,
    description: service.seoDesc ?? service.shortDesc,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: service.name,
      description: service.shortDesc,
      images: [{ url: ogImage, alt: service.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: service.name,
      description: service.shortDesc,
      images: [ogImage],
    },
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug: rawSlug } = await params
  const slug = safeDecodeSlug(rawSlug)
  const [service, allServices, settings] = await Promise.all([
    getServiceBySlugFull(slug),
    getActiveServices(),
    getSiteSettings(),
  ])
  if (!service) notFound()

  const others = allServices.filter((s) => s.id !== service.id).slice(0, 3)
  const phoneTel = settings.phoneTel || ''

  // 只渲染 isVisible 的 section，依 order 排序
  const visibleSections = service.sections
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order)

  // 從 sections 攤平 faqs 給 FAQPage schema 用
  const faqs = service.sections.flatMap((sec) => sec.faqs ?? [])

  // 拉該服務對應的 testimonials（schema 用，不影響原版面）
  const testimonials = await prisma.testimonial
    .findMany({
      where: { isActive: true, serviceId: service.id },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: 10,
    })
    .catch(() => [])

  const breadcrumb = breadcrumbJsonLd([
    { name: '首頁', path: '/' },
    { name: '服務項目', path: '/services' },
    { name: service.name, path: `/services/${service.slug}` },
  ])

  const serviceSchema = serviceJsonLd({
    name: service.name,
    shortDesc: service.shortDesc,
    slug: service.slug,
    heroImage: service.heroImage,
    longDesc: service.longDesc,
  })

  const faqSchema = faqs.length > 0 ? faqPageJsonLd(faqs) : null
  const reviewSchema =
    testimonials.length > 0
      ? reviewListJsonLd(
          testimonials.map((t) => ({
            author: t.authorName,
            rating: t.rating,
            content: t.content,
            createdAt: t.createdAt,
          })),
        )
      : null

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={serviceSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {reviewSchema && <JsonLd data={reviewSchema} />}
      {visibleSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          service={service}
          others={others}
          phoneTel={phoneTel}
        />
      ))}
    </>
  )
}
