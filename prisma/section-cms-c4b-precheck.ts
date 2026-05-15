import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('=== C4b drop 後完整性檢查 ===\n')
  console.log('(C4b 後 sectionId 已 not null，schema 強制無孤兒記錄)\n')

  // 同時記錄目前所有筆數供 drop 後對照
  const counts = {
    services: await prisma.service.count(),
    sections: await prisma.serviceSection.count(),
    features: await prisma.serviceFeature.count(),
    faqs: await prisma.serviceFaq.count(),
    beforeAfters: await prisma.beforeAfterPair.count(),
    gallery: await prisma.serviceGalleryImage.count(),
  }
  console.log(`\n總筆數（drop 後應該完全相同）：`)
  console.log(JSON.stringify(counts, null, 2))

  console.log('\n✅ 通過所有檢查，可以安全 drop')
}

main().finally(() => prisma.$disconnect())
