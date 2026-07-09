import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { sanitizeRichText } from '@/lib/sanitize-html'
import { slugify } from '@/lib/slug'

type RouteParams = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}
    if (body.question !== undefined) {
      if (typeof body.question !== 'string' || !body.question.trim()) {
        return errorResponse('問題為必填', 400)
      }
      data.question = body.question.trim()
    }
    if (body.answer !== undefined) {
      // FAQ 答案自成一頁（/faq/[slug]，H1=問題），故放行到 h4
      const cleanAnswer = sanitizeRichText(body.answer, { maxHeading: 4 })
      if (!cleanAnswer) return errorResponse('回答為必填', 400)
      data.answer = cleanAnswer
    }
    if (body.order !== undefined) {
      data.order = typeof body.order === 'number' ? body.order : parseInt(String(body.order), 10)
    }
    // slug：僅在明確提供且正規化後與原值不同時更新，並查重（避免既有 URL 失效）
    if (body.slug !== undefined && typeof body.slug === 'string' && body.slug.trim()) {
      const normalized = slugify(body.slug)
      const dup = await prisma.generalFaq.findFirst({
        where: { slug: normalized, NOT: { id: parseInt(id, 10) } },
        select: { id: true },
      })
      if (dup) return errorResponse(`網址「${normalized}」已被其他問題使用`, 400)
      data.slug = normalized
    }
    // metaDescription：明確帶入才更新；留空字串＝清除覆寫（存 null），fallback 回答案截斷
    if (body.metaDescription !== undefined) {
      data.metaDescription =
        typeof body.metaDescription === 'string' && body.metaDescription.trim()
          ? body.metaDescription.trim()
          : null
    }

    const item = await prisma.generalFaq.update({ where: { id: parseInt(id, 10) }, data })
    return successResponse(item)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '更新失敗')
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    await prisma.generalFaq.delete({ where: { id: parseInt(id, 10) } })
    return successResponse({ message: '已刪除' })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '刪除失敗')
  }
}
