import type { Metadata } from 'next'
import { SectionHeading } from '@/components/section-heading'
import { WorksGallery } from '@/components/works-gallery'
import { getAllBeforeAfters, getActiveServices, getContentBlock } from '@/lib/queries'
import { JsonLd } from '@/components/json-ld'
import { breadcrumbJsonLd, imageGalleryJsonLd } from '@/lib/seo'

export const revalidate = 60

export const metadata: Metadata = {
  title: '服務案例',
  description:
    '所有清洗前後對比圖均為實際施作案例，未經修飾濾鏡，已取得客戶授權。可依服務分類篩選查看。',
  alternates: { canonical: '/works' },
}

export default async function WorksPage() {
  const [allBeforeAfters, services, heroBlock] = await Promise.all([
    getAllBeforeAfters(),
    getActiveServices(),
    getContentBlock('hero-works').catch(() => null),
  ])
  const hero = heroBlock ?? {}

  // BeforeAfterPair 需要 string，將 Date 轉 ISO
  const items = allBeforeAfters.map((p) => ({
    id: p.id,
    beforeUrl: p.beforeUrl,
    afterUrl: p.afterUrl,
    caption: p.caption ?? '',
    location: p.location,
    serviceSlug: p.serviceSlug,
    serviceName: p.serviceName,
  }))

  const filters = [
    { slug: 'all', name: '全部', count: items.length },
    ...services.map((s) => ({
      slug: s.slug,
      name: s.name,
      count: items.filter((p) => p.serviceSlug === s.slug).length,
    })),
  ].filter((f) => f.count > 0)

  const breadcrumb = breadcrumbJsonLd([
    { name: '首頁', path: '/' },
    { name: '服務案例', path: '/works' },
  ])
  const gallerySchema = imageGalleryJsonLd(
    allBeforeAfters.map((p) => ({
      beforeUrl: p.beforeUrl,
      afterUrl: p.afterUrl,
      caption: p.caption,
      location: p.location,
      serviceName: p.serviceName,
    })),
  )

  return (
    <>
      <JsonLd data={breadcrumb} />
      {gallerySchema && <JsonLd data={gallerySchema} />}
      <section className="bg-medical-glow pt-8 pb-8 md:pt-12 md:pb-12">
        <div className="container-narrow">
          <SectionHeading
            as="h1"
            eyebrow={hero.eyebrow || "Real Results"}
            title={hero.title || "服務案例・前後對比"}
            description={
              hero.description ||
              "拖動中央分隔線，親眼見證 invisible care 帶來的改變。所有照片均為真實案例。"
            }
          />
        </div>
      </section>

      <section className="section pt-8 md:pt-10">
        <div className="container-narrow">
          <WorksGallery items={items} filters={filters} />
        </div>
      </section>
    </>
  );
}
