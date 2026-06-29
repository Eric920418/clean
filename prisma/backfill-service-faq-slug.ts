/**
 * 一次性回填：把現有 ServiceFaq 補上 slug（SEO 獨立網址 /services/[服務]/faq/[slug] 用）。
 *
 * 行為：
 * - 只處理 slug 為 null/空 的列（已有 slug 的不動，可安全重跑＝冪等）
 * - slug 唯一性範圍＝「同一服務」（URL 是 /services/[serviceSlug]/faq/[faqSlug]）
 * - 用 lib/slug 的 slugify(question) + uniqueSlug 對「該服務既有 slug 集合」去重
 * - 逐筆 update，不刪除、不覆蓋任何既有資料
 *
 * 執行：pnpm exec tsx prisma/backfill-service-faq-slug.ts
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import { slugify, uniqueSlug } from '../lib/slug'

neonConfig.webSocketConstructor = ws

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const faqs = await prisma.serviceFaq.findMany({
    orderBy: { order: 'asc' },
    include: { section: { select: { serviceId: true } } },
  })

  // 每個 service 維護一份既有 slug 集合（同服務內唯一）
  const perService = new Map<number, Set<string>>()
  for (const f of faqs) {
    const sid = f.section.serviceId
    if (!perService.has(sid)) perService.set(sid, new Set())
    if (f.slug && f.slug.trim() !== '') perService.get(sid)!.add(f.slug)
  }

  let filled = 0
  for (const f of faqs) {
    if (f.slug && f.slug.trim() !== '') continue
    const sid = f.section.serviceId
    const set = perService.get(sid)!
    const slug = uniqueSlug(slugify(f.question), set)
    set.add(slug)
    await prisma.serviceFaq.update({ where: { id: f.id }, data: { slug } })
    filled++
    console.log(`  service#${sid}  faq#${f.id}  ${f.question.slice(0, 22)}  →  ${slug}`)
  }

  console.log(`\n完成：共 ${faqs.length} 筆，回填 ${filled} 筆，已有 slug ${faqs.length - filled} 筆。`)
}

main()
  .catch((e) => {
    console.error('回填失敗：', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
