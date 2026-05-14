// 共用型別：前台 service-sections 用
// section.config 是 Json，每個 type 有自己 config shape

import type {
  Service,
  ServiceSection,
  ServiceFeature,
  ServiceFaq,
  BeforeAfterPair,
  ServiceGalleryImage,
} from '@prisma/client'

export type {
  ServiceFeature,
  ServiceFaq,
  BeforeAfterPair,
  ServiceGalleryImage,
} from '@prisma/client'

export type SectionWithRelations = ServiceSection & {
  features: ServiceFeature[]
  faqs: ServiceFaq[]
  beforeAfters: BeforeAfterPair[]
  galleryImgs: ServiceGalleryImage[]
}

export type ServiceForSection = Service & {
  sections: SectionWithRelations[]
}

export function configString(config: unknown, key: string): string | null {
  if (!config || typeof config !== 'object') return null
  const v = (config as Record<string, unknown>)[key]
  return typeof v === 'string' && v.trim() ? v : null
}
