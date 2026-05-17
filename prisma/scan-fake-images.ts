/**
 * 唯讀：掃 DB 看哪些欄位現在還存著「假圖 URL」（unsplash / picsum / placeholder）。
 * 不修改任何資料。報告完後業主決定要不要跑 `prisma/clear-fake-images.ts`。
 *
 * 執行：pnpm tsx prisma/scan-fake-images.ts
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const FAKE_HOSTS = ['images.unsplash.com', 'source.unsplash.com', 'picsum.photos', 'placehold', 'via.placeholder']

function isFake(url: string | null | undefined): boolean {
  if (!url) return false
  return FAKE_HOSTS.some((h) => url.includes(h))
}

async function main() {
  console.log('🔍 掃描 DB 假圖 URL（唯讀，不修改）…\n')

  const services = await prisma.service.findMany({
    select: { id: true, slug: true, name: true, heroImage: true, cardImage: true },
  })
  const fakeServiceHero = services.filter((s) => isFake(s.heroImage))
  const fakeServiceCard = services.filter((s) => isFake(s.cardImage))

  const pairs = await prisma.beforeAfterPair.findMany({
    select: { id: true, sectionId: true, beforeUrl: true, afterUrl: true, caption: true },
  })
  const fakePairs = pairs.filter((p) => isFake(p.beforeUrl) || isFake(p.afterUrl))

  const galleryImgs = await prisma.serviceGalleryImage.findMany({
    select: { id: true, sectionId: true, url: true, caption: true },
  })
  const fakeGallery = galleryImgs.filter((g) => isFake(g.url))

  const sections = await prisma.serviceSection.findMany({
    select: { id: true, serviceId: true, type: true, config: true },
  })
  type SectionWithImage = { id: number; serviceId: number; type: string; fakeKeys: string[] }
  const fakeSections: SectionWithImage[] = []
  for (const s of sections) {
    const cfg = (s.config ?? {}) as Record<string, unknown>
    const fakeKeys: string[] = []
    for (const [k, v] of Object.entries(cfg)) {
      if (typeof v === 'string' && isFake(v)) fakeKeys.push(k)
    }
    if (fakeKeys.length > 0) fakeSections.push({ id: s.id, serviceId: s.serviceId, type: s.type, fakeKeys })
  }

  const contentBlocks = await prisma.contentBlock.findMany({
    select: { key: true, payload: true },
  })
  type BlockWithImage = { key: string; fakeKeys: string[] }
  const fakeBlocks: BlockWithImage[] = []
  for (const b of contentBlocks) {
    const payload = (b.payload ?? {}) as Record<string, unknown>
    const fakeKeys: string[] = []
    for (const [k, v] of Object.entries(payload)) {
      if (typeof v === 'string' && isFake(v)) fakeKeys.push(k)
    }
    if (fakeKeys.length > 0) fakeBlocks.push({ key: b.key, fakeKeys })
  }

  // 報告
  const total =
    fakeServiceHero.length +
    fakeServiceCard.length +
    fakePairs.length +
    fakeGallery.length +
    fakeSections.length +
    fakeBlocks.length

  console.log(`📊 假圖總筆數：${total}`)
  console.log()

  if (fakeServiceHero.length > 0) {
    console.log(`🔸 Service.heroImage：${fakeServiceHero.length} 筆`)
    for (const s of fakeServiceHero) {
      console.log(`   - [${s.id}] ${s.slug} (${s.name}) → ${s.heroImage}`)
    }
  }
  if (fakeServiceCard.length > 0) {
    console.log(`🔸 Service.cardImage：${fakeServiceCard.length} 筆`)
    for (const s of fakeServiceCard) {
      console.log(`   - [${s.id}] ${s.slug} (${s.name}) → ${s.cardImage}`)
    }
  }
  if (fakePairs.length > 0) {
    console.log(`🔸 BeforeAfterPair（前後對比圖）：${fakePairs.length} 組`)
    for (const p of fakePairs) {
      console.log(`   - section#${p.sectionId} pair#${p.id} ${p.caption ?? '無 caption'}`)
    }
  }
  if (fakeGallery.length > 0) {
    console.log(`🔸 ServiceGalleryImage（圖庫）：${fakeGallery.length} 張`)
    for (const g of fakeGallery) {
      console.log(`   - section#${g.sectionId} img#${g.id} ${g.caption ?? '無 caption'}`)
    }
  }
  if (fakeSections.length > 0) {
    console.log(`🔸 ServiceSection.config（區塊內嵌圖）：${fakeSections.length} 個區塊`)
    for (const s of fakeSections) {
      console.log(`   - section#${s.id} (type=${s.type}, serviceId=${s.serviceId}) 假圖欄位：${s.fakeKeys.join(', ')}`)
    }
  }
  if (fakeBlocks.length > 0) {
    console.log(`🔸 ContentBlock.payload（首頁/about 等 CMS 區塊）：${fakeBlocks.length} 個 key`)
    for (const b of fakeBlocks) {
      console.log(`   - ${b.key} 假圖欄位：${b.fakeKeys.join(', ')}`)
    }
  }

  if (total === 0) {
    console.log('✅ DB 內沒有任何假圖 URL，業主已清乾淨')
  } else {
    console.log()
    console.log('⚠️  以上欄位仍在 DB 裡載入時會打 unsplash／placeholder 取得假圖。')
    console.log('   下一步：跑 `pnpm tsx prisma/clear-fake-images.ts` 一鍵清除（會把欄位設為 null/空字串）。')
  }
}

main()
  .catch((e) => {
    console.error('❌ 掃描失敗：', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
