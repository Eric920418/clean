import { revalidatePath } from 'next/cache'

/**
 * 觸發前台與此 service 相關頁面立即重新生成。
 *
 * 前台使用一小時 ISR；服務資料也用於頁尾、FAQ、作品與 sitemap。
 * 任何 admin 寫入動作（features / faqs / sections / before-afters / gallery / main fields / isActive）
 * 都應該在 commit 後呼叫此 helper，讓業主存檔後立刻看得到變化。
 *
 * revalidatePath 是 fire-and-forget：標記路徑為 stale，下次請求才會 regenerate。
 * 不會延遲 admin API response。
 */
export async function revalidateService(serviceId: number) {
  // 保留既有呼叫介面；全站失效也涵蓋改名／刪除前的網址，無需再查 DB。
  void serviceId
  revalidatePublicSite()
}

export function revalidatePublicSite() {
  revalidatePath('/', 'layout')
  revalidatePath('/sitemap.xml')
}
