import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServiceBySlugFull, getActiveServices, getSiteSettings } from '@/lib/queries'
import { JsonLd } from '@/components/json-ld'
import { serviceJsonLd } from '@/lib/seo'
import { SectionRenderer } from '@/components/service-sections/SectionRenderer'

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

  return (
    <>
      <JsonLd
        data={serviceJsonLd({ name: service.name, shortDesc: service.shortDesc, slug: service.slug })}
      />
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
