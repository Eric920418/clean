import type { MetadataRoute } from 'next'
import { mockServices } from '@/lib/mock-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const now = new Date()

  const staticRoutes = ['', '/services', '/works', '/about', '/faq', '/contact'].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.7,
  }))

  const serviceRoutes = mockServices.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...serviceRoutes]
}
