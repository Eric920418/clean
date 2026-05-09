'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/site-config'

const navItems = [
  { href: '/services', label: '服務項目' },
  { href: '/works', label: '清潔實績' },
  { href: '/about', label: '關於我們' },
  { href: '/faq', label: '常見問題' },
  { href: '/contact', label: '預約諮詢' },
]

export function SiteNav() {
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
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white shadow-sm transition group-hover:bg-primary-deep">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
          </span>
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
          <a href={siteConfig.contact.phoneTel} className="btn-primary !py-2 !text-sm">
            立即來電預約
          </a>
        </nav>

        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-bg-soft"
          onClick={() => setOpen((v) => !v)}
          aria-label="開關選單"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
          </nav>
        </div>
      )}
    </header>
  )
}
