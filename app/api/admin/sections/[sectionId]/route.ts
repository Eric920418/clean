import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'

type RouteParams = { params: Promise<{ sectionId: string }> }

// GET /api/admin/sections/[sectionId] — 一次拿 section + 所屬 service 基本資訊 + 該 section 的所有子表 items
// 子表 items 是 sectionId-scoped（不是 serviceId-scoped）
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { sectionId } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const section = await prisma.serviceSection.findUnique({
      where: { id: parseInt(sectionId, 10) },
      include: {
        service: { select: { id: true, name: true, slug: true, longDesc: true } },
        features: { orderBy: { order: 'asc' } },
        faqs: { orderBy: { order: 'asc' } },
        beforeAfters: { orderBy: [{ order: 'asc' }, { id: 'asc' }] },
        galleryImgs: { orderBy: { order: 'asc' } },
      },
    })
    if (!section) return errorResponse('區塊不存在', 404)
    return successResponse(section)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '讀取失敗')
  }
}
