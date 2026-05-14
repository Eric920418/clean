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
        features: { orderBy: { order: 'asc' } },
        faqs: { orderBy: { order: 'asc' } },
        beforeAfters: { orderBy: { order: 'asc' } },
        galleryImgs: { orderBy: { order: 'asc' } },
      },
    })

    if (!service) return errorResponse('服務不存在', 404)
    return successResponse(service)
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

    if (body.slug && !/^[a-z0-9-]+$/.test(body.slug)) {
      return errorResponse('slug 格式錯誤', 400)
    }

    // 先讀舊圖 URL，update 後比對清 R2 孤兒檔
    const before = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { heroImage: true, cardImage: true, introImage: true },
    })

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
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
        ...(body.introEyebrow !== undefined && { introEyebrow: body.introEyebrow || null }),
        ...(body.introTitle !== undefined && { introTitle: body.introTitle || null }),
        ...(body.introParagraph1 !== undefined && { introParagraph1: body.introParagraph1 || null }),
        ...(body.introParagraph2 !== undefined && { introParagraph2: body.introParagraph2 || null }),
        ...(body.introParagraph3 !== undefined && { introParagraph3: body.introParagraph3 || null }),
        ...(body.introImage !== undefined && { introImage: body.introImage || null }),
        ...(body.whyEyebrow !== undefined && { whyEyebrow: body.whyEyebrow || null }),
        ...(body.whyTitle !== undefined && { whyTitle: body.whyTitle || null }),
      },
    })

    // 圖片 URL 改變就清舊 R2（非 R2 URL 會被 guard 跳過）
    if (before) {
      const stale: string[] = []
      if (before.heroImage && before.heroImage !== service.heroImage) stale.push(before.heroImage)
      if (before.cardImage && before.cardImage !== service.cardImage) stale.push(before.cardImage)
      if (before.introImage && before.introImage !== service.introImage)
        stale.push(before.introImage)
      if (stale.length > 0) {
        Promise.all(stale.map((url) => deleteImageFromR2(url))).catch((e) =>
          console.warn('R2 stale cleanup:', e),
        )
      }
    }

    return successResponse(service)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorResponse('slug 已被其他服務使用', 400)
    }
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
