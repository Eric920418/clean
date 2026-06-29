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
  slug: string | null
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
  slug: string | null
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

export type PageSectionPage = 'home' | 'about'

// 各頁面的固定 section type（不能新增、不能刪除，業主只能排序/隱藏）
// 「hero」「cta」在 home / about 命名重複是刻意的 — 各自代表該頁的 hero / cta，
// 透過 page 欄位區分；render dispatch 與 ensure 邏輯都以 (page, type) 為單位
export const FIXED_TYPES_BY_PAGE = {
  home: ['hero', 'services_grid', 'why_us', 'featured_works', 'process', 'testimonials', 'cta'],
  about: ['hero', 'story', 'beliefs', 'cta'],
} as const

export type FixedHomeSectionType = (typeof FIXED_TYPES_BY_PAGE)['home'][number]
export type FixedAboutSectionType = (typeof FIXED_TYPES_BY_PAGE)['about'][number]
export type FixedPageSectionType = FixedHomeSectionType | FixedAboutSectionType

// 動態 section type — 業主可任意新增/刪除
export type DynamicPageSectionType = 'text_block' | 'cta_banner' | 'image_text' | 'rich_content'

export type PageSectionType = FixedPageSectionType | DynamicPageSectionType

export function isFixedType(page: PageSectionPage, type: string): boolean {
  return (FIXED_TYPES_BY_PAGE[page] as readonly string[]).includes(type)
}

export type AdminPageSection = {
  id: number
  page: PageSectionPage
  type: PageSectionType
  order: number
  isVisible: boolean
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type AdminSiteSetting = {
  id: number
  key: string
  value: string
}
