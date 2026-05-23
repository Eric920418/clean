import type { MetadataRoute } from 'next'
import { getActiveServices, getFeaturedBeforeAfters } from '@/lib/queries'

export const revalidate = 300 // sitemap 5 分鐘 ISR 即可

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const now = new Date()

  // priority 階層：首頁 1.0 > services 列表 0.9 > service detail / works 0.8 > 其他 0.6
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/works`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  // 若 DB 不可用，回退僅有靜態路由（避免 build 時 fail）
  let serviceRoutes: MetadataRoute.Sitemap = []
  let worksImageEntry: MetadataRoute.Sitemap = []
  try {
    const [services, featured] = await Promise.all([
      getActiveServices(),
      getFeaturedBeforeAfters().catch(() => []),
    ])

    serviceRoutes = services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: s.updatedAt ?? now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      // 每個 service 把 heroImage 帶進 image sitemap，讓 Google Image Search 收錄
      ...(s.heroImage ? { images: [s.heroImage] } : {}),
    }))

    // 作品頁帶上前 10 張 featured before-after 圖（避免 sitemap 太肥）
    if (featured.length > 0) {
      worksImageEntry = [
        {
          url: `${base}/works`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
          images: featured.slice(0, 10).flatMap((p) => [p.beforeUrl, p.afterUrl]),
        },
      ]
      // 移除原本的 /works 靜態項，避免重複
      staticRoutes.splice(
        staticRoutes.findIndex((r) => r.url === `${base}/works`),
        1,
      )
    }
  } catch {
    // DB 不可用，sitemap 仍輸出靜態路由
  }

  return [...staticRoutes, ...worksImageEntry, ...serviceRoutes]
}
