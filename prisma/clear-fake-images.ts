/**
 * 把 DB 裡所有 unsplash／placeholder 假圖 URL 清掉。
 *
 * 規則：
 *   - Service.heroImage / cardImage：String? 可 null → 設為 null
 *   - ServiceSection.config 內的假圖欄位（image 等）→ 從 JSON 移除該 key
 *   - ContentBlock.payload 內的假圖欄位 → 從 JSON 移除該 key
 *   - BeforeAfterPair.beforeUrl/afterUrl：NOT NULL → **整筆刪除**（無法 null）
 *   - ServiceGalleryImage.url：NOT NULL → **整筆刪除**
 *
 * 預設 dry-run 模式（不寫 DB），加 `--confirm` 才實際執行。
 *
 * 執行：
 *   pnpm tsx prisma/clear-fake-images.ts             # dry-run，只報告會改什麼
 *   pnpm tsx prisma/clear-fake-images.ts --confirm   # 實際寫 DB
 */
import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const FAKE_HOSTS = ['images.unsplash.com', 'source.unsplash.com', 'picsum.photos', 'placehold', 'via.placeholder']
const isFake = (url: string | null | undefined): boolean =>
  !!url && FAKE_HOSTS.some((h) => url.includes(h))

const DRY_RUN = !process.argv.includes('--confirm')

async function main() {
  console.log(`${DRY_RUN ? '🧪 DRY-RUN（不會寫 DB）' : '🚨 CONFIRMED — 實際寫 DB'}\n`)

  let plannedUpdates = 0
  let plannedDeletes = 0

  // 1. Service.heroImage / cardImage → null
  const services = await prisma.service.findMany({
    select: { id: true, slug: true, heroImage: true, cardImage: true },
  })
  for (const s of services) {
    const clearHero = isFake(s.heroImage)
    const clearCard = isFake(s.cardImage)
    if (!clearHero && !clearCard) continue
    plannedUpdates++
    const fields: string[] = []
    if (clearHero) fields.push('heroImage')
    if (clearCard) fields.push('cardImage')
    console.log(`  · Service[${s.id} ${s.slug}] → 清 ${fields.join(', ')}`)
    if (!DRY_RUN) {
      await prisma.service.update({
        where: { id: s.id },
        data: {
          heroImage: clearHero ? null : undefined,
          cardImage: clearCard ? null : undefined,
        },
      })
    }
  }

  // 2. ServiceSection.config 內的假圖欄位 → 移除 key
  const sections = await prisma.serviceSection.findMany({
    select: { id: true, type: true, serviceId: true, config: true },
  })
  for (const s of sections) {
    const cfg = (s.config ?? {}) as Record<string, unknown>
    const fakeKeys = Object.entries(cfg)
      .filter(([, v]) => typeof v === 'string' && isFake(v as string))
      .map(([k]) => k)
    if (fakeKeys.length === 0) continue
    plannedUpdates++
    console.log(`  · Section[${s.id} type=${s.type} serviceId=${s.serviceId}] config 移除 key: ${fakeKeys.join(', ')}`)
    if (!DRY_RUN) {
      const newCfg = { ...cfg }
      for (const k of fakeKeys) delete newCfg[k]
      await prisma.serviceSection.update({
        where: { id: s.id },
        data: { config: newCfg as Prisma.InputJsonValue },
      })
    }
  }

  // 3. ContentBlock.payload 內的假圖欄位 → 移除 key
  const blocks = await prisma.contentBlock.findMany({ select: { key: true, payload: true } })
  for (const b of blocks) {
    const payload = (b.payload ?? {}) as Record<string, unknown>
    const fakeKeys = Object.entries(payload)
      .filter(([, v]) => typeof v === 'string' && isFake(v as string))
      .map(([k]) => k)
    if (fakeKeys.length === 0) continue
    plannedUpdates++
    console.log(`  · ContentBlock[${b.key}] payload 移除 key: ${fakeKeys.join(', ')}`)
    if (!DRY_RUN) {
      const newPayload = { ...payload }
      for (const k of fakeKeys) delete newPayload[k]
      await prisma.contentBlock.update({
        where: { key: b.key },
        data: { payload: newPayload as Prisma.InputJsonValue },
      })
    }
  }

  // 4. BeforeAfterPair → 整筆刪（NOT NULL 欄位無法 null）
  const pairs = await prisma.beforeAfterPair.findMany({
    select: { id: true, sectionId: true, beforeUrl: true, afterUrl: true, caption: true, location: true },
  })
  const fakePairs = pairs.filter((p) => isFake(p.beforeUrl) || isFake(p.afterUrl))
  for (const p of fakePairs) {
    plannedDeletes++
    console.log(`  · ❌ DELETE BeforeAfterPair[${p.id}] section=${p.sectionId} caption="${p.caption ?? ''}" location="${p.location ?? ''}"`)
    if (!DRY_RUN) {
      await prisma.beforeAfterPair.delete({ where: { id: p.id } })
    }
  }

  // 5. ServiceGalleryImage → 整筆刪
  const imgs = await prisma.serviceGalleryImage.findMany({
    select: { id: true, sectionId: true, url: true, caption: true },
  })
  const fakeImgs = imgs.filter((g) => isFake(g.url))
  for (const g of fakeImgs) {
    plannedDeletes++
    console.log(`  · ❌ DELETE ServiceGalleryImage[${g.id}] section=${g.sectionId} caption="${g.caption ?? ''}"`)
    if (!DRY_RUN) {
      await prisma.serviceGalleryImage.delete({ where: { id: g.id } })
    }
  }

  console.log()
  console.log(`📊 預計 ${plannedUpdates} 筆 UPDATE，${plannedDeletes} 筆 DELETE`)
  if (DRY_RUN) {
    console.log('🧪 這是 dry-run。確認沒問題再加 `--confirm` 實際執行：')
    console.log('   pnpm tsx prisma/clear-fake-images.ts --confirm')
  } else {
    console.log('✅ 已寫入 DB')
  }
}

main()
  .catch((e) => {
    console.error('❌ 失敗：', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
