'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { MobileTabBar } from './mobile-tab-bar'

export function AdminContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadError, setUnreadError] = useState<string | null>(null)

  const isLoginPage = pathname === '/admin/login'
  const isAuthenticated = status === 'authenticated'

  // 取得未讀詢問單數量（給底部 tab bar badge 用）
  useEffect(() => {
    if (!isAuthenticated || isLoginPage) return
    let cancelled = false
    async function fetchUnread() {
      try {
        const r = await fetch('/api/admin/inquiries?count=unread', { cache: 'no-store' })
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || `${r.status} ${r.statusText}`)
        if (typeof data.count !== 'number') throw new Error('未讀詢問單數量格式錯誤')
        if (!cancelled) {
          setUnreadCount(data.count)
          setUnreadError(null)
        }
      } catch (error) {
        if (!cancelled) setUnreadError(error instanceof Error ? error.message : String(error))
      }
    }
    fetchUnread()
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchUnread()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [isAuthenticated, isLoginPage, pathname])

  if (isLoginPage) {
    return <div className="admin-friendly min-h-screen bg-bg-soft">{children}</div>
  }

  if (isAuthenticated) {
    return (
      <div className="admin-friendly min-h-screen bg-bg-soft">
        <Sidebar />
        <main className="min-h-screen md:ml-64">
          <div
            className="px-3 py-4 sm:p-6 md:p-8"
            style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom) + 1rem)' }}
          >
            {unreadError && <p role="alert" className="mb-4 text-sm text-red-700">未讀詢問單載入失敗：{unreadError}</p>}
            {children}
          </div>
        </main>
        <MobileTabBar unreadCount={unreadCount} />
      </div>
    )
  }

  return <div className="admin-friendly min-h-screen bg-bg-soft">{children}</div>
}
