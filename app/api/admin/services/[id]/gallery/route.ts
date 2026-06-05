import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { deleteImageFromR2 } from '@/lib/r2'
import { revalidateService } from '@/lib/revalidate-service'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response
  try {
    const items = await prisma.serviceGalleryImage.findMany({
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
    const { url, alt, caption, sectionId } = await request.json()
    if (!url) return errorResponse('url 為必填', 400)
    if (typeof sectionId !== 'number') return errorResponse('sectionId 為必填', 400)

    // order 由 server 計算 max+1，避免 client 用 length 計算在刪除後撞號
    const maxOrder = await prisma.serviceGalleryImage.aggregate({
      where: { sectionId },
      _max: { order: true },
    })

    const item = await prisma.serviceGalleryImage.create({
      data: {
        sectionId,
        url,
        alt: alt || null,
        caption: caption || null,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    })
    await revalidateService(parseInt(id))
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}

// PATCH 用來改 order / alt / caption（單筆）
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const { imageId, alt, caption, order } = await request.json()
    if (!imageId) return errorResponse('imageId 為必填', 400)

    const item = await prisma.serviceGalleryImage.update({
      where: { id: parseInt(imageId) },
      data: {
        ...(alt !== undefined && { alt: alt || null }),
        ...(caption !== undefined && { caption: caption || null }),
        ...(order !== undefined && { order }),
      },
    })
    await revalidateService(parseInt(id))
    return successResponse(item)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '更新失敗')
  }
}

// DELETE 接 ?imageId=
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')
    if (!imageId) return errorResponse('imageId 為必填', 400)

    const item = await prisma.serviceGalleryImage.findUnique({
      where: { id: parseInt(imageId) },
    })
    if (!item) return errorResponse('圖片不存在', 404)

    deleteImageFromR2(item.url).catch((e) => console.warn('R2 cleanup:', e))
    await prisma.serviceGalleryImage.delete({ where: { id: parseInt(imageId) } })
    await revalidateService(parseInt(id))
    return successResponse({ message: '已刪除' })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '刪除失敗')
  }
}
