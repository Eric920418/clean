/**
 * 把 lib/mock-data.ts 的 6 大服務範例資料寫入資料庫
 *
 * 行為：
 * - Service：以 slug upsert（已存在不覆蓋業主編輯過的內容）
 * - Features / FAQs / BeforeAfters / Gallery：先清空該服務的這些子表，再重建
 *   （這些是 seed 範例，業主後台會自己補）
 * - Testimonials：upsert by authorName（避免重跑時重複插）
 *
 * 執行：pnpm db:seed
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { mockServices, mockTestimonials } from '../lib/mock-data'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 開始 seed…')

  for (const m of mockServices) {
    const service = await prisma.service.upsert({
      where: { slug: m.slug },
      create: {
        slug: m.slug,
        name: m.name,
        shortDesc: m.shortDesc,
        longDesc: m.longDesc,
        icon: m.icon,
        heroImage: m.heroImage,
        cardImage: m.cardImage,
        order: m.order,
        isActive: m.isActive,
        isFeatured: m.isFeatured,
      },
      update: {
        // 已存在則只補名稱與描述（避免覆蓋業主自訂的圖片與設定）
        name: m.name,
      },
    })

    // 子表：features / faqs / beforeAfters / gallery 全部以 service 為單位 reset
    await prisma.serviceFeature.deleteMany({ where: { serviceId: service.id } })
    if (m.features.length > 0) {
      await prisma.serviceFeature.createMany({
        data: m.features.map((f) => ({
          serviceId: service.id,
          text: f.text,
          order: f.order,
        })),
      })
    }

    await prisma.serviceFaq.deleteMany({ where: { serviceId: service.id } })
    if (m.faqs.length > 0) {
      await prisma.serviceFaq.createMany({
        data: m.faqs.map((f) => ({
          serviceId: service.id,
          question: f.question,
          answer: f.answer,
          order: f.order,
        })),
      })
    }

    await prisma.beforeAfterPair.deleteMany({ where: { serviceId: service.id } })
    if (m.beforeAfters.length > 0) {
      await prisma.beforeAfterPair.createMany({
        data: m.beforeAfters.map((p) => ({
          serviceId: service.id,
          beforeUrl: p.beforeUrl,
          afterUrl: p.afterUrl,
          caption: p.caption,
          location: p.location,
          takenAt: p.takenAt ? new Date(p.takenAt) : null,
          isFeatured: p.isFeatured,
          order: p.id, // 用 id 作為 seed 的 order
        })),
      })
    }

    await prisma.serviceGalleryImage.deleteMany({ where: { serviceId: service.id } })
    if (m.galleryImgs.length > 0) {
      await prisma.serviceGalleryImage.createMany({
        data: m.galleryImgs.map((g, i) => ({
          serviceId: service.id,
          url: g.url,
          alt: g.alt,
          order: i,
        })),
      })
    }

    console.log(`  ✓ ${m.slug} (${m.beforeAfters.length} 組對比)`)
  }

  // Testimonials
  for (const t of mockTestimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { authorName: t.authorName },
    })
    if (existing) continue

    await prisma.testimonial.create({
      data: {
        authorName: t.authorName,
        authorMeta: t.authorMeta,
        rating: t.rating,
        content: t.content,
        order: t.id,
      },
    })
  }
  console.log(`  ✓ ${mockTestimonials.length} 則客戶評價`)

  console.log('✅ seed 完成')
}

main()
  .catch((e) => {
    console.error('seed 失敗：', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
