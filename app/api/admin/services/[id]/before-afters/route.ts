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
    const items = await prisma.beforeAfterPair.findMany({
      where: { section: { serviceId: parseInt(id) } },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
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
    const body = await request.json()
    const { beforeUrl, afterUrl, caption, location, takenAt, isFeatured, isActive, order, sectionId } = body

    if (!beforeUrl || !afterUrl) {
      return errorResponse('Before 與 After 兩張圖皆為必填', 400)
    }
    if (typeof sectionId !== 'number') return errorResponse('sectionId 為必填', 400)

    const item = await prisma.beforeAfterPair.create({
      data: {
        sectionId,
        beforeUrl,
        afterUrl,
        caption: caption || null,
        location: location || null,
        takenAt: takenAt ? new Date(takenAt) : null,
        isFeatured: !!isFeatured,
        isActive: isActive !== false,
        order: order ?? 0,
      },
    })
    await revalidateService(parseInt(id))
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}
