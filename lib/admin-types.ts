// 後台 client component 用的型別（Date 已序列化為 string）

export type AdminService = {
  id: number
  slug: string
  name: string
  shortDesc: string
  longDesc: string
  icon: string | null
  heroImage: string | null
  cardImage: string | null
  order: number
  isActive: boolean
  isFeatured: boolean
  seoTitle: string | null
  seoDesc: string | null
  createdAt: string
  updatedAt: string
  features?: AdminServiceFeature[]
  faqs?: AdminServiceFaq[]
  beforeAfters?: AdminBeforeAfter[]
  galleryImgs?: AdminGalleryImage[]
  sections?: AdminServiceSection[]
  _count?: { beforeAfters: number; galleryImgs: number }
}

export type AdminServiceFeature = {
  id: number
  sectionId: number
  text: string
  order: number
}

export type AdminServiceFaq = {
  id: number
  sectionId: number
  question: string
  answer: string
  order: number
}

export type AdminBeforeAfter = {
  id: number
  sectionId: number
  beforeUrl: string
  afterUrl: string
  caption: string | null
  location: string | null
  takenAt: string | null
  order: number
  isFeatured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AdminGalleryImage = {
  id: number
  sectionId: number
  url: string
  alt: string | null
  caption: string | null
  order: number
}

export type AdminInquiry = {
  id: number
  name: string
  phone: string
  lineId: string | null
  email: string | null
  preferDate: string | null
  address: string | null
  message: string | null
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'DONE' | 'CLOSED'
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export type AdminTestimonial = {
  id: number
  authorName: string
  authorMeta: string | null
  rating: number
  content: string
  serviceId: number | null
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export type ServiceSectionType =
  | 'hero'
  | 'intro'
  | 'why_with_features'
  | 'before_after'
  | 'gallery'
  | 'faq'
  | 'cta'
  | 'more_services'
  | 'text_block'

export type AdminServiceSection = {
  id: number
  serviceId: number
  type: ServiceSectionType
  order: number
  isVisible: boolean
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string
  _count?: {
    features: number
    faqs: number
    beforeAfters: number
    galleryImgs: number
  }
}

export type AdminWhyUsSection = {
  id: number
  location: string
  eyebrow: string | null
  title: string
  description: string | null
  cards: { title: string; desc: string }[]
  order: number
  createdAt: string
  updatedAt: string
}

export type AdminProcessStep = {
  id: number
  step: string
  title: string
  desc: string
  order: number
  createdAt: string
  updatedAt: string
}

export type AdminGeneralFaq = {
  id: number
  question: string
  answer: string
  order: number
  createdAt: string
  updatedAt: string
}

export type AdminContentBlock = {
  id: number
  key: string
  payload: unknown
  createdAt: string
  updatedAt: string
}

export type AdminSiteSetting = {
  id: number
  key: string
  value: string
}
