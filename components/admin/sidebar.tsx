'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  Home,
  Sparkles,
  Inbox,
  Quote,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  Workflow,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_LABELS } from '@/lib/i18n/admin-zh'

/**
 * Sidebar（桌機版）— 老人友善
 * - 固定寬 w-64，不再收合（移除 collapsed 模式，icon-only 對老人不友善）
 * - 永遠顯示 label
 * - 字級 base/16px、選單項目 min-height 48px
 * - 進階項目（content/settings）收進摺疊區，預設關
 * - 手機版隱藏（md:flex），改用 MobileTabBar
 */

const PRIMARY_ITEMS = [
  { title: NAV_LABELS.dashboard, href: '/admin/dashboard', icon: Home },
  { title: NAV_LABELS.services, href: '/admin/services', icon: Sparkles },
  { title: NAV_LABELS.inquiries, href: '/admin/inquiries', icon: Inbox },
  { title: NAV_LABELS.testimonials, href: '/admin/testimonials', icon: Quote },
  // 「為何選我們」已合併到 /admin/content 的首頁/關於我們區塊管理（2026-05-18）
  { title: NAV_LABELS.processSteps, href: '/admin/process-steps', icon: Workflow },
  { title: NAV_LABELS.generalFaqs, href: '/admin/general-faqs', icon: HelpCircle },
]

const ADVANCED_ITEMS = [
  { title: NAV_LABELS.content, href: '/admin/content', icon: FileText },
  { title: NAV_LABELS.settings, href: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [advancedOpen, setAdvancedOpen] = useState(() =>
    ADVANCED_ITEMS.some(
      (it) => pathname === it.href || pathname.startsWith(it.href + '/'),
    ),
  )

  return (
    <aside
      className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r border-ink/40 bg-ink text-white md:flex"
      aria-label="後台主導覽"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <Link href="/admin/dashboard" className="flex items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shrink-0">
            <ShieldCheck className="h-6 w-6" strokeWidth={2.2} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold">invisible care</span>
            <span className="text-sm text-white/60">後台管理</span>
          </span>
        </Link>
      </div>

      {/* Primary 選單 */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {PRIMARY_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-colors',
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white',
                  )}
                  style={{ minHeight: 48 }}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* 進階分組 */}
        <div className="mt-4 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="mx-3 flex w-[calc(100%-1.5rem)] items-center justify-between rounded-lg px-4 py-3 text-base text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            style={{ minHeight: 48 }}
          >
            <span className="font-medium">{NAV_LABELS.advanced}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                advancedOpen && 'rotate-180',
              )}
            />
          </button>
          {advancedOpen && (
            <ul className="mt-1 space-y-1 px-3">
              {ADVANCED_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-colors',
                        isActive
                          ? 'bg-primary/80 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white',
                      )}
                      style={{ minHeight: 48 }}
                    >
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </nav>

      {/* 登出 */}
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          style={{ minHeight: 48 }}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="font-medium">{NAV_LABELS.logout}</span>
        </button>
      </div>
    </aside>
  )
}
