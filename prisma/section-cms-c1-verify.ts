import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const [services, sections, features, faqs, beforeAfters, gallery] = await Promise.all([
    prisma.service.count(),
    prisma.serviceSection.count(),
    prisma.serviceFeature.count(),
    prisma.serviceFaq.count(),
    prisma.beforeAfterPair.count(),
    prisma.serviceGalleryImage.count(),
  ])
  console.log('=== 全表 count ===')
  console.log(JSON.stringify({ services, sections, features, faqs, beforeAfters, gallery }, null, 2))

  const grouped = await prisma.serviceSection.groupBy({
    by: ['serviceId'],
    _count: { _all: true },
  })
  console.log('\n每個 service 的 section 數：')
  grouped.forEach((g) => console.log(`  service ${g.serviceId}: ${g._count._all} sections`))

  const wrong = grouped.filter((g) => g._count._all !== 8)
  if (wrong.length) {
    console.error(`❌ ${wrong.length} 個 service section 數不是 8`)
    process.exit(1)
  } else {
    console.log('\n✅ 全部 service 都有 8 個 section')
  }
}

main().finally(() => prisma.$disconnect())
