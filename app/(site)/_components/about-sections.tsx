import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { PageSection } from '@prisma/client'
import { SectionHeading } from '@/components/section-heading'
import { RichText } from '@/components/rich-text'
import type { WhyUsCard } from '@/lib/why-us'
import { DynamicSection } from './page-custom-sections'

export type AboutSectionsData = {
  blocks: Record<string, Record<string, string>>
  beliefSections: AboutBelief[]
  phoneTel: string
}

type AboutBelief = {
  id: number
  eyebrow: string | null
  title: string
  description: string | null
  cards: unknown
}

/**
 * About 頁 layout dispatcher — 依 PageSection.order 排序依 type 分派。
 *
 * fixed types: hero / story / beliefs / cta
 * dynamic types 委派給 <DynamicSection>。
 */
export function AboutSections({
  sections,
  ...data
}: { sections: PageSection[] } & AboutSectionsData) {
  return (
    <>
      {sections.map((s) => {
        switch (s.type) {
          case 'hero':
            return <Hero key={s.id} block={data.blocks['hero-about'] ?? {}} />
          case 'story':
            return <Story key={s.id} block={data.blocks['about'] ?? {}} />
          case 'beliefs':
            return <Beliefs key={s.id} sections={data.beliefSections} />
          case 'cta':
            return (
              <Cta
                key={s.id}
                block={data.blocks['cta-about'] ?? {}}
                phoneTel={data.phoneTel}
              />
            )
          default:
            return <DynamicSection key={s.id} section={s} phoneTel={data.phoneTel} />
        }
      })}
    </>
  )
}

function Hero({ block }: { block: Record<string, string> }) {
  return (
    <section className="bg-medical-glow pt-8 pb-8 md:pt-12 md:pb-12">
      <div className="container-narrow grid grid-cols-1 items-end gap-10 md:grid-cols-2">
        <div>
          <span className="eyebrow">{block.eyebrow || 'About invisible care'}</span>
          <h1 className="mt-5 text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
            {block.titleLine1 || '看不見的守護，'}
            <br />
            <span className="text-primary-deep">
              {block.titleLine2 || '才是家最頂級的豪華'}
            </span>
          </h1>
        </div>
        <RichText
          html={
            block.lead ||
            '真正的居家品質，不該只存在於裝潢的華麗，而應體現在每一次深呼吸、每一寸觸摸到的布料，以及每一口入喉的水中。我們是 居家健康空間的修復師。'
          }
          className="text-base leading-relaxed text-ink-soft md:text-lg"
        />
      </div>
    </section>
  )
}

function Story({ block }: { block: Record<string, string> }) {
  const eyebrow = block.eyebrow || 'Our story'
  const title = block.title || '關於那些被遺忘的空間'
  const paragraphs = [
    block.paragraph1 ||
      '我們常說「家是最好的避風港」，但如果避風港裡的空氣充滿塵蟎、水源帶著餘氯、家電裡藏著陳年黴菌，這個家，真的安全嗎？',
    block.paragraph2 ||
      'invisible care 整合了防霾通風、全戶濾水、深度清潔、家電維修等核心技術，致力於為每一位客戶提供「由內而外」的居家健康解決方案。',
    block.paragraph3 ||
      '我們不只是清潔工，更是您居家的健康顧問，用職人精神與精準技術，為您守護家人的每一次呼吸與每一滴用水。',
  ].filter(Boolean)
  const image = block.image || null

  return (
    <section className="section pt-10 md:pt-14">
      <div
        className={`container-narrow grid items-center gap-12 ${image ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
      >
        {image && (
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
        )}
        <div>
          <SectionHeading eyebrow={eyebrow} title={title} />
          <div className="mt-6 space-y-4 text-base leading-loose text-ink-soft">
            {paragraphs.map((p, i) => (
              <RichText key={i} html={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Beliefs({ sections }: { sections: AboutBelief[] }) {
  if (sections.length === 0) return null
  return (
    <>
      {sections.map((section) => {
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
    </>
  )
}

function Cta({ block, phoneTel }: { block: Record<string, string>; phoneTel: string }) {
  return (
    <section className="container-narrow py-16 md:py-24">
      <div className="rounded-2xl border border-hairline bg-gradient-to-br from-bg-tint to-white p-10 text-center md:p-16">
        <h2 className="text-3xl font-medium tracking-tight text-ink md:text-4xl">
          {block.title || '您的家，值得被溫柔對待'}
        </h2>
        <RichText
          html={block.description || '讓專業的職人團隊，為您的愛家注入全新的生命力。'}
          className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft"
        />
        <a href={phoneTel} className="btn-primary mt-8">
          {block.primaryCta || '立即來電預約'}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}
