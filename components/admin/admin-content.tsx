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

  const isLoginPage = pathname === '/admin/login'
  const isAuthenticated = status === 'authenticated'

  // 取得未讀詢問單數量（給底部 tab bar badge 用）
  useEffect(() => {
    if (!isAuthenticated || isLoginPage) return
    let cancelled = false
    async function fetchUnread() {
      try {
        const r = await fetch('/api/admin/inquiries', { cache: 'no-store' })
        if (!r.ok) return
        const data = await r.json()
        if (!cancelled && Array.isArray(data)) {
          const unread = data.filter(
            (it: { isRead?: boolean }) => it.isRead === false,
          ).length
          setUnreadCount(unread)
        }
      } catch {
        // 不阻擋畫面
      }
    }
    fetchUnread()
    const id = setInterval(fetchUnread, 60000) // 每分鐘刷新
    return () => {
      cancelled = true
      clearInterval(id)
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
            {children}
          </div>
        </main>
        <MobileTabBar unreadCount={unreadCount} />
      </div>
    )
  }

  return <div className="admin-friendly min-h-screen bg-bg-soft">{children}</div>
}
