import 'dotenv/config'
import { prisma } from './lib/prisma'

async function main() {
  const rows: any = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns
    WHERE table_name='BookingInquiry'
    ORDER BY ordinal_position
  `)
  console.log('--- BookingInquiry columns ---')
  console.table(rows)
  const data: any = await prisma.$queryRawUnsafe(
    `SELECT id, "serviceIds" FROM "BookingInquiry" WHERE "serviceIds" IS NOT NULL`,
  )
  console.log('--- non-null serviceIds rows ---')
  console.log(JSON.stringify(data, null, 2))
  await prisma.$disconnect()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
