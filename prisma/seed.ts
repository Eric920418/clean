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

// 只示範 2 個服務的故事區，其他 4 個留空讓業主自己寫
const introMap: Record<string, {
  introEyebrow: string
  introTitle: string
  introParagraph1: string
  introParagraph2: string
  introParagraph3: string
  introImage: string
}> = {
  'aircon-cleaning': {
    introEyebrow: 'Why this matters',
    introTitle: '冷氣不只是冷，更是空氣的入口',
    introParagraph1: '夏季長時間運轉的冷氣，蒸發器與導風葉常年潮濕，是黴菌與細菌最愛的繁殖場。一台沒清過的冷氣，吹出來的空氣可能比戶外還髒。',
    introParagraph2: '我們採用整機拆卸式深度清洗，把蒸發器、貫流扇、外殼通通卸下來進高壓水柱清洗，搭配生物可分解洗劑，敏感肌、寵物、嬰幼兒環境一樣安全。',
    introParagraph3: '每一台冷氣施作前後都會錄影、拍照，讓您清楚看見「黑水變清水」的真實過程。我們相信，看不見的潔淨，才是最頂級的居家品質。',
    introImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80',
  },
  'washer-deep-clean': {
    introEyebrow: 'The hidden truth',
    introTitle: '看似乾淨的洗衣機，其實藏著厚厚一層黑垢',
    introParagraph1: '洗衣機內筒與外筒之間的夾層，是您每天洗衣時看不到的地方。長年累積的洗劑殘渣、衣物纖維、發霉黴斑，讓洗出來的衣服看似乾淨、實則沾滿微生物。',
    introParagraph2: '我們的洗衣機拆解清潔，是把整台洗衣機翻過來、拆下內筒做物理清洗，而不是丟一顆清潔錠就交差。整個過程拍照記錄，您能看見原本藏在縫隙裡的東西。',
    introParagraph3: '滾筒式、直立式、變頻、雙槽，我們都能處理。每一次拆洗都搭配抗菌處理，讓您下一批衣服真正洗得乾淨。',
    introImage: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=80',
  },
}

async function main() {
  console.log('🌱 開始 seed…')

  for (const m of mockServices) {
    const intro = introMap[m.slug] ?? null
    const existing = await prisma.service.findUnique({ where: { slug: m.slug } })

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
        ...(intro ?? {}),
      },
      update: {
        // 已存在則只補名稱（避免覆蓋業主自訂的圖片與設定）
        name: m.name,
        // 只在業主還沒填過 intro 時才補示範文案，不會覆蓋業主編輯
        ...(intro && existing && existing.introTitle === null ? intro : {}),
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

  // ContentBlock：about 故事區（前台 /about 頁面從這裡讀）
  const aboutBlockExisting = await prisma.contentBlock.findUnique({ where: { key: 'about' } })
  if (!aboutBlockExisting) {
    await prisma.contentBlock.create({
      data: {
        key: 'about',
        payload: {
          eyebrow: 'Our story',
          title: '關於那些被遺忘的空間',
          paragraph1: '我們常說「家是最好的避風港」，但如果避風港裡的空氣充滿塵蟎、水源帶著餘氯、家電裡藏著陳年黴菌，這個家，真的安全嗎？',
          paragraph2: 'invisible care 整合了防霾通風、全戶濾水、深度清潔、家電維修等核心技術，致力於為每一位客戶提供「由內而外」的居家健康解決方案。',
          paragraph3: '我們不只是清潔工，更是您居家的健康顧問，用職人精神與精準技術，為您守護家人的每一次呼吸與每一滴用水。',
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
        },
      },
    })
    console.log('  ✓ ContentBlock: about（含圖片）')
  } else {
    console.log('  ↷ ContentBlock: about 已存在，跳過（避免覆蓋業主編輯）')
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
