import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@neondatabase/serverless', 'ws', '@prisma/adapter-neon'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // SEO：www.needfix.com.tw 永久 308 轉向 apex needfix.com.tw
  // 避免 duplicate content、Google 索引權重被稀釋
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.needfix.com.tw' }],
        destination: 'https://needfix.com.tw/:path*',
        permanent: true,
      },
    ]
  },

  // 安全 headers — 技術 SEO「信任分」項目，Google 會把這些當品質訊號
  // 不加 CSP（會被 Vercel Analytics / CKEditor / R2 image 誤殺，後續另開）
  async headers() {
    const securityHeaders = [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
    ]
    return [
      {
        // 套用到所有路由（含 admin），但排除 _next 靜態資源以免影響 CDN cache
        source: '/((?!_next/static|_next/image).*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
