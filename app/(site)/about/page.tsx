import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: '關於我們',
  description:
    'invisible care 是一群對「居家純淨度」有著偏執追求的職人。我們是「居家健康空間的修復師」。',
}

export default function AboutPage() {
  return (
    <>
      <section className="bg-medical-glow pt-14 pb-8 md:pt-20 md:pb-12">
        <div className="container-narrow grid grid-cols-1 items-end gap-10 md:grid-cols-2">
          <div>
            <span className="eyebrow">About invisible care</span>
            <h1 className="mt-5 text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
              看不見的守護，<br />
              <span className="text-primary-deep">才是家最頂級的豪華</span>
            </h1>
          </div>
          <p className="text-base leading-relaxed text-ink-soft md:text-lg">
            真正的居家品質，不該只存在於裝潢的華麗，而應體現在每一次深呼吸、每一寸觸摸到的布料，以及每一口入喉的水中。我們是
            <strong className="font-medium text-ink"> 居家健康空間的修復師</strong>。
          </p>
        </div>
      </section>

      <section className="section pt-10 md:pt-14">
        <div className="container-narrow grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80"
              alt="師傅施作中"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionHeading eyebrow="Our story" title="關於那些被遺忘的空間" />
            <div className="mt-6 space-y-4 text-base leading-loose text-ink-soft">
              <p>
                我們常說「家是最好的避風港」，但如果避風港裡的空氣充滿塵蟎、水源帶著餘氯、家電裡藏著陳年黴菌，這個家，真的安全嗎？
              </p>
              <p>
                invisible care 整合了防霾通風、全戶濾水、深度清潔、家電維修等核心技術，致力於為每一位客戶提供「由內而外」的居家健康解決方案。
              </p>
              <p>
                我們不只是清潔工，更是您居家的健康顧問，用職人精神與精準技術，為您守護家人的每一次呼吸與每一滴用水。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-soft py-16 md:py-24">
        <div className="container-narrow">
          <SectionHeading
            align="center"
            eyebrow="Our beliefs"
            title="三項職人信仰"
            description="我們不追求低價競爭，追求的是「品質的極致」與「客戶的安心」。"
          />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {siteConfig.promises.map((p, idx) => (
              <div
                key={p.title}
                className="rounded-xl border border-hairline bg-white p-8"
              >
                <span className="font-display text-xs font-semibold tracking-[0.25em] text-primary-deep">
                  Belief {idx + 1}
                </span>
                <h3 className="mt-4 text-xl font-medium text-ink">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-narrow py-16 md:py-24">
        <div className="rounded-2xl border border-hairline bg-gradient-to-br from-bg-tint to-white p-10 text-center md:p-16">
          <h2 className="text-3xl font-medium tracking-tight text-ink md:text-4xl">
            您的家，值得被溫柔對待
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            讓專業的職人團隊，為您的愛家注入全新的生命力。
          </p>
          <a href={siteConfig.contact.phoneTel} className="btn-primary mt-8">
            立即來電預約
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  )
}
