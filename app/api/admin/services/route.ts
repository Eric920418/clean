import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'

// GET 全部服務（後台 + 前台共用，不檢查 auth；前台只讀 isActive）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const services = await prisma.service.findMany({
      where: {
        ...(isActive !== null && { isActive: isActive === 'true' }),
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        features: { orderBy: { order: 'asc' } },
        faqs: { orderBy: { order: 'asc' } },
        _count: { select: { beforeAfters: true, galleryImgs: true } },
      },
    })
    return successResponse(services)
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
      slug,
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
      introEyebrow,
      introTitle,
      introParagraph1,
      introParagraph2,
      introParagraph3,
      introImage,
      whyEyebrow,
      whyTitle,
    } = body

    if (!slug || !name || !shortDesc || !longDesc) {
      return errorResponse('slug、名稱、卡片摘要、長描述為必填', 400)
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return errorResponse('slug 只能含小寫英文、數字與連字號（如 aircon-cleaning）', 400)
    }

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
        introEyebrow: introEyebrow || null,
        introTitle: introTitle || null,
        introParagraph1: introParagraph1 || null,
        introParagraph2: introParagraph2 || null,
        introParagraph3: introParagraph3 || null,
        introImage: introImage || null,
        whyEyebrow: whyEyebrow || null,
        whyTitle: whyTitle || null,
      },
    })

    return successResponse(service, 201)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorResponse('slug 已存在，請改用其他 slug', 400)
    }
    console.error('Create service error:', error)
    return errorResponse(error instanceof Error ? error.message : '建立服務失敗')
  }
}
