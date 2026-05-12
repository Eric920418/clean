import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { FloatingCta } from '@/components/floating-cta'
import { getSiteSettings } from '@/lib/queries'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // 全站讀 SiteSetting（電話、Line、Email 等業主後台可改）
  let settings: Record<string, string> = {}
  try {
    settings = await getSiteSettings()
  } catch {
    settings = {}
  }

  return (
    <>
      <SiteNav settings={settings} />
      <main>{children}</main>
      <SiteFooter settings={settings} />
      <FloatingCta settings={settings} />
    </>
  )
}
