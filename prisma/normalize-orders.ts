import 'dotenv/config'
import { prisma } from '../lib/prisma'

/**
 * 一次性 normalize：把所有有 order 欄位的表重編為 0..n-1（每個 group 內）。
 * 修復「箭頭排序失效」的根因：DB 內多筆 order 值碰撞時，swap 兩個相同 order 等於沒動。
 *
 * 排序準則：先 order asc，相同 order 用 id asc（保留新增順序）。
 */
async function main() {
  const tx = await prisma.$transaction(
    async (db) => {
    const log: string[] = []

    // 全表型（無 group）
    const services = await db.service.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] })
    for (let i = 0; i < services.length; i++) {
      if (services[i].order !== i) {
        await db.service.update({ where: { id: services[i].id }, data: { order: i } })
      }
    }
    log.push(`Service: ${services.length} rows`)

    const generalFaqs = await db.generalFaq.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] })
    for (let i = 0; i < generalFaqs.length; i++) {
      if (generalFaqs[i].order !== i) {
        await db.generalFaq.update({ where: { id: generalFaqs[i].id }, data: { order: i } })
      }
    }
    log.push(`GeneralFaq: ${generalFaqs.length} rows`)

    const processSteps = await db.processStep.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    })
    for (let i = 0; i < processSteps.length; i++) {
      if (processSteps[i].order !== i) {
        await db.processStep.update({ where: { id: processSteps[i].id }, data: { order: i } })
      }
    }
    log.push(`ProcessStep: ${processSteps.length} rows`)

    const whyUs = await db.whyUsSection.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] })
    for (let i = 0; i < whyUs.length; i++) {
      if (whyUs[i].order !== i) {
        await db.whyUsSection.update({ where: { id: whyUs[i].id }, data: { order: i } })
      }
    }
    log.push(`WhyUsSection: ${whyUs.length} rows`)

    // group by serviceId
    const serviceIds = (await db.service.findMany({ select: { id: true } })).map((s) => s.id)
    let secCount = 0
    for (const sid of serviceIds) {
      const rows = await db.serviceSection.findMany({
        where: { serviceId: sid },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      })
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].order !== i) {
          await db.serviceSection.update({ where: { id: rows[i].id }, data: { order: i } })
        }
        secCount++
      }
    }
    log.push(`ServiceSection: ${secCount} rows (grouped by serviceId)`)

    // group by sectionId
    const sectionIds = (await db.serviceSection.findMany({ select: { id: true } })).map(
      (s) => s.id,
    )
    let baCount = 0
    let featCount = 0
    let faqCount = 0
    let galCount = 0
    for (const sid of sectionIds) {
      const ba = await db.beforeAfterPair.findMany({
        where: { sectionId: sid },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      })
      for (let i = 0; i < ba.length; i++) {
        if (ba[i].order !== i) {
          await db.beforeAfterPair.update({ where: { id: ba[i].id }, data: { order: i } })
        }
        baCount++
      }
      const feat = await db.serviceFeature.findMany({
        where: { sectionId: sid },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      })
      for (let i = 0; i < feat.length; i++) {
        if (feat[i].order !== i) {
          await db.serviceFeature.update({ where: { id: feat[i].id }, data: { order: i } })
        }
        featCount++
      }
      const faq = await db.serviceFaq.findMany({
        where: { sectionId: sid },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      })
      for (let i = 0; i < faq.length; i++) {
        if (faq[i].order !== i) {
          await db.serviceFaq.update({ where: { id: faq[i].id }, data: { order: i } })
        }
        faqCount++
      }
      const gal = await db.serviceGalleryImage.findMany({
        where: { sectionId: sid },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      })
      for (let i = 0; i < gal.length; i++) {
        if (gal[i].order !== i) {
          await db.serviceGalleryImage.update({ where: { id: gal[i].id }, data: { order: i } })
        }
        galCount++
      }
    }
    log.push(`BeforeAfterPair: ${baCount} rows (grouped by sectionId)`)
    log.push(`ServiceFeature: ${featCount} rows (grouped by sectionId)`)
    log.push(`ServiceFaq: ${faqCount} rows (grouped by sectionId)`)
    log.push(`ServiceGalleryImage: ${galCount} rows (grouped by sectionId)`)

      return log
    },
    { timeout: 60_000, maxWait: 5_000 },
  )

  console.log('--- normalize done ---')
  for (const l of tx) console.log(l)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
