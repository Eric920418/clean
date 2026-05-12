'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Inbox, Sparkles, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_LABELS } from '@/lib/i18n/admin-zh'

/**
 * 手機底部 Tab Bar — 老人友善
 * - 高 72px，每個 tab 觸控目標 56x72px
 * - icon + 文字（不靠純圖示認知）
 * - 4 個入口涵蓋 80% 需求；其餘走「更多」
 * - 桌機隱藏（md: hidden）
 */

const TABS = [
  { href: '/admin/dashboard', label: NAV_LABELS.dashboard, icon: Home },
  { href: '/admin/inquiries', label: NAV_LABELS.inquiries, icon: Inbox },
  { href: '/admin/services', label: NAV_LABELS.services, icon: Sparkles },
  { href: '/admin/more', label: NAV_LABELS.more, icon: MoreHorizontal },
] as const

export function MobileTabBar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-hairline bg-white/95 backdrop-blur-md md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)', // iPhone home indicator 避讓
        boxShadow: '0 -2px 8px rgba(15, 23, 42, 0.06)',
      }}
      aria-label="主導覽"
    >
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href !== '/admin/more' && pathname.startsWith(tab.href + '/'))
        const Icon = tab.icon
        const showBadge = tab.href === '/admin/inquiries' && unreadCount > 0

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors',
              isActive ? 'text-primary-deep' : 'text-ink-soft hover:text-ink',
            )}
            style={{ minHeight: 72 }}
          >
            <div className="relative">
              <Icon
                className={cn('h-6 w-6', isActive && 'scale-110 transition-transform')}
                strokeWidth={isActive ? 2.4 : 2}
              />
              {showBadge && (
                <span className="absolute -right-2.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-xs font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className={cn('text-sm font-medium', isActive && 'font-semibold')}>
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-primary" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
