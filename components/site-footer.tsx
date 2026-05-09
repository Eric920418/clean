import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, ShieldCheck, MessageCircle, PhoneCall } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { getActiveServices } from '@/lib/queries'

export async function SiteFooter() {
  // 拿真實服務列表；DB 不可用時回退空清單，footer 仍能顯示
  let services: { slug: string; name: string }[] = []
  try {
    services = await getActiveServices()
  } catch {
    services = []
  }

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
          <h4 className="text-sm font-semibold text-ink">服務項目</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            {services.map((s) => (
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
              <Phone className="mt-0.5 h-4 w-4 text-primary-deep shrink-0" />
              <a
                href={siteConfig.contact.phoneTel}
                className="hover:text-primary-deep transition"
              >
                {siteConfig.contact.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-primary-deep shrink-0" />
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="hover:text-primary-deep transition break-all"
              >
                {siteConfig.contact.email}
              </a>
            </li>

            {siteConfig.contact.lineId && (
              <li className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 h-4 w-4 text-primary-deep shrink-0" />
                <span>
                  LINE ID：
                  <span className="text-ink font-medium">{siteConfig.contact.lineId}</span>
                </span>
              </li>
            )}

            {(siteConfig.contact.lineFriendUrl || siteConfig.contact.lineCallUrl) && (
              <li className="flex flex-wrap gap-2 pt-1">
                {siteConfig.contact.lineFriendUrl && (
                  <a
                    href={siteConfig.contact.lineFriendUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#06C755] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    加 LINE 好友
                  </a>
                )}
                {siteConfig.contact.lineCallUrl && (
                  <a
                    href={siteConfig.contact.lineCallUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#06C755] px-3 py-1.5 text-xs font-medium text-[#06C755] hover:bg-[#06C755]/5 transition"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    LINE 通話
                  </a>
                )}
              </li>
            )}

            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-primary-deep shrink-0" />
              <span>{siteConfig.contact.serviceArea}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-primary-deep shrink-0" />
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
