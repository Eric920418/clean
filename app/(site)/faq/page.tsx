import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { Faq } from '@/components/faq'
import { getActiveServices } from '@/lib/queries'

export const revalidate = 60

export const metadata: Metadata = {
  title: '常見問題',
  description: 'invisible care 居家服務常見問題，包含冷氣、洗衣機、水塔等服務的細節說明。',
}

const generalFaqs = [
  {
    id: 1001,
    question: '預約後多久能安排施作？',
    answer: '一般情況下 1–3 天內可安排，旺季（夏季冷氣、年末居家清潔）建議提前 1 週預約。',
  },
  {
    id: 1002,
    question: '報價會不會中途加價？',
    answer:
      '不會。我們堅持透明報價：到府評估後給出總價，書面確認再施作。若現場發現額外狀況，我們會先停下來與您溝通，確認後才繼續，絕不擅自加價。',
  },
  {
    id: 1003,
    question: '使用的洗劑對小孩、寵物安全嗎？',
    answer:
      '我們優選歐盟認證、生物可分解的環保洗劑，無刺鼻氣味、無毒性殘留，敏感肌、嬰幼兒、寵物環境皆可安心。',
  },
  {
    id: 1004,
    question: '完工後若有問題怎麼辦？',
    answer:
      '所有服務皆提供 30 天無憂保固，若清洗後出現異常運轉、未清潔到位等問題，我們將免費回訪處理。',
  },
]

export default async function FaqPage() {
  const services = await getActiveServices()
  return (
    <>
      <section className="bg-medical-glow pt-14 pb-8 md:pt-20 md:pb-12">
        <div className="container-narrow max-w-3xl">
          <SectionHeading
            eyebrow="FAQ"
            title="常見問題"
            description="找不到答案？歡迎直接聯繫我們。"
          />
        </div>
      </section>

      <section className="section pt-8 md:pt-10">
        <div className="container-narrow max-w-3xl space-y-12">
          <div>
            <h2 className="text-xl font-medium text-ink">一般服務</h2>
            <div className="mt-6">
              <Faq items={generalFaqs} />
            </div>
          </div>

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
            <p className="text-base text-ink-soft">還有其他疑問？</p>
            <Link href="/contact" className="btn-primary mt-4">
              聯絡我們
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
