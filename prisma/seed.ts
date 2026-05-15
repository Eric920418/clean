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
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import { mockServices, mockTestimonials } from '../lib/mock-data'
import { siteConfig } from '../lib/site-config'

neonConfig.webSocketConstructor = ws

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// 示範 intro section config（C4a：直接寫入 ServiceSection.config，不再經過 Service.intro* 欄位）
const introSectionConfig: Record<string, {
  eyebrow: string
  title: string
  paragraph1: string
  paragraph2: string
  paragraph3: string
  image: string
}> = {
  'aircon-cleaning': {
    eyebrow: 'Why this matters',
    title: '冷氣不只是冷，更是空氣的入口',
    paragraph1: '夏季長時間運轉的冷氣，蒸發器與導風葉常年潮濕，是黴菌與細菌最愛的繁殖場。一台沒清過的冷氣，吹出來的空氣可能比戶外還髒。',
    paragraph2: '我們採用整機拆卸式深度清洗，把蒸發器、貫流扇、外殼通通卸下來進高壓水柱清洗，搭配生物可分解洗劑，敏感肌、寵物、嬰幼兒環境一樣安全。',
    paragraph3: '每一台冷氣施作前後都會錄影、拍照，讓您清楚看見「黑水變清水」的真實過程。我們相信，看不見的潔淨，才是最頂級的居家品質。',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80',
  },
  'washer-deep-clean': {
    eyebrow: 'The hidden truth',
    title: '看似乾淨的洗衣機，其實藏著厚厚一層黑垢',
    paragraph1: '洗衣機內筒與外筒之間的夾層，是您每天洗衣時看不到的地方。長年累積的洗劑殘渣、衣物纖維、發霉黴斑，讓洗出來的衣服看似乾淨、實則沾滿微生物。',
    paragraph2: '我們的洗衣機拆解清潔，是把整台洗衣機翻過來、拆下內筒做物理清洗，而不是丟一顆清潔錠就交差。整個過程拍照記錄，您能看見原本藏在縫隙裡的東西。',
    paragraph3: '滾筒式、直立式、變頻、雙槽，我們都能處理。每一次拆洗都搭配抗菌處理，讓您下一批衣服真正洗得乾淨。',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=80',
  },
}

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
        // 已存在則只補名稱（避免覆蓋業主自訂的圖片與設定）
        name: m.name,
      },
    })

    // C4b 後：子表 reset 必須先確保對應 type 的 section 存在，再 scope 到 sectionId
    const sectionIds = await ensureDefaultSectionsForService(service.id, service.name, m)

    await prisma.serviceFeature.deleteMany({ where: { sectionId: sectionIds.why } })
    if (m.features.length > 0) {
      await prisma.serviceFeature.createMany({
        data: m.features.map((f) => ({
          sectionId: sectionIds.why,
          text: f.text,
          order: f.order,
        })),
      })
    }

    await prisma.serviceFaq.deleteMany({ where: { sectionId: sectionIds.faq } })
    if (m.faqs.length > 0) {
      await prisma.serviceFaq.createMany({
        data: m.faqs.map((f) => ({
          sectionId: sectionIds.faq,
          question: f.question,
          answer: f.answer,
          order: f.order,
        })),
      })
    }

    await prisma.beforeAfterPair.deleteMany({ where: { sectionId: sectionIds.before_after } })
    if (m.beforeAfters.length > 0) {
      await prisma.beforeAfterPair.createMany({
        data: m.beforeAfters.map((p) => ({
          sectionId: sectionIds.before_after,
          beforeUrl: p.beforeUrl,
          afterUrl: p.afterUrl,
          caption: p.caption,
          location: p.location,
          takenAt: p.takenAt ? new Date(p.takenAt) : null,
          isFeatured: p.isFeatured,
          order: p.id,
        })),
      })
    }

    await prisma.serviceGalleryImage.deleteMany({ where: { sectionId: sectionIds.gallery } })
    if (m.galleryImgs.length > 0) {
      await prisma.serviceGalleryImage.createMany({
        data: m.galleryImgs.map((g, i) => ({
          sectionId: sectionIds.gallery,
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

  // === 結構性品牌文案 ContentBlock 初始值（13 個 key）===
  // 用 findUnique 短路避免覆蓋業主已編輯資料
  const initialBlocks: Record<string, Record<string, string>> = {
    'hero-home': {
      eyebrow: 'Invisible Care · 居家健康守護',
      titleLine1: '看不見的守護，',
      titleLine2: '才是家最頂級的豪華',
      description:
        '從空氣、水源到家電，我們用職人精神拆解每一處被忽略的細節。讓家，回歸最純粹、最令人安心的模樣。',
      primaryCta: '立即來電預約',
      secondaryCta: '看服務案例',
      checklist1: '歐盟認證環保洗劑',
      checklist2: '透明報價・絕不增項',
      checklist3: '30 天無憂保固',
      checklist4: '雙北・桃園・新竹到府',
    },
    'section-services-home': {
      eyebrow: 'Our Services',
      title: '服務項目，一站式守護',
      description:
        '從窗戶上的紗網，到家中每一滴用水，我們整合全方位居家維護技術，由內而外照顧您與家人的健康。',
    },
    'section-works-home': {
      eyebrow: 'Real Results',
      title: '親眼見證的反差',
      description: '所有清洗前後對比圖均為實際施作案例，未經修飾濾鏡，已取得客戶授權。',
      viewAllLabel: '查看全部實績',
    },
    'section-process-home': {
      eyebrow: 'How it works',
      title: '四步驟・讓您安心交付',
    },
    'section-testimonials-home': {
      eyebrow: 'Customer Voices',
      title: '他們選擇了 invisible care',
    },
    'cta-home': {
      overline: 'BOOK YOUR HOME CARE TODAY',
      titleLine1: '把專業交給我們，',
      titleLine2: '把時間留給家人。',
      description: '一次預約，到府全程服務，讓您看見每一個被細心對待的細節。',
      primaryCta: '立即來電預約',
    },
    'hero-about': {
      eyebrow: 'About invisible care',
      titleLine1: '看不見的守護，',
      titleLine2: '才是家最頂級的豪華',
      lead:
        '真正的居家品質，不該只存在於裝潢的華麗，而應體現在每一次深呼吸、每一寸觸摸到的布料，以及每一口入喉的水中。我們是 居家健康空間的修復師。',
    },
    'cta-about': {
      title: '您的家，值得被溫柔對待',
      description: '讓專業的職人團隊，為您的愛家注入全新的生命力。',
      primaryCta: '立即來電預約',
    },
    'hero-contact': {
      eyebrow: 'Contact',
      title: '預約諮詢',
      description:
        '填寫下方表單，30 分鐘內專人聯繫；或直接撥打專線、加入 LINE，我們將盡快為您服務。',
    },
    'hero-faq': {
      eyebrow: 'FAQ',
      title: '常見問題',
      description: '找不到答案？歡迎直接聯繫我們。',
      generalHeading: '一般服務',
      contactBoxText: '還有其他疑問？',
      contactBoxButton: '聯絡我們',
    },
    'hero-services': {
      eyebrow: 'Our Services',
      title: '服務項目',
      description: '點選下方服務查看完整介紹、清潔前後實績與常見問題。',
    },
    'hero-works': {
      eyebrow: 'Real Results',
      title: '服務案例・前後對比',
      description: '拖動中央分隔線，親眼見證 invisible care 帶來的改變。所有照片均為真實案例。',
    },
    navigation: {
      navServicesLabel: '服務項目',
      navWorksLabel: '服務案例',
      navAboutLabel: '關於我們',
      navFaqLabel: '常見問題',
      navContactLabel: '預約諮詢',
      navPrimaryCtaLabel: '立即來電預約',
      footerLegalNote: '本網站所有清洗前後對比圖均經客戶授權刊登',
    },
  }
  let blocksCreated = 0
  for (const [key, payload] of Object.entries(initialBlocks)) {
    const existing = await prisma.contentBlock.findUnique({ where: { key } })
    if (!existing) {
      await prisma.contentBlock.create({ data: { key, payload } })
      blocksCreated++
    }
  }
  if (blocksCreated > 0) {
    console.log(`  ✓ ContentBlock 結構文案: 補入 ${blocksCreated} 筆初始值`)
  } else {
    console.log('  ↷ ContentBlock 結構文案: 全部已存在，跳過')
  }

  // WhyUsSection：首頁「為何選我們」第一筆（從 siteConfig.promises 搬過來）
  const whyUsHomeExisting = await prisma.whyUsSection.findFirst({
    where: { location: 'home', order: 0 },
  })
  if (!whyUsHomeExisting) {
    await prisma.whyUsSection.create({
      data: {
        location: 'home',
        eyebrow: 'Why invisible care',
        title: '三項堅持，讓家人安心',
        description: '我們不追求低價競爭，追求的是「品質的極致」與「客戶的安心」。',
        cards: siteConfig.promises,
        order: 0,
      },
    })
    console.log('  ✓ WhyUsSection(home): 第一筆已建立')

    // 既有 ContentBlock(key=why-us) 變成孤兒資料，清掉
    const removed = await prisma.contentBlock.deleteMany({ where: { key: 'why-us' } })
    if (removed.count > 0) {
      console.log(`  ✓ 已清除孤兒 ContentBlock(key=why-us) × ${removed.count}`)
    }
  } else {
    console.log('  ↷ WhyUsSection(home): 已有資料，跳過')
  }

  // WhyUsSection(about)：about 頁「三項職人信仰」
  const whyUsAboutExisting = await prisma.whyUsSection.findFirst({
    where: { location: 'about' },
  })
  if (!whyUsAboutExisting) {
    await prisma.whyUsSection.create({
      data: {
        location: 'about',
        eyebrow: 'Our beliefs',
        title: '三項職人信仰',
        description: '我們不追求低價競爭，追求的是「品質的極致」與「客戶的安心」。',
        cards: siteConfig.promises,
        order: 0,
      },
    })
    console.log('  ✓ WhyUsSection(about): 第一筆已建立')
  } else {
    console.log('  ↷ WhyUsSection(about): 已有資料，跳過')
  }

  // ProcessStep：首頁四步驟服務流程
  const processExisting = await prisma.processStep.count()
  if (processExisting === 0) {
    await prisma.processStep.createMany({
      data: siteConfig.process.map((p, idx) => ({
        step: p.step,
        title: p.title,
        desc: p.desc,
        order: idx,
      })),
    })
    console.log(`  ✓ ProcessStep: ${siteConfig.process.length} 筆已建立`)
  } else {
    console.log('  ↷ ProcessStep: 已有資料，跳過')
  }

  // GeneralFaq：/faq 一般問題（非特定服務）
  const generalFaqExisting = await prisma.generalFaq.count()
  if (generalFaqExisting === 0) {
    await prisma.generalFaq.createMany({
      data: [
        {
          question: '預約後多久能安排施作？',
          answer:
            '一般情況下 1–3 天內可安排，旺季（夏季冷氣、年末居家清潔）建議提前 1 週預約。',
          order: 0,
        },
        {
          question: '報價會不會中途加價？',
          answer:
            '不會。我們堅持透明報價：到府評估後給出總價，書面確認再施作。若現場發現額外狀況，我們會先停下來與您溝通，確認後才繼續，絕不擅自加價。',
          order: 1,
        },
        {
          question: '使用的洗劑對小孩、寵物安全嗎？',
          answer:
            '我們優選歐盟認證、生物可分解的環保洗劑，無刺鼻氣味、無毒性殘留，敏感肌、嬰幼兒、寵物環境皆可安心。',
          order: 2,
        },
        {
          question: '完工後若有問題怎麼辦？',
          answer:
            '所有服務皆提供 30 天無憂保固，若清洗後出現異常運轉、未清潔到位等問題，我們將免費回訪處理。',
          order: 3,
        },
      ],
    })
    console.log('  ✓ GeneralFaq: 4 筆已建立')
  } else {
    console.log('  ↷ GeneralFaq: 已有資料，跳過')
  }

  // SiteSetting：把 siteConfig.contact / brand 全寫進 DB（業主後台可改）
  // 用 upsert.create 模式但不覆蓋既有值，避免覆蓋業主已編輯資料
  const initialSettings: Record<string, string> = {
    siteName: siteConfig.brandName,
    tagline: siteConfig.brandTagline,
    description: siteConfig.description,
    phone: siteConfig.contact.phone,
    phoneTel: siteConfig.contact.phoneTel,
    email: siteConfig.contact.email,
    lineId: siteConfig.contact.lineId,
    lineFriendUrl: siteConfig.contact.lineFriendUrl,
    lineCallUrl: siteConfig.contact.lineCallUrl,
    serviceArea: siteConfig.contact.serviceArea,
    hours: siteConfig.contact.hours,
    fbUrl: siteConfig.social.facebook,
    igUrl: siteConfig.social.instagram,
    proshakeUrl: siteConfig.partners.proshake.url,
    iosAppUrl: siteConfig.apps.ios,
  }
  let createdCount = 0
  for (const [key, value] of Object.entries(initialSettings)) {
    const existing = await prisma.siteSetting.findUnique({ where: { key } })
    if (!existing) {
      await prisma.siteSetting.create({ data: { key, value } })
      createdCount++
    }
  }
  if (createdCount > 0) {
    console.log(`  ✓ SiteSetting: 補入 ${createdCount} 筆初始值`)
  } else {
    console.log('  ↷ SiteSetting: 全部已存在，跳過')
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

  // C4b 後：子表 reset 期間已透過 ensureDefaultSectionsForService 建立 sections
  // 這裡再補入 intro section 的示範文案（idempotent，業主編過就跳過）
  await seedIntroSectionConfigs()

  console.log('✅ seed 完成')
}

async function seedIntroSectionConfigs() {
  let updated = 0
  for (const [slug, cfg] of Object.entries(introSectionConfig)) {
    const service = await prisma.service.findUnique({
      where: { slug },
      include: { sections: { where: { type: 'intro' } } },
    })
    const introSection = service?.sections[0]
    if (!introSection) continue
    const current = introSection.config as Record<string, unknown>
    if (current.title) continue // 已被業主編輯過，跳過
    await prisma.serviceSection.update({
      where: { id: introSection.id },
      data: { config: cfg as Prisma.InputJsonValue, isVisible: true },
    })
    updated++
  }
  if (updated > 0) console.log(`  ✓ Intro section config 補入 ${updated} 筆示範文案`)
}

// === Section CMS helper（C4b 之後）===
// 確保 service 有 8 個 default section（idempotent），回傳對應 sectionId map
const SECTION_ORDER = [
  'hero',
  'intro',
  'why_with_features',
  'before_after',
  'gallery',
  'faq',
  'cta',
  'more_services',
] as const

type DefaultSectionIds = {
  hero: number
  intro: number
  why_with_features: number
  before_after: number
  gallery: number
  faq: number
  cta: number
  more_services: number
  why: number
}

async function ensureDefaultSectionsForService(
  serviceId: number,
  serviceName: string,
  mock: { features: unknown[]; faqs: unknown[]; beforeAfters: unknown[]; galleryImgs: unknown[] },
): Promise<DefaultSectionIds> {
  const existing = await prisma.serviceSection.findMany({ where: { serviceId } })
  const byType = new Map(existing.map((s) => [s.type, s.id]))

  for (let i = 0; i < SECTION_ORDER.length; i++) {
    const type = SECTION_ORDER[i]
    if (byType.has(type)) continue
    const config: Prisma.InputJsonValue =
      type === 'before_after'
        ? { eyebrow: 'Real Results', title: `${serviceName}・實際施作前後` }
        : type === 'gallery'
        ? { eyebrow: 'Gallery', title: '施作過程' }
        : type === 'faq'
        ? { eyebrow: 'FAQ', title: '常見問題' }
        : {}
    const visible =
      type === 'before_after'
        ? mock.beforeAfters.length > 0
        : type === 'gallery'
        ? mock.galleryImgs.length > 0
        : type === 'faq'
        ? mock.faqs.length > 0
        : true
    const created = await prisma.serviceSection.create({
      data: { serviceId, type, order: i + 1, isVisible: visible, config },
    })
    byType.set(type, created.id)
  }

  return {
    hero: byType.get('hero')!,
    intro: byType.get('intro')!,
    why_with_features: byType.get('why_with_features')!,
    why: byType.get('why_with_features')!,
    before_after: byType.get('before_after')!,
    gallery: byType.get('gallery')!,
    faq: byType.get('faq')!,
    cta: byType.get('cta')!,
    more_services: byType.get('more_services')!,
  }
}

main()
  .catch((e) => {
    console.error('seed 失敗：', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
