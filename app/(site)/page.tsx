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
import { localBusinessJsonLd } from '@/lib/seo'

// ISR：每 60 秒 background revalidation；首次以外的訪客都讀 cache
export const revalidate = 60

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

  const ratingAvg =
    testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      : undefined

  const businessJsonLd = localBusinessJsonLd(
    ratingAvg ? { rating: { average: ratingAvg, count: testimonials.length } } : undefined,
  )

  return (
    <>
      <JsonLd data={businessJsonLd} />
      <HomeSections
        sections={sections}
        services={services}
        testimonials={testimonials}
        featured={featured}
        whyUsSections={whyUsSections}
        processSteps={processSteps}
        blocks={blocks}
        phoneTel={phoneTel}
      />
    </>
  )
}
