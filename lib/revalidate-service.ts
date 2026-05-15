import { revalidatePath } from 'next/cache'
import { prisma } from './prisma'

/**
 * 觸發前台與此 service 相關頁面立即重新生成。
 *
 * 前台 `/services/[slug]` 與 `/services` 都用 ISR `revalidate = 60`，預設要等 60 秒才看到改動。
 * 任何 admin 寫入動作（features / faqs / sections / before-afters / gallery / main fields / isActive）
 * 都應該在 commit 後呼叫此 helper，讓業主存檔後立刻看得到變化。
 *
 * revalidatePath 是 fire-and-forget：標記路徑為 stale，下次請求才會 regenerate。
 * 不會延遲 admin API response。
 */
export async function revalidateService(serviceId: number) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { slug: true },
  })
  if (service) {
    revalidatePath(`/services/${service.slug}`)
  }
  revalidatePath('/services')
  revalidatePath('/')
}
