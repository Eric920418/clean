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
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: {
      features: { orderBy: { order: 'asc' } },
      faqs: { orderBy: { order: 'asc' } },
      _count: {
        select: { beforeAfters: { where: { isActive: true } }, galleryImgs: true },
      },
    },
  })
}

export async function getServiceBySlugFull(slug: string) {
  return prisma.service.findUnique({
    where: { slug },
    include: {
      features: { orderBy: { order: 'asc' } },
      faqs: { orderBy: { order: 'asc' } },
      beforeAfters: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
      galleryImgs: { orderBy: { order: 'asc' } },
    },
  })
}

export async function getFeaturedBeforeAfters() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      name: true,
      beforeAfters: {
        where: { isFeatured: true, isActive: true },
        orderBy: { order: 'asc' },
      },
    },
  })
  return services.flatMap((s) =>
    s.beforeAfters.map((p) => ({ ...p, serviceSlug: s.slug, serviceName: s.name })),
  )
}

export async function getAllBeforeAfters() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    select: {
      slug: true,
      name: true,
      beforeAfters: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
    },
  })
  return services.flatMap((s) =>
    s.beforeAfters.map((p) => ({ ...p, serviceSlug: s.slug, serviceName: s.name })),
  )
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
