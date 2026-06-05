import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { revalidateService } from '@/lib/revalidate-service'
import { sanitizeRichText } from '@/lib/sanitize-html'

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
    const { question, answer, sectionId } = await request.json()
    if (!question) return errorResponse('問題為必填', 400)
    if (typeof sectionId !== 'number') return errorResponse('sectionId 為必填', 400)
    const cleanAnswer = sanitizeRichText(answer)
    if (!cleanAnswer) return errorResponse('答案為必填', 400)

    // order 由 server 計算 max+1，避免 client 用 length 計算在刪除後撞號
    const maxOrder = await prisma.serviceFaq.aggregate({
      where: { sectionId },
      _max: { order: true },
    })

    const item = await prisma.serviceFaq.create({
      data: {
        sectionId,
        question,
        answer: cleanAnswer,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    })
    await revalidateService(parseInt(id))
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}
