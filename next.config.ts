import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
}

export default nextConfig
