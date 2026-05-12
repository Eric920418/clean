'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  Quote,
  BadgeCheck,
  Workflow,
  HelpCircle,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Wrench,
} from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { NAV_LABELS } from '@/lib/i18n/admin-zh'
import { cn } from '@/lib/utils'

/**
 * 手機版「更多」入口頁
 * - 常用功能在外層（評價）
 * - 不常用收進「進階設定」摺疊區（內容、站台設定）
 * - 登出獨立按鈕在底部
 */

const COMMON_ITEMS = [
  {
    href: '/admin/testimonials',
    label: NAV_LABELS.testimonials,
    description: '客人留下的好評，會出現在首頁',
    icon: Quote,
  },
  {
    href: '/admin/why-us-sections',
    label: NAV_LABELS.whyUs,
    description: '首頁「為何選我們」與關於頁「三項職人信仰」',
    icon: BadgeCheck,
  },
  {
    href: '/admin/process-steps',
    label: NAV_LABELS.processSteps,
    description: '首頁「四步驟」服務流程',
    icon: Workflow,
  },
  {
    href: '/admin/general-faqs',
    label: NAV_LABELS.generalFaqs,
    description: '常見問題頁的一般問答',
    icon: HelpCircle,
  },
] as const

const ADVANCED_ITEMS = [
  {
    href: '/admin/content',
    label: NAV_LABELS.content,
    description: '修改首頁上的標題、介紹文字',
    icon: FileText,
  },
  {
    href: '/admin/settings',
    label: NAV_LABELS.settings,
    description: '電話、Line、社群連結等基本資料',
    icon: Settings,
  },
] as const

export default function MorePage() {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <>
      <AdminPageHeader title={NAV_LABELS.more} description="其他功能與設定" />

      {/* 常用 */}
      <ul className="space-y-3">
        {COMMON_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-4 rounded-2xl border border-hairline bg-white p-5 transition hover:border-primary-soft hover:shadow-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tint text-primary-deep shrink-0">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-medium text-ink">{item.label}</div>
                  <div className="text-base text-ink-soft mt-0.5">
                    {item.description}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-ink-muted shrink-0" />
              </Link>
            </li>
          )
        })}
      </ul>

      {/* 進階設定（摺疊） */}
      <div className="mt-6 rounded-2xl border border-hairline bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="flex w-full items-center gap-4 p-5 transition hover:bg-bg-soft"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-soft text-ink-soft shrink-0">
            <Wrench className="h-6 w-6" />
          </span>
          <div className="flex-1 text-left">
            <div className="text-lg font-medium text-ink">進階設定</div>
            <div className="text-base text-ink-soft mt-0.5">
              不常用的網站設定，需要時再打開
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-ink-muted shrink-0 transition-transform',
              advancedOpen && 'rotate-180',
            )}
          />
        </button>
        {advancedOpen && (
          <ul className="border-t border-hairline divide-y divide-hairline-soft">
            {ADVANCED_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-4 px-5 py-4 transition hover:bg-bg-soft"
                  >
                    <Icon className="h-5 w-5 text-ink-soft shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-medium text-ink">{item.label}</div>
                      <div className="text-sm text-ink-soft mt-0.5">
                        {item.description}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-muted shrink-0" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* 登出 */}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/admin/login' })}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-hairline bg-white p-5 text-lg font-medium text-ink-soft transition hover:border-danger hover:text-danger"
        style={{ minHeight: 64 }}
      >
        <LogOut className="h-5 w-5" />
        {NAV_LABELS.logout}
      </button>
    </>
  )
}
