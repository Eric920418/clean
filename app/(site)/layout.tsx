import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { FloatingCta } from '@/components/floating-cta'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
      <FloatingCta />
    </>
  )
}
