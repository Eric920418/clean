import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { slugify, uniqueSlug } from '@/lib/slug'

// GET 全部服務（admin 用，需登入；前台讀資料走 lib/queries.ts）
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const services = await prisma.service.findMany({
      where: {
        ...(isActive !== null && { isActive: isActive === 'true' }),
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        sections: {
          include: {
            features: { orderBy: { order: 'asc' } },
            faqs: { orderBy: { order: 'asc' } },
            _count: { select: { beforeAfters: true, galleryImgs: true } },
          },
        },
      },
    })
    // 攤平給 admin client 用
    return successResponse(
      services.map((s) => ({
        ...s,
        features: s.sections.flatMap((sec) => sec.features),
        faqs: s.sections.flatMap((sec) => sec.faqs),
        _count: {
          beforeAfters: s.sections.reduce((sum, sec) => sum + sec._count.beforeAfters, 0),
          galleryImgs: s.sections.reduce((sum, sec) => sum + sec._count.galleryImgs, 0),
        },
      })),
    )
  } catch (error) {
    console.error('Get services error:', error)
    return errorResponse(error instanceof Error ? error.message : '獲取服務失敗')
  }
}

// POST 建立服務
export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const {
      name,
      shortDesc,
      longDesc,
      icon,
      heroImage,
      cardImage,
      isActive,
      isFeatured,
      order,
      seoTitle,
      seoDesc,
    } = body

    if (!name || !shortDesc || !longDesc) {
      return errorResponse('名稱、卡片摘要、長描述為必填', 400)
    }

    const existing = new Set(
      (await prisma.service.findMany({ select: { slug: true } })).map((s) => s.slug),
    )
    const slug = uniqueSlug(slugify(name), existing)

    const service = await prisma.service.create({
      data: {
        slug,
        name,
        shortDesc,
        longDesc,
        icon: icon || null,
        heroImage: heroImage || null,
        cardImage: cardImage || null,
        isActive: isActive !== false,
        isFeatured: isFeatured === true,
        order: order || 0,
        seoTitle: seoTitle || null,
        seoDesc: seoDesc || null,
      },
    })

    return successResponse(service, 201)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorResponse('服務名稱衝突，請稍後重試或微調名稱', 400)
    }
    console.error('Create service error:', error)
    return errorResponse(error instanceof Error ? error.message : '建立服務失敗')
  }
}
