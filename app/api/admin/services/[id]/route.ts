import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { deleteImageFromR2 } from '@/lib/r2'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            features: { orderBy: { order: 'asc' } },
            faqs: { orderBy: { order: 'asc' } },
            _count: { select: { beforeAfters: true, galleryImgs: true } },
          },
        },
      },
    })

    if (!service) return errorResponse('服務不存在', 404)
    // 攤平回 service-level 給既有 admin/edit page 使用
    const flat = {
      ...service,
      features: service.sections.flatMap((s) => s.features),
      faqs: service.sections.flatMap((s) => s.faqs),
      _count: {
        beforeAfters: service.sections.reduce((sum, s) => sum + s._count.beforeAfters, 0),
        galleryImgs: service.sections.reduce((sum, s) => sum + s._count.galleryImgs, 0),
      },
    }
    return successResponse(flat)
  } catch (error) {
    console.error('Get service error:', error)
    return errorResponse(error instanceof Error ? error.message : '獲取服務失敗')
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const serviceId = parseInt(id)

    // slug 在編輯時鎖定：改 slug 等同改 URL，會破壞已分享連結與 SEO，故忽略 body.slug

    // 先讀舊圖 URL，update 後比對清 R2 孤兒檔
    const before = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { heroImage: true, cardImage: true },
    })

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.shortDesc !== undefined && { shortDesc: body.shortDesc }),
        ...(body.longDesc !== undefined && { longDesc: body.longDesc }),
        ...(body.icon !== undefined && { icon: body.icon || null }),
        ...(body.heroImage !== undefined && { heroImage: body.heroImage || null }),
        ...(body.cardImage !== undefined && { cardImage: body.cardImage || null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.seoTitle !== undefined && { seoTitle: body.seoTitle || null }),
        ...(body.seoDesc !== undefined && { seoDesc: body.seoDesc || null }),
      },
    })

    // 圖片 URL 改變就清舊 R2（非 R2 URL 會被 guard 跳過）
    if (before) {
      const stale: string[] = []
      if (before.heroImage && before.heroImage !== service.heroImage) stale.push(before.heroImage)
      if (before.cardImage && before.cardImage !== service.cardImage) stale.push(before.cardImage)
      if (stale.length > 0) {
        Promise.all(stale.map((url) => deleteImageFromR2(url))).catch((e) =>
          console.warn('R2 stale cleanup:', e),
        )
      }
    }

    return successResponse(service)
  } catch (error) {
    console.error('Update service error:', error)
    return errorResponse(error instanceof Error ? error.message : '更新服務失敗')
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    await prisma.service.delete({ where: { id: parseInt(id) } })
    return successResponse({ message: '刪除成功' })
  } catch (error) {
    console.error('Delete service error:', error)
    return errorResponse(error instanceof Error ? error.message : '刪除服務失敗')
  }
}
