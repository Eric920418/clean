import type { Service } from '@prisma/client'
import type { SectionWithRelations, ServiceForSection } from './types'
import { HeroSection } from './HeroSection'
import { IntroSection } from './IntroSection'
import { WhyWithFeaturesSection } from './WhyWithFeaturesSection'
import { BeforeAfterSection } from './BeforeAfterSection'
import { GallerySection } from './GallerySection'
import { FaqSection } from './FaqSection'
import { CtaSection } from './CtaSection'
import { MoreServicesSection } from './MoreServicesSection'
import { TextBlockSection } from './TextBlockSection'

type Props = {
  section: SectionWithRelations
  service: ServiceForSection
  others: Service[]
  phoneTel: string
}

export function SectionRenderer({ section, service, others, phoneTel }: Props) {
  switch (section.type) {
    case 'hero':
      return <HeroSection section={section} service={service} phoneTel={phoneTel} />
    case 'intro':
      return <IntroSection section={section} service={service} />
    case 'why_with_features':
      return <WhyWithFeaturesSection section={section} service={service} />
    case 'before_after':
      return <BeforeAfterSection section={section} service={service} />
    case 'gallery':
      return <GallerySection section={section} service={service} />
    case 'faq':
      return <FaqSection section={section} />
    case 'cta':
      return <CtaSection section={section} service={service} phoneTel={phoneTel} />
    case 'more_services':
      return <MoreServicesSection others={others} />
    case 'text_block':
      return <TextBlockSection section={section} />
    default:
      return null
  }
}
