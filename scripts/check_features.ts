import { prisma } from '../lib/prisma'

async function main() {
  const services = await prisma.service.findMany({
    select: { id: true, slug: true, name: true },
    orderBy: { id: 'asc' },
  })
  console.log('--- All services ---')
  for (const s of services) {
    const count = await prisma.serviceFeature.count({
      where: { section: { serviceId: s.id } },
    })
    console.log(`service id=${s.id} slug=${s.slug} name="${s.name}" total_features=${count}`)
  }

  console.log('\n--- service id=4 sections detail ---')
  const sections = await prisma.serviceSection.findMany({
    where: { serviceId: 4 },
    include: { features: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  })
  for (const s of sections) {
    console.log(`section id=${s.id} type=${s.type} order=${s.order} visible=${s.isVisible} features=${s.features.length}`)
    for (const f of s.features) {
      console.log(`   - [${f.id}] order=${f.order} text="${f.text.slice(0, 50)}"`)
    }
  }

  console.log('\n--- ALL features across DB (any service) ---')
  const all = await prisma.serviceFeature.findMany({
    include: { section: { select: { id: true, type: true, serviceId: true } } },
    orderBy: { id: 'asc' },
  })
  for (const f of all) {
    console.log(`feature id=${f.id} sectionId=${f.sectionId} (type=${f.section.type}, serviceId=${f.section.serviceId}) text="${f.text.slice(0, 40)}"`)
  }
  await prisma.$disconnect()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
