import {
  getActiveServices,
  getActiveTestimonials,
  getFeaturedBeforeAfters,
  getWhyUsSections,
  getProcessSteps,
  getSiteSettings,
  getAllContentBlocks,
  getActivePageSections,
} from '@/lib/queries'
import { HomeSections } from './_components/home-sections'
import { JsonLd } from '@/components/json-ld'
import { localBusinessJsonLd, itemListJsonLd, reviewListJsonLd } from '@/lib/seo'

// ISR：一小時備援更新；CMS 存檔失效，下一次存取重新生成
export const revalidate = 3600

export default async function HomePage() {
  const [services, testimonials, featured, whyUsSections, processSteps, settings, blocks, sections] =
    await Promise.all([
      getActiveServices(),
      getActiveTestimonials(),
      getFeaturedBeforeAfters(),
      getWhyUsSections({ location: 'home' }),
      getProcessSteps(),
      getSiteSettings(),
      getAllContentBlocks(),
      getActivePageSections('home'),
    ])
  const phoneTel = settings.phoneTel || ''
  const lineFriendUrl = settings.lineFriendUrl || ''
  const lineCallUrl = settings.lineCallUrl || ''

  const ratingAvg =
    testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      : undefined

  const businessJsonLd = localBusinessJsonLd({
    rating: ratingAvg ? { average: ratingAvg, count: testimonials.length } : undefined,
    image: settings.ogImage || undefined,
    knowsAbout: services.map((s) => s.name),
    sameAs: [settings.fbUrl, settings.igUrl],
  })

  const servicesList = itemListJsonLd(
    services.map((s) => ({
      name: s.name,
      url: `/services/${s.slug}`,
      description: s.shortDesc,
    })),
  )

  const reviewList = reviewListJsonLd(
    testimonials.map((t) => ({
      author: t.authorName,
      rating: t.rating,
      content: t.content,
      createdAt: t.createdAt,
    })),
  )

  return (
    <>
      <JsonLd data={businessJsonLd} />
      <JsonLd data={servicesList} />
      {reviewList && <JsonLd data={reviewList} />}
      <HomeSections
        sections={sections}
        services={services}
        testimonials={testimonials}
        featured={featured}
        whyUsSections={whyUsSections}
        processSteps={processSteps}
        blocks={blocks}
        phoneTel={phoneTel}
        lineFriendUrl={lineFriendUrl}
        lineCallUrl={lineCallUrl}
      />
    </>
  )
}
