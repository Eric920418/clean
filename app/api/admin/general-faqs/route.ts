import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { sanitizeRichText } from '@/lib/sanitize-html'
import { slugify, uniqueSlug } from '@/lib/slug'

export async function GET() {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response
  try {
    const items = await prisma.generalFaq.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })
    return successResponse(items)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '獲取失敗')
  }
}

export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const { question, answer, order, slug, metaDescription } = await request.json()
    if (typeof question !== 'string' || !question.trim()) {
      return errorResponse('問題為必填', 400)
    }
    // metaDescription 選填：留空存 null，generateMetadata 會 fallback 回答案截斷
    const metaDesc =
      typeof metaDescription === 'string' && metaDescription.trim()
        ? metaDescription.trim()
        : null
    // FAQ 答案自成一頁（/faq/[slug]，H1=問題），故放行到 h4
    const cleanAnswer = sanitizeRichText(answer, { maxHeading: 4 })
    if (!cleanAnswer) return errorResponse('回答為必填', 400)

    let finalOrder = typeof order === 'number' ? order : null
    if (finalOrder === null) {
      const last = await prisma.generalFaq.findFirst({ orderBy: { order: 'desc' } })
      finalOrder = (last?.order ?? -1) + 1
    }

    // slug：未填則由問題自動產生；唯一性由 uniqueSlug 對既有 slug 集合應用層保證
    const existingSlugs = new Set(
      (await prisma.generalFaq.findMany({ select: { slug: true } }))
        .map((f) => f.slug)
        .filter((s): s is string => !!s),
    )
    const base = typeof slug === 'string' && slug.trim() ? slugify(slug) : slugify(question)
    const finalSlug = uniqueSlug(base, existingSlugs)

    const item = await prisma.generalFaq.create({
      data: {
        question: question.trim(),
        answer: cleanAnswer,
        slug: finalSlug,
        metaDescription: metaDesc,
        order: finalOrder,
      },
    })
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}
