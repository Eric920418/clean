import 'dotenv/config'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

/**
 * 一次性 backfill：把純文字欄位包成 HTML <p>，準備供 RichText 渲染。
 * Idempotent — 已是 `<` 開頭就跳過、可安全重跑。
 *
 * 涵蓋 8 個富文本欄位（與 plan 對齊）：
 *   1. Service.longDesc
 *   2. ServiceFaq.answer
 *   3. GeneralFaq.answer
 *   4. Testimonial.content
 *   5-8. ServiceSection.config.{paragraph1,paragraph2,paragraph3,body}
 */

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
  // idempotent guard
  if (trimmed.startsWith('<')) return null
  return trimmed
    .split(/\n+/)
    .filter((line) => line.trim() !== '')
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('')
}

const RICH_TEXT_CONFIG_KEYS = ['paragraph1', 'paragraph2', 'paragraph3', 'body'] as const

async function main() {
  let serviceCount = 0
  for (const s of await prisma.service.findMany()) {
    const html = toHtml(s.longDesc)
    if (html) {
      await prisma.service.update({ where: { id: s.id }, data: { longDesc: html } })
      serviceCount++
    }
  }
  console.log(`Service.longDesc: ${serviceCount}`)

  let serviceFaqCount = 0
  for (const f of await prisma.serviceFaq.findMany()) {
    const html = toHtml(f.answer)
    if (html) {
      await prisma.serviceFaq.update({ where: { id: f.id }, data: { answer: html } })
      serviceFaqCount++
    }
  }
  console.log(`ServiceFaq.answer: ${serviceFaqCount}`)

  let generalFaqCount = 0
  for (const f of await prisma.generalFaq.findMany()) {
    const html = toHtml(f.answer)
    if (html) {
      await prisma.generalFaq.update({ where: { id: f.id }, data: { answer: html } })
      generalFaqCount++
    }
  }
  console.log(`GeneralFaq.answer: ${generalFaqCount}`)

  let testimonialCount = 0
  for (const t of await prisma.testimonial.findMany()) {
    const html = toHtml(t.content)
    if (html) {
      await prisma.testimonial.update({ where: { id: t.id }, data: { content: html } })
      testimonialCount++
    }
  }
  console.log(`Testimonial.content: ${testimonialCount}`)

  let sectionCount = 0
  for (const sec of await prisma.serviceSection.findMany({
    where: { type: { in: ['intro', 'text_block'] } },
  })) {
    const cfg = (sec.config ?? {}) as Record<string, unknown>
    let dirty = false
    for (const key of RICH_TEXT_CONFIG_KEYS) {
      const v = cfg[key]
      if (typeof v !== 'string') continue
      const html = toHtml(v)
      if (html) {
        cfg[key] = html
        dirty = true
      }
    }
    if (dirty) {
      await prisma.serviceSection.update({
        where: { id: sec.id },
        data: { config: cfg as Prisma.InputJsonValue },
      })
      sectionCount++
    }
  }
  console.log(`ServiceSection.config (intro/text_block): ${sectionCount} sections updated`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
