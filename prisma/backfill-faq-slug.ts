/**
 * 一次性回填：把現有 GeneralFaq 補上 slug（SEO 獨立網址 /faq/[slug] 用）。
 *
 * 行為：
 * - 只處理 slug 為 null/空 的列（已有 slug 的不動，可安全重跑＝冪等）
 * - 用 lib/slug 的 slugify(question) + uniqueSlug 對既有 slug 集合去重
 * - 逐筆 update，不刪除、不覆蓋任何既有資料
 *
 * 執行：pnpm exec tsx prisma/backfill-faq-slug.ts
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
  const faqs = await prisma.generalFaq.findMany({ orderBy: { order: 'asc' } })
  const existing = new Set(
    faqs.map((f) => f.slug).filter((s): s is string => !!s && s.trim() !== ''),
  )

  let filled = 0
  for (const f of faqs) {
    if (f.slug && f.slug.trim() !== '') continue
    const slug = uniqueSlug(slugify(f.question), existing)
    existing.add(slug)
    await prisma.generalFaq.update({ where: { id: f.id }, data: { slug } })
    filled++
    console.log(`  #${f.id}  ${f.question.slice(0, 24)}  →  ${slug}`)
  }

  console.log(`\n完成：共 ${faqs.length} 筆，回填 ${filled} 筆，已有 slug ${faqs.length - filled} 筆。`)
}

main()
  .catch((e) => {
    console.error('回填失敗：', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
