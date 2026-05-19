import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { RichText } from '@/components/rich-text'
import type { PageSection } from '@prisma/client'

type Props = {
  sections: PageSection[]
  phoneTel: string
}

/**
 * 渲染由後台 /admin/content 動態建立的附加區塊。
 * 依 type 分派到 4 種 UI；isVisible=false 在 queries 已過濾，此處不需再判斷。
 */
export function PageCustomSections({ sections, phoneTel }: Props) {
  if (sections.length === 0) return null
  return (
    <>
      {sections.map((s) => {
        const cfg = (s.config ?? {}) as Record<string, unknown>
        switch (s.type) {
          case 'text_block':
            return <TextBlock key={s.id} cfg={cfg} />
          case 'cta_banner':
            return <CtaBanner key={s.id} cfg={cfg} phoneTel={phoneTel} />
          case 'image_text':
            return <ImageText key={s.id} cfg={cfg} />
          case 'rich_content':
            return <RichContent key={s.id} cfg={cfg} />
          default:
            return null
        }
      })}
    </>
  )
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null
}

function TextBlock({ cfg }: { cfg: Record<string, unknown> }) {
  const eyebrow = str(cfg.eyebrow)
  const title = str(cfg.title)
  const body = str(cfg.body)
  if (!title && !body) return null
  return (
    <section className="section">
      <div className="container-narrow">
        {title && (
          <SectionHeading
            align="center"
            eyebrow={eyebrow ?? undefined}
            title={title}
          />
        )}
        {body && (
          <RichText
            html={body}
            className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-ink-soft"
          />
        )}
      </div>
    </section>
  )
}

function CtaBanner({
  cfg,
  phoneTel,
}: {
  cfg: Record<string, unknown>
  phoneTel: string
}) {
  const overline = str(cfg.overline)
  const titleLine1 = str(cfg.titleLine1)
  const titleLine2 = str(cfg.titleLine2)
  const description = str(cfg.description)
  const primaryCta = str(cfg.primaryCta) ?? '立即來電預約'
  const backgroundImage = str(cfg.backgroundImage)
  const lineUrl = str(cfg.lineUrl)

  if (!titleLine1 && !titleLine2 && !description) return null

  return (
    <section className="container-narrow pb-16 md:pb-24">
      <div className="relative overflow-hidden rounded-2xl bg-ink px-8 py-12 text-white md:px-14 md:py-16">
        {backgroundImage && (
          <div className="absolute inset-0 opacity-60">
            <Image
              src={backgroundImage}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="relative max-w-2xl">
          {overline && (
            <span className="text-xs text-white! font-medium tracking-[0.2em] ">
              {overline}
            </span>
          )}
          {(titleLine1 || titleLine2) && (
            <h2 className="mt-4 text-white! text-3xl font-medium leading-tight md:text-4xl">
              {titleLine1}
              {titleLine1 && titleLine2 && <br />}
              {titleLine2}
            </h2>
          )}
          {description && (
            <RichText
              html={description}
              className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base"
            />
          )}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {phoneTel && (
              <a href={phoneTel} className="btn-primary">
                {primaryCta}
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
            {lineUrl && (
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="加入 LINE 好友"
                className="inline-flex items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://scdn.line-apps.com/n/line_add_friends/btn/zh-Hant.png"
                  alt="加入 LINE 好友"
                  height={36}
                  className="h-9 w-auto"
                />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function ImageText({ cfg }: { cfg: Record<string, unknown> }) {
  const layout = str(cfg.layout) === 'image-right' ? 'image-right' : 'image-left'
  const image = str(cfg.image)
  const eyebrow = str(cfg.eyebrow)
  const title = str(cfg.title)
  const body = str(cfg.body)
  const ctaText = str(cfg.ctaText)
  const ctaUrl = str(cfg.ctaUrl)

  if (!image && !title && !body) return null

  const textCol = (
    <div>
      {(eyebrow || title) && (
        <SectionHeading eyebrow={eyebrow ?? undefined} title={title ?? ''} />
      )}
      {body && (
        <RichText
          html={body}
          className="mt-6 text-base leading-relaxed text-ink-soft"
        />
      )}
      {ctaText && ctaUrl && (
        <Link href={ctaUrl} className="btn-primary mt-8">
          {ctaText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )

  const imageCol = image ? (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-hairline bg-bg-soft">
      <Image
        src={image}
        alt={title ?? ''}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
        unoptimized
      />
    </div>
  ) : null

  return (
    <section className="section">
      <div
        className={`container-narrow grid items-center gap-10 md:gap-14 ${
          imageCol ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {imageCol && layout === 'image-left' ? (
          <>
            {imageCol}
            {textCol}
          </>
        ) : imageCol ? (
          <>
            {textCol}
            {imageCol}
          </>
        ) : (
          textCol
        )}
      </div>
    </section>
  )
}

function RichContent({ cfg }: { cfg: Record<string, unknown> }) {
  const html = str(cfg.html)
  if (!html) return null
  return (
    <section className="section">
      <div className="container-narrow">
        <RichText html={html} className="max-w-3xl mx-auto" />
      </div>
    </section>
  )
}
