import { prisma } from '../lib/prisma'

async function main() {
  const sections = await prisma.serviceSection.findMany({
    where: { serviceId: 4 },
    include: { features: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  })
  console.log(`=== service 4 sections + features (count = ${sections.length}) ===`)
  for (const s of sections) {
    console.log(`\nsection id=${s.id} type=${s.type} order=${s.order} visible=${s.isVisible} features=${s.features.length}`)
    for (const f of s.features) {
      console.log(`   - [${f.id}] order=${f.order} text="${f.text.slice(0, 60)}"`)
    }
  }
  await prisma.$disconnect()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
