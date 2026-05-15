import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { revalidateService } from '@/lib/revalidate-service'

type RouteParams = { params: Promise<{ id: string }> }

const ALLOWED_TYPES = [
  'hero',
  'intro',
  'why_with_features',
  'before_after',
  'gallery',
  'faq',
  'cta',
  'more_services',
  'text_block',
] as const

type SectionType = (typeof ALLOWED_TYPES)[number]

function defaultConfig(type: SectionType, serviceName: string): Record<string, unknown> {
  switch (type) {
    case 'hero':
    case 'cta':
    case 'more_services':
      return {}
    case 'intro':
      return { eyebrow: null, title: null, image: null, paragraph1: null, paragraph2: null, paragraph3: null }
    case 'why_with_features':
      return { eyebrow: null, title: null }
    case 'before_after':
      return { eyebrow: 'Real Results', title: `${serviceName}・實際施作前後` }
    case 'gallery':
      return { eyebrow: 'Gallery', title: '施作過程' }
    case 'faq':
      return { eyebrow: 'FAQ', title: '常見問題' }
    case 'text_block':
      return { eyebrow: null, title: null, body: null }
  }
}

// GET /api/admin/services/[id]/sections — 列出全部 section（依 order）
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const serviceId = parseInt(id, 10)
    const sections = await prisma.serviceSection.findMany({
      where: { serviceId },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { features: true, faqs: true, beforeAfters: true, galleryImgs: true } },
      },
    })
    return successResponse(sections)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '讀取失敗')
  }
}

// POST /api/admin/services/[id]/sections — 新增一個 section
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const serviceId = parseInt(id, 10)
    const body = await request.json()
    const type = body.type as SectionType

    if (!type || !ALLOWED_TYPES.includes(type)) {
      return errorResponse(`type 必須是這 9 種之一：${ALLOWED_TYPES.join(', ')}`, 400)
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { name: true } })
    if (!service) return errorResponse('找不到該服務', 404)

    // 新 section 放最後（order = max + 1）
    const maxOrder = await prisma.serviceSection.aggregate({
      where: { serviceId },
      _max: { order: true },
    })

    const section = await prisma.serviceSection.create({
      data: {
        serviceId,
        type,
        order: (maxOrder._max.order ?? 0) + 1,
        isVisible: true,
        config: defaultConfig(type, service.name) as Prisma.InputJsonValue,
      },
    })

    await revalidateService(serviceId)
    return successResponse(section, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '新增失敗')
  }
}
