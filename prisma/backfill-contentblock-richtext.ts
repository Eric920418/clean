import 'dotenv/config'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

/**
 * 一次性 backfill：把 ContentBlock.payload 內所有「原 textarea」欄位的純文字包成 <p>。
 * Idempotent — 已 `<` 開頭就跳過、可安全重跑。
 *
 * 對應 app/admin/content/page.tsx 的 BLOCK_DEFS 內 type: 'richtext' 的所有欄位。
 * 結構變動時請同步更新此 map。
 */
const RICH_TEXT_KEYS_BY_BLOCK: Record<string, string[]> = {
  'hero-home': ['description'],
  'section-services-home': ['description'],
  'section-works-home': ['description'],
  'cta-home': ['description'],
  'hero-about': ['lead'],
  about: ['paragraph1', 'paragraph2', 'paragraph3'],
  'cta-about': ['description'],
  'hero-contact': ['description'],
  'hero-faq': ['description'],
  'hero-services': ['description'],
  'hero-works': ['description'],
  navigation: ['footerLegalNote'],
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toHtml(plain: string | null | undefined): string | null {
  if (typeof plain !== 'string') return null
  const trimmed = plain.trim()
  if (trimmed === '') return null
  if (trimmed.startsWith('<')) return null // 已是 HTML
  return trimmed
    .split(/\n+/)
    .filter((line) => line.trim() !== '')
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('')
}

async function main() {
  let totalBlocks = 0
  let totalFields = 0
  for (const [key, fields] of Object.entries(RICH_TEXT_KEYS_BY_BLOCK)) {
    const block = await prisma.contentBlock.findUnique({ where: { key } })
    if (!block) continue
    const payload = { ...((block.payload as Record<string, unknown>) ?? {}) }
    let dirty = false
    for (const f of fields) {
      const v = payload[f]
      if (typeof v !== 'string') continue
      const html = toHtml(v)
      if (html) {
        payload[f] = html
        dirty = true
        totalFields++
      }
    }
    if (dirty) {
      await prisma.contentBlock.update({
        where: { key },
        data: { payload: payload as Prisma.InputJsonValue },
      })
      totalBlocks++
      console.log(`  ✓ ${key}`)
    }
  }
  console.log(`done: ${totalBlocks} blocks, ${totalFields} fields backfilled`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
