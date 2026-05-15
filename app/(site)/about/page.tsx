import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { getContentBlock, getSiteSettings, getWhyUsSections, getAllContentBlocks } from '@/lib/queries'
import type { WhyUsCard } from '@/lib/why-us'

export const metadata: Metadata = {
  title: '關於我們',
  description:
    'invisible care 是一群對「居家純淨度」有著偏執追求的職人。我們是「居家健康空間的修復師」。',
}

// CMS 內容隨時可由業主在後台修改，每 60 秒重新生成
export const revalidate = 60

export default async function AboutPage() {
  const [aboutBlock, settings, beliefSections, blocks] = await Promise.all([
    getContentBlock('about'),
    getSiteSettings(),
    getWhyUsSections({ location: 'about' }),
    getAllContentBlocks(),
  ])
  const phoneTel = settings.phoneTel || ''
  const heroBlock = blocks['hero-about'] ?? {}
  const ctaBlock = blocks['cta-about'] ?? {}
  const eyebrow = aboutBlock?.eyebrow || 'Our story'
  const title = aboutBlock?.title || '關於那些被遺忘的空間'
  const paragraphs = [
    aboutBlock?.paragraph1 || '我們常說「家是最好的避風港」，但如果避風港裡的空氣充滿塵蟎、水源帶著餘氯、家電裡藏著陳年黴菌，這個家，真的安全嗎？',
    aboutBlock?.paragraph2 || 'invisible care 整合了防霾通風、全戶濾水、深度清潔、家電維修等核心技術，致力於為每一位客戶提供「由內而外」的居家健康解決方案。',
    aboutBlock?.paragraph3 || '我們不只是清潔工，更是您居家的健康顧問，用職人精神與精準技術，為您守護家人的每一次呼吸與每一滴用水。',
  ].filter(Boolean)
  const image =
    aboutBlock?.image ||
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80'

  return (
    <>
      <section className="bg-medical-glow pt-8 pb-8 md:pt-12 md:pb-12">
        <div className="container-narrow grid grid-cols-1 items-end gap-10 md:grid-cols-2">
          <div>
            <span className="eyebrow">{heroBlock.eyebrow || 'About invisible care'}</span>
            <h1 className="mt-5 text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
              {heroBlock.titleLine1 || '看不見的守護，'}
              <br />
              <span className="text-primary-deep">{heroBlock.titleLine2 || '才是家最頂級的豪華'}</span>
            </h1>
          </div>
          <p className="text-base leading-relaxed text-ink-soft md:text-lg">
            {heroBlock.lead ||
              '真正的居家品質，不該只存在於裝潢的華麗，而應體現在每一次深呼吸、每一寸觸摸到的布料，以及每一口入喉的水中。我們是 居家健康空間的修復師。'}
          </p>
        </div>
      </section>

      <section className="section pt-10 md:pt-14">
        <div className="container-narrow grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src={image}
              alt="師傅施作中"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <SectionHeading eyebrow={eyebrow} title={title} />
            <div className="mt-6 space-y-4 text-base leading-loose text-ink-soft">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {beliefSections.map((section) => {
        const cards = (section.cards as unknown as WhyUsCard[]) ?? []
        return (
          <section key={section.id} className="bg-bg-soft py-6 md:py-10">
            <div className="container-narrow">
              <SectionHeading
                align="center"
                eyebrow={section.eyebrow ?? undefined}
                title={section.title}
                description={section.description ?? undefined}
              />
              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                {cards.map((card, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-hairline bg-white p-8"
                  >
                    <span className="font-display text-xs font-semibold tracking-[0.25em] text-primary-deep">
                      Belief {idx + 1}
                    </span>
                    <h3 className="mt-4 text-xl font-medium text-ink">{card.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      })}

      <section className="container-narrow py-16 md:py-24">
        <div className="rounded-2xl border border-hairline bg-gradient-to-br from-bg-tint to-white p-10 text-center md:p-16">
          <h2 className="text-3xl font-medium tracking-tight text-ink md:text-4xl">
            {ctaBlock.title || '您的家，值得被溫柔對待'}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            {ctaBlock.description || '讓專業的職人團隊，為您的愛家注入全新的生命力。'}
          </p>
          <a href={phoneTel} className="btn-primary mt-8">
            {ctaBlock.primaryCta || '立即來電預約'}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  )
}
