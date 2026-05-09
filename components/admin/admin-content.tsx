'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { useSidebar } from './sidebar-context'
import { cn } from '@/lib/utils'

export function AdminContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const pathname = usePathname()
  const { collapsed } = useSidebar()

  const isLoginPage = pathname === '/admin/login'
  const isAuthenticated = status === 'authenticated'

  if (isLoginPage) {
    return <div className="min-h-screen bg-bg-soft">{children}</div>
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-soft">
        <Sidebar />
        <main
          className={cn(
            'min-h-screen transition-all duration-300',
            collapsed ? 'ml-16' : 'ml-64',
          )}
        >
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    )
  }

  return <div className="min-h-screen bg-bg-soft">{children}</div>
}
