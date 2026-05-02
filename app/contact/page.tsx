import type { Metadata } from 'next'
import { Phone, Mail, Clock, MapPin } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { ContactForm } from '@/components/contact-form'
import { mockServices } from '@/lib/mock-data'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: '預約諮詢',
  description:
    '填寫預約諮詢表單，30 分鐘內專人聯繫您；或撥打專線、加 LINE 預約 invisible care 居家服務。',
}

export default function ContactPage() {
  return (
    <>
      <section className="bg-medical-glow pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container-narrow max-w-3xl">
          <SectionHeading
            eyebrow="Contact"
            title="預約諮詢"
            description="填寫下方表單，30 分鐘內專人聯繫；或直接撥打專線、加入 LINE，我們將盡快為您服務。"
          />
        </div>
      </section>

      <section className="section pt-12 md:pt-16">
        <div className="container-narrow grid grid-cols-1 gap-10 lg:grid-cols-3">
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-hairline bg-bg-soft p-7">
              <h3 className="text-base font-medium text-ink">直接聯絡</h3>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-primary-deep" />
                  <div>
                    <div className="text-ink-muted">服務專線</div>
                    <a
                      href={`tel:${siteConfig.contact.phone}`}
                      className="font-medium text-ink hover:text-primary-deep"
                    >
                      {siteConfig.contact.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary-deep" />
                  <div>
                    <div className="text-ink-muted">電子郵件</div>
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="font-medium text-ink hover:text-primary-deep"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-primary-deep" />
                  <div>
                    <div className="text-ink-muted">服務時間</div>
                    <span className="font-medium text-ink">{siteConfig.contact.hours}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary-deep" />
                  <div>
                    <div className="text-ink-muted">服務範圍</div>
                    <span className="font-medium text-ink">{siteConfig.contact.serviceArea}</span>
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-2">
            <ContactForm services={mockServices.map((s) => ({ id: s.id, name: s.name }))} />
          </div>
        </div>
      </section>
    </>
  )
}
