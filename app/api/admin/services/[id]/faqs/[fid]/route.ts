import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { revalidateService } from '@/lib/revalidate-service'
import { sanitizeRichText } from '@/lib/sanitize-html'
import { slugify } from '@/lib/slug'

type RouteParams = { params: Promise<{ id: string; fid: string }> }

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id, fid } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}
    if (body.question !== undefined) data.question = body.question
    if (body.answer !== undefined) {
      // FAQ 答案自成一頁（/services/[s]/faq/[slug]，H1=問題），故放行到 h4
      const c = sanitizeRichText(body.answer, { maxHeading: 4 })
      if (!c) return errorResponse('答案為必填', 400)
      data.answer = c
    }
    if (body.order !== undefined) data.order = body.order
    // slug：僅在明確提供時更新，並查重（範圍＝同一服務，排除自己），避免既有 URL 失效
    if (typeof body.slug === 'string' && body.slug.trim()) {
      const normalized = slugify(body.slug)
      const dup = await prisma.serviceFaq.findFirst({
        where: {
          slug: normalized,
          section: { serviceId: parseInt(id) },
          NOT: { id: parseInt(fid) },
        },
        select: { id: true },
      })
      if (dup) return errorResponse(`網址「${normalized}」已被此服務其他問題使用`, 400)
      data.slug = normalized
    }
    // metaDescription：明確帶入才更新；留空字串＝清除覆寫（存 null），fallback 回答案截斷
    if (body.metaDescription !== undefined) {
      data.metaDescription =
        typeof body.metaDescription === 'string' && body.metaDescription.trim()
          ? body.metaDescription.trim()
          : null
    }

    const item = await prisma.serviceFaq.update({ where: { id: parseInt(fid) }, data })
    await revalidateService(parseInt(id))
    return successResponse(item)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '更新失敗')
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id, fid } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    await prisma.serviceFaq.delete({ where: { id: parseInt(fid) } })
    await revalidateService(parseInt(id))
    return successResponse({ message: '已刪除' })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '刪除失敗')
  }
}
