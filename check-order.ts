import 'dotenv/config'
import { prisma } from './lib/prisma'

async function main() {
  const list = await prisma.service.findMany({
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
    select: { id: true, slug: true, name: true, order: true },
  })
  console.log('--- services (id, order, slug, name) ---')
  for (const s of list) {
    console.log(`#${s.id}  order=${s.order}  ${s.slug}  ${s.name}`)
  }
  await prisma.$disconnect()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
