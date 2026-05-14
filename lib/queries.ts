// 前台 Server Components 的 prisma 查詢輔助
// 集中查詢，方便日後擴展（如 caching、loaders）

import { prisma } from './prisma'

// 「為何選我們」多區塊（含 cards JSON），預設只取首頁 location
// 若需要 about 頁的同型區塊，傳 { location: 'about' }
export async function getWhyUsSections(opts?: { location?: string }) {
  return prisma.whyUsSection.findMany({
    where: { location: opts?.location ?? 'home' },
    orderBy: { order: 'asc' },
  })
}

// 首頁「服務流程」步驟
export async function getProcessSteps() {
  return prisma.processStep.findMany({ orderBy: { order: 'asc' } })
}

// /faq 一般問題
export async function getGeneralFaqs() {
  return prisma.generalFaq.findMany({ orderBy: { order: 'asc' } })
}

export async function getActiveServices() {
  // 服務列表 + 每個服務透過 sections 拉子表（features/faqs 用於卡片摘要 / FAQ 頁；
  // _count 用於 /admin/services 列表的「N 組對比 / N 圖」顯示）
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          features: { orderBy: { order: 'asc' } },
          faqs: { orderBy: { order: 'asc' } },
          _count: {
            select: { beforeAfters: { where: { isActive: true } }, galleryImgs: true },
          },
        },
      },
    },
  })
  // 攤平 sections 內子表為 service 層級（向下相容 callers 像 /faq /services 頁）
  return services.map((s) => ({
    ...s,
    features: s.sections.flatMap((sec) => sec.features),
    faqs: s.sections.flatMap((sec) => sec.faqs),
    _count: {
      beforeAfters: s.sections.reduce((sum, sec) => sum + sec._count.beforeAfters, 0),
      galleryImgs: s.sections.reduce((sum, sec) => sum + sec._count.galleryImgs, 0),
    },
  }))
}

export async function getServiceBySlugFull(slug: string) {
  return prisma.service.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          features: { orderBy: { order: 'asc' } },
          faqs: { orderBy: { order: 'asc' } },
          beforeAfters: { where: { isActive: true }, orderBy: { order: 'asc' } },
          galleryImgs: { orderBy: { order: 'asc' } },
        },
      },
    },
  })
}

export async function getFeaturedBeforeAfters() {
  const pairs = await prisma.beforeAfterPair.findMany({
    where: { isFeatured: true, isActive: true, section: { service: { isActive: true } } },
    orderBy: { order: 'asc' },
    include: { section: { select: { service: { select: { slug: true, name: true } } } } },
  })
  return pairs.map((p) => ({
    ...p,
    serviceSlug: p.section.service.slug,
    serviceName: p.section.service.name,
  }))
}

export async function getAllBeforeAfters() {
  const pairs = await prisma.beforeAfterPair.findMany({
    where: { isActive: true, section: { service: { isActive: true } } },
    orderBy: [{ section: { service: { order: 'asc' } } }, { order: 'asc' }],
    include: { section: { select: { service: { select: { slug: true, name: true } } } } },
  })
  return pairs.map((p) => ({
    ...p,
    serviceSlug: p.section.service.slug,
    serviceName: p.section.service.name,
  }))
}

export async function getActiveTestimonials() {
  return prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    take: 6,
  })
}

export async function getSiteSettings() {
  const items = await prisma.siteSetting.findMany()
  const map: Record<string, string> = {}
  items.forEach((s) => (map[s.key] = s.value))
  return map
}

export async function getContentBlock(key: string) {
  const item = await prisma.contentBlock.findUnique({ where: { key } })
  return (item?.payload as Record<string, string> | null) ?? null
}

// 一次取所有 ContentBlock，回成 { key: { fieldName: value } }
// 比每頁多次 await getContentBlock 省 round-trip
export async function getAllContentBlocks(): Promise<Record<string, Record<string, string>>> {
  const items = await prisma.contentBlock.findMany()
  const map: Record<string, Record<string, string>> = {}
  items.forEach((b) => {
    map[b.key] = (b.payload as Record<string, string> | null) ?? {}
  })
  return map
}
