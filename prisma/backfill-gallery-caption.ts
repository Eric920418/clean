import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  const rows = await prisma.serviceGalleryImage.findMany({
    where: { caption: null, alt: { not: null } },
  })
  for (const r of rows) {
    await prisma.serviceGalleryImage.update({
      where: { id: r.id },
      data: { caption: r.alt },
    })
  }
  console.log(`backfilled ${rows.length} rows`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
