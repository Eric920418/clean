import type { MetadataRoute } from 'next'
import { getActiveServices } from '@/lib/queries'

export const revalidate = 300 // sitemap 5 分鐘 ISR 即可

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const now = new Date()

  const staticRoutes = ['', '/services', '/works', '/about', '/faq', '/contact'].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.7,
  }))

  // 若 DB 不可用，回退僅有靜態路由（避免 build 時 fail）
  let serviceRoutes: MetadataRoute.Sitemap = []
  try {
    const services = await getActiveServices()
    serviceRoutes = services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: s.updatedAt ?? now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  } catch {
    // DB 不可用，sitemap 仍輸出靜態路由
  }

  return [...staticRoutes, ...serviceRoutes]
}
