import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { FloatingCta } from '@/components/floating-cta'
import { LightboxProvider } from '@/components/lightbox-provider'
import { getSiteSettings, getContentBlock } from '@/lib/queries'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // 全站讀 SiteSetting + 導覽列文案 ContentBlock
  let settings: Record<string, string> = {}
  let navigation: Record<string, string> = {}
  try {
    settings = await getSiteSettings()
  } catch {
    settings = {}
  }
  try {
    navigation = (await getContentBlock('navigation')) ?? {}
  } catch {
    navigation = {}
  }

  return (
    <LightboxProvider>
      <SiteNav settings={settings} navigation={navigation} />
      <main>{children}</main>
      <SiteFooter settings={settings} navigation={navigation} />
      <FloatingCta settings={settings} />
    </LightboxProvider>
  )
}
