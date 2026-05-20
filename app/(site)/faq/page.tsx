import type { Metadata } from 'next'
import { MessageCircle, PhoneCall } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { Faq } from '@/components/faq'
import { getActiveServices, getGeneralFaqs, getContentBlock, getSiteSettings } from '@/lib/queries'

export const revalidate = 60

export const metadata: Metadata = {
  title: '常見問題',
  description: 'invisible care 居家服務常見問題，包含冷氣、洗衣機、水塔等服務的細節說明。',
}

export default async function FaqPage() {
  const [services, generalFaqs, heroBlock, settings] = await Promise.all([
    getActiveServices(),
    getGeneralFaqs(),
    getContentBlock('hero-faq').catch(() => null),
    getSiteSettings(),
  ])
  const hero = heroBlock ?? {}
  const lineFriendUrl = settings.lineFriendUrl || ''
  const lineCallUrl = settings.lineCallUrl || ''
  return (
    <>
      <section className="bg-medical-glow pt-8 pb-8 md:pt-12 md:pb-12">
        <div className="container-narrow max-w-3xl">
          <SectionHeading
            eyebrow={hero.eyebrow || "FAQ"}
            title={hero.title || "常見問題"}
            description={hero.description || "找不到答案？歡迎直接聯繫我們。"}
          />
        </div>
      </section>

      <section className="section pt-8 md:pt-10">
        <div className="container-narrow max-w-3xl space-y-12">
          {generalFaqs.length > 0 && (
            <div>
              <h2 className="text-xl font-medium text-ink">
                {hero.generalHeading || "一般服務"}
              </h2>
              <div className="mt-6">
                <Faq items={generalFaqs} />
              </div>
            </div>
          )}

          {services
            .filter((s) => (s.faqs?.length ?? 0) > 0)
            .map((s) => (
              <div key={s.id}>
                <h2 className="text-xl font-medium text-ink">{s.name}</h2>
                <div className="mt-6">
                  <Faq items={s.faqs ?? []} />
                </div>
              </div>
            ))}

          <div className="rounded-xl border border-hairline bg-bg-soft p-8 text-center">
            <p className="text-base text-ink-soft">
              {hero.contactBoxText || "還有其他疑問？"}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {lineFriendUrl && (
                <a
                  href={lineFriendUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-[#06C755] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  加 LINE 預約
                </a>
              )}
              {lineCallUrl && (
                <a
                  href={lineCallUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-[#06C755] px-4 py-2 text-sm font-medium text-[#06C755] hover:bg-[#06C755]/10 transition"
                >
                  <PhoneCall className="h-4 w-4" />
                  LINE 通話
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
