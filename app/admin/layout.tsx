import type { Metadata } from 'next'
import { AdminSessionProvider } from '@/components/admin/session-provider'
import { AuthGuard } from '@/components/admin/auth-guard'
import { AdminContent } from '@/components/admin/admin-content'

export const metadata: Metadata = {
  title: '後台管理',
  description: 'invisible care CMS 後台',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <AuthGuard>
        <AdminContent>{children}</AdminContent>
      </AuthGuard>
    </AdminSessionProvider>
  )
}
