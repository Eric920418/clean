'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Sparkles,
  Inbox,
  Quote,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar-context'

const menuItems = [
  { title: '儀表板', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: '服務管理', href: '/admin/services', icon: Sparkles },
  { title: '詢問單', href: '/admin/inquiries', icon: Inbox },
  { title: '客戶評價', href: '/admin/testimonials', icon: Quote },
  { title: '頁面內容', href: '/admin/content', icon: FileText },
  { title: '站台設定', href: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-ink text-white transition-all duration-300 z-50 border-r border-ink/40',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link href="/admin/dashboard" className="flex items-center gap-2 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white shrink-0">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
            </span>
            {!collapsed && (
              <span className="flex flex-col leading-none truncate">
                <span className="text-sm font-semibold truncate">invisible care</span>
                <span className="mt-0.5 text-[10px] tracking-widest text-white/60">後台管理</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-white/10 transition-colors shrink-0"
            aria-label={collapsed ? '展開側欄' : '收合側欄'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm',
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-white/80 hover:bg-white/10 hover:text-white',
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full text-sm',
              collapsed && 'justify-center',
            )}
            title={collapsed ? '登出' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>登出</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
