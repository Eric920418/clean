import type { Metadata } from 'next'
import { Noto_Sans_TC, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { getSiteSettings } from '@/lib/queries'
import { JsonLd } from '@/components/json-ld'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import './globals.css'

const noto = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function generateMetadata(): Promise<Metadata> {
  let settings: Record<string, string> = {}
  try {
    settings = await getSiteSettings()
  } catch {
    settings = {}
  }
  const siteName = settings.siteName || 'invisible care'
  const tagline = settings.tagline || '看不見的守護，才是家最頂級的豪華'
  const description =
    settings.description ||
    'invisible care 整合冷氣／洗衣機深度拆洗、水塔清洗、全戶濾水、防霾紗網與精緻居家清潔，服務全台主要城市。'
  // 業主應於後台 SiteSetting 設定 `ogImage`（建議 1200×630），未設定時退到 logo.jpg
  // 雖然 logo.jpg 不是標準 OG 尺寸，但比 404 強；社群預覽至少有東西可見
  const ogImage = settings.ogImage || `${baseUrl}/logo.jpg`
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION || settings.googleVerification

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${siteName} · ${tagline}`,
      template: `%s · ${siteName}`,
    },
    description,
    alternates: { canonical: '/' },
    openGraph: {
      title: `${siteName} · ${tagline}`,
      description,
      type: 'website',
      locale: 'zh_TW',
      siteName,
      url: baseUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteName} · ${tagline}`,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 取站台設定供 Organization JSON-LD 的 sameAs 使用（社群網址）；DB 不可用時退到空物件
  let settings: Record<string, string> = {}
  try {
    settings = await getSiteSettings()
  } catch {
    settings = {}
  }

  return (
    <html
      lang="zh-TW"
      suppressHydrationWarning
      className={`${noto.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased">
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={organizationJsonLd({ sameAs: [settings.fbUrl, settings.igUrl] })} />
        {children}
        <Toaster position="top-center" richColors closeButton />
        <Analytics />
        <SpeedInsights />
      </body>
      <GoogleAnalytics gaId="G-7DSMSX9BXD" />
    </html>
  )
}
