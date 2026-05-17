'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Menu, X, Phone, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// 內嵌 LINE 風格 icon（白底 + 綠字 knockout，跟 floating-cta 同款）
function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="white"
        d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.6 7.2 8.4 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1.1 1 .6 1.2-.5 6.4-3.8 8.7-6.5 1.6-1.7 2.1-3.5 2.1-4.4 0-4.4-4.5-8-10-8z"
      />
      <text
        x="12"
        y="13"
        textAnchor="middle"
        fontSize="5.5"
        fontWeight="900"
        fill="#06C755"
        fontFamily="-apple-system, system-ui, sans-serif"
      >
        LINE
      </text>
    </svg>
  )
}

export function SiteNav({
  settings,
  navigation,
}: {
  settings: Record<string, string>
  navigation: Record<string, string>
}) {
  const phoneTel = settings.phoneTel || ''
  const phone = settings.phone || ''
  const lineFriendUrl = settings.lineFriendUrl || ''
  const primaryCtaLabel = navigation.navPrimaryCtaLabel || '立即來電預約'

  // route 固定，label 由業主後台改
  const navItems = [
    { href: '/services', label: navigation.navServicesLabel || '服務項目' },
    { href: '/works', label: navigation.navWorksLabel || '服務案例' },
    { href: '/about', label: navigation.navAboutLabel || '關於我們' },
    { href: '/faq', label: navigation.navFaqLabel || '常見問題' },
    { href: '/contact', label: navigation.navContactLabel || '預約諮詢' },
  ]
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors',
        scrolled
          ? 'border-b border-hairline bg-white/85 backdrop-blur-md'
          : 'bg-transparent',
      )}
    >
      <div className="container-narrow flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.jpg"
            alt="ProShake"
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-md object-contain transition group-hover:opacity-90"
          />
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-tight text-ink">
              invisible <span className="text-primary-deep">care</span>
            </span>
            <span className="mt-0.5 text-[11px] tracking-widest text-ink-muted">
              看不見的守護
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-soft transition hover:text-primary-deep"
            >
              {item.label}
            </Link>
          ))}
          <a href={phoneTel} className="btn-primary !py-2 !text-sm">
            {primaryCtaLabel}
          </a>
        </nav>

        {/* 手機 top bar：icon-only CTA + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href={phoneTel}
            aria-label={`撥打電話 ${phone}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E53935] text-white shadow-sm active:scale-95 transition"
          >
            <Phone className="h-4 w-4" strokeWidth={2.4} />
          </a>
          {lineFriendUrl && (
            <a
              href={lineFriendUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="加 LINE 官方帳號"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#06C755] text-white shadow-sm active:scale-95 transition"
            >
              <LineIcon className="h-5 w-5" />
            </a>
          )}
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-bg-soft"
            onClick={() => setOpen((v) => !v)}
            aria-label="開關選單"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-hairline bg-white">
          <nav className="container-narrow flex flex-col py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base text-ink-soft transition hover:text-primary-deep"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 grid gap-2 border-t border-hairline pt-4">
              <a
                href={phoneTel}
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#E53935] px-4 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.98] transition"
              >
                <Phone className="h-4 w-4" strokeWidth={2.4} />
                {primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
              {lineFriendUrl && (
                <a
                  href={lineFriendUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#06C755] px-4 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.98] transition"
                >
                  <LineIcon className="h-5 w-5" />
                  立即加 LINE 諮詢
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
