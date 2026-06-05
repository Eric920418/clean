import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { revalidateService } from '@/lib/revalidate-service'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response
  try {
    const items = await prisma.serviceFeature.findMany({
      where: { section: { serviceId: parseInt(id) } },
      orderBy: { order: 'asc' },
    })
    return successResponse(items)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '獲取失敗')
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const { text, sectionId } = await request.json()
    if (!text) return errorResponse('特色文字為必填', 400)
    if (typeof sectionId !== 'number') return errorResponse('sectionId 為必填', 400)

    // order 由 server 計算 max+1，避免 client 用 length 計算在刪除後撞號
    const maxOrder = await prisma.serviceFeature.aggregate({
      where: { sectionId },
      _max: { order: true },
    })

    const item = await prisma.serviceFeature.create({
      data: {
        sectionId,
        text,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    })
    await revalidateService(parseInt(id))
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}
