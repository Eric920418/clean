import type { Metadata } from 'next'
import { Phone, Mail, Clock, MapPin, MessageCircle, PhoneCall } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { ContactForm } from '@/components/contact-form'
import { getSiteSettings, getContentBlock } from '@/lib/queries'
import { JsonLd } from '@/components/json-ld'
import { breadcrumbJsonLd, contactPageJsonLd } from '@/lib/seo'

export const revalidate = 60

export const metadata: Metadata = {
  title: '預約諮詢',
  description:
    '填寫預約諮詢表單，30 分鐘內專人聯繫您；或撥打專線、加 LINE 預約 invisible care 居家服務。',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage() {
  const [settings, heroBlock] = await Promise.all([
    getSiteSettings().catch(() => ({}) as Record<string, string>),
    getContentBlock('hero-contact').catch(() => null),
  ])
  const hero = heroBlock ?? {}
  const phone = settings.phone || ''
  const phoneTel = settings.phoneTel || ''
  const email = settings.email || ''
  const lineId = settings.lineId || ''
  const lineFriendUrl = settings.lineFriendUrl || ''
  const lineCallUrl = settings.lineCallUrl || ''
  const hours = settings.hours || ''
  const serviceArea = settings.serviceArea || ''
  const breadcrumb = breadcrumbJsonLd([
    { name: '首頁', path: '/' },
    { name: '預約諮詢', path: '/contact' },
  ])
  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={contactPageJsonLd()} />
      <section className="bg-medical-glow pt-8 pb-8 md:pt-12 md:pb-12">
        <div className="container-narrow max-w-3xl">
          <SectionHeading
            eyebrow={hero.eyebrow || "Contact"}
            title={hero.title || "預約諮詢"}
            description={
              hero.description ||
              "填寫下方表單，30 分鐘內專人聯繫；或直接撥打專線、加入 LINE，我們將盡快為您服務。"
            }
          />
        </div>
      </section>

      <section className="section pt-8 md:pt-10">
        <div className="container-narrow grid grid-cols-1 gap-10 lg:grid-cols-3">
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-hairline bg-bg-soft p-5">
              <h3 className="text-base font-medium text-ink">直接聯絡</h3>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-primary-deep" />
                  <div>
                    <div className="text-ink-muted">服務專線（點擊來電）</div>
                    <a
                      href={phoneTel}
                      className="font-medium text-ink hover:text-primary-deep"
                    >
                      {phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary-deep" />
                  <div>
                    <div className="text-ink-muted">電子郵件</div>
                    <a
                      href={`mailto:${email}`}
                      className="font-medium text-ink hover:text-primary-deep break-all"
                    >
                      {email}
                    </a>
                  </div>
                </li>

                {lineId && (
                  <li className="flex items-start gap-3">
                    <MessageCircle className="mt-0.5 h-4 w-4 text-primary-deep" />
                    <div>
                      <div className="text-ink-muted">LINE 好友 ID</div>
                      <span className="font-medium text-ink">{lineId}</span>
                    </div>
                  </li>
                )}

                {(lineFriendUrl || lineCallUrl) && (
                  <li className="pt-2 space-y-2">
                    {lineFriendUrl && (
                      <a
                        href={lineFriendUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-md bg-[#06C755] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition w-full"
                      >
                        <MessageCircle className="h-4 w-4" />加 LINE 好友
                      </a>
                    )}
                    {lineCallUrl && (
                      <a
                        href={lineCallUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-md border border-[#06C755] px-4 py-2 text-sm font-medium text-[#06C755] hover:bg-[#06C755]/5 transition w-full"
                      >
                        <PhoneCall className="h-4 w-4" />
                        LINE 通話
                      </a>
                    )}
                  </li>
                )}

                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-primary-deep" />
                  <div>
                    <div className="text-ink-muted">服務時間</div>
                    <span className="font-medium text-ink">{hours}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary-deep" />
                  <div>
                    <div className="text-ink-muted">服務範圍</div>
                    <span className="font-medium text-ink">{serviceArea}</span>
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
