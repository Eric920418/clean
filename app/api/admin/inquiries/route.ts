import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const isRead = searchParams.get('isRead')

    const items = await prisma.bookingInquiry.findMany({
      where: {
        ...(status && { status: status as 'NEW' | 'CONTACTED' | 'QUOTED' | 'DONE' | 'CLOSED' }),
        ...(isRead !== null && { isRead: isRead === 'true' }),
      },
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
    })
    return successResponse(items)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '獲取失敗')
  }
}
