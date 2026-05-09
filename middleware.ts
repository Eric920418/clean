import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // /admin/login 不需登入；其他 /admin/* 需要 token
        if (req.nextUrl.pathname === '/admin/login') return true
        return !!token
      },
    },
    pages: {
      signIn: '/admin/login',
    },
  },
)

export const config = {
  matcher: ['/admin/:path*'],
}
