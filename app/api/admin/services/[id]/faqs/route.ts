import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { revalidateService } from '@/lib/revalidate-service'
import { sanitizeRichText } from '@/lib/sanitize-html'
import { slugify, uniqueSlug } from '@/lib/slug'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response
  try {
    const items = await prisma.serviceFaq.findMany({
      where: { section: { serviceId: parseInt(id) } },
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
    const { question, answer, sectionId, slug } = await request.json()
    if (!question) return errorResponse('問題為必填', 400)
    if (typeof sectionId !== 'number') return errorResponse('sectionId 為必填', 400)
    // FAQ 答案自成一頁（/services/[s]/faq/[slug]，H1=問題），故放行到 h4
    const cleanAnswer = sanitizeRichText(answer, { maxHeading: 4 })
    if (!cleanAnswer) return errorResponse('答案為必填', 400)

    // order 由 server 計算 max+1，避免 client 用 length 計算在刪除後撞號
    const maxOrder = await prisma.serviceFaq.aggregate({
      where: { sectionId },
      _max: { order: true },
    })

    // slug：未填則由問題自動產生；唯一性範圍＝同一服務（URL 是 /services/[serviceSlug]/faq/[faqSlug]）
    const existingSlugs = new Set(
      (
        await prisma.serviceFaq.findMany({
          where: { section: { serviceId: parseInt(id) } },
          select: { slug: true },
        })
      )
        .map((f) => f.slug)
        .filter((s): s is string => !!s),
    )
    const base = typeof slug === 'string' && slug.trim() ? slugify(slug) : slugify(question)
    const finalSlug = uniqueSlug(base, existingSlugs)

    const item = await prisma.serviceFaq.create({
      data: {
        sectionId,
        question,
        answer: cleanAnswer,
        slug: finalSlug,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    })
    await revalidateService(parseInt(id))
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}
