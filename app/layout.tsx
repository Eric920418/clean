import type { Metadata } from 'next'
import { Noto_Sans_TC, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getSiteSettings } from '@/lib/queries'
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
  const description = settings.description || ''
  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${siteName} · ${tagline}`,
      template: `%s · ${siteName}`,
    },
    description,
    openGraph: {
      title: `${siteName} · ${tagline}`,
      description,
      type: 'website',
      locale: 'zh_TW',
    },
    robots: { index: true, follow: true },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-TW"
      suppressHydrationWarning
      className={`${noto.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors closeButton />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
