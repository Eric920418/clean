import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { mockServices } from '@/lib/mock-data'

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-hairline bg-bg-soft">
      <div className="container-narrow grid grid-cols-1 gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="text-base font-semibold tracking-tight">
              invisible <span className="text-primary-deep">care</span>
            </span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink">六大服務</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            {mockServices.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-primary-deep">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink">聯絡資訊</h4>
          <ul className="mt-4 space-y-3 text-sm text-ink-soft">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-primary-deep" />
              <span>{siteConfig.contact.phone}</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-primary-deep" />
              <span>{siteConfig.contact.email}</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-primary-deep" />
              <span>{siteConfig.contact.serviceArea}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-primary-deep" />
              <span>{siteConfig.contact.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="container-narrow flex flex-col items-start gap-2 py-6 text-xs text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.</p>
          <p>本網站所有清洗前後對比圖均經客戶授權刊登</p>
        </div>
      </div>
    </footer>
  )
}
