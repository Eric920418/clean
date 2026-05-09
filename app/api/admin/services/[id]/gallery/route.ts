import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { deleteImageFromR2 } from '@/lib/r2'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const items = await prisma.serviceGalleryImage.findMany({
      where: { serviceId: parseInt(id) },
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
    const { url, alt, order } = await request.json()
    if (!url) return errorResponse('url 為必填', 400)

    const item = await prisma.serviceGalleryImage.create({
      data: {
        serviceId: parseInt(id),
        url,
        alt: alt || null,
        order: order ?? 0,
      },
    })
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}

// PATCH 用來改 order / alt（單筆）
export async function PATCH(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const { imageId, alt, order } = await request.json()
    if (!imageId) return errorResponse('imageId 為必填', 400)

    const item = await prisma.serviceGalleryImage.update({
      where: { id: parseInt(imageId) },
      data: {
        ...(alt !== undefined && { alt: alt || null }),
        ...(order !== undefined && { order }),
      },
    })
    return successResponse(item)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '更新失敗')
  }
}

// DELETE 接 ?imageId=
export async function DELETE(request: NextRequest) {
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
    return successResponse({ message: '已刪除' })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '刪除失敗')
  }
}
