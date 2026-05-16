import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { revalidateService } from '@/lib/revalidate-service'
import { sanitizeRichText } from '@/lib/sanitize-html'

const RICH_TEXT_CONFIG_KEYS = ['paragraph1', 'paragraph2', 'paragraph3', 'body'] as const

type RouteParams = { params: Promise<{ id: string; sectionId: string }> }

// PUT /api/admin/services/[id]/sections/[sectionId] — 更新（order swap / isVisible toggle / config 編輯）
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id, sectionId } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.order !== undefined) {
      data.order = typeof body.order === 'number' ? body.order : parseInt(String(body.order), 10)
    }
    if (body.isVisible !== undefined) {
      data.isVisible = Boolean(body.isVisible)
    }
    if (body.config !== undefined) {
      if (typeof body.config !== 'object' || body.config === null || Array.isArray(body.config)) {
        return errorResponse('config 必須是 object', 400)
      }
      // 對 config 內的富文本欄位 sanitize
      const cfg = { ...(body.config as Record<string, unknown>) }
      for (const key of RICH_TEXT_CONFIG_KEYS) {
        if (cfg[key] !== undefined) {
          cfg[key] = cfg[key] === null ? null : sanitizeRichText(cfg[key])
        }
      }
      data.config = cfg
    }

    const section = await prisma.serviceSection.update({
      where: { id: parseInt(sectionId, 10) },
      data,
    })
    await revalidateService(parseInt(id, 10))
    return successResponse(section)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '更新失敗')
  }
}

// DELETE /api/admin/services/[id]/sections/[sectionId]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id, sectionId } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const serviceId = parseInt(id, 10)

    // 安全閥：不能刪到最後一個 section（至少留一個）
    const remaining = await prisma.serviceSection.count({ where: { serviceId } })
    if (remaining <= 1) {
      return errorResponse('至少要保留一個區塊；可改用「隱藏」功能', 400)
    }

    await prisma.serviceSection.delete({ where: { id: parseInt(sectionId, 10) } })
    await revalidateService(serviceId)
    return successResponse({ message: '已刪除' })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '刪除失敗')
  }
}
