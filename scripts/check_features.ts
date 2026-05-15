import { prisma } from '../lib/prisma'

async function main() {
  const service = await prisma.service.findUnique({
    where: { id: 4 },
    select: { id: true, slug: true, name: true, heroImage: true, cardImage: true },
  })
  console.log('=== Service 主欄位 ===')
  console.log(`id=${service?.id} slug=${service?.slug}`)
  console.log(`name=${service?.name}`)
  console.log(`heroImage=${service?.heroImage ?? '(null)'}`)
  console.log(`cardImage=${service?.cardImage ?? '(null)'}`)

  console.log('\n=== Hero section config ===')
  const hero = await prisma.serviceSection.findFirst({
    where: { serviceId: 4, type: 'hero' },
    select: { id: true, type: true, isVisible: true, config: true },
  })
  if (hero) {
    console.log(`section id=${hero.id} type=${hero.type} visible=${hero.isVisible}`)
    console.log('config =', JSON.stringify(hero.config, null, 2))
  } else {
    console.log('(no hero section)')
  }

  await prisma.$disconnect()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
