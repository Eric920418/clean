import type { Metadata } from 'next'
import { SectionHeading } from '@/components/section-heading'
import { WorksGallery } from '@/components/works-gallery'
import { getAllBeforeAfters, getActiveServices } from '@/lib/queries'

export const revalidate = 60

export const metadata: Metadata = {
  title: '清潔實績',
  description:
    '所有清洗前後對比圖均為實際施作案例，未經修飾濾鏡，已取得客戶授權。可依服務分類篩選查看。',
}

export default async function WorksPage() {
  const [allBeforeAfters, services] = await Promise.all([
    getAllBeforeAfters(),
    getActiveServices(),
  ])

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

  return (
    <>
      <section className="bg-medical-glow pt-14 pb-8 md:pt-20 md:pb-12">
        <div className="container-narrow">
          <SectionHeading
            eyebrow="Real Results"
            title="清潔實績・前後對比"
            description="拖動中央分隔線，親眼見證 invisible care 帶來的改變。所有照片均為真實案例。"
          />
        </div>
      </section>

      <section className="section pt-8 md:pt-10">
        <div className="container-narrow">
          <WorksGallery items={items} filters={filters} />
        </div>
      </section>
    </>
  )
}
